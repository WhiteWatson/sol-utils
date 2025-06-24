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

// 新的钱包余额接口类型
export interface WalletBalanceData {
    address: string;
    solBalance: number;
    tokenBalances: Array<{
        symbol: string;
        name: string;
        balance: number;
        price: number;
        usdValue: number;
        color: string;
    }>;
    totalUsdValue: number;
    lastUpdated: string;
}

// 纯余额数据接口类型（不包含价格）
export interface WalletBalanceOnlyData {
    address: string;
    solBalance: number;
    tokenBalances: Array<{
        symbol: string;
        name: string;
        balance: number;
        decimals: number;
        address: string;
        color: string;
    }>;
    lastUpdated: string;
}

export const api = {
    async getLatestBalance(wallet: string): Promise<BalanceData> {
        const response = await axios.get(`${API_BASE}/balance/latest`, {
            params: { wallet }
        });
        return response.data;
    },

    async getWalletBalance(wallet: string): Promise<WalletBalanceData> {
        const response = await axios.get(`${API_BASE}/balance/wallet`, {
            params: { wallet }
        });
        return response.data;
    },

    async getWalletBalanceOnly(wallet: string): Promise<WalletBalanceOnlyData> {
        const response = await axios.get(`${API_BASE}/balance/wallet-only`, {
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