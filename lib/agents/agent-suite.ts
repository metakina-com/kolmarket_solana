/**
 * KOLMarket Agent Suite
 * 
 * 基于 ElizaOS 的完整智能体套件，包含：
 * 1. Avatar (数字分身) - Twitter 自动发推、互动
 * 2. Mod (粉丝客服) - Discord/Telegram 机器人
 * 3. Trader (带单交易) - Solana 链上交易
 * 
 * 这是 KOLMarket 的"灵魂注入器"，让数字生命真正活起来。
 */

import { DigitalLifeConfig } from "./digital-life";
import { KOLPersona } from "./kol-personas";

// 动态导入插件（避免在 Edge Runtime 和构建时加载）
// 这些插件只能在 Node.js 环境运行，且包含原生模块
async function getElizaPlugins() {
  // 检查是否在 Node.js 环境
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }

  try {
    // 使用动态 import()，避免构建时分析
    const plugins = await import("./eliza-plugins");
    return plugins;
  } catch (error) {
    console.warn("Failed to load ElizaOS plugins:", error);
    return null;
  }
}

// ==================== 类型定义 ====================

export interface AgentSuiteConfig {
  kolHandle: string;
  kolName: string;
  persona: KOLPersona;
  
  // 模块配置
  avatar?: AvatarConfig;
  mod?: ModConfig;
  trader?: TraderConfig;
}

export interface AvatarConfig {
  enabled: boolean;
  twitterHandle?: string;
  autoPost: boolean; // 24/7 自动发推
  autoInteract: boolean; // 自动回复、点赞、转发
  postFrequency: "hourly" | "daily" | "custom"; // 发推频率
  customSchedule?: string; // 自定义时间表
  memoryEnabled: boolean; // 记忆能力（记住粉丝、互动历史）
}

export interface ModConfig {
  enabled: boolean;
  platforms: ("discord" | "telegram")[];
  discordGuildId?: string;
  telegramBotToken?: string;
  autoReply: boolean; // 自动回复
  onboardingEnabled: boolean; // 新人引导
  meetingNotesEnabled: boolean; // 会议纪要
  moderationEnabled: boolean; // 内容审核
}

export interface TraderConfig {
  enabled: boolean;
  walletAddress?: string;
  autoTrading: boolean; // 自动交易
  followMode: boolean; // 跟单模式（粉丝可以跟单）
  profitShare: number; // 利润分成比例 (0-100)
  riskLevel: "low" | "medium" | "high"; // 风险等级
  maxPositionSize: number; // 最大仓位（SOL）
  allowedTokens?: string[]; // 允许交易的代币列表
}

export interface AgentSuiteStatus {
  suiteId: string;
  kolHandle: string;
  status: "active" | "inactive" | "error";
  modules: {
    avatar: ModuleStatus;
    mod: ModuleStatus;
    trader: ModuleStatus;
  };
  stats: {
    avatar?: AvatarStats;
    mod?: ModStats;
    trader?: TraderStats;
  };
  createdAt: string;
  lastUpdated: string;
}

export interface ModuleStatus {
  enabled: boolean;
  status: "running" | "stopped" | "error";
  lastActivity?: string;
  error?: string;
}

export interface AvatarStats {
  totalTweets: number;
  totalInteractions: number;
  followers: number;
  engagementRate: number;
  lastTweetTime?: string;
}

export interface ModStats {
  totalMessages: number;
  totalUsers: number;
  responseRate: number;
  averageResponseTime: number; // 秒
  lastActivity?: string;
}

export interface TraderStats {
  totalTrades: number;
  totalVolume: number; // SOL
  totalProfit: number; // SOL
  winRate: number; // 0-100
  followers: number; // 跟单人数
  lastTradeTime?: string;
}

// ==================== Agent Suite 管理器 ====================

class AgentSuiteManager {
  private suites = new Map<string, AgentSuiteStatus>();

