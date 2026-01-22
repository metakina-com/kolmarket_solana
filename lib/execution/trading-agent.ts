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
import { tradingHistoryManager } from "./trading-history";

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

  // 2. 检查是否有Jupiter swap操作（需要特殊处理）
  const hasSwap = strategy.rules.some(r => r.action === "swap" || r.action === "swap_instruction");
  
  if (hasSwap) {
    // 如果有swap操作，使用Jupiter API构建版本化交易
    return await buildStrategyWithJupiterSwap(agent, strategy, payer);
  }

  // 3. 构建普通交易
  const transaction = new Transaction();
  let ruleCount = 0;

  for (const rule of strategy.rules) {
    const instruction = await generateInstructionFromRule(agent, rule, payer);
    if (instruction && instruction.type !== "jupiter_swap") {
      transaction.add(instruction);
      ruleCount++;
    }
  }

  if (ruleCount === 0) {
    throw new Error(`No valid instructions generated for strategy ${strategy.id}`);
  }

  // 4. 模拟交易（安全检查）
  const simulation = await agent.connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }

  // 5. 设置交易参数
  const { blockhash } = await agent.connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  // 6. 序列化未签名交易
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
 * 构建包含Jupiter swap的策略交易
 */
async function buildStrategyWithJupiterSwap(
  agent: TradingAgent,
  strategy: TradingStrategy,
  payer: PublicKey
): Promise<SerializedStrategyTx> {
  // 动态导入Jupiter swap模块
  const { buildJupiterSwapTransaction, validateSwapParams } = await import("./jupiter-swap");

  // 找到swap规则（目前只支持单个swap）
  const swapRule = strategy.rules.find(r => r.action === "swap" || r.action === "swap_instruction");
  if (!swapRule) {
    throw new Error("Swap rule not found");
  }

  // 验证swap参数
  const swapParams = {
    inputMint: swapRule.parameters.inputMint,
    outputMint: swapRule.parameters.outputMint,
    amount: swapRule.parameters.amount, // 原始单位
    slippageBps: swapRule.parameters.slippageBps || 50,
    payer,
  };

  const validation = validateSwapParams(swapParams);
  if (!validation.valid) {
    throw new Error(`Invalid swap parameters: ${validation.error}`);
  }

  // 检查滑点限制
  const slippagePercent = swapParams.slippageBps! / 100;
  if (slippagePercent > agent.riskLimits.maxSlippage) {
    throw new Error(`Slippage ${slippagePercent}% exceeds maximum ${agent.riskLimits.maxSlippage}%`);
  }

  // 构建Jupiter swap交易
  const { serializedTransaction, quote } = await buildJupiterSwapTransaction(
    swapParams,
    agent.connection
  );

  // 返回序列化交易
  return {
    serializedTransaction,
    strategyId: strategy.id,
    ruleCount: 1,
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
            signer.publicKey,
            agent.connection,
            signer
          );
          if (execution.transactionHash) {
            agent.executions.push(execution);
            
            // 记录到历史
            const network = agent.connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
            tradingHistoryManager.addFromStrategyExecution(
              execution,
              signer.publicKey.toBase58(),
              network,
              { strategyName: strategy.name, viaAgentKit: true }
            );
            
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
    
    // 7. 记录到历史
    const network = agent.connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
    tradingHistoryManager.addFromStrategyExecution(
      execution,
      signer.publicKey.toBase58(),
      network,
      { strategyName: strategy.name }
    );
    
    return execution;
  } catch (error) {
    console.error("Strategy execution error:", error);
    const failedExecution: TradingExecution = {
      id: `exec-${Date.now()}`,
      strategyId: strategy.id,
      transactionHash: "",
      status: "failed",
      timestamp: new Date().toISOString(),
    };
    
    // 记录失败到历史
    const network = agent.connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
    tradingHistoryManager.addFromStrategyExecution(
      failedExecution,
      signer.publicKey.toBase58(),
      network,
      { 
        strategyName: strategy.name,
        error: error instanceof Error ? error.message : String(error)
      }
    );
    
    return failedExecution;
  }
}

/**
 * 评估策略条件
 * 支持条件格式:
 * - 余额: "balance > 1 SOL", "balance >= 0.5"
 * - 价格: "price(TOKEN_MINT) > 100", "price(TOKEN_MINT) < 50"
 * - 时间: "time > 2024-01-01T00:00:00Z", "time < now + 1h"
 */
