import { Schema, model, Document } from 'mongoose';

export interface IPriceHistory extends Document {
    timestamp: Date;
    sol: number;
    usdc: number;
    usdt: number;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
    timestamp: { type: Date, default: Date.now, index: true },
    sol: { type: Number, required: true },
    usdc: { type: Number, required: true },
    usdt: { type: Number, required: true }
});

export default model<IPriceHistory>('PriceHistory', PriceHistorySchema); 