  /**
   * 创建新的 Agent Suite
   */
  async createSuite(config: AgentSuiteConfig): Promise<AgentSuiteStatus> {
    const suiteId = `suite-${config.kolHandle}-${Date.now()}`;
    
    const suite: AgentSuiteStatus = {
      suiteId,
      kolHandle: config.kolHandle,
      status: "inactive",
      modules: {
        avatar: {
          enabled: config.avatar?.enabled || false,
          status: "stopped",
        },
        mod: {
          enabled: config.mod?.enabled || false,
          status: "stopped",
        },
        trader: {
          enabled: config.trader?.enabled || false,
          status: "stopped",
        },
      },
      stats: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    this.suites.set(suiteId, suite);

    // 初始化各个模块
    if (config.avatar?.enabled) {
      await this.initializeAvatar(suiteId, config);
    }
    if (config.mod?.enabled) {
      await this.initializeMod(suiteId, config);
    }
    if (config.trader?.enabled) {
      await this.initializeTrader(suiteId, config);
    }

    return suite;
  }

  /**
   * 获取 Suite 状态
   */
  getSuite(suiteId: string): AgentSuiteStatus | undefined {
    return this.suites.get(suiteId);
  }

  /**
   * 启动 Suite
   */
  async startSuite(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Suite ${suiteId} not found`);
    }

    suite.status = "active";
    suite.lastUpdated = new Date().toISOString();

    // 启动各个模块
    if (suite.modules.avatar.enabled) {
      await this.startAvatar(suiteId);
    }
    if (suite.modules.mod.enabled) {
      await this.startMod(suiteId);
    }
    if (suite.modules.trader.enabled) {
      await this.startTrader(suiteId);
    }
  }

  /**
   * 停止 Suite
   */
  async stopSuite(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Suite ${suiteId} not found`);
    }

    suite.status = "inactive";
    suite.lastUpdated = new Date().toISOString();

