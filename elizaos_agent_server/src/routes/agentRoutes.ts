import { Router, Request, Response, NextFunction } from 'express';
import { agentManager } from '../core/AgentManager.js';
import { validationService } from '../services/ValidationService.js';
import { CreateAgentRequestSchema } from '../types/agent.js';
import { optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// 应用可选认证中间件到所有路由
router.use(optionalAuth);

/**
 * POST /api/agents - 创建 Agent (表单模式)
 * 对应需求 FR-01
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.id || 'anonymous';
    const data = CreateAgentRequestSchema.parse(req.body);

    const agent = await agentManager.createAgent(creatorId, data);

    res.status(201).json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        createdAt: agent.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/agents/import - 导入 character.json
 * 对应需求 FR-02
 */
router.post('/import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.id || 'anonymous';
    
    // 支持直接传 JSON 对象或 JSON 字符串
    let character;
    if (typeof req.body.character === 'string') {
      character = validationService.parseAndValidate(req.body.character);
    } else {
      character = validationService.validateAndSanitize(req.body.character || req.body);
    }

    const agent = await agentManager.importAgent(creatorId, character);

    logger.info(`Agent imported: ${agent.id} (${agent.name})`);

    res.status(201).json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        createdAt: agent.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agents - 获取用户的所有 Agent
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.id || 'anonymous';
    const agents = await agentManager.getAgentsByCreator(creatorId);

    res.json({
      success: true,
      data: agents.map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        lastActiveAt: a.lastActiveAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agents/:id - 获取单个 Agent 详情
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentManager.getAgentById(req.params.id);

    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        character: agent.characterJson,
        status: agent.status,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
        lastActiveAt: agent.lastActiveAt?.toISOString() || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/agents/:id - 更新 Agent 配置
 * 对应需求 FR-03
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const character = validationService.validateAndSanitize(req.body);
    const agent = await agentManager.updateAgent(req.params.id, character);

    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        updatedAt: agent.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/agents/:id - 删除 Agent
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await agentManager.deleteAgent(req.params.id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

// Express Request 类型扩展
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}
