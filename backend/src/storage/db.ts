import mongoose from 'mongoose';
import logger from '../utils/logger';
import { config } from '../config/index';

export async function connectDB() {
    const mongoUri = config.database.uri;
    try {
        await mongoose.connect(mongoUri);
        logger.info('✅ 已连接 MongoDB');
    } catch (error) {
        logger.error('❌ 连接 MongoDB 失败', error);
        throw error;
    }
} 