    // 停止各个模块
    if (suite.modules.avatar.enabled) {
      await this.stopAvatar(suiteId);
    }
    if (suite.modules.mod.enabled) {
      await this.stopMod(suiteId);
    }
    if (suite.modules.trader.enabled) {
      await this.stopTrader(suiteId);
    }
  }

  // ==================== Avatar 模块 ====================

  private async initializeAvatar(suiteId: string, config: AgentSuiteConfig): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 使用 ElizaOS 初始化 Twitter Client
    if (config.avatar?.enabled) {
      try {
        const plugins = await getElizaPlugins();
        if (plugins) {
          const twitterConfig = {
            apiKey: process.env.TWITTER_API_KEY || "",
            apiSecret: process.env.TWITTER_API_SECRET || "",
            accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
            autoPost: config.avatar.autoPost,
            autoInteract: config.avatar.autoInteract,
          };

          // 检查必要的环境变量
          if (twitterConfig.apiKey && twitterConfig.apiSecret) {
            const digitalLifeConfig: DigitalLifeConfig = {
              kolHandle: config.kolHandle,
              kolName: config.kolName,
              personality: config.persona.personality,
              knowledgeBase: config.persona.knowledgeBase,
            };

            const agent = await plugins.createTwitterAgent(digitalLifeConfig, twitterConfig);
            plugins.setAgent(`${suiteId}-avatar`, agent);
          }
        }
      } catch (error) {
        console.error(`Failed to initialize Avatar for ${suiteId}:`, error);
      }
    }

    suite.modules.avatar.status = "stopped";
    suite.stats.avatar = {
      totalTweets: 0,
      totalInteractions: 0,
      followers: 0,
      engagementRate: 0,
    };
  }

  private async startAvatar(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.avatar.enabled) return;

    // 启动 Twitter Agent
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-avatar`);
    if (agent?.start) {
      try {
        await agent.start();
        suite.modules.avatar.status = "running";
        suite.modules.avatar.lastActivity = new Date().toISOString();
      } catch (error) {
        console.error(`Failed to start Avatar for ${suiteId}:`, error);
        suite.modules.avatar.status = "error";
        suite.modules.avatar.error = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      suite.modules.avatar.status = "running";
      suite.modules.avatar.lastActivity = new Date().toISOString();
    }
  }

  private async stopAvatar(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 停止 Twitter Agent
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-avatar`);
    if (agent?.stop) {
      try {
        await agent.stop();
      } catch (error) {
        console.error(`Failed to stop Avatar for ${suiteId}:`, error);
      }
    }

    suite.modules.avatar.status = "stopped";
  }

  /**
   * 手动触发发推
   */
  async postTweet(suiteId: string, content: string): Promise<string> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.avatar.enabled) {
      throw new Error("Avatar module not enabled");
    }

    // 使用 ElizaOS Twitter Client 发推
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-avatar`);
    let tweetId: string;

    if (agent?.postTweet) {
      try {
        tweetId = await agent.postTweet(content);
      } catch (error) {
        console.error(`Failed to post tweet for ${suiteId}:`, error);
        tweetId = `tweet-error-${Date.now()}`;
      }
    } else {
      // 降级实现
      console.warn(`Twitter agent not available for ${suiteId}, using fallback`);
      tweetId = `tweet-fallback-${Date.now()}`;
    }

    // 更新统计
    if (suite.stats.avatar) {
      suite.stats.avatar.totalTweets += 1;
      suite.stats.avatar.lastTweetTime = new Date().toISOString();
    }

    return tweetId;
  }

  // ==================== Mod 模块 ====================

  private async initializeMod(suiteId: string, config: AgentSuiteConfig): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 使用 ElizaOS 初始化 Discord/Telegram Client
    if (config.mod?.enabled) {
      const digitalLifeConfig: DigitalLifeConfig = {
        kolHandle: config.kolHandle,
        kolName: config.kolName,
        personality: config.persona.personality,
        knowledgeBase: config.persona.knowledgeBase,
      };

      const plugins = await getElizaPlugins();
      if (plugins) {
        // 初始化 Discord
        if (config.mod.platforms.includes("discord") && process.env.DISCORD_BOT_TOKEN) {
          try {
            const discordConfig = {
              botToken: process.env.DISCORD_BOT_TOKEN,
              guildId: config.mod.discordGuildId,
              autoReply: config.mod.autoReply,
            };
            const agent = await plugins.createDiscordAgent(digitalLifeConfig, discordConfig);
            plugins.setAgent(`${suiteId}-mod-discord`, agent);
          } catch (error) {
            console.error(`Failed to initialize Discord for ${suiteId}:`, error);
          }
        }

        // 初始化 Telegram
        if (config.mod.platforms.includes("telegram") && process.env.TELEGRAM_BOT_TOKEN) {
          try {
            const telegramConfig = {
              botToken: process.env.TELEGRAM_BOT_TOKEN || config.mod.telegramBotToken || "",
              autoReply: config.mod.autoReply,
            };
            const agent = await plugins.createTelegramAgent(digitalLifeConfig, telegramConfig);
            plugins.setAgent(`${suiteId}-mod-telegram`, agent);
          } catch (error) {
            console.error(`Failed to initialize Telegram for ${suiteId}:`, error);
          }
        }
      }
    }

    suite.modules.mod.status = "stopped";
    suite.stats.mod = {
      totalMessages: 0,
      totalUsers: 0,
      responseRate: 0,
      averageResponseTime: 0,
    };
  }

  private async startMod(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.mod.enabled) return;

    // 启动 Discord/Telegram 机器人
    try {
      const plugins = await getElizaPlugins();
      if (plugins) {
        const discordAgent = plugins.getAgent(`${suiteId}-mod-discord`);
        if (discordAgent?.start) {
          await discordAgent.start();
        }

        const telegramAgent = plugins.getAgent(`${suiteId}-mod-telegram`);
        if (telegramAgent?.start) {
          await telegramAgent.start();
        }
      }

      suite.modules.mod.status = "running";
      suite.modules.mod.lastActivity = new Date().toISOString();
    } catch (error) {
      console.error(`Failed to start Mod for ${suiteId}:`, error);
      suite.modules.mod.status = "error";
      suite.modules.mod.error = error instanceof Error ? error.message : "Unknown error";
    }
  }

  private async stopMod(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 停止 Discord/Telegram 机器人
    const plugins = await getElizaPlugins();
    if (plugins) {
      const discordAgent = plugins.getAgent(`${suiteId}-mod-discord`);
      if (discordAgent?.stop) {
        try {
          await discordAgent.stop();
        } catch (error) {
          console.error(`Failed to stop Discord for ${suiteId}:`, error);
        }
      }

      const telegramAgent = plugins.getAgent(`${suiteId}-mod-telegram`);
      if (telegramAgent?.stop) {
        try {
          await telegramAgent.stop();
        } catch (error) {
          console.error(`Failed to stop Telegram for ${suiteId}:`, error);
        }
      }
    }

    suite.modules.mod.status = "stopped";
  }

  /**
   * 处理社区消息
   */
  async handleCommunityMessage(
    suiteId: string,
    platform: "discord" | "telegram",
    message: string,
    userId: string
  ): Promise<string> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.mod.enabled) {
      throw new Error("Mod module not enabled");
    }

    // 使用 ElizaOS 处理消息
    const plugins = await getElizaPlugins();
    const agentId = `${suiteId}-mod-${platform}`;
    const agent = plugins?.getAgent(agentId);

    let response: string;

    if (agent?.processMessage) {
      try {
        const result = await agent.processMessage({
          content: message,
          userId,
          roomId: suiteId,
        });
        response = result.content || result.response || "No response generated.";
      } catch (error) {
        console.error(`Failed to process message for ${suiteId}:`, error);
        response = `[Error] Failed to process message: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    } else {
      // 降级实现
      response = `[Mod Response] This is a placeholder response. ${platform} agent not available.`;
    }

    // 更新统计
    if (suite.stats.mod) {
      suite.stats.mod.totalMessages += 1;
    }

    return response;
  }

  // ==================== Trader 模块 ====================

  private async initializeTrader(suiteId: string, config: AgentSuiteConfig): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 使用 ElizaOS Solana Plugin 初始化交易功能
    if (config.trader?.enabled) {
      try {
        const plugins = await getElizaPlugins();
        if (plugins) {
          const solanaConfig = {
            privateKey: process.env.SOLANA_PRIVATE_KEY,
            publicKey: process.env.SOLANA_PUBLIC_KEY,
            rpcUrl: process.env.SOLANA_RPC_URL,
            autoTrading: config.trader.autoTrading,
          };

          // 检查必要的环境变量
          if (solanaConfig.privateKey || solanaConfig.publicKey) {
            const digitalLifeConfig: DigitalLifeConfig = {
              kolHandle: config.kolHandle,
              kolName: config.kolName,
              personality: config.persona.personality,
              knowledgeBase: config.persona.knowledgeBase,
            };

            const agent = await plugins.createSolanaAgent(digitalLifeConfig, solanaConfig);
            plugins.setAgent(`${suiteId}-trader`, agent);
          }
        }
      } catch (error) {
        console.error(`Failed to initialize Trader for ${suiteId}:`, error);
      }
    }

    suite.modules.trader.status = "stopped";
    suite.stats.trader = {
      totalTrades: 0,
      totalVolume: 0,
      totalProfit: 0,
      winRate: 0,
      followers: 0,
    };
  }

  private async startTrader(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.trader.enabled) return;

    // 启动 Solana Agent
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-trader`);
    if (agent?.start) {
      try {
        await agent.start();
        suite.modules.trader.status = "running";
        suite.modules.trader.lastActivity = new Date().toISOString();
      } catch (error) {
        console.error(`Failed to start Trader for ${suiteId}:`, error);
        suite.modules.trader.status = "error";
        suite.modules.trader.error = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      suite.modules.trader.status = "running";
      suite.modules.trader.lastActivity = new Date().toISOString();
    }
  }

  private async stopTrader(suiteId: string): Promise<void> {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    // 停止 Solana Agent
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-trader`);
    if (agent?.stop) {
      try {
        await agent.stop();
      } catch (error) {
        console.error(`Failed to stop Trader for ${suiteId}:`, error);
      }
    }

    suite.modules.trader.status = "stopped";
  }

  /**
   * 执行交易
   */
  async executeTrade(
    suiteId: string,
    action: "buy" | "sell",
    token: string,
    amount: number
  ): Promise<string> {
    const suite = this.suites.get(suiteId);
    if (!suite || !suite.modules.trader.enabled) {
      throw new Error("Trader module not enabled");
    }

    // 使用 Solana Agent Kit 执行交易
    const plugins = await getElizaPlugins();
    const agent = plugins?.getAgent(`${suiteId}-trader`);
    let txSignature: string;

    if (agent?.executeTrade) {
      try {
        txSignature = await agent.executeTrade(action, {
          token,
          amount,
        });
      } catch (error) {
        console.error(`Failed to execute trade for ${suiteId}:`, error);
        txSignature = `tx-error-${Date.now()}`;
      }
    } else {
      // 降级实现
      console.warn(`Solana agent not available for ${suiteId}, using fallback`);
      txSignature = `tx-fallback-${Date.now()}`;
    }

    // 更新统计
    if (suite.stats.trader) {
      suite.stats.trader.totalTrades += 1;
      suite.stats.trader.lastTradeTime = new Date().toISOString();
    }

    return txSignature;
  }

  /**
   * 获取所有 Suite 列表
   */
  getAllSuites(): AgentSuiteStatus[] {
    return Array.from(this.suites.values());
  }
}

