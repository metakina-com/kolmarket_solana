import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  buildSOLDistributionTransaction,
  buildTokenDistributionTransaction,
} from "@/lib/execution/distribution";

export const runtime = "edge";

/**
 * POST /api/execution/distribute
 * 构建分红未签名交易，供前端用户钱包签名并广播。
 * SOL: { recipients, totalAmount?, usePercentage, network?, payer }
 * Token: { mint, recipients (address + amount 最小单位), network?, payer }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipients,
      totalAmount,
      usePercentage,
      network = "devnet",
      payer,
      mint,
    } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Recipients are required" }, { status: 400 });
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

    const payerPubkey = new PublicKey(payer);

    if (mint) {
      const mintPubkey = new PublicKey(mint);
      const built = await buildTokenDistributionTransaction(
        connection,
        payerPubkey,
        mintPubkey,
        recipients,
        !!usePercentage,
        usePercentage ? totalAmount : undefined
      );
      return NextResponse.json({
        success: true,
        mode: "token",
        serializedTransaction: built.serializedTransaction,
        totalAmount: built.totalAmount,
        recipientCount: built.recipientCount,
      });
    }

    const built = await buildSOLDistributionTransaction(
      connection,
      payerPubkey,
      recipients,
      !!usePercentage,
      usePercentage ? totalAmount : undefined
    );

    return NextResponse.json({
      success: true,
      mode: "sol",
      serializedTransaction: built.serializedTransaction,
      totalAmount: built.totalAmount,
      recipientCount: built.recipientCount,
    });
  } catch (e) {
    console.error("Distribution prepare error:", e);
    return NextResponse.json(
      {
        error: "Failed to prepare distribution",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
