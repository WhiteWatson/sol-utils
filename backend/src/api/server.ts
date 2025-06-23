import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import balanceRouter from './routes/balance';
import { errorHandler } from '../utils/errorHandler';
import logger from '../utils/logger';

export function createServer(): Express {
    const app = express();

    // 中间件
    app.use(express.json());
    app.use(cors());
    app.use(helmet());

    // 日志中间件
    app.use((req, _res, next) => {
        logger.info(`${req.method} ${req.url}`);
        next();
    });

    // 健康检查
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    // API 路由
    app.use('/api/balance', balanceRouter);

    // Swagger 文档
    const swaggerSpec = swaggerJSDoc({
        definition: {
            openapi: '3.0.0',
            info: { title: 'Solana Balance Monitor API', version: '1.0.0' }
        },
        apis: []
    });
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // 错误处理中间件
    app.use(errorHandler);

    return app;
} 