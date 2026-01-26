/**
 * ElizaOS 类型扩展
 * 
 * 这些类型与 @elizaos/core 兼容，用于本地类型检查和扩展
 */

import type { UUID } from 'crypto';

/**
 * ElizaOS Character 完整接口
 * 与 @elizaos/core Character 类型兼容
 */
export interface ElizaCharacter {
  // 必填字段
  name: string;
  bio: string | string[];
  
  // 可选标识字段 (导入时由平台生成)
  id?: string;
  username?: string;
  
  // 人设相关
  lore?: string[];
  topics?: string[];
  adjectives?: string[];
  knowledge?: string[];
  
  // 风格配置
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
  };
  
  // 示例对话
  messageExamples?: Array<Array<{
    user: string;
    content: { text: string };
  }>>;
  postExamples?: string[];
  
  // 模型设置
  modelProvider?: string;
  settings?: {
    model?: string;
    voice?: {
      model?: string;
    };
    secrets?: Record<string, string>;  // 导入时清洗
  };
  
  // 客户端配置
  clients?: string[];
  
  // 插件 (导入时忽略)
  plugins?: string[];
}

/**
 * ElizaOS Memory 接口
 * 用于存储对话历史和上下文
 */
export interface ElizaMemory {
  id: string;
  agentId: string;
  userId: string;
  roomId: string;
  content: ElizaContent;
  embedding?: number[];
  createdAt: number;
  unique?: boolean;
}

/**
 * ElizaOS Content 接口
 */
export interface ElizaContent {
  text: string;
  action?: string;
  source?: string;
  url?: string;
  inReplyTo?: string;
  attachments?: ElizaAttachment[];
  metadata?: Record<string, unknown>;
}

/**
 * ElizaOS Attachment 接口
 */
export interface ElizaAttachment {
  id: string;
  url: string;
  title?: string;
  source?: string;
  description?: string;
  text?: string;
  contentType?: string;
}

/**
 * ElizaOS State 接口
 * 用于消息处理时的上下文状态
 */
export interface ElizaState {
  userId?: string;
  agentId?: string;
  roomId?: string;
  bio?: string;
  lore?: string;
  messageDirections?: string;
  postDirections?: string;
  actors?: string;
  recentMessages?: string;
  recentMessagesData?: ElizaMemory[];
  goals?: string;
  goalsData?: ElizaGoal[];
  actions?: string;
  actionNames?: string;
  providers?: string;
  responseData?: Record<string, unknown>;
  recentInteractionsData?: ElizaMemory[];
  [key: string]: unknown;
}

/**
 * ElizaOS Goal 接口
 */
export interface ElizaGoal {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  status: 'IN_PROGRESS' | 'DONE' | 'FAILED';
  objectives: ElizaObjective[];
}

/**
 * ElizaOS Objective 接口
 */
export interface ElizaObjective {
  id: string;
  description: string;
  completed: boolean;
}

/**
 * Runtime 配置接口
 */
export interface ElizaRuntimeConfig {
  character: ElizaCharacter;
  modelProvider: 'openai' | 'anthropic';
  modelName?: string;
  token?: string;
  databaseAdapter?: unknown;
}

/**
 * Chat 请求接口
 */
export interface ChatRequest {
  agentId: string;
  userId: string;
  roomId?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chat 响应接口
 */
export interface ChatResponse {
  messageId: string;
  agentId: string;
  roomId: string;
  text: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * 消息历史查询参数
 */
export interface GetHistoryParams {
  agentId: string;
  roomId: string;
  limit?: number;
  before?: number;
  after?: number;
}
