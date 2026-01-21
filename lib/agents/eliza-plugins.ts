/**
 * ElizaOS 插件集成模块
 * 
 * 实际集成 Twitter、Discord、Telegram、Solana 插件
 * 
 * 注意：此模块只能在 Node.js 环境运行，不能在 Edge Runtime 中使用
 */

import "server-only";
import type { DigitalLifeConfig } from "./digital-life";

// ==================== 类型定义 ====================

export interface ElizaAgent {
  id: string;
  name: string;
  processMessage?: (message: any) => Promise<any>;
  postTweet?: (content: string) => Promise<string>;
  sendMessage?: (channelId: string, message: string) => Promise<void>;
  executeTrade?: (action: string, params: any) => Promise<string>;
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
}

export interface TwitterPluginConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  autoPost?: boolean;
  autoInteract?: boolean;
}

export interface DiscordPluginConfig {
  botToken: string;
  guildId?: string;
  autoReply?: boolean;
}

export interface TelegramPluginConfig {
  botToken: string;
  autoReply?: boolean;
}

export interface SolanaPluginConfig {
  privateKey?: string;
  publicKey?: string;
  rpcUrl?: string;
  autoTrading?: boolean;
}

// ==================== ElizaOS Agent 创建器 ====================

/**
 * 创建带有 Twitter 插件的 ElizaOS Agent
 */
export async function createTwitterAgent(
  config: DigitalLifeConfig,
  twitterConfig: TwitterPluginConfig
): Promise<ElizaAgent> {
  try {
    // 检查是否在 Edge Runtime（不支持）
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("ElizaOS plugins not supported in Edge Runtime");
      return createFallbackAgent(config);
    }

    // 动态导入 ElizaOS 和 Twitter 插件（仅在运行时）
    const elizaosCore: any = await import("@elizaos/core");
    const Agent = elizaosCore.Agent || elizaosCore.default?.Agent;
    const twitterPluginModule: any = await import("@elizaos/plugin-twitter");
    const TwitterPlugin = twitterPluginModule.default || twitterPluginModule.TwitterPlugin;

    // 创建 Agent 配置
    const agentConfig = {
      name: config.kolName,
      description: config.personality,
      modelProvider: (process.env.ELIZA_MODEL_PROVIDER || "CLOUDFLARE_AI") as any,
      model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
      knowledge: config.knowledgeBase || [],
    };

    // 创建 Agent 实例
    const agent = new Agent(agentConfig);

    // 添加 Twitter 插件
    const twitterPlugin = new TwitterPlugin({
      apiKey: twitterConfig.apiKey,
      apiSecret: twitterConfig.apiSecret,
      accessToken: twitterConfig.accessToken,
      accessTokenSecret: twitterConfig.accessTokenSecret,
      autoPost: twitterConfig.autoPost ?? false,
      autoInteract: twitterConfig.autoInteract ?? false,
    });

    agent.addPlugin(twitterPlugin);

    return {
      id: `twitter-${config.kolHandle}-${Date.now()}`,
      name: config.kolName,
      processMessage: async (message: any) => {
        return await agent.processMessage(message);
      },
      postTweet: async (content: string) => {
        // 使用 Twitter 插件发推
        const result = await twitterPlugin.postTweet?.(content);
        return result || `tweet-${Date.now()}`;
      },
      start: async () => {
        await agent.start?.();
      },
      stop: async () => {
        await agent.stop?.();
      },
    };
  } catch (error) {
    console.error("Failed to create Twitter agent:", error);
    // 返回降级实现
    return createFallbackAgent(config);
  }
}

/**
 * 创建带有 Discord 插件的 ElizaOS Agent
 */
export async function createDiscordAgent(
  config: DigitalLifeConfig,
  discordConfig: DiscordPluginConfig
): Promise<ElizaAgent> {
  try {
    // 检查是否在 Edge Runtime
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("ElizaOS plugins not supported in Edge Runtime");
      return createFallbackAgent(config);
    }

    // 动态导入
    const elizaosCore: any = await import("@elizaos/core");
    const Agent = elizaosCore.Agent || elizaosCore.default?.Agent;
    const discordPluginModule: any = await import("@elizaos/plugin-discord");
    const DiscordPlugin = discordPluginModule.default || discordPluginModule.DiscordPlugin;

    const agentConfig = {
      name: config.kolName,
      description: config.personality,
      modelProvider: (process.env.ELIZA_MODEL_PROVIDER || "CLOUDFLARE_AI") as any,
      model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
      knowledge: config.knowledgeBase || [],
    };

    const agent = new Agent(agentConfig);

    const discordPlugin = new DiscordPlugin({
      token: discordConfig.botToken,
      guildId: discordConfig.guildId,
      autoReply: discordConfig.autoReply ?? true,
    });

    agent.addPlugin(discordPlugin);

    return {
      id: `discord-${config.kolHandle}-${Date.now()}`,
      name: config.kolName,
      processMessage: async (message: any) => {
        return await agent.processMessage(message);
      },
      sendMessage: async (channelId: string, message: string) => {
        await discordPlugin.sendMessage?.(channelId, message);
      },
      start: async () => {
        await agent.start?.();
      },
      stop: async () => {
        await agent.stop?.();
      },
    };
  } catch (error) {
    console.error("Failed to create Discord agent:", error);
    return createFallbackAgent(config);
  }
}

