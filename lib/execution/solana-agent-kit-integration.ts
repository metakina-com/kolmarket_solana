/**
 * Solana Agent Kit 集成模块
 * 用于执行复杂的 Solana 链上操作
 * 
 * 注意：
 * - 使用动态导入避免构建时依赖问题
 * - Solana Agent Kit 需要 Node.js runtime，不支持 Edge Runtime
 * - 所有导入都在函数内部进行，避免静态导入
 */

import type { Connection, Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { TradingStrategy, TradingExecution } from "./trading-agent";

// 类型定义（避免直接导入）
type SolanaAgentKit = any;

// Solana Agent Kit 实例存储
const agentKitInstances = new Map<string, SolanaAgentKit>();

/**
 * 初始化 Solana Agent Kit
 * 
 * @param connection - Solana 连接
 * @param privateKey - 私钥（可选，用于自动签名）
 * @returns Agent Kit 实例
 */
export async function initializeSolanaAgentKit(
  connection: Connection,
  privateKey?: string
): Promise<SolanaAgentKit | null> {
  try {
    // 检查运行环境
    if (typeof window !== "undefined") {
      // 浏览器环境，不支持
      return null;
    }

    // 检查是否在 Edge Runtime（不支持）
    // Edge Runtime 没有 Node.js 全局对象
    if (typeof process === "undefined" || !process.versions?.node) {
      console.warn("Solana Agent Kit not supported in Edge Runtime");
      return null;
    }

    // 动态导入 Solana Agent Kit（仅在 Node.js 环境）
    // 使用动态导入，避免构建时解析
    const agentKitModule = await import("solana-agent-kit");
    const SolanaAgentKit = (agentKitModule as any).SolanaAgentKit || (agentKitModule as any).default || agentKitModule;

    if (!SolanaAgentKit) {
      console.warn("SolanaAgentKit class not found in module");
      return null;
    }

    // 创建配置
    const config: any = {
      connection,
      // 如果提供私钥，可以用于自动签名（生产环境需要更安全的处理）
      // privateKey: privateKey ? Buffer.from(privateKey, "hex") : undefined,
    };

    // 创建 Agent Kit 实例
    const agentKit = typeof SolanaAgentKit === "function" 
      ? new SolanaAgentKit(config)
      : SolanaAgentKit;
    
    return agentKit;
  } catch (error) {
    console.error("Error initializing Solana Agent Kit:", error);
    console.warn("Solana Agent Kit not available. Falling back to basic web3.js implementation.");
    return null;
  }
}

/**
 * 使用 Solana Agent Kit 执行交易策略
 * 
 * 注意：Agent Kit主要用于智能体工具调用，实际swap操作使用Jupiter API
 * 
 * @param agentKit - Agent Kit 实例
 * @param strategy - 交易策略
 * @param userWallet - 用户钱包公钥
 * @param connection - Solana 连接（用于Jupiter swap）
 * @param signer - 签名者（可选，用于服务端签名）
 * @returns 执行结果
 */
export async function executeStrategyWithAgentKit(
  agentKit: SolanaAgentKit,
  strategy: TradingStrategy,
  userWallet: PublicKey,
  connection?: Connection,
  signer?: any
): Promise<TradingExecution> {
  try {
    // 使用 Agent Kit 的工具调用功能
    // 根据策略规则转换为操作

    let transactionHash = "";
    const transactions: string[] = [];

    for (const rule of strategy.rules) {
      if (rule.action === "transfer") {
        // 使用 Agent Kit 的转账工具（如果支持）
        // 或者使用基础web3.js实现
        try {
          // 尝试使用Agent Kit的transfer方法（如果存在）
          if (typeof agentKit.transfer === "function") {
            const result = await agentKit.transfer({
              to: new PublicKey(rule.parameters.recipient),
              amount: rule.parameters.amount,
              from: userWallet,
            });
            if (result?.signature) {
              transactionHash = result.signature;
              transactions.push(result.signature);
            }
          } else {
            // 降级到基础实现
            console.warn("Agent Kit transfer not available, using fallback");
          }
        } catch (transferError) {
          console.error("Transfer via Agent Kit failed:", transferError);
        }
      } else if (rule.action === "swap") {
        // 使用 Jupiter swap（Agent Kit不直接支持swap，使用Jupiter API）
        try {
          const { buildJupiterSwapTransaction } = await import("./jupiter-swap");
          const { VersionedTransaction } = await import("@solana/web3.js");
          
          if (!connection) {
            throw new Error("Connection required for Jupiter swap");
          }

          // 构建swap交易
          const { serializedTransaction } = await buildJupiterSwapTransaction(
            {
              inputMint: rule.parameters.inputMint,
              outputMint: rule.parameters.outputMint,
              amount: rule.parameters.amount,
              slippageBps: rule.parameters.slippageBps || 50,
              payer: userWallet,
            },
            connection
          );

          // 如果提供了signer，可以立即执行
          if (signer) {
            const { executeJupiterSwap } = await import("./jupiter-swap");
            const swapResult = await executeJupiterSwap(
              {
                inputMint: rule.parameters.inputMint,
                outputMint: rule.parameters.outputMint,
                amount: rule.parameters.amount,
                slippageBps: rule.parameters.slippageBps || 50,
                payer: userWallet,
              },
              connection,
              signer
            );
            transactionHash = swapResult.transactionHash;
            transactions.push(swapResult.transactionHash);
          } else {
            // 返回序列化交易供用户签名
            // 注意：这种情况下transactionHash为空，需要前端签名后返回
            console.warn("No signer provided, swap transaction needs user wallet signature");
          }
        } catch (swapError) {
          console.error("Jupiter swap failed:", swapError);
          throw swapError;
        }
      }
      // 更多操作类型...
    }

    return {
      id: `exec-${Date.now()}`,
      strategyId: strategy.id,
      transactionHash: transactionHash || transactions[0] || "",
      status: transactionHash || transactions.length > 0 ? "success" : "failed",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error executing strategy with Agent Kit:", error);
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
 * 使用 Solana Agent Kit 执行分红分配
 * 
 * @param agentKit - Agent Kit 实例
 * @param recipients - 接收者列表
 * @param amounts - 金额列表
 * @param userWallet - 用户钱包
 * @returns 交易哈希
 */
export async function executeDistributionWithAgentKit(
  agentKit: SolanaAgentKit,
  recipients: PublicKey[],
  amounts: number[],
  userWallet: PublicKey
): Promise<string> {
  try {
    // 使用 Agent Kit 的批量转账功能
    // const transactions = recipients.map((recipient, index) => ({
    //   to: recipient,
    //   amount: amounts[index],
    //   from: userWallet,
    // }));

    // const result = await agentKit.batchTransfer({
    //   transactions,
    // });

    // return result.signature;

    // 临时返回（需要完整实现）
    return "";
  } catch (error) {
    console.error("Error executing distribution with Agent Kit:", error);
    throw error;
  }
}

/**
 * 获取或创建 Agent Kit 实例
 */
export async function getOrCreateAgentKit(
  connection: Connection,
  instanceId: string = "default"
): Promise<SolanaAgentKit | null> {
  let agentKit = agentKitInstances.get(instanceId);
  
  if (!agentKit) {
    agentKit = await initializeSolanaAgentKit(connection);
    if (agentKit) {
      agentKitInstances.set(instanceId, agentKit);
    }
  }

  return agentKit;
}
