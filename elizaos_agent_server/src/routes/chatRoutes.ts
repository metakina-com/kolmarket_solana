/**
 * Chat API 路由
 * 
 * 处理与 Agent 的对话交互
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { chatService, ChatError } from '../services/ChatService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// 请求验证 Schema
const SendMessageSchema = z.object({
  userId: z.string().min(1).max(100), // 允许任意字符串作为用户ID
  roomId: z.string().min(1).optional(),
  text: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).optional(),
});

const GetHistorySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.coerce.number().optional(),
  after: z.coerce.number().optional(),
});

/**
 * POST /api/chat/:agentId
 * 发送消息给 Agent
 */
router.post('/:agentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    
    // 验证请求体
    const validation = SendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.format(),
      });
    }

    const { userId, roomId, text, metadata } = validation.data;

    logger.info(`Chat API: message received for agent ${agentId}`);

    // 调用 ChatService
    const response = await chatService.sendMessage({
      agentId,
      userId,
      roomId,
      text,
      metadata,
    });

    return res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {
    if (error instanceof ChatError) {
      logger.error(`Chat API error: ${error.code}`, { 
        agentId: error.agentId, 
        message: error.message 
      });
      
      return res.status(500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Agent not found
    if (error instanceof Error && error.message.includes('Agent not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: error.message,
        },
      });
    }

    next(error);
  }
});

/**
 * GET /api/chat/:agentId/history/:roomId
 * 获取对话历史
 */
router.get('/:agentId/history/:roomId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, roomId } = req.params;
    
    // 验证查询参数
    const validation = GetHistorySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.format(),
      });
    }

    const { limit } = validation.data;

    logger.debug(`Chat API: fetching history for room ${roomId}`);

    const history = await chatService.getHistory({
      agentId,
      roomId,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: {
        roomId,
        messages: history,
        count: history.length,
      },
    });

  } catch (error) {
    if (error instanceof ChatError) {
      return res.status(500).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
});

/**
 * POST /api/chat/:agentId/session
 * 创建新的对话 Session
 */
router.post('/:agentId/session', async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_USER_ID',
        message: 'userId is required',
      },
    });
  }

  const roomId = chatService.createSession(agentId, userId);

  return res.status(201).json({
    success: true,
    data: {
      agentId,
      userId,
      roomId,
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * DELETE /api/chat/:agentId/history/:roomId
 * 清除对话历史
 */
router.delete('/:agentId/history/:roomId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;

    await chatService.clearHistory(roomId);

    return res.status(200).json({
      success: true,
      message: 'History cleared',
    });

  } catch (error) {
    next(error);
  }
});

export default router;