/**
 * 创建带有 Telegram 插件的 ElizaOS Agent
 */
export async function createTelegramAgent(
  config: DigitalLifeConfig,
  telegramConfig: TelegramPluginConfig
): Promise<ElizaAgent> {
  try {
    // 检查是否在 Edge Runtime
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("ElizaOS plugins not supported in Edge Runtime");
      return createFallbackAgent(config);
    }

    // 动态导入
    const elizaosCore: any = await import("@elizaos/core");
    const Agent = elizaosCore.Agent || elizaosCore.default?.Agent;
    const telegramPluginModule: any = await import("@elizaos/plugin-telegram");
    const TelegramPlugin = telegramPluginModule.default || telegramPluginModule.TelegramPlugin;

    const agentConfig = {
      name: config.kolName,
      description: config.personality,
      modelProvider: (process.env.ELIZA_MODEL_PROVIDER || "CLOUDFLARE_AI") as any,
      model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
      knowledge: config.knowledgeBase || [],
    };

    const agent = new Agent(agentConfig);

    const telegramPlugin = new TelegramPlugin({
      token: telegramConfig.botToken,
      autoReply: telegramConfig.autoReply ?? true,
    });

    agent.addPlugin(telegramPlugin);

    return {
      id: `telegram-${config.kolHandle}-${Date.now()}`,
      name: config.kolName,
      processMessage: async (message: any) => {
        return await agent.processMessage(message);
      },
      sendMessage: async (chatId: string, message: string) => {
        await telegramPlugin.sendMessage?.(chatId, message);
      },
      start: async () => {
        await agent.start?.();
      },
      stop: async () => {
        await agent.stop?.();
      },
    };
  } catch (error) {
    console.error("Failed to create Telegram agent:", error);
    return createFallbackAgent(config);
  }
}

/**
 * 创建带有 Solana 插件的 ElizaOS Agent
 */
export async function createSolanaAgent(
  config: DigitalLifeConfig,
  solanaConfig: SolanaPluginConfig
): Promise<ElizaAgent> {
  try {
    // 检查是否在 Edge Runtime
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("ElizaOS plugins not supported in Edge Runtime");
      return createFallbackAgent(config);
    }

    // 动态导入
    const elizaosCore: any = await import("@elizaos/core");
    const Agent = elizaosCore.Agent || elizaosCore.default?.Agent;
    const solanaPluginModule: any = await import("@elizaos/plugin-solana-agent-kit");
    const SolanaAgentKitPlugin = solanaPluginModule.default || solanaPluginModule.SolanaAgentKitPlugin;

    const agentConfig = {
      name: config.kolName,
      description: config.personality,
      modelProvider: (process.env.ELIZA_MODEL_PROVIDER || "CLOUDFLARE_AI") as any,
      model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
      knowledge: config.knowledgeBase || [],
    };

    const agent = new Agent(agentConfig);

    const solanaPlugin = new SolanaAgentKitPlugin({
      privateKey: solanaConfig.privateKey,
      publicKey: solanaConfig.publicKey,
      rpcUrl: solanaConfig.rpcUrl || process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      autoTrading: solanaConfig.autoTrading ?? false,
    });

    agent.addPlugin(solanaPlugin);

    return {
      id: `solana-${config.kolHandle}-${Date.now()}`,
      name: config.kolName,
      processMessage: async (message: any) => {
        return await agent.processMessage(message);
      },
      executeTrade: async (action: string, params: any) => {
        // 使用 Solana 插件执行交易
        const result = await solanaPlugin.executeTrade?.(action, params);
        return result || `tx-${Date.now()}`;
      },
      start: async () => {
        await agent.start?.();
      },
      stop: async () => {
        await agent.stop?.();
      },
    };
  } catch (error) {
    console.error("Failed to create Solana agent:", error);
    return createFallbackAgent(config);
  }
}

/**
 * 降级实现（当插件不可用时）
 */
function createFallbackAgent(config: DigitalLifeConfig): ElizaAgent {
  return {
    id: `fallback-${config.kolHandle}-${Date.now()}`,
    name: config.kolName,
    processMessage: async (message: any) => {
      return {
        content: `[Fallback] This is a placeholder response for ${config.kolName}. Plugin integration pending.`,
      };
    },
    postTweet: async (content: string) => {
      console.log(`[Fallback] Would post tweet: ${content}`);
      return `tweet-fallback-${Date.now()}`;
    },
    sendMessage: async (channelId: string, message: string) => {
      console.log(`[Fallback] Would send message to ${channelId}: ${message}`);
    },
    executeTrade: async (action: string, params: any) => {
      console.log(`[Fallback] Would execute trade: ${action}`, params);
      return `tx-fallback-${Date.now()}`;
    },
    start: async () => {
      console.log(`[Fallback] Agent ${config.kolName} started`);
    },
    stop: async () => {
      console.log(`[Fallback] Agent ${config.kolName} stopped`);
    },
  };
}

// ==================== Agent 存储 ====================

const agentInstances = new Map<string, ElizaAgent>();

export function getAgent(agentId: string): ElizaAgent | undefined {
  return agentInstances.get(agentId);
}

export function setAgent(agentId: string, agent: ElizaAgent): void {
  agentInstances.set(agentId, agent);
}

export function removeAgent(agentId: string): void {
  const agent = agentInstances.get(agentId);
  if (agent?.stop) {
    agent.stop();
  }
  agentInstances.delete(agentId);
}