async function evaluateStrategyConditions(
  agent: TradingAgent,
  strategy: TradingStrategy,
  payer: PublicKey
): Promise<boolean> {
  for (const rule of strategy.rules) {
    const cond = (rule.condition || "").trim();
    if (!cond) continue;

    // 1. 余额条件: "balance > 1 SOL"
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
      continue;
    }

    // 2. 价格条件: "price(TOKEN_MINT) > 100"
    const priceMatch = cond.match(
      /^price\s*\(\s*([A-Za-z0-9]+)\s*\)\s*(>=?|<=?|==?|!=)\s*([\d.]+)\s*$/i
    );
    if (priceMatch) {
      const tokenMint = priceMatch[1];
      const op = priceMatch[2];
      const threshold = parseFloat(priceMatch[3]);
      if (Number.isNaN(threshold) || threshold < 0) continue;

      try {
        const price = await getTokenPrice(tokenMint, agent.connection);
        if (price === null) {
          console.warn(`Could not fetch price for ${tokenMint}`);
          continue;
        }

        let ok = false;
        switch (op) {
          case ">":
            ok = price > threshold;
            break;
          case ">=":
            ok = price >= threshold;
            break;
          case "<":
            ok = price < threshold;
            break;
          case "<=":
            ok = price <= threshold;
            break;
          case "==":
            ok = Math.abs(price - threshold) < 0.01;
            break;
          case "!=":
            ok = Math.abs(price - threshold) >= 0.01;
            break;
          default:
            ok = true;
        }
        if (!ok) return false;
      } catch (error) {
        console.error(`Error evaluating price condition: ${error}`);
        return false;
      }
      continue;
    }

    // 3. 时间条件: "time > 2024-01-01T00:00:00Z", "time < now + 1h"
    const timeMatch = cond.match(
      /^time\s*(>=?|<=?|==?|!=)\s*(.+)$/i
    );
    if (timeMatch) {
      const op = timeMatch[1];
      const timeExpr = timeMatch[2].trim();
      const now = new Date();

      let targetTime: Date;
      if (timeExpr.toLowerCase().startsWith("now")) {
        // 相对时间: "now + 1h", "now - 30m"
        const relativeMatch = timeExpr.match(/now\s*([+-])\s*(\d+)\s*(h|m|d|w)/i);
        if (relativeMatch) {
          const sign = relativeMatch[1];
          const amount = parseInt(relativeMatch[2]);
          const unit = relativeMatch[3].toLowerCase();
          
          let ms = 0;
          switch (unit) {
            case "m": ms = amount * 60 * 1000; break;
            case "h": ms = amount * 60 * 60 * 1000; break;
            case "d": ms = amount * 24 * 60 * 60 * 1000; break;
            case "w": ms = amount * 7 * 24 * 60 * 60 * 1000; break;
          }
          
          targetTime = new Date(now.getTime() + (sign === "+" ? ms : -ms));
        } else {
          targetTime = now;
        }
      } else {
        // 绝对时间: ISO 8601 格式
        targetTime = new Date(timeExpr);
        if (isNaN(targetTime.getTime())) {
          console.warn(`Invalid time expression: ${timeExpr}`);
          continue;
        }
      }

      let ok = false;
      switch (op) {
        case ">":
          ok = now > targetTime;
          break;
        case ">=":
          ok = now >= targetTime;
          break;
        case "<":
          ok = now < targetTime;
          break;
        case "<=":
          ok = now <= targetTime;
          break;
        case "==":
          ok = Math.abs(now.getTime() - targetTime.getTime()) < 1000;
          break;
        case "!=":
          ok = Math.abs(now.getTime() - targetTime.getTime()) >= 1000;
          break;
        default:
          ok = true;
      }
      if (!ok) return false;
      continue;
    }
  }
  return true;
}

/**
 * 获取Token价格（简化实现，使用Jupiter API）
 */
async function getTokenPrice(
  tokenMint: string,
  connection: Connection
): Promise<number | null> {
  try {
    // 使用Jupiter API获取价格
    // SOL mint: So11111111111111111111111111111111111111112
    const solMint = "So11111111111111111111111111111111111111112";
    
    // 如果查询的是SOL，返回1
    if (tokenMint === solMint || tokenMint.toLowerCase() === "sol") {
      return 1;
    }

    // 使用Jupiter quote API获取价格（1个token能换多少SOL）
    const network = connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
    const baseUrl = "https://quote-api.jup.ag/v6";
    
    // 假设查询1个token（需要知道decimals，这里简化处理）
    const amount = 1_000_000; // 假设6位小数
    
    const url = new URL(`${baseUrl}/quote`);
    url.searchParams.append("inputMint", tokenMint);
    url.searchParams.append("outputMint", solMint);
    url.searchParams.append("amount", amount.toString());
    url.searchParams.append("slippageBps", "50");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const quote = await response.json();
    if (!quote.outAmount) {
      return null;
    }

    // 计算价格：outAmount (SOL) / inAmount (token)
    const outAmount = parseFloat(quote.outAmount);
    const price = outAmount / amount;
    
    return price;
  } catch (error) {
    console.error(`Error fetching token price for ${tokenMint}:`, error);
    return null;
  }
}

/**
 * 根据规则生成指令
 * 
 * 支持的操作类型:
 * - transfer: SOL转账
 * - swap: Token swap (Jupiter)
 * - swap_instruction: 返回Jupiter swap交易（需要特殊处理）
 */
async function generateInstructionFromRule(
  agent: TradingAgent,
  rule: TradingRule,
  payer: PublicKey
): Promise<any> {
  // 根据规则类型生成不同的指令
  
  if (rule.action === "transfer") {
    const recipient = new PublicKey(rule.parameters.recipient);
    const amount = (rule.parameters.amount || 0) * LAMPORTS_PER_SOL;
    
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports: Math.floor(amount),
    });
  }

  // Jupiter swap 需要特殊处理，因为它是版本化交易
  // 在 buildTradingStrategyTransaction 中单独处理
  if (rule.action === "swap" || rule.action === "swap_instruction") {
    // 返回标记，表示需要特殊处理
    return { type: "jupiter_swap", rule };
  }

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
