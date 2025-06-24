import { Request, Response, NextFunction } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import logger from '../../utils/logger';
import BalanceRecord from '../../storage/models/BalanceRecord';
import dayjs from 'dayjs';
import PriceHistory from '../../storage/models/PriceHistory';
import { config } from '../../config/index';
import { fetchBalances } from '../../collector/balanceFetcher';
import { fetchPrices } from '../../collector/priceFetcher';

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