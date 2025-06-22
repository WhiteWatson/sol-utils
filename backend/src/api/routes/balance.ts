import { Router } from 'express';
import { getLatestBalance, getBalanceHistory, getAggregatedBalance } from '../controllers/balanceController';

const router = Router();

router.get('/latest', getLatestBalance);
router.post('/history', getBalanceHistory);
router.get('/aggregated', getAggregatedBalance);

export default router; 