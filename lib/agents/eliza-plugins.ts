/**
 * Agent 插件模块 (轻量级 Stub 实现)
 * 
 * 原 ElizaOS 已移除，使用独立的 stub 实现
 * 这些 stub 提供 API 兼容性，实际功能需要配置外部服务
 */

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
 * 创建 Twitter Agent (Stub 实现)
 * TODO: 集成实际 Twitter API
 */
export async function createTwitterAgent(
  config: DigitalLifeConfig,
  twitterConfig: TwitterPluginConfig
): Promise<ElizaAgent> {
  console.log(`[Stub] Creating Twitter agent for ${config.kolName}`);
  return createFallbackAgent(config, "twitter");
}

/**
 * 创建 Discord Agent (Stub 实现)
 * TODO: 集成实际 Discord API
 */
export async function createDiscordAgent(
  config: DigitalLifeConfig,
  discordConfig: DiscordPluginConfig
): Promise<ElizaAgent> {
  console.log(`[Stub] Creating Discord agent for ${config.kolName}`);
  return createFallbackAgent(config, "discord");
}

/**
 * 创建 Telegram Agent (Stub 实现)
 * TODO: 集成实际 Telegram Bot API
 */
export async function createTelegramAgent(
  config: DigitalLifeConfig,
  telegramConfig: TelegramPluginConfig
): Promise<ElizaAgent> {
  console.log(`[Stub] Creating Telegram agent for ${config.kolName}`);
  return createFallbackAgent(config, "telegram");
}

/**
 * 创建 Solana Agent (Stub 实现)
 * TODO: 集成实际 Solana 交易功能
 */
export async function createSolanaAgent(
  config: DigitalLifeConfig,
  solanaConfig: SolanaPluginConfig
): Promise<ElizaAgent> {
  console.log(`[Stub] Creating Solana agent for ${config.kolName}`);
  return createFallbackAgent(config, "solana");
}

/**
 * Stub 实现（提供 API 兼容性）
 */
function createFallbackAgent(config: DigitalLifeConfig, platform: string = "generic"): ElizaAgent {
  return {
    id: `${platform}-${config.kolHandle}-${Date.now()}`,
    name: config.kolName,
    processMessage: async (message: any) => {
      return {
        content: `[${platform}] Response from ${config.kolName}. Configure external service for full functionality.`,
      };
    },
    postTweet: async (content: string) => {
      console.log(`[${platform}] Would post: ${content}`);
      return `${platform}-post-${Date.now()}`;
    },
    sendMessage: async (channelId: string, message: string) => {
      console.log(`[${platform}] Would send to ${channelId}: ${message}`);
    },
    executeTrade: async (action: string, params: any) => {
      console.log(`[${platform}] Would execute: ${action}`, params);
      return `${platform}-tx-${Date.now()}`;
    },
    start: async () => {
      console.log(`[${platform}] Agent ${config.kolName} started (stub)`);
    },
    stop: async () => {
      console.log(`[${platform}] Agent ${config.kolName} stopped (stub)`);
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
