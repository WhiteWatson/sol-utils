import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';
import { config } from '../config/index';
import logger from '../utils/logger';

const connection = new Connection(config.solana.rpc);

export interface Prices {
    sol: number;
    usdc: number;
    usdt: number;
}

// 使用 Solana RPC 获取价格数据
export async function fetchPrices(): Promise<Prices> {
    try {
        // 尝试从 Pyth Network 获取价格
        const pythResponse = await axios.get('https://api.pyth.network/v2/price_feeds/latest', {
            params: {
                ids: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d,0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a,0x2b89b9dc8fdf9f34709a5b106b472f0f39bb1ca902ce3094e9153e7b142ca84e'
            },
            timeout: 10000
        });

        if (pythResponse.data && pythResponse.data.data) {
            const feeds = pythResponse.data.data;
            const solPrice = feeds['0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d']?.price?.price || 0;
            const usdcPrice = feeds['0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a']?.price?.price || 1;
            const usdtPrice = feeds['0x2b89b9dc8fdf9f34709a5b106b472f0f39bb1ca902ce3094e9153e7b142ca84e']?.price?.price || 1;

            return {
                sol: solPrice,
                usdc: usdcPrice,
                usdt: usdtPrice
            };
        }

        // 如果 Pyth 失败，尝试 CoinGecko
        logger.warn('Pyth Network 获取失败，尝试 CoinGecko');
        const coingeckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: { ids: 'solana,usd-coin,tether', vs_currencies: 'usd' },
            timeout: 10000
        });

        const { solana, 'usd-coin': usdcPrice, tether } = coingeckoResponse.data;
        return {
            sol: solana.usd,
            usdc: usdcPrice.usd,
            usdt: tether.usd
        };

    } catch (error) {
        logger.error('获取价格失败', error);

        // 如果所有价格源都失败，返回默认价格
        logger.warn('使用默认价格');
        return {
            sol: 100, // 默认 SOL 价格
            usdc: 1,  // USDC 通常稳定在 1 USD
            usdt: 1   // USDT 通常稳定在 1 USD
        };
    }
} 