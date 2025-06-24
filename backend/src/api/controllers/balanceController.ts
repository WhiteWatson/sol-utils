import { Request, Response, NextFunction } from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import axios from 'axios';
import logger from '../../utils/logger';
import BalanceRecord from '../../storage/models/BalanceRecord';
import dayjs from 'dayjs';
import PriceHistory from '../../storage/models/PriceHistory';
import { config } from '../../config/index';
import { fetchBalances } from '../../collector/balanceFetcher';
import { fetchPrices } from '../../collector/priceFetcher';

// 代币配置
const TOKENS = {
    SOL: {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        address: 'So11111111111111111111111111111111111111112',
        color: '#9945FF',
    },
    USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        color: '#2775CA',
    },
    USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        color: '#26A17B',
    },
    BONK: {
        symbol: 'BONK',
        name: 'Bonk',
        decimals: 5,
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        color: '#FF6B35',
    },
    JUP: {
        symbol: 'JUP',
        name: 'Jupiter',
        decimals: 6,
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        color: '#FF6B35',
    },
} as const;

// 价格缓存
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 获取CoinGecko ID
function getCoinGeckoId(symbol: string): string {
    const ids: Record<string, string> = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BONK': 'bonk',
        'JUP': 'jupiter',
    };
    return ids[symbol] || symbol.toLowerCase();
}

