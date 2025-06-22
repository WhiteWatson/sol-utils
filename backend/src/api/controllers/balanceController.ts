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
        const { wallet, startDate, endDate, interval = 'hourly' } = req.body;
        if (!wallet) {
            return res.status(400).json({ message: 'wallet 必填' });
        }
        const start = startDate ? new Date(startDate) : dayjs().subtract(1, 'day').toDate();
        const end = endDate ? new Date(endDate) : new Date();

        const groupFormat = interval === 'daily' ? '%Y-%m-%d' : '%Y-%m-%dT%H:00:00Z';

        const data = await BalanceRecord.aggregate([
            {
                $match: {
                    wallet,
                    timestamp: {
                        $gte: start,
                        $lte: end
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
                    sol: 1,
                    usdc: 1,
                    usdt: 1
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

        if (balanceData.length === 0) return res.json({});

        const sols = balanceData.map((d: any) => d.sol);
        const min = Math.min(...sols);
        const max = Math.max(...sols);
        const avg = sols.reduce((a: number, b: number) => a + b, 0) / sols.length;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (sols[sols.length - 1] > sols[0] * 1.02) trend = 'up';
        else if (sols[sols.length - 1] < sols[0] * 0.98) trend = 'down';

        res.json({ min, max, avg, trend });
    } catch (error) {
        next(error);
    }
} 