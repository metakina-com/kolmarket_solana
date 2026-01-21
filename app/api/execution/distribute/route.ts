import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { executeSOLDistribution, executePercentageDistribution } from "@/lib/execution/distribution";
import { loadKeypairFromEnv } from "@/lib/utils/solana-keypair";

// 使用 Node.js runtime，因为 Solana Agent Kit 不兼容 Edge Runtime
export const runtime = "nodejs";

/**
 * POST /api/execution/distribute
 * 执行分红分配
 * 
 * 注意：这是一个演示实现，实际生产环境需要：
 * 1. 使用用户的钱包签名，而不是服务器密钥
 * 2. 实现更严格的安全检查
 * 3. 添加权限验证
 */
export async function POST(req: NextRequest) {
  try {
    const { recipients, totalAmount, usePercentage, network = "devnet" } = await req.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients are required" },
        { status: 400 }
      );
    }

    // 创建连接（实际应该使用环境变量配置）
    const connection = new Connection(
      network === "mainnet" 
        ? process.env.SOLANA_MAINNET_RPC || clusterApiUrl("mainnet-beta")
        : clusterApiUrl("devnet"),
      "confirmed"
    );

    // 从环境变量加载密钥对（开发环境）
    // ⚠️ 警告：生产环境应该使用用户钱包签名，而不是服务器密钥
    // 实际实现应该：
    // 1. 接收用户钱包的公钥
    // 2. 在前端让用户签名交易
    // 3. 或者使用安全的签名服务
    let signer = loadKeypairFromEnv(network);
    if (!signer) {
      console.warn("⚠️  No keypair found in env, using generated keypair (for demo only)");
      signer = Keypair.generate(); // 仅用于演示
    }

    let result;
    if (usePercentage && totalAmount) {
      // 按百分比分配
      result = await executePercentageDistribution(
        connection,
        signer,
        recipients,
        totalAmount
      );
    } else {
      // 按固定金额分配
      result = await executeSOLDistribution(
        connection,
        signer,
        recipients
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Distribution error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute distribution",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
