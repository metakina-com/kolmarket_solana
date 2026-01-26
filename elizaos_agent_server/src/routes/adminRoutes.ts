import { Router, Request, Response, NextFunction } from 'express';
import { runtimePool } from '../core/RuntimePool.js';
import { db } from '../db/index.js';

const router = Router();

/**
 * GET /api/admin/stats - 系统统计
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const poolStats = runtimePool.getStats();
    
    // 获取数据库统计
    const agentCountResult = await db.query('SELECT COUNT(*) as count FROM agents');
    const activeCountResult = await db.query(
      "SELECT COUNT(*) as count FROM agents WHERE status = 'active'"
    );

    res.json({
      success: true,
      data: {
        pool: poolStats,
        database: {
          totalAgents: parseInt(agentCountResult.rows[0].count),
          activeAgents: parseInt(activeCountResult.rows[0].count),
        },
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        uptime: Math.round(process.uptime()),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/pool - 查看资源池状态
 */
router.get('/pool', (_req: Request, res: Response) => {
  const stats = runtimePool.getStats();
  
  res.json({
    success: true,
    data: stats,
  });
});

/**
 * POST /api/admin/agents/:id/evict - 强制卸载 Agent
 */
router.post('/agents/:id/evict', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const evicted = await runtimePool.evict(id);

    if (!evicted) {
      res.status(404).json({ 
        success: false, 
        error: 'Agent not in pool' 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: `Agent ${id} evicted from pool` 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/pool/clear - 清空资源池
 */
router.post('/pool/clear', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await runtimePool.clear();
    
    res.json({ 
      success: true, 
      message: 'Pool cleared' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
