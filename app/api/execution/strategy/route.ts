import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import {
  initializeTradingAgent,
  executeTradingStrategy,
  TradingStrategy,
} from "@/lib/execution/trading-agent";
import { loadKeypairFromEnv } from "@/lib/utils/solana-keypair";

// 使用 Node.js runtime，因为 Solana Agent Kit 不兼容 Edge Runtime
export const runtime = "nodejs";

/**
 * POST /api/execution/strategy
 * 执行交易策略
 * 
 * 注意：这是一个演示实现，实际生产环境需要：
 * 1. 使用用户的钱包签名
 * 2. 实现更严格的风险控制
 * 3. 添加策略验证
 */
export async function POST(req: NextRequest) {
  try {
    const { strategy, network = "devnet" } = await req.json();

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy is required" },
        { status: 400 }
      );
    }

    // 创建连接
    const connection = new Connection(
      network === "mainnet"
        ? process.env.SOLANA_MAINNET_RPC || clusterApiUrl("mainnet-beta")
        : clusterApiUrl("devnet"),
      "confirmed"
    );

    // 初始化交易智能体
    const agent = await initializeTradingAgent(connection, {
      maxSlippage: 5,
      maxTransactionAmount: 10,
      maxDailyLoss: 50,
    });

    // 从环境变量加载密钥对（开发环境）
    // ⚠️ 警告：生产环境应该使用用户钱包签名
    let signer = loadKeypairFromEnv(network);
    if (!signer) {
      console.warn("⚠️  No keypair found in env, using generated keypair (for demo only)");
      signer = Keypair.generate(); // 仅用于演示
    }

    // 执行策略
    const execution = await executeTradingStrategy(
      agent,
      strategy as TradingStrategy,
      signer
    );

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error) {
    console.error("Strategy execution error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute strategy",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
