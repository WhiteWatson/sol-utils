import { Schema, model, Document } from 'mongoose';

export interface IBalanceRecord extends Document {
    wallet: string;
    timestamp: Date;
    sol: number;
    usdc: number;
    usdt: number;
}

const BalanceRecordSchema = new Schema<IBalanceRecord>({
    wallet: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    sol: { type: Number, required: true },
    usdc: { type: Number, required: true },
    usdt: { type: Number, required: true }
});

export default model<IBalanceRecord>('BalanceRecord', BalanceRecordSchema); 