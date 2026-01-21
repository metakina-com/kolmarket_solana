/**
 * ElizaOS 集成模块
 * 用于创建和管理 KOL 数字生命智能体
 * 
 * 注意：使用动态导入避免 Edge Runtime 兼容性问题
 */

import { DigitalLifeConfig, DigitalLifeAgent } from "./digital-life";

// 类型定义（避免直接导入，可能导致 Edge Runtime 问题）
type Agent = any;
type Memory = any;
type ModelProviderName = string;

// ElizaOS Agent 实例存储
const agentInstances = new Map<string, Agent>();

/**
 * 使用 ElizaOS 创建 KOL 数字生命智能体
 * 
 * @param config - 数字生命配置
 * @returns 智能体对象
 */
export async function createElizaDigitalLife(
  config: DigitalLifeConfig
): Promise<DigitalLifeAgent> {
  try {
    // 注意：ElizaOS 的完整初始化需要更多配置
    // 这里提供基础框架，实际使用时需要：
    // 1. 配置模型提供者（OpenAI, Anthropic, 等）
    // 2. 配置数据库连接
    // 3. 配置其他必要的服务

    // 检查是否在 Edge Runtime（不支持）
    // Edge Runtime 没有 Node.js 全局对象
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("ElizaOS not supported in Edge Runtime. Using fallback.");
      return {
        id: `dl-${config.kolHandle}-${Date.now()}`,
        config,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
    }

    // 动态导入 ElizaOS（仅在 Node.js 环境）
    // const { Agent } = await import("@elizaos/core");
    // const { SolanaAgentKitPlugin } = await import("@elizaos/plugin-solana-agent-kit");

    // 创建 Agent 配置
    // 支持 Cloudflare Workers AI（推荐，无需 API Key）
    // 或传统模型提供者（OpenAI, Anthropic）
    // const agentConfig = {
    //   name: config.kolName,
    //   description: config.personality,
    //   // 选项 1: 使用 Cloudflare Workers AI（推荐）
    //   modelProvider: "CLOUDFLARE_AI" as ModelProviderName,
    //   model: "@cf/meta/llama-3-8b-instruct",
    //   // 选项 2: 使用传统模型提供者
    //   // modelProvider: (process.env.ELIZA_MODEL_PROVIDER || "OPEN_AI") as ModelProviderName,
    //   // model: process.env.ELIZA_MODEL || "gpt-4",
    //   // apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    //   knowledge: config.knowledgeBase,
    //   // 更多配置...
    // };

    // 创建 Agent 实例（需要完整配置）
    // const agent = new Agent(agentConfig);
    
    // 添加 Solana 插件
    // agent.addPlugin(new SolanaAgentKitPlugin({
    //   privateKey: process.env.SOLANA_PRIVATE_KEY,
    //   rpcUrl: process.env.SOLANA_RPC_URL,
    // }));

    // 存储 Agent 实例
    const agentId = `eliza-${config.kolHandle}-${Date.now()}`;
    // agentInstances.set(agentId, agent);

    // 当前返回基础实现（需要完整配置后才能使用 ElizaOS）
    return {
      id: agentId,
      config,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating ElizaOS agent:", error);
    // 降级到基础实现
    return {
      id: `dl-${config.kolHandle}-${Date.now()}`,
      config,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * 使用 ElizaOS Agent 进行对话
 * 
 * @param agentId - 智能体 ID
 * @param message - 用户消息
 * @returns 智能体回复
 */
export async function chatWithElizaAgent(
  agentId: string,
  message: string
): Promise<string> {
  try {
    const agent = agentInstances.get(agentId);
    
    if (!agent) {
      return `[ElizaOS Agent ${agentId}] Agent not found. Please create the agent first.`;
    }

    // 使用 ElizaOS 处理消息
    // const response = await agent.processMessage({
    //   content: message,
    //   userId: "user",
    //   roomId: "default",
    // });

    // return response.content || "No response generated.";

    // 临时返回（实际需要完整实现）
    return `[ElizaOS Agent ${agentId}] This is a placeholder. Full ElizaOS integration requires additional configuration (database, model provider, etc.).`;
  } catch (error) {
    console.error("Error chatting with ElizaOS agent:", error);
    return `[Error] Failed to process message: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * 获取 ElizaOS Agent 实例
 */
export function getElizaAgent(agentId: string): Agent | undefined {
  return agentInstances.get(agentId);
}

/**
 * 初始化 ElizaOS 环境
 * 需要在应用启动时调用
 */
export async function initializeElizaEnvironment(): Promise<void> {
  // 检查必要的环境变量
  // 注意：如果使用 Cloudflare Workers AI，不需要 API Key
  const requiredEnvVars = [
    // "OPENAI_API_KEY", // 仅在使用 OpenAI 时需要
    // "ANTHROPIC_API_KEY", // 仅在使用 Anthropic 时需要
    "SOLANA_RPC_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables for ElizaOS: ${missingVars.join(", ")}`
    );
    console.warn("ElizaOS features will be limited without these variables.");
  }
}