// 获取代币价格
async function getTokenPrice(symbol: string): Promise<number> {
    const cacheKey = symbol.toLowerCase();
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.price;
    }

    // 默认价格（当API不可用时使用）
    const defaultPrices: Record<string, number> = {
        'SOL': 150.0,
        'USDC': 1.0,
        'USDT': 1.0,
        'BONK': 0.00002,
        'JUP': 0.5,
    };

    try {
        // 使用免费的 CoinGecko API，不需要 API key
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(symbol)}&vs_currencies=usd`,
            {
                timeout: 10000, // 10秒超时
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SolanaBalanceMonitor/1.0)'
                }
            }
        );

        if (response.status !== 200) {
            throw new Error(`API响应状态码: ${response.status}`);
        }

        const data = response.data;
        const coinId = getCoinGeckoId(symbol);
        const price = data[coinId]?.usd;

        if (price === undefined || price === null) {
            throw new Error(`未找到${symbol}的价格数据`);
        }

        // 缓存价格
        priceCache.set(cacheKey, { price, timestamp: Date.now() });
        logger.info(`成功获取${symbol}价格: $${price}`);

        return price;
    } catch (error) {
        logger.warn(`获取${symbol}价格失败，使用默认价格:`, error);
        const defaultPrice = defaultPrices[symbol] || 0;

        // 缓存默认价格，避免重复请求
        priceCache.set(cacheKey, { price: defaultPrice, timestamp: Date.now() });

        return defaultPrice;
    }
}

// 获取所有代币价格
async function getAllTokenPrices(): Promise<Record<string, { usd: number; change24h: number }>> {
    const symbols = Object.values(TOKENS).map(token => token.symbol);
    const pricePromises = symbols.map(async (symbol) => {
        const price = await getTokenPrice(symbol);
        return { symbol, price };
    });

    const results = await Promise.allSettled(pricePromises);
    const prices: Record<string, { usd: number; change24h: number }> = {};

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            prices[result.value.symbol] = {
                usd: result.value.price,
                change24h: 0, // 暂时设为0，可以后续添加24小时变化
            };
        }
    });

    return prices;
}

// 获取代币余额
async function getTokenBalance(connection: Connection, walletAddress: string, tokenMint: string): Promise<any | null> {
    try {
        const walletPublicKey = new PublicKey(walletAddress);
        const tokenPublicKey = new PublicKey(tokenMint);

        // 获取关联代币账户地址
        const tokenAccount = await getAssociatedTokenAddress(
            tokenPublicKey,
            walletPublicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        // 获取代币账户信息
        const accountInfo = await getAccount(connection, tokenAccount);

        // 查找代币配置
        const tokenConfig = Object.values(TOKENS).find(token => token.address === tokenMint);
        if (!tokenConfig) {
            return null;
        }

        const balance = Number(accountInfo.amount) / Math.pow(10, tokenConfig.decimals);

        return {
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            balance,
            decimals: tokenConfig.decimals,
            address: tokenMint,
            color: tokenConfig.color,
        };
    } catch (error) {
        // 代币账户不存在或错误，返回null
        return null;
    }
}

// 获取完整钱包余额信息
export async function getWalletBalance(req: Request, res: Response, next: NextFunction) {
    const wallet = req.query.wallet as string;
    if (!wallet) {
        return res.status(400).json({ message: 'wallet 参数必填' });
    }

    try {
        const connection = new Connection(config.solana.rpc, 'confirmed');
        const publicKey = new PublicKey(wallet);

        // 并行获取SOL余额、代币余额和价格
        const [lamports, prices] = await Promise.all([
            connection.getBalance(publicKey),
            getAllTokenPrices()
        ]);

        const solBalance = lamports / LAMPORTS_PER_SOL;

        // 获取所有代币余额
        const tokenBalances = [];

        // 添加SOL余额
        if (solBalance > 0) {
            const solPrice = prices.SOL?.usd || 0;
            const solUsdValue = solBalance * solPrice;
            tokenBalances.push({
                symbol: 'SOL',
                name: 'Solana',
                balance: solBalance,
                price: solPrice,
                usdValue: solUsdValue,
                color: TOKENS.SOL.color,
            });
        }

        // 获取其他代币余额
        const tokenPromises = Object.values(TOKENS)
            .filter(token => token.symbol !== 'SOL')
            .map(token => getTokenBalance(connection, wallet, token.address));

        const tokenResults = await Promise.allSettled(tokenPromises);

        tokenResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value && result.value.balance > 0) {
                const price = prices[result.value.symbol]?.usd || 0;
                const usdValue = result.value.balance * price;
                tokenBalances.push({
                    ...result.value,
                    price,
                    usdValue,
                });
            }
        });

        // 计算总USD价值
        const totalUsdValue = tokenBalances.reduce((total, token) => total + token.usdValue, 0);

        const result = {
            address: wallet,
            solBalance,
            tokenBalances,
            totalUsdValue,
            lastUpdated: new Date().toISOString(),
        };

        res.json(result);
    } catch (error) {
        logger.error('获取钱包余额失败', error);
        res.status(500).json({
            message: '获取钱包余额失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
}

export async function getLatestBalance(req: Request, res: Response, next: NextFunction) {
    const wallet = req.query.wallet as string;
    if (!wallet) {
        return res.status(400).json({ message: 'wallet 参数必填' });
    }

    try {
        // 使用配置文件中的 RPC 连接
        const connection = new Connection(config.solana.rpc);
        const publicKey = new PublicKey(wallet);

        // 并行获取余额和价格
        const [lamports, balances, prices] = await Promise.all([
            connection.getBalance(publicKey),
            fetchBalances(wallet),
            fetchPrices()
        ]);

        const sol = lamports / 1e9;

        const result = {
            sol,
            usdc: balances.usdc,
            usdt: balances.usdt,
            prices: {
                sol: prices.sol,
                usdc: prices.usdc,
                usdt: prices.usdt
            }
        };

        res.json(result);
    } catch (error) {
        logger.error('获取余额失败', error);
        res.status(500).json({
            message: '获取余额失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
}

export async function getBalanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const { wallet, timeRange = '1h' } = req.body;
        if (!wallet) {
            return res.status(400).json({ message: 'wallet 必填' });
        }

        // 根据时间范围计算开始时间
        const now = new Date();
        let start: Date;
        let groupFormat: string;

        switch (timeRange) {
            case '1m':
                start = dayjs().subtract(1, 'minute').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
                break;
            case '5m':
                start = dayjs().subtract(5, 'minute').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
                break;
            case '15m':
                start = dayjs().subtract(15, 'minute').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
                break;
            case '30m':
                start = dayjs().subtract(30, 'minute').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
                break;
            case '1h':
                start = dayjs().subtract(1, 'hour').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
                break;
            case '6h':
                start = dayjs().subtract(6, 'hour').toDate();
                groupFormat = '%Y-%m-%dT%H:00:00';
                break;
            case '12h':
                start = dayjs().subtract(12, 'hour').toDate();
                groupFormat = '%Y-%m-%dT%H:00:00';
                break;
            case '1d':
                start = dayjs().subtract(1, 'day').toDate();
                groupFormat = '%Y-%m-%dT%H:00:00';
                break;
            default:
                start = dayjs().subtract(1, 'hour').toDate();
                groupFormat = '%Y-%m-%dT%H:%M:%S';
        }

        const data = await BalanceRecord.aggregate([
            {
                $match: {
                    wallet,
                    timestamp: {
                        $gte: start,
                        $lte: now
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: groupFormat, date: '$timestamp' }
                    },
                    sol: { $avg: '$sol' },
                    usdc: { $avg: '$usdc' },
                    usdt: { $avg: '$usdt' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    timestamp: '$_id',
                    _id: 0,
                    sol: { $round: ['$sol', 6] },
                    usdc: { $round: ['$usdc', 2] },
                    usdt: { $round: ['$usdt', 2] }
                }
            }
        ]);

        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function getAggregatedBalance(req: Request, res: Response, next: NextFunction) {
    try {
        const { wallet, period = '7d' } = req.query as { wallet?: string; period?: string };
        if (!wallet) {
            return res.status(400).json({ message: 'wallet 必填' });
        }
        const days = parseInt(period.replace('d', ''), 10) || 7;
        const from = dayjs().subtract(days, 'day').toDate();

        const [balanceData, priceData] = await Promise.all([
            BalanceRecord.find({ wallet, timestamp: { $gte: from } }).sort({ timestamp: 1 }),
            PriceHistory.find({ timestamp: { $gte: from } }).sort({ timestamp: 1 })
        ]);

        if (balanceData.length === 0) {
            return res.json({
                balance: { min: 0, max: 0, avg: 0, trend: 'stable' as const },
                price: { current: 0, change: 0, changePercent: '0' }
            });
        }

        const sols = balanceData.map((d: any) => d.sol);
        const min = Math.min(...sols);
        const max = Math.max(...sols);
        const avg = sols.reduce((a: number, b: number) => a + b, 0) / sols.length;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (sols[sols.length - 1] > sols[0] * 1.02) trend = 'up';
        else if (sols[sols.length - 1] < sols[0] * 0.98) trend = 'down';

        // 计算价格变化
        let currentPrice = 0;
        let priceChange = 0;
        let changePercent = '0';

        if (priceData.length > 0) {
            const latestPrice = priceData[priceData.length - 1];
            const earliestPrice = priceData[0];

            if (latestPrice && earliestPrice) {
                currentPrice = latestPrice.sol || 0;
                priceChange = (latestPrice.sol || 0) - (earliestPrice.sol || 0);

                if (earliestPrice.sol && earliestPrice.sol > 0) {
                    const percentChange = (priceChange / earliestPrice.sol) * 100;
                    changePercent = percentChange.toFixed(2);
                }
            }
        }

        res.json({
            balance: { min, max, avg, trend },
            price: { current: currentPrice, change: priceChange, changePercent }
        });
    } catch (error) {
        next(error);
    }
}

// 获取纯余额信息（不包含价格）
export async function getWalletBalanceOnly(req: Request, res: Response, next: NextFunction) {
    const wallet = req.query.wallet as string;
    if (!wallet) {
        return res.status(400).json({ message: 'wallet 参数必填' });
    }

    try {
        const connection = new Connection(config.solana.rpc, 'confirmed');
        const publicKey = new PublicKey(wallet);

        // 只获取SOL余额
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / LAMPORTS_PER_SOL;

        // 获取所有代币余额
        const tokenBalances = [];

        // 添加SOL余额
        if (solBalance > 0) {
            tokenBalances.push({
                symbol: 'SOL',
                name: 'Solana',
                balance: solBalance,
                decimals: 9,
                address: TOKENS.SOL.address,
                color: TOKENS.SOL.color,
            });
        }

        // 获取其他代币余额
        const tokenPromises = Object.values(TOKENS)
            .filter(token => token.symbol !== 'SOL')
            .map(token => getTokenBalance(connection, wallet, token.address));

        const tokenResults = await Promise.allSettled(tokenPromises);

        tokenResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value && result.value.balance > 0) {
                tokenBalances.push(result.value);
            }
        });

        const result = {
            address: wallet,
            solBalance,
            tokenBalances,
            lastUpdated: new Date().toISOString(),
        };

        res.json(result);
    } catch (error) {
        logger.error('获取钱包余额失败', error);
        res.status(500).json({
            message: '获取钱包余额失败',
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
} 