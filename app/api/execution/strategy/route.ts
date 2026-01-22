import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  initializeTradingAgent,
  buildTradingStrategyTransaction,
  TradingStrategy,
} from "@/lib/execution/trading-agent";

export const runtime = "edge";

/**
 * POST /api/execution/strategy
 * 构建策略未签名交易，供前端用户钱包签名并广播。
 * 
 * Body: { strategy, network?, payer }
 * payer: 用户钱包公钥 (base58)，必填。
 */
export async function POST(req: NextRequest) {
  try {
    const { strategy, network = "devnet", payer } = await req.json();

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy is required" },
        { status: 400 }
      );
    }
    if (!payer || typeof payer !== "string") {
      return NextResponse.json(
        { error: "payer (wallet public key) is required. Sign with your wallet." },
        { status: 400 }
      );
    }

    const connection = new Connection(
      network === "mainnet"
        ? process.env.SOLANA_MAINNET_RPC || clusterApiUrl("mainnet-beta")
        : clusterApiUrl("devnet"),
      "confirmed"
    );

    const agent = await initializeTradingAgent(connection, {
      maxSlippage: 5,
      maxTransactionAmount: 10,
      maxDailyLoss: 50,
    });

    let payerPubkey: PublicKey;
    try {
      payerPubkey = new PublicKey(payer);
    } catch {
      return NextResponse.json(
        { error: "Invalid payer public key format." },
        { status: 400 }
      );
    }
    const built = await buildTradingStrategyTransaction(
      agent,
      strategy as TradingStrategy,
      payerPubkey
    );

    return NextResponse.json({
      success: true,
      serializedTransaction: built.serializedTransaction,
      strategyId: built.strategyId,
      ruleCount: built.ruleCount,
    });
  } catch (error) {
    console.error("Strategy prepare error:", error);
    return NextResponse.json(
      {
        error: "Failed to prepare strategy transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
