import axios from 'axios';

const API_BASE = '/api';

export interface BalanceData {
    sol: number;
    usdc: number;
    usdt: number;
    prices: {
        sol: number;
        usdc: number;
        usdt: number;
    };
}

export interface HistoryData {
    timestamp: string;
    sol: number;
    usdc: number;
    usdt: number;
}

export interface AggregatedData {
    balance: {
        min: number;
        max: number;
        avg: number;
        trend: 'up' | 'down' | 'stable';
    };
    price: {
        current: number;
        change: number;
        changePercent: string;
    };
}

export const api = {
    async getLatestBalance(wallet: string): Promise<BalanceData> {
        const response = await axios.get(`${API_BASE}/balance/latest`, {
            params: { wallet }
        });
        return response.data;
    },

    async getBalanceHistory(wallet: string, timeRange = '1h'): Promise<HistoryData[]> {
        const response = await axios.post(`${API_BASE}/balance/history`, {
            wallet,
            timeRange
        });
        return response.data;
    },

    async getAggregatedBalance(wallet: string, period = '7d'): Promise<AggregatedData> {
        const response = await axios.get(`${API_BASE}/balance/aggregated`, {
            params: { wallet, period }
        });
        return response.data;
    }
}; 