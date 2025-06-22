import { CronJob } from 'cron';
import { fetchBalances } from './balanceFetcher';
import { fetchPrices } from './priceFetcher';
import BalanceRecord from '../storage/models/BalanceRecord';
import PriceHistory from '../storage/models/PriceHistory';
import logger from '../utils/logger';
import { config } from '../config/index';

const wallets = config.monitor.wallets;

export function startScheduler() {
    if (wallets.length === 0) {
        logger.warn('未配置 MONITOR_WALLETS，定时任务未启动');
        return;
    }

    const job = new CronJob('*/1 * * * *', async () => {
        try {
            const prices = await fetchPrices();
            await PriceHistory.create({
                timestamp: new Date(),
                ...prices
            });
            for (const wallet of wallets) {
                const balances = await fetchBalances(wallet);
                await BalanceRecord.create({
                    wallet,
                    timestamp: new Date(),
                    ...balances
                });
                logger.info(`已记录余额 ${wallet}`);
            }
            logger.info('已记录价格历史');
        } catch (error) {
            logger.error('定时任务失败', error);
        }
    });

    job.start();
    logger.info('⏰ 定时采集任务已启动 (每分钟)');
} 