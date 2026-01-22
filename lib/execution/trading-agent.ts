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

/** 用于前端签名的序列化未签名策略交易 */
export interface SerializedStrategyTx {
  serializedTransaction: string; // base64
  strategyId: string;
  ruleCount: number;
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
 * 构建策略未签名交易（供用户钱包签名）
 * 
 * @param agent - 交易智能体实例
 * @param strategy - 交易策略
 * @param payer - 付款人公钥（用户钱包）
 * @returns 序列化信息，前端反序列化后由用户签名并广播
 */
export async function buildTradingStrategyTransaction(
  agent: TradingAgent,
  strategy: TradingStrategy,
  payer: PublicKey
): Promise<SerializedStrategyTx> {
  if (!strategy.enabled) {
    throw new Error(`Strategy ${strategy.id} is not enabled`);
  }

  // 1. 评估策略条件
  const conditionsMet = await evaluateStrategyConditions(agent, strategy, payer);
  if (!conditionsMet) {
    throw new Error(`Strategy conditions not met for ${strategy.id}`);
  }

  // 2. 构建交易
  const transaction = new Transaction();
  let ruleCount = 0;

  for (const rule of strategy.rules) {
    const instruction = await generateInstructionFromRule(agent, rule, payer);
    if (instruction) {
      transaction.add(instruction);
      ruleCount++;
    }
  }

  if (ruleCount === 0) {
    throw new Error(`No valid instructions generated for strategy ${strategy.id}`);
  }

  // 3. 模拟交易（安全检查）
  const simulation = await agent.connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  // 4. 设置交易参数
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  // 5. 序列化未签名交易
  const serialized = Buffer.from(
    transaction.serialize({ requireAllSignatures: false })
  ).toString("base64");

  return {
    serializedTransaction: serialized,
    strategyId: strategy.id,
    ruleCount,
  };
}

/**
 * 执行交易策略（服务端签名，如脚本/后台）
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

    // 3. 使用构建函数生成交易，然后签名并发送
    const built = await buildTradingStrategyTransaction(agent, strategy, signer.publicKey);
    const transaction = Transaction.from(
      Buffer.from(built.serializedTransaction, "base64")
    );
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
 * 执行分红分配（已弃用）
 *
 * 分红已统一走用户钱包签名流程，请使用：
 * - POST /api/execution/distribute：构建未签名交易，前端签名后广播
 * - lib/execution/distribution：buildSOLDistributionTransaction / buildTokenDistributionTransaction
 *
 * @deprecated 使用 distribute API + 用户钱包签名
 * @param agent - 交易智能体实例
 * @param recipients - 接收者列表
 * @param amounts - 分配金额
 * @returns 交易哈希
 */
export async function executeDistribution(
  _agent: any,
  _recipients: PublicKey[],
  _amounts: number[]
): Promise<string> {
  throw new Error(
    "executeDistribution is deprecated. Use POST /api/execution/distribute with user wallet signing instead."
  );
}
