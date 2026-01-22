/**
 * KMT 代币自动化运营模块
 * 
 * 功能：
 * 1. 定时任务调度（质押奖励、交易手续费分红等）
 * 2. 条件触发分发（治理投票奖励、空投等）
 * 3. 批量分发优化
 * 4. 分发记录和统计
 */

import {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";
import { executeTokenDistribution, DistributionRecipient } from "./distribution";

export interface KMTAutomationConfig {
  tokenMint: string; // KMT token mint 地址
  signerKeypair: Keypair; // 分发者密钥对
  network: "devnet" | "mainnet-beta";
  rpcUrl?: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: "scheduled" | "conditional" | "manual";
  schedule?: {
    cron: string; // Cron 表达式，如 "0 0 * * *" (每天午夜)
    timezone?: string;
  };
  condition?: {
    type: "balance_threshold" | "transaction_count" | "governance_vote" | "staking_period";
    params: Record<string, any>;
  };
  distribution: {
    recipients: DistributionRecipient[];
    totalAmount?: number; // 总金额（如果使用百分比）
    usePercentage: boolean;
  };
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export interface AutomationResult {
  taskId: string;
  success: boolean;
  transactionHash?: string;
  recipients: DistributionRecipient[];
  totalAmount: number;
  timestamp: string;
  error?: string;
}

/**
 * KMT 自动化运营管理器
 */
export class KMTAutomationManager {
  private connection: Connection;
  private config: KMTAutomationConfig;
  private tasks: Map<string, AutomationTask> = new Map();
  private runningTasks: Set<string> = new Set();

  constructor(config: KMTAutomationConfig) {
    this.config = config;
    this.connection = new Connection(
      config.rpcUrl || 
      (config.network === "mainnet-beta" 
        ? process.env.SOLANA_MAINNET_RPC || clusterApiUrl("mainnet-beta")
        : clusterApiUrl("devnet")),
      "confirmed"
    );
  }

  /**
   * 添加自动化任务
   */
  addTask(task: AutomationTask): void {
    this.tasks.set(task.id, task);
  }

  /**
   * 移除自动化任务
   */
  removeTask(taskId: string): void {
    this.tasks.delete(taskId);
  }

  /**
   * 获取所有任务
   */
  getTasks(): AutomationTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取任务详情
   */
  getTask(taskId: string): AutomationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 启用/禁用任务
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.enabled = enabled;
    return true;
  }

  /**
   * 执行单个任务
   */
  async executeTask(taskId: string): Promise<AutomationResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (!task.enabled) {
      throw new Error(`Task ${taskId} is disabled`);
    }

    if (this.runningTasks.has(taskId)) {
      throw new Error(`Task ${taskId} is already running`);
    }

    this.runningTasks.add(taskId);

    try {
      // 检查条件（如果是条件触发任务）
      if (task.type === "conditional" && task.condition) {
        const conditionMet = await this.checkCondition(task.condition);
        if (!conditionMet) {
          return {
            taskId,
            success: false,
            recipients: task.distribution.recipients,
            totalAmount: 0,
            timestamp: new Date().toISOString(),
            error: "Condition not met",
          };
        }
      }

      // 准备接收者列表
      let recipients: DistributionRecipient[] = task.distribution.recipients;
      
      if (task.distribution.usePercentage && task.distribution.totalAmount) {
        // 按百分比计算金额
        const totalAmount = task.distribution.totalAmount;
        recipients = recipients.map((r) => ({
          ...r,
          amount: (totalAmount * (r.percentage || 0)) / 100,
        }));
      }

      // 执行代币分发
      const tokenMint = new PublicKey(this.config.tokenMint);
      const result = await executeTokenDistribution(
        this.connection,
        this.config.signerKeypair,
        tokenMint,
        recipients
      );

      // 更新任务状态
      task.lastRun = new Date().toISOString();
      task.runCount += 1;
      if (task.schedule) {
        task.nextRun = this.calculateNextRun(task.schedule.cron);
      }

      return {
        taskId,
        success: true,
        transactionHash: result.transactionHash,
        recipients: result.recipients,
        totalAmount: result.totalAmount,
        timestamp: result.timestamp,
      };
    } catch (error) {
      return {
        taskId,
        success: false,
        recipients: task.distribution.recipients,
        totalAmount: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * 检查条件是否满足
   */
  private async checkCondition(condition: AutomationTask["condition"]): Promise<boolean> {
    if (!condition) return true;

    switch (condition.type) {
      case "balance_threshold": {
        const threshold = condition.params.threshold as number;
        const account = new PublicKey(condition.params.account as string);
        const balance = await this.connection.getBalance(account);
        return balance >= threshold;
      }
      case "transaction_count": {
        const minCount = condition.params.minCount as number;
        const account = new PublicKey(condition.params.account as string);
        const signatures = await this.connection.getSignaturesForAddress(account, { limit: 1 });
        // 简化实现，实际应该检查特定时间范围内的交易数
        return signatures.length >= minCount;
      }
      case "governance_vote": {
        // 治理投票条件检查（需要集成治理程序）
        // 这里返回 true 作为占位符
        return condition.params.voted === true;
      }
      case "staking_period": {
        // 质押期限检查（需要集成质押程序）
        const minDays = condition.params.minDays as number;
        // 简化实现
        return true;
      }
      default:
        return true;
    }
  }

  /**
   * 计算下次运行时间（简化实现）
   */
  private calculateNextRun(cron: string): string {
    // 简化实现：假设是每天运行
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }

  /**
   * 创建质押奖励任务
   */
  static createStakingRewardTask(
    recipients: DistributionRecipient[],
    dailyReward: number
  ): AutomationTask {
    return {
      id: `staking-reward-${Date.now()}`,
      name: "质押奖励每日分发",
      type: "scheduled",
      schedule: {
        cron: "0 0 * * *", // 每天午夜
        timezone: "UTC",
      },
      distribution: {
        recipients,
        totalAmount: dailyReward,
        usePercentage: true,
      },
      enabled: true,
      runCount: 0,
    };
  }

  /**
   * 创建交易手续费分红任务
   */
  static createTradingFeeRewardTask(
    recipients: DistributionRecipient[],
    feeDistribution: { platform: number; holders: number; kol: number }
  ): AutomationTask {
    return {
      id: `trading-fee-${Date.now()}`,
      name: "交易手续费分红",
      type: "conditional",
      condition: {
        type: "balance_threshold",
        params: {
          threshold: 1000, // 当累计手续费达到 1000 KMT 时触发
        },
      },
      distribution: {
        recipients,
        usePercentage: true,
      },
      enabled: true,
      runCount: 0,
    };
  }

  /**
   * 创建治理投票奖励任务
   */
  static createGovernanceRewardTask(
    recipients: DistributionRecipient[],
    rewardPerVote: number
  ): AutomationTask {
    return {
      id: `governance-reward-${Date.now()}`,
      name: "治理投票奖励",
      type: "conditional",
      condition: {
        type: "governance_vote",
        params: {
          voted: true,
        },
      },
      distribution: {
        recipients: recipients.map((r) => ({
          ...r,
          amount: rewardPerVote,
        })),
        usePercentage: false,
      },
      enabled: true,
      runCount: 0,
    };
  }

  /**
   * 创建空投任务
   */
  static createAirdropTask(
    recipients: DistributionRecipient[],
    airdropAmount: number
  ): AutomationTask {
    return {
      id: `airdrop-${Date.now()}`,
      name: "KMT 空投",
      type: "manual",
      distribution: {
        recipients: recipients.map((r) => ({
          ...r,
          amount: airdropAmount,
        })),
        usePercentage: false,
      },
      enabled: true,
      runCount: 0,
    };
  }
}
