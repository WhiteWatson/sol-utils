import dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 3000,
    },
    database: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/solana-monitor',
    },
    solana: {
        rpc: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
    },
    monitor: {
        wallets: (process.env.MONITOR_WALLETS || '').split(',').filter((w: string) => w),
    },
    coingecko: {
        apiKey: process.env.COINGECKO_API_KEY,
    }
}; 