import { Router } from 'express';
import agentRoutes from './agentRoutes.js';
import chatRoutes from './chatRoutes.js';
import adminRoutes from './adminRoutes.js';
import { db } from '../db/index.js';
import { runtimePool } from '../core/RuntimePool.js';

const router = Router();

// Agent 管理 API
router.use('/agents', agentRoutes);

// 对话 API
router.use('/chat', chatRoutes);

// 管理员 API
router.use('/admin', adminRoutes);

// 健康检查 - 详细版本
router.get('/health', async (_req, res) => {
  const dbHealthy = await db.healthCheck();
  const poolStats = runtimePool.getStats();
  
  const status = dbHealthy ? 'ok' : 'degraded';
  const statusCode = dbHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      runtimePool: {
        status: 'healthy',
        activeAgents: poolStats.size,
        maxAgents: poolStats.maxSize,
      },
    },
  });
});

export default router;
