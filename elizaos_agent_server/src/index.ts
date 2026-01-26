import app from './app.js';
import { config, validateElizaOSDependencies } from './config/index.js';
import { logger } from './utils/logger.js';
import { runtimePool } from './core/RuntimePool.js';
import { db } from './db/index.js';

async function main() {
  // 验证 ElizaOS 依赖
  await validateElizaOSDependencies();

  // 检查数据库连接
  const dbHealthy = await db.healthCheck();
  if (!dbHealthy) {
    logger.error('Database connection failed');
    process.exit(1);
  }
  logger.info('Database connected');

  // 启动 Runtime 池清理任务
  runtimePool.startIdleCleanup(60000); // 每分钟检查一次
  logger.info(`RuntimePool started (max: ${config.MAX_ACTIVE_AGENTS}, timeout: ${config.AGENT_IDLE_TIMEOUT_MS}ms)`);
  logger.info(`ElizaOS configured: provider=${config.DEFAULT_MODEL_PROVIDER}, model=${config.DEFAULT_MODEL}`);

  // 启动 HTTP 服务器
  const server = app.listen(config.PORT, () => {
    logger.info(`🚀 ElizaOS Agent Server running on port ${config.PORT}`);
    logger.info(`   Environment: ${config.NODE_ENV}`);
  });

  // 优雅关闭
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      // 优雅关闭 RuntimePool (停止所有 ElizaOS Runtime)
      await runtimePool.shutdown();

      // 关闭数据库连接
      await db.close();

      process.exit(0);
    });

    // 强制退出超时
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
