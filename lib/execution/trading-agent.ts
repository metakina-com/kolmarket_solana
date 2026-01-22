/**
 * 交易智能体模块
 * 基于 @solana/web3.js 和 Solana Agent Kit
 * 
 * 状态: ✅ 基础功能已实现 + ✅ Solana Agent Kit 已集成
 * 
 * 功能:
 * 1. ✅ 基础 web3.js 实现
 * 2. ✅ Solana Agent Kit 集成 (solana-agent-kit-integration.ts)
 * 3. 🔄 LangChain 集成（可选）
 * 4. 🔄 更多交易类型支持
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
// 动态导入避免 Edge Runtime 问题
// import { getOrCreateAgentKit, executeStrategyWithAgentKit } from "./solana-agent-kit-integration";

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  rules: TradingRule[];
  enabled: boolean;
}

export interface TradingRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface TradingExecution {
  id: string;
  strategyId: string;
  transactionHash: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
}

export interface TradingAgent {
  connection: Connection;
  strategies: TradingStrategy[];
  executions: TradingExecution[];
  riskLimits: RiskLimits;
}

export interface RiskLimits {
  maxSlippage: number; // 最大滑点 (百分比)
  maxTransactionAmount: number; // 最大交易金额 (SOL)
  maxDailyLoss: number; // 最大日亏损 (SOL)
  whitelistedPrograms: PublicKey[]; // 白名单程序
}

/**
 * 初始化交易智能体
 * 
 * @param connection - Solana 连接
 * @param riskLimits - 风险限制配置
 * @returns 交易智能体实例
 */
export async function initializeTradingAgent(
  connection: Connection,
  riskLimits?: Partial<RiskLimits>
): Promise<TradingAgent> {
  const defaultRiskLimits: RiskLimits = {
    maxSlippage: 5, // 5%
    maxTransactionAmount: 10, // 10 SOL
    maxDailyLoss: 50, // 50 SOL
    whitelistedPrograms: [],
    ...riskLimits,
  };

  return {
    connection,
    strategies: [],
    executions: [],
    riskLimits: defaultRiskLimits,
  };
}

/**
 * 执行交易策略
 * 
 * @param agent - 交易智能体实例
 * @param strategy - 交易策略
 * @param signer - 签名者密钥对
 * @param useAgentKit - 是否使用 Solana Agent Kit（默认尝试使用）
 * @returns 执行结果
 */
export async function executeTradingStrategy(
  agent: TradingAgent,
  strategy: TradingStrategy,
  signer: Keypair,
  useAgentKit: boolean = true
): Promise<TradingExecution> {
  if (!strategy.enabled) {
    throw new Error(`Strategy ${strategy.id} is not enabled`);
  }

  try {
    // 1. 评估策略条件
    const conditionsMet = await evaluateStrategyConditions(agent, strategy, signer.publicKey);
    if (!conditionsMet) {
      return {
        id: `exec-${Date.now()}`,
        strategyId: strategy.id,
        transactionHash: "",
        status: "failed",
        timestamp: new Date().toISOString(),
      };
    }

    // 2. 尝试使用 Solana Agent Kit（如果可用）
    if (useAgentKit) {
      try {
        // 动态导入避免 Edge Runtime 问题
        const { getOrCreateAgentKit, executeStrategyWithAgentKit } = await import("./solana-agent-kit-integration");
        const agentKit = await getOrCreateAgentKit(agent.connection);
        if (agentKit) {
          const execution = await executeStrategyWithAgentKit(
            agentKit,
            strategy,
            signer.publicKey
          );
          if (execution.transactionHash) {
            agent.executions.push(execution);
            return execution;
          }
        }
      } catch (agentKitError) {
        console.warn("Solana Agent Kit execution failed, falling back to web3.js:", agentKitError);
        // 继续使用基础实现
      }
    }

    // 3. 降级到基础 web3.js 实现
    const transaction = new Transaction();
    
    // 根据策略规则生成指令
    for (const rule of strategy.rules) {
      const instruction = await generateInstructionFromRule(agent, rule, signer.publicKey);
      if (instruction) {
        transaction.add(instruction);
      }
    }

    // 4. 模拟交易（安全检查）
    const simulation = await agent.connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }

    // 5. 执行链上交易
    transaction.recentBlockhash = (await agent.connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = signer.publicKey;

    const signature = await sendAndConfirmTransaction(
      agent.connection,
      transaction,
      [signer],
      { commitment: "confirmed" }
    );

    // 6. 记录执行结果
    const execution: TradingExecution = {
      id: `exec-${Date.now()}`,
      strategyId: strategy.id,
      transactionHash: signature,
      status: "success",
      timestamp: new Date().toISOString(),
    };

    agent.executions.push(execution);
    return execution;
  } catch (error) {
    console.error("Strategy execution error:", error);
    return {
      id: `exec-${Date.now()}`,
      strategyId: strategy.id,
      transactionHash: "",
      status: "failed",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 评估策略条件
 * 支持简单条件格式，如 "balance > 1"、"balance >= 0.5 SOL"
 */
async function evaluateStrategyConditions(
  agent: TradingAgent,
  strategy: TradingStrategy,
  payer: PublicKey
): Promise<boolean> {
  for (const rule of strategy.rules) {
    const cond = (rule.condition || "").trim();
    if (!cond) continue;

    const balanceMatch = cond.match(
      /^balance\s*(>=?|<=?|==?|!=)\s*([\d.]+)(?:\s*SOL)?\s*$/i
    );
    if (balanceMatch) {
      const op = balanceMatch[1];
      const threshold = parseFloat(balanceMatch[2]);
      if (Number.isNaN(threshold) || threshold < 0) continue;

      const lamports = await agent.connection.getBalance(payer);
      const balanceSOL = lamports / LAMPORTS_PER_SOL;

      let ok = false;
      switch (op) {
        case ">":
          ok = balanceSOL > threshold;
          break;
        case ">=":
          ok = balanceSOL >= threshold;
          break;
        case "<":
          ok = balanceSOL < threshold;
          break;
        case "<=":
          ok = balanceSOL <= threshold;
          break;
        case "==":
          ok = Math.abs(balanceSOL - threshold) < 1e-9;
          break;
        case "!=":
          ok = Math.abs(balanceSOL - threshold) >= 1e-9;
          break;
        default:
          ok = true;
      }
      if (!ok) return false;
    }
  }
  return true;
}

/**
 * 根据规则生成指令
 */
async function generateInstructionFromRule(
  agent: TradingAgent,
  rule: TradingRule,
  payer: PublicKey
): Promise<any> {
  // 根据规则类型生成不同的指令
  // 这里提供基础实现，实际应该支持更多交易类型
  
  if (rule.action === "transfer") {
    const recipient = new PublicKey(rule.parameters.recipient);
    const amount = (rule.parameters.amount || 0) * LAMPORTS_PER_SOL;
    
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports: Math.floor(amount),
    });
  }

  // TODO: 添加更多交易类型支持
  // - Token swap (Jupiter, Raydium)
  // - Staking
  // - Liquidity provision
  // 等等

  return null;
}

/**
 * 执行分红分配
 * 
 * @param agent - 交易智能体实例
 * @param recipients - 接收者列表
 * @param amounts - 分配金额
 * @returns 交易哈希
 */
export async function executeDistribution(
  agent: any,
  recipients: PublicKey[],
  amounts: number[]
): Promise<string> {
  // TODO: 实现分红逻辑
  // 1. 验证分配参数
  // 2. 创建批量转账交易
  // 3. 签名并发送交易
  // 4. 返回交易哈希

  return "";
}
