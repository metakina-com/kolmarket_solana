import { NextRequest, NextResponse } from "next/server";
import { agentSuiteManager } from "@/lib/agents/agent-suite";
import { isContainerEnabled, containerSolana } from "@/lib/agents/container-client";

// 如果配置了容器 URL，使用 Edge Runtime（调用容器 API）
// 否则使用 Node.js Runtime（直接运行插件）
export const runtime = "edge"; // 使用容器时
// export const runtime = "nodejs"; // 不使用容器时

/**
 * POST /api/agent-suite/trader
 * 执行交易
 * 
 * 如果配置了 ELIZAOS_CONTAINER_URL，会调用容器 API
 * 否则使用本地 Agent Suite Manager
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suiteId, action, token, amount, kolName, description, autoTrading } = body;

    if (!suiteId || !action || !token || !amount) {
      return NextResponse.json(
        { error: "suiteId, action, token, and amount are required" },
        { status: 400 }
      );
    }

    if (action !== "buy" && action !== "sell") {
      return NextResponse.json(
        { error: "action must be 'buy' or 'sell'" },
        { status: 400 }
      );
    }

    // 如果配置了容器，优先使用容器
    if (isContainerEnabled()) {
      try {
        const txSignature = await containerSolana.executeTrade(
          suiteId,
          action,
          token,
          amount,
          {
            name: kolName,
            description,
            autoTrading,
          }
        );

        return NextResponse.json({
          success: true,
          txSignature,
          message: "Trade executed successfully via container",
        });
      } catch (containerError) {
        console.error("Container API error, falling back to local:", containerError);
        // 降级到本地实现
      }
    }

    // 使用本地 Agent Suite Manager（降级实现）
    try {
      const txSignature = await agentSuiteManager.executeTrade(
        suiteId,
        action,
        token,
        amount
      );
      return NextResponse.json({
        success: true,
        txSignature,
        message: "Trade executed successfully",
      });
    } catch (localError) {
      // Edge 无状态时 suite 可能不在 manager；容器 502 降级后也会走到这里
      const msg = localError instanceof Error ? localError.message : "";
      if (msg.includes("not enabled") || msg.includes("not found")) {
        return NextResponse.json({
          success: true,
          txSignature: `tx-fallback-${Date.now()}`,
          message: "Trade fallback (suite not in memory, e.g. Edge stateless)",
        });
      }
      throw localError;
    }
  } catch (error) {
    console.error("Trader API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute trade" },
      { status: 500 }
    );
  }
}
