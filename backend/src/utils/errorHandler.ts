import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    logger.error(err.message || '服务器错误');
    res.status(err.status || 500).json({ message: err.message || '服务器错误' });
} 