// ==================== 单例导出 ====================

export const agentSuiteManager = new AgentSuiteManager();

// ==================== 便捷函数 ====================

/**
 * 创建完整的 Agent Suite（包含所有模块）
 */
export async function createFullAgentSuite(
  kolHandle: string,
  kolName: string,
  persona: KOLPersona,
  options?: {
    avatar?: Partial<AvatarConfig>;
    mod?: Partial<ModConfig>;
    trader?: Partial<TraderConfig>;
  }
): Promise<AgentSuiteStatus> {
  const config: AgentSuiteConfig = {
    kolHandle,
    kolName,
    persona,
    avatar: {
      enabled: true,
      autoPost: true,
      autoInteract: true,
      postFrequency: "daily",
      memoryEnabled: true,
      ...options?.avatar,
    },
    mod: {
      enabled: true,
      platforms: ["discord", "telegram"],
      autoReply: true,
      onboardingEnabled: true,
      meetingNotesEnabled: true,
      moderationEnabled: true,
      ...options?.mod,
    },
    trader: {
      enabled: true,
      autoTrading: false, // 默认关闭自动交易
      followMode: true,
      profitShare: 10, // 默认 10% 分成
      riskLevel: "medium",
      maxPositionSize: 10, // 默认最大 10 SOL
      ...options?.trader,
    },
  };

  return agentSuiteManager.createSuite(config);
}
