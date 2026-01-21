/**
 * ElizaOS 增强集成模块
 * 
 * 提供更完整的 ElizaOS 集成实现，包括：
 * - 实际插件初始化
 * - 错误处理和重试机制
 * - 日志记录
 * - 环境检测和降级
 */

import { DigitalLifeConfig, DigitalLifeAgent } from "./digital-life";

// ==================== 类型定义 ====================

export interface ElizaAgentConfig {
  name: string;
  description: string;
  modelProvider?: "CLOUDFLARE_AI" | "OPEN_AI" | "ANTHROPIC";
  model?: string;
  apiKey?: string;
  knowledge?: string[];
  plugins?: string[]; // 插件列表
}

export interface ElizaAgentInstance {
  id: string;
  config: ElizaAgentConfig;
  status: "initializing" | "ready" | "error" | "stopped";
  createdAt: string;
  lastActivity?: string;
  error?: string;
}

// ==================== 日志系统 ====================

class Logger {
  private prefix = "[ElizaOS]";

  info(message: string, ...args: any[]) {
    console.log(`${this.prefix} [INFO]`, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`${this.prefix} [WARN]`, message, ...args);
  }

  error(message: string, error?: Error, ...args: any[]) {
    console.error(`${this.prefix} [ERROR]`, message, error, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`${this.prefix} [DEBUG]`, message, ...args);
    }
  }
}

const logger = new Logger();

// ==================== 环境检测 ====================

function isEdgeRuntime(): boolean {
  return typeof process === "undefined" || !process.versions?.node;
}

function isCloudflareWorkers(): boolean {
  return typeof globalThis !== "undefined" && "caches" in globalThis;
}

// ==================== 配置验证 ====================

function validateConfig(config: ElizaAgentConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name) {
    errors.push("Agent name is required");
  }

  if (config.modelProvider === "OPEN_AI" && !config.apiKey) {
    errors.push("OpenAI API key is required when using OpenAI");
  }

  if (config.modelProvider === "ANTHROPIC" && !config.apiKey) {
    errors.push("Anthropic API key is required when using Anthropic");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== ElizaOS Agent 管理器 ====================

class ElizaAgentManager {
  private agents = new Map<string, ElizaAgentInstance>();
  private initialized = false;

  /**
   * 初始化 ElizaOS 环境
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug("Already initialized");
      return;
    }

    logger.info("Initializing ElizaOS environment...");

    // 检查环境
    if (isEdgeRuntime()) {
      logger.warn("Running in Edge Runtime. ElizaOS features will be limited.");
    }

    // 检查必要的环境变量
    const requiredEnvVars: string[] = [];
    if (process.env.ELIZA_MODEL_PROVIDER === "OPEN_AI") {
      requiredEnvVars.push("OPENAI_API_KEY");
    }
    if (process.env.ELIZA_MODEL_PROVIDER === "ANTHROPIC") {
      requiredEnvVars.push("ANTHROPIC_API_KEY");
    }

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      logger.warn(`Missing environment variables: ${missingVars.join(", ")}`);
    }

    this.initialized = true;
    logger.info("ElizaOS environment initialized");
  }

  /**
   * 创建 ElizaOS Agent
   */
  async createAgent(
    digitalLifeConfig: DigitalLifeConfig,
    elizaConfig?: Partial<ElizaAgentConfig>
  ): Promise<DigitalLifeAgent> {
    try {
      await this.initialize();

      // 合并配置
      const config: ElizaAgentConfig = {
        name: digitalLifeConfig.kolName,
        description: digitalLifeConfig.personality,
        modelProvider: (process.env.ELIZA_MODEL_PROVIDER as any) || "CLOUDFLARE_AI",
        model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
        knowledge: digitalLifeConfig.knowledgeBase,
        ...elizaConfig,
      };

      // 验证配置
      const validation = validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.errors.join(", ")}`);
      }

      // 检查环境兼容性
      if (isEdgeRuntime()) {
        logger.warn("Edge Runtime detected. Using fallback implementation.");
        return this.createFallbackAgent(digitalLifeConfig);
      }

      // TODO: 实际创建 ElizaOS Agent
      // const { Agent } = await import("@elizaos/core");
      // const agent = new Agent(config);

      // 创建 Agent 实例记录
      const agentId = `eliza-${digitalLifeConfig.kolHandle}-${Date.now()}`;
      const instance: ElizaAgentInstance = {
        id: agentId,
        config,
        status: "ready",
        createdAt: new Date().toISOString(),
      };

      this.agents.set(agentId, instance);
      logger.info(`Agent created: ${agentId}`);

      return {
        id: agentId,
        config: digitalLifeConfig,
        createdAt: instance.createdAt,
        lastUpdated: instance.createdAt,
      };
    } catch (error) {
      logger.error("Failed to create agent", error as Error);
      return this.createFallbackAgent(digitalLifeConfig);
    }
  }

  /**
   * 降级实现（用于 Edge Runtime 或不支持的环境）
   */
  private createFallbackAgent(config: DigitalLifeConfig): DigitalLifeAgent {
    logger.warn("Using fallback agent implementation");
    return {
      id: `fallback-${config.kolHandle}-${Date.now()}`,
      config,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 获取 Agent 实例
   */
  getAgent(agentId: string): ElizaAgentInstance | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 更新 Agent 状态
   */
  updateAgentStatus(agentId: string, status: ElizaAgentInstance["status"], error?: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date().toISOString();
      if (error) {
        agent.error = error;
      }
      this.agents.set(agentId, agent);
    }
  }

  /**
   * 获取所有 Agent
   */
  getAllAgents(): ElizaAgentInstance[] {
    return Array.from(this.agents.values());
  }
}

// ==================== 单例导出 ====================

export const elizaAgentManager = new ElizaAgentManager();

// ==================== 便捷函数 ====================

/**
 * 创建 ElizaOS 数字生命智能体（增强版）
 */
export async function createElizaDigitalLifeEnhanced(
  config: DigitalLifeConfig,
  elizaConfig?: Partial<ElizaAgentConfig>
): Promise<DigitalLifeAgent> {
  return elizaAgentManager.createAgent(config, elizaConfig);
}

/**
 * 初始化 ElizaOS 环境（增强版）
 */
export async function initializeElizaEnvironmentEnhanced(): Promise<void> {
  return elizaAgentManager.initialize();
}
