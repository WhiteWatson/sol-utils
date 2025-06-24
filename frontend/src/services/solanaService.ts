import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

// Solana网络配置
export const SOLANA_NETWORKS = {
    MAINNET: 'https://api.mainnet-beta.solana.com',
    DEVNET: 'https://api.devnet.solana.com',
    TESTNET: 'https://api.testnet.solana.com',
} as const;

// 常用代币配置
export const TOKENS = {
    SOL: {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        address: 'So11111111111111111111111111111111111111112', // Wrapped SOL
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

// 余额数据接口
export interface TokenBalance {
    symbol: string;
    name: string;
    balance: number;
    decimals: number;
    address: string;
    color: string;
    usdValue?: number;
    price?: number;
}

// 钱包余额接口
export interface WalletBalance {
    address: string;
    solBalance: number;
    tokenBalances: TokenBalance[];
    totalUsdValue: number;
    lastUpdated: string;
}

// 价格数据接口
export interface PriceData {
    [symbol: string]: {
        usd: number;
        change24h: number;
    };
}

class SolanaService {
    private connection: Connection;
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

    constructor(endpoint: string = SOLANA_NETWORKS.MAINNET) {
        this.connection = new Connection(endpoint, 'confirmed');
    }

    // 获取SOL余额
    async getSolBalance(walletAddress: string): Promise<number> {
        try {
            const publicKey = new PublicKey(walletAddress);
            const balance = await this.connection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('获取SOL余额失败:', error);
            return 0;
        }
    }

    // 获取代币余额
    async getTokenBalance(walletAddress: string, tokenMint: string): Promise<TokenBalance | null> {
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
            const accountInfo = await getAccount(this.connection, tokenAccount);

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

    // 获取所有代币余额
    async getAllTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
        const tokenBalances: TokenBalance[] = [];

        // 获取SOL余额
        const solBalance = await this.getSolBalance(walletAddress);
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
            .map(token => this.getTokenBalance(walletAddress, token.address));

        const results = await Promise.allSettled(tokenPromises);

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value && result.value.balance > 0) {
                tokenBalances.push(result.value);
            }
        });

        return tokenBalances;
    }

    // 获取代币价格
    async getTokenPrice(symbol: string): Promise<number> {
        const cacheKey = symbol.toLowerCase();
        const cached = this.priceCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.price;
        }

        try {
            // 使用CoinGecko API获取价格
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${this.getCoinGeckoId(symbol)}&vs_currencies=usd&include_24hr_change=true`
            );

            if (!response.ok) {
                throw new Error('价格获取失败');
            }

            const data = await response.json();
            const coinId = this.getCoinGeckoId(symbol);
            const price = data[coinId]?.usd || 0;

            // 缓存价格
            this.priceCache.set(cacheKey, { price, timestamp: Date.now() });

            return price;
        } catch (error) {
            console.error(`获取${symbol}价格失败:`, error);
            return 0;
        }
    }

    // 获取所有代币价格
    async getAllTokenPrices(): Promise<PriceData> {
        const symbols = Object.values(TOKENS).map(token => token.symbol);
        const pricePromises = symbols.map(async (symbol) => {
            const price = await this.getTokenPrice(symbol);
            return { symbol, price };
        });

        const results = await Promise.allSettled(pricePromises);
        const prices: PriceData = {};

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

    // 获取完整钱包余额信息
    async getWalletBalance(walletAddress: string): Promise<WalletBalance> {
        try {
            // 获取所有代币余额
            const tokenBalances = await this.getAllTokenBalances(walletAddress);

            // 获取价格数据
            const prices = await this.getAllTokenPrices();

            // 计算USD价值和添加价格信息
            let totalUsdValue = 0;
            const enrichedBalances = tokenBalances.map(token => {
                const price = prices[token.symbol]?.usd || 0;
                const usdValue = token.balance * price;
                totalUsdValue += usdValue;

                return {
                    ...token,
                    price,
                    usdValue,
                };
            });

            return {
                address: walletAddress,
                solBalance: tokenBalances.find(t => t.symbol === 'SOL')?.balance || 0,
                tokenBalances: enrichedBalances,
                totalUsdValue,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error('获取钱包余额失败:', error);
            return {
                address: walletAddress,
                solBalance: 0,
                tokenBalances: [],
                totalUsdValue: 0,
                lastUpdated: new Date().toISOString(),
            };
        }
    }

    // 获取CoinGecko ID
    private getCoinGeckoId(symbol: string): string {
        const coinMap: Record<string, string> = {
            'SOL': 'solana',
            'USDC': 'usd-coin',
            'USDT': 'tether',
            'BONK': 'bonk',
            'JUP': 'jupiter',
        };
        return coinMap[symbol] || symbol.toLowerCase();
    }

    // 刷新价格缓存
    clearPriceCache(): void {
        this.priceCache.clear();
    }

    // 设置网络端点
    setEndpoint(endpoint: string): void {
        this.connection = new Connection(endpoint, 'confirmed');
    }
}

// 创建单例实例
export const solanaService = new SolanaService(); 