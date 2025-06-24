import { Router } from 'express';
import { getLatestBalance, getBalanceHistory, getAggregatedBalance, getWalletBalance, getWalletBalanceOnly } from '../controllers/balanceController';

const router = Router();

router.get('/latest', getLatestBalance);
router.get('/wallet', getWalletBalance);
router.get('/wallet-only', getWalletBalanceOnly);
router.post('/history', getBalanceHistory);
router.get('/aggregated', getAggregatedBalance);

export default router; 