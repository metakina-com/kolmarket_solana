/**
 * 分红分配模块
 * 实现智能分红分配逻辑
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
// import { getOrCreateAgentKit, executeDistributionWithAgentKit } from "./solana-agent-kit-integration";

export interface DistributionRecipient {
  address: PublicKey;
  amount: number; // SOL amount
  percentage?: number; // 百分比（可选）
}

export interface DistributionResult {
  transactionHash: string;
  recipients: DistributionRecipient[];
  totalAmount: number;
  timestamp: string;
}

/**
 * 执行分红分配（SOL）
 * 
 * @param connection - Solana 连接
 * @param signer - 签名者密钥对
 * @param recipients - 接收者列表
 * @param useAgentKit - 是否使用 Solana Agent Kit（默认尝试使用）
 * @returns 交易哈希和分配结果
 */
export async function executeSOLDistribution(
  connection: Connection,
  signer: Keypair,
  recipients: DistributionRecipient[],
  useAgentKit: boolean = true
): Promise<DistributionResult> {
  // 验证参数
  if (recipients.length === 0) {
    throw new Error("Recipients list cannot be empty");
  }

  // 计算总金额
  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);

  // 尝试使用 Solana Agent Kit（如果可用）
  if (useAgentKit) {
    try {
      // 动态导入避免 Edge Runtime 问题
      const { getOrCreateAgentKit, executeDistributionWithAgentKit } = await import("./solana-agent-kit-integration");
      const agentKit = await getOrCreateAgentKit(connection);
      if (agentKit) {
        const recipientPubkeys = recipients.map(r => r.address);
        const amounts = recipients.map(r => r.amount);
        
        const transactionHash = await executeDistributionWithAgentKit(
          agentKit,
          recipientPubkeys,
          amounts,
          signer.publicKey
        );
        
        if (transactionHash) {
          return {
            transactionHash,
            recipients,
            totalAmount,
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (agentKitError) {
      console.warn("Solana Agent Kit distribution failed, falling back to web3.js:", agentKitError);
      // 继续使用基础实现
    }
  }

  // 检查余额
  const balance = await connection.getBalance(signer.publicKey);
  const requiredAmount = totalAmount * LAMPORTS_PER_SOL;
  const estimatedFee = 5000 * recipients.length; // 估算每笔转账费用

  if (balance < requiredAmount + estimatedFee) {
    throw new Error(`Insufficient balance. Required: ${(requiredAmount + estimatedFee) / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  // 创建交易
  const transaction = new Transaction();

  // 添加所有转账指令
  for (const recipient of recipients) {
    const lamports = recipient.amount * LAMPORTS_PER_SOL;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: signer.publicKey,
        toPubkey: recipient.address,
        lamports: Math.floor(lamports),
      })
    );
  }

  // 获取最新区块哈希
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer.publicKey;

  // 发送并确认交易
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [signer],
    { commitment: "confirmed" }
  );

  return {
    transactionHash: signature,
    recipients,
    totalAmount,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 按百分比分配分红
 * 
 * @param connection - Solana 连接
 * @param signer - 签名者密钥对
 * @param recipients - 接收者列表（包含百分比）
 * @param totalAmount - 总金额（SOL）
 * @returns 交易哈希和分配结果
 */
export async function executePercentageDistribution(
  connection: Connection,
  signer: Keypair,
  recipients: DistributionRecipient[],
  totalAmount: number
): Promise<DistributionResult> {
  // 验证百分比总和
  const totalPercentage = recipients.reduce((sum, r) => sum + (r.percentage || 0), 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100%. Current sum: ${totalPercentage}%`);
  }

  // 计算每个接收者的金额
  const calculatedRecipients: DistributionRecipient[] = recipients.map((r) => ({
    ...r,
    amount: (totalAmount * (r.percentage || 0)) / 100,
  }));

  return executeSOLDistribution(connection, signer, calculatedRecipients);
}

/**
 * 执行 SPL Token 分红分配
 * 
 * @param connection - Solana 连接
 * @param signer - 签名者密钥对
 * @param tokenMint - Token mint 地址
 * @param recipients - 接收者列表
 * @returns 交易哈希和分配结果
 */
export async function executeTokenDistribution(
  connection: Connection,
  signer: Keypair,
  tokenMint: PublicKey,
  recipients: DistributionRecipient[]
): Promise<DistributionResult> {
  // TODO: 实现 SPL Token 转账
  // 需要使用 @solana/spl-token
  // 1. 获取或创建关联代币账户
  // 2. 创建转账指令
  // 3. 批量执行
  // 
  // 注意：需要安装 @solana/spl-token 包
  // npm install @solana/spl-token

  throw new Error("Token distribution not yet implemented. Use SOL distribution for now.");
}
