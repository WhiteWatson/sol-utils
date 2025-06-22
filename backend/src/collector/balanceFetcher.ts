import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { USDC_MINT, USDT_MINT } from '../config/constants';
import logger from '../utils/logger';
import { config } from '../config/index';

const connection = new Connection(config.solana.rpc);

export interface WalletBalances {
    sol: number;
    usdc: number;
    usdt: number;
}

async function getTokenBalance(publicKey: PublicKey, mintAddress: string): Promise<number> {
    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(mintAddress)
        });
        let amount = 0;
        accounts.value.forEach((acc: any) => {
            const parsed = acc.account.data.parsed;
            const balance = parsed.info.tokenAmount;
            amount += Number(balance.amount) / 10 ** balance.decimals;
        });
        return amount;
    } catch (e) {
        logger.error(`查询 token 余额失败: ${mintAddress}`, e);
        return 0;
    }
}

export async function fetchBalances(wallet: string): Promise<WalletBalances> {
    const publicKey = new PublicKey(wallet);
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / 1e9;
    const [usdc, usdt] = await Promise.all([
        getTokenBalance(publicKey, USDC_MINT),
        getTokenBalance(publicKey, USDT_MINT)
    ]);
    return { sol, usdc, usdt };
} 