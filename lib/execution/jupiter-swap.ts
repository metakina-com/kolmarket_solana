/**
 * Jupiter Swap 集成模块
 * 用于执行 Solana 链上的 Token Swap 操作
 * 
 * 使用 Jupiter Aggregator API v6
 * 文档: https://docs.jup.ag/docs/apis/swap-api
 */

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";

export interface JupiterSwapParams {
  inputMint: string; // 输入Token mint地址
  outputMint: string; // 输出Token mint地址
  amount: number; // 输入金额（原始单位，不是小数）
  slippageBps?: number; // 滑点（基点，默认50 = 0.5%）
  payer: PublicKey; // 付款人公钥
}

export interface JupiterSwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  priceImpactPct: string;
  routePlan: any[];
}

export interface JupiterSwapResult {
  transactionHash: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
}

/**
 * 获取 Jupiter Swap 报价
 * 
 * @param params - Swap 参数
 * @param connection - Solana 连接（用于确定网络）
 * @returns Swap 报价
 */
export async function getJupiterSwapQuote(
  params: JupiterSwapParams,
  connection: Connection
): Promise<JupiterSwapQuote> {
  const network = connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
  const baseUrl = network === "mainnet" 
    ? "https://quote-api.jup.ag/v6"
    : "https://quote-api.jup.ag/v6"; // Jupiter API 支持 devnet

  const slippageBps = params.slippageBps || 50; // 默认 0.5%

  const url = new URL(`${baseUrl}/quote`);
  url.searchParams.append("inputMint", params.inputMint);
  url.searchParams.append("outputMint", params.outputMint);
  url.searchParams.append("amount", params.amount.toString());
  url.searchParams.append("slippageBps", slippageBps.toString());
  url.searchParams.append("onlyDirectRoutes", "false");
  url.searchParams.append("asLegacyTransaction", "false");

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jupiter quote failed: ${error}`);
  }

  return await response.json();
}

/**
 * 获取 Jupiter Swap 交易
 * 
 * @param quote - Swap 报价
 * @param params - Swap 参数
 * @param connection - Solana 连接
 * @returns 序列化的交易（base64）
 */
export async function getJupiterSwapTransaction(
  quote: JupiterSwapQuote,
  params: JupiterSwapParams,
  connection: Connection
): Promise<string> {
  const network = connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "devnet";
  const baseUrl = network === "mainnet"
    ? "https://quote-api.jup.ag/v6"
    : "https://quote-api.jup.ag/v6";

  const response = await fetch(`${baseUrl}/swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: params.payer.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jupiter swap transaction failed: ${error}`);
  }

  const { swapTransaction } = await response.json();
  return swapTransaction;
}

/**
 * 构建 Jupiter Swap 未签名交易（供用户钱包签名）
 * 
 * @param params - Swap 参数
 * @param connection - Solana 连接
 * @returns 序列化交易和报价信息
 */
export async function buildJupiterSwapTransaction(
  params: JupiterSwapParams,
  connection: Connection
): Promise<{
  serializedTransaction: string;
  quote: JupiterSwapQuote;
}> {
  // 1. 获取报价
  const quote = await getJupiterSwapQuote(params, connection);

  // 2. 获取交易
  const swapTransaction = await getJupiterSwapTransaction(quote, params, connection);

  return {
    serializedTransaction: swapTransaction,
    quote,
  };
}

/**
 * 执行 Jupiter Swap（服务端签名，如脚本/后台）
 * 
 * @param params - Swap 参数
 * @param connection - Solana 连接
 * @param signer - 签名者密钥对
 * @returns Swap 结果
 */
export async function executeJupiterSwap(
  params: JupiterSwapParams,
  connection: Connection,
  signer: Keypair
): Promise<JupiterSwapResult> {
  // 1. 构建交易
  const { serializedTransaction, quote } = await buildJupiterSwapTransaction(params, connection);

  // 2. 反序列化交易
  const transactionBuf = Buffer.from(serializedTransaction, "base64");
  const transaction = VersionedTransaction.deserialize(transactionBuf);

  // 3. 签名交易
  transaction.sign([signer]);

  // 4. 发送并确认交易
  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    maxRetries: 3,
  });

  // 5. 等待确认
  await connection.confirmTransaction(signature, "confirmed");

  return {
    transactionHash: signature,
    inputAmount: quote.inAmount,
    outputAmount: quote.outAmount,
    priceImpact: quote.priceImpactPct || "0",
  };
}

/**
 * 验证 Swap 参数
 */
export function validateSwapParams(params: JupiterSwapParams): { valid: boolean; error?: string } {
  if (!params.inputMint || !PublicKey.isOnCurve(params.inputMint)) {
    return { valid: false, error: "Invalid inputMint address" };
  }

  if (!params.outputMint || !PublicKey.isOnCurve(params.outputMint)) {
    return { valid: false, error: "Invalid outputMint address" };
  }

  if (params.amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (params.slippageBps && (params.slippageBps < 0 || params.slippageBps > 10000)) {
    return { valid: false, error: "Slippage must be between 0 and 10000 bps (0-100%)" };
  }

  return { valid: true };
}
