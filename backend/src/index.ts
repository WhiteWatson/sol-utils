import { createServer } from './api/server';
import { connectDB } from './storage/db';
import logger from './utils/logger';
import { startScheduler } from './collector/scheduler';
import { config } from './config/index';

async function bootstrap() {
    try {
        // 尝试连接数据库，但不强制要求
        try {
            await connectDB();
        } catch (error) {
            logger.warn('⚠️ 数据库连接失败，服务将继续运行但某些功能可能不可用', error);
        }

        const app = createServer();
        app.listen(config.server.port, () => {
            logger.info(`🚀 Server is running at http://localhost:${config.server.port}`);
        });

        // 只有在数据库连接成功时才启动调度器
        try {
            startScheduler();
        } catch (error) {
            logger.warn('⚠️ 调度器启动失败', error);
        }
    } catch (error) {
        logger.error('启动失败', error);
        process.exit(1);
    }
}

bootstrap(); 