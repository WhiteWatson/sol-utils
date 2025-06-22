import { createServer } from './api/server';
import { connectDB } from './storage/db';
import logger from './utils/logger';
import { startScheduler } from './collector/scheduler';
import { config } from './config/index';

async function bootstrap() {
    try {
        await connectDB();
        const app = createServer();
        app.listen(config.server.port, () => {
            logger.info(`🚀 Server is running at http://localhost:${config.server.port}`);
        });

        startScheduler();
    } catch (error) {
        logger.error('启动失败', error);
        process.exit(1);
    }
}

bootstrap(); 