/**
 * ElizaOS Runtime 工厂
 * 
 * 负责创建和配置 ElizaOS AgentRuntime 实例
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { elizaDbAdapter } from '../db/ElizaDatabaseAdapter.js';
import type { ElizaCharacter, ElizaRuntimeConfig } from '../types/eliza.js';

/**
 * 配置验证结果
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ElizaOS Runtime 接口 (简化版)
 * 用于类型检查，实际类型来自 @elizaos/core
 */
export interface IElizaRuntime {
  agentId: string;
  character: unknown;
  initialize(options?: { skipMigrations?: boolean }): Promise<void>;
  stop(): Promise<void>;
}

/**
 * ElizaOS Runtime 工厂类
 */
export class ElizaRuntimeFactory {
  /**
   * 创建 ElizaOS Runtime 实例
   */
  async createRuntime(runtimeConfig: ElizaRuntimeConfig): Promise<IElizaRuntime> {
    // 1. 验证配置
    const validation = this.validateConfig(runtimeConfig);
    if (!validation.valid) {
      throw new Error(`Invalid runtime config: ${validation.errors.join(', ')}`);
    }

    // 2. 获取 API Token
    const token = this.getApiToken(runtimeConfig.modelProvider);
    if (!token) {
      throw new Error(`API token not found for provider: ${runtimeConfig.modelProvider}`);
    }

    // 3. 准备 Character 配置
    const character = this.prepareCharacter(runtimeConfig.character, runtimeConfig.modelProvider);

    // 4. 动态导入 ElizaOS 并创建 Runtime
    logger.info(`Creating ElizaOS runtime for character: ${character.name}`);
    
    // 动态导入以避免类型检查问题
    const elizaCore = await import('@elizaos/core') as any;
    const AgentRuntime = elizaCore.AgentRuntime;
    
    if (!AgentRuntime) {
      throw new Error('AgentRuntime not found in @elizaos/core');
    }
    
    const runtime = new AgentRuntime({
      character: character as any,
      adapter: elizaDbAdapter as any,
      settings: {
        // 可以在这里传递额外设置
      },
    });

    // 5. 初始化 Runtime
    await runtime.initialize();
    
    logger.info(`ElizaOS runtime initialized for: ${character.name}`);
    return runtime as IElizaRuntime;
  }

  /**
   * 验证 Runtime 配置
   */
  validateConfig(runtimeConfig: ElizaRuntimeConfig): ValidationResult {
    const errors: string[] = [];

    // 验证 Character
    if (!runtimeConfig.character) {
      errors.push('Character is required');
    } else {
      if (!runtimeConfig.character.name) {
        errors.push('Character name is required');
      }
      if (!runtimeConfig.character.bio) {
        errors.push('Character bio is required');
      }
    }

    // 验证 Model Provider
    if (!runtimeConfig.modelProvider) {
      errors.push('Model provider is required');
    } else if (!['openai', 'anthropic'].includes(runtimeConfig.modelProvider)) {
      errors.push(`Invalid model provider: ${runtimeConfig.modelProvider}`);
    }

    // 验证 API Token 可用性
    if (runtimeConfig.modelProvider === 'openai' && !config.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required for OpenAI provider');
    }
    if (runtimeConfig.modelProvider === 'anthropic' && !config.ANTHROPIC_API_KEY) {
      errors.push('ANTHROPIC_API_KEY is required for Anthropic provider');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取 API Token
   */
  private getApiToken(provider: string): string | undefined {
    switch (provider) {
      case 'openai':
        return config.OPENAI_API_KEY;
      case 'anthropic':
        return config.ANTHROPIC_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * 准备 Character 配置
   * 设置默认值并清理不安全字段
   */
  private prepareCharacter(
    character: ElizaCharacter,
    modelProvider: string
  ): ElizaCharacter {
    // 创建副本避免修改原对象
    const prepared: ElizaCharacter = {
      ...character,
      // 设置默认 username
      username: character.username || character.name.toLowerCase().replace(/\s+/g, '_'),
      // 设置模型提供商
      modelProvider: character.modelProvider || modelProvider,
      // 确保数组字段存在
      topics: character.topics || [],
      adjectives: character.adjectives || [],
      lore: character.lore || [],
      messageExamples: character.messageExamples || [],
      postExamples: character.postExamples || [],
      style: {
        all: character.style?.all || [],
        chat: character.style?.chat || [],
        post: character.style?.post || [],
      },
    };

    // 清理不安全字段
    delete prepared.plugins;  // 插件需要单独审核
    if (prepared.settings) {
      delete prepared.settings.secrets;  // 不允许导入密钥
    }

    return prepared;
  }
}

// 单例导出
export const elizaRuntimeFactory = new ElizaRuntimeFactory();
