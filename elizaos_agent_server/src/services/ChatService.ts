/**
 * ChatService - 对话处理服务
 * 
 * 负责处理用户与 Agent 之间的对话消息
 */

import { v4 as uuidv4 } from 'uuid';
import { agentManager } from '../core/AgentManager.js';
import { elizaDbAdapter } from '../db/ElizaDatabaseAdapter.js';
import { logger } from '../utils/logger.js';
import type { 
  ChatRequest, 
  ChatResponse, 
  ElizaMemory, 
  GetHistoryParams 
} from '../types/eliza.js';

/**
 * 聊天错误类
 */
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

/**
 * ChatService 类
 */
export class ChatService {
  /**
   * 发送消息并获取 Agent 响应
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const { agentId, userId, text, metadata } = request;
    const roomId = request.roomId || uuidv4();
    const messageId = uuidv4();

    logger.info(`ChatService: processing message for agent ${agentId}, room ${roomId}`);

    try {
      // 1. 获取或唤醒 Runtime
      const runtime = await agentManager.getOrHydrate(agentId);

      // 2. 构建 Memory 对象
      const memory: ElizaMemory = {
        id: messageId,
        agentId,
        userId,
        roomId,
        content: {
          text,
          metadata,
        },
        createdAt: Date.now(),
      };

      // 3. 存储用户消息
      await elizaDbAdapter.createMemory(memory);

      // 4. 使用 ElizaOS Runtime 生成响应
      let responseText: string;
      
      try {
        // 尝试多种 ElizaOS API 调用方式
        responseText = await this.generateResponse(runtime, text, roomId, userId);
      } catch (genError) {
        logger.error(`ChatService: text generation failed for agent ${agentId}:`, genError);
        responseText = 'I apologize, but I encountered an error while processing your message.';
      }

      // 5. 存储 Agent 响应
      const responseMemory: ElizaMemory = {
        id: uuidv4(),
        agentId,
        userId: agentId, // Agent 作为发送者
        roomId,
        content: {
          text: responseText,
          metadata: { isAgentResponse: true },
        },
        createdAt: Date.now(),
      };
      
      await elizaDbAdapter.createMemory(responseMemory);

      // 6. 返回响应
      const response: ChatResponse = {
        messageId: responseMemory.id,
        agentId,
        roomId,
        text: responseText,
        timestamp: new Date(),
        metadata: responseMemory.content.metadata,
      };

      logger.info(`ChatService: response generated for agent ${agentId}, room ${roomId}`);
      return response;

    } catch (error) {
      logger.error(`ChatService: error processing message for agent ${agentId}:`, error);
      
      // 返回优雅的错误响应
      throw new ChatError(
        'Failed to process message',
        'MESSAGE_PROCESSING_FAILED',
        agentId,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * 生成 Agent 响应 - 兼容多种 ElizaOS API
   */
  private async generateResponse(
    runtime: unknown,
    text: string,
    roomId: string,
    userId: string
  ): Promise<string> {
    const rt = runtime as Record<string, unknown>;
    
    // 方式1: 使用 processMessage (ElizaOS 标准方法)
    if (typeof rt.processMessage === 'function') {
      const result = await (rt.processMessage as Function)({
        content: { text },
        roomId,
        userId,
      });
      return this.extractResponseText(result);
    }

    // 方式2: 使用 generateText
    if (typeof rt.generateText === 'function') {
      const result = await (rt.generateText as Function)(text, { roomId, userId });
      return this.extractResponseText(result);
    }

    // 方式3: 使用 chat 方法
    if (typeof rt.chat === 'function') {
      const result = await (rt.chat as Function)(text, { roomId, userId });
      return this.extractResponseText(result);
    }

    // 方式4: 使用 handleMessage
    if (typeof rt.handleMessage === 'function') {
      const result = await (rt.handleMessage as Function)({
        content: { text },
        roomId,
        userId,
      });
      return this.extractResponseText(result);
    }

    throw new Error('No compatible message handling method found on runtime');
  }

  /**
   * 从响应中提取文本
   */
  private extractResponseText(result: unknown): string {
    if (typeof result === 'string') {
      return result;
    }
    
    if (result && typeof result === 'object') {
      const obj = result as Record<string, unknown>;
      
      // 尝试多种响应格式
      if (typeof obj.text === 'string') return obj.text;
      if (typeof obj.content === 'string') return obj.content;
      if (obj.content && typeof (obj.content as Record<string, unknown>).text === 'string') {
        return (obj.content as Record<string, unknown>).text as string;
      }
      if (typeof obj.message === 'string') return obj.message;
      if (typeof obj.response === 'string') return obj.response;
    }

    return 'I apologize, but I could not generate a response.';
  }

  /**
   * 获取对话历史
   */
  async getHistory(params: GetHistoryParams): Promise<ElizaMemory[]> {
    const { agentId, roomId, limit = 50 } = params;

    logger.debug(`ChatService: fetching history for room ${roomId}, limit ${limit}`);

    try {
      const memories = await elizaDbAdapter.getMemories({
        roomId,
        count: limit,
      });

      return memories;
    } catch (error) {
      logger.error(`ChatService: error fetching history for room ${roomId}:`, error);
      throw new ChatError(
        'Failed to fetch conversation history',
        'HISTORY_FETCH_FAILED',
        agentId,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * 创建新的对话 Session
   */
  createSession(agentId: string, userId: string): string {
    const roomId = uuidv4();
    logger.info(`ChatService: created new session ${roomId} for agent ${agentId}, user ${userId}`);
    return roomId;
  }

  /**
   * 清理对话历史
   */
  async clearHistory(roomId: string): Promise<void> {
    logger.info(`ChatService: clearing history for room ${roomId}`);
    await elizaDbAdapter.removeAllMemories(roomId);
  }
}

// 单例导出
export const chatService = new ChatService();
