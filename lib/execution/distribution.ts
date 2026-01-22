/**
 * 分红分配模块
 * 实现智能分红分配逻辑
 * 支持：1) 服务端签名（演示） 2) 构建未签名交易供用户钱包签名（生产）
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
import { tradingHistoryManager } from "./trading-history";

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

/** 用于前端签名的序列化未签名交易 */
export interface SerializedDistributionTx {
  serializedTransaction: string; // base64
  totalAmount: number;
  recipientCount: number;
}

/** Token 分红序列化结果 */
export interface SerializedTokenDistributionTx {
  serializedTransaction: string;
  totalAmount: number; // raw token units
  recipientCount: number;
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

  const balance = await connection.getBalance(signer.publicKey);
  const estimatedFee = 5000 * recipients.length;
  const requiredAmount = totalAmount * LAMPORTS_PER_SOL;
  if (balance < requiredAmount + estimatedFee) {
    throw new Error(`Insufficient balance. Required: ${(requiredAmount + estimatedFee) / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  const transaction = await buildSOLDistributionTransactionInternal(
    connection,
    signer.publicKey,
    recipients,
    totalAmount
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [signer],
    { commitment: "confirmed" }
  );

  const result: DistributionResult = {
    transactionHash: signature,
    recipients,
    totalAmount,
    timestamp: new Date().toISOString(),
  };

  // 记录到历史
  const network = connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
  tradingHistoryManager.addFromDistribution(
    result,
    signer.publicKey.toBase58(),
    network,
    "sol"
  );

  return result;
}

const estimatedFeePerTransfer = 5000;

/**
 * 构建 SOL 分红未签名交易（供用户钱包签名）
 * @param connection - Solana 连接
 * @param payer - 付款人公钥（用户钱包）
 * @param recipients - 接收者列表，address 为 base58
 * @param usePercentage - 是否按百分比
 * @param totalAmount - 总金额（SOL），百分比模式必填
 * @returns 序列化信息，前端反序列化后由用户签名并广播
 */
export async function buildSOLDistributionTransaction(
  connection: Connection,
  payer: PublicKey,
  recipients: { address: string; amount: number; percentage?: number }[],
  usePercentage: boolean,
  totalAmount?: number
): Promise<SerializedDistributionTx> {
  let resolved: DistributionRecipient[];
  let total: number;

  if (usePercentage && totalAmount != null && totalAmount > 0) {
    const sum = recipients.reduce((s, r) => s + (r.percentage ?? 0), 0);
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100%. Current: ${sum}%`);
    }
    resolved = recipients.map((r) => ({
      address: new PublicKey(r.address),
      amount: (totalAmount * (r.percentage ?? 0)) / 100,
      percentage: r.percentage,
    }));
    total = totalAmount;
  } else {
    resolved = recipients.map((r) => ({
      address: new PublicKey(r.address),
      amount: r.amount,
      percentage: r.percentage,
    }));
    total = resolved.reduce((s, r) => s + r.amount, 0);
  }

  if (resolved.length === 0 || total <= 0) {
    throw new Error("No valid recipients or total amount is zero");
  }

  const balance = await connection.getBalance(payer);
  const requiredLamports = total * LAMPORTS_PER_SOL + estimatedFeePerTransfer * resolved.length;
  if (balance < requiredLamports) {
    throw new Error(
      `Insufficient balance. Required: ${requiredLamports / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`
    );
  }

  const transaction = await buildSOLDistributionTransactionInternal(
    connection,
    payer,
    resolved,
    total
  );

  const serialized = Buffer.from(
    transaction.serialize({ requireAllSignatures: false })
  ).toString("base64");

  return {
    serializedTransaction: serialized,
    totalAmount: total,
    recipientCount: resolved.length,
  };
}

async function buildSOLDistributionTransactionInternal(
  connection: Connection,
  payer: PublicKey,
  recipients: DistributionRecipient[],
  totalAmount: number
): Promise<Transaction> {
  const transaction = new Transaction();
  for (const r of recipients) {
    const lamports = Math.floor(r.amount * LAMPORTS_PER_SOL);
    if (lamports <= 0) continue;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: r.address,
        lamports,
      })
    );
  }
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;
  return transaction;
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
 * 构建 SPL Token 分红未签名交易（供用户钱包签名）
 * recipients[].amount 为 raw token 数量（最小单位）
 */
export async function buildTokenDistributionTransaction(
  connection: Connection,
  payer: PublicKey,
  tokenMint: PublicKey,
  recipients: { address: string; amount: number }[]
): Promise<SerializedTokenDistributionTx> {
  if (recipients.length === 0) {
    throw new Error("Recipients list cannot be empty");
  }

  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    createTransferInstruction,
    TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const transaction = new Transaction();
  const totalTokenAmount = recipients.reduce((sum, r) => sum + Math.floor(r.amount), 0);
  if (totalTokenAmount <= 0) {
    throw new Error("Total token amount must be positive");
  }

  const senderTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    payer
  );

  try {
    await getAccount(connection, senderTokenAccount);
  } catch {
    throw new Error("Sender token account does not exist. Create it first.");
  }

  const senderAccountInfo = await getAccount(connection, senderTokenAccount);
  const senderBalance = Number(senderAccountInfo.amount);
  if (senderBalance < totalTokenAmount) {
    throw new Error(
      `Insufficient token balance. Required: ${totalTokenAmount}, Available: ${senderBalance}`
    );
  }

  for (const r of recipients) {
    const recipientPubkey = new PublicKey(r.address);
    const amount = Math.floor(r.amount);
    if (amount <= 0) continue;

    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipientPubkey
    );

    try {
      await getAccount(connection, recipientTokenAccount);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer,
          recipientTokenAccount,
          recipientPubkey,
          tokenMint
        )
      );
    }

    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        payer,
        BigInt(amount),
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  const serialized = Buffer.from(
    transaction.serialize({ requireAllSignatures: false })
  ).toString("base64");

  return {
    serializedTransaction: serialized,
    totalAmount: totalTokenAmount,
    recipientCount: recipients.filter((r) => Math.floor(r.amount) > 0).length,
  };
}

/**
 * 执行 SPL Token 分红分配（服务端签名，如脚本/后台）
 * 
 * @param connection - Solana 连接
 * @param signer - 签名者密钥对
 * @param tokenMint - Token mint 地址
 * @param recipients - 接收者列表（amount 为 token 最小单位）
 * @returns 交易哈希和分配结果
 */
export async function executeTokenDistribution(
  connection: Connection,
  signer: Keypair,
  tokenMint: PublicKey,
  recipients: DistributionRecipient[]
): Promise<DistributionResult> {
  const built = await buildTokenDistributionTransaction(
    connection,
    signer.publicKey,
    tokenMint,
    recipients.map((r) => ({ address: r.address.toBase58(), amount: r.amount }))
  );

  const transaction = Transaction.from(
    Buffer.from(built.serializedTransaction, "base64")
  );
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [signer],
    { commitment: "confirmed" }
  );

  const result: DistributionResult = {
    transactionHash: signature,
    recipients,
    totalAmount: built.totalAmount,
    timestamp: new Date().toISOString(),
  };

  // 记录到历史
  const network = connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
  tradingHistoryManager.addFromDistribution(
    result,
    signer.publicKey.toBase58(),
    network,
    "token",
    tokenMint.toBase58()
  );

  return result;
}
