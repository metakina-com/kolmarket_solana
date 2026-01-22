import { NextRequest, NextResponse } from "next/server";
import { tradingHistoryManager } from "@/lib/execution/trading-history";
import type { TradingHistoryFilter } from "@/lib/execution/trading-history";

export const runtime = "edge";

/**
 * GET /api/execution/history
 * 查询交易历史记录
 * 
 * Query params:
 * - wallet: 钱包地址
 * - type: 类型 (strategy|distribution|swap)
 * - status: 状态 (pending|success|failed)
 * - network: 网络 (devnet|mainnet)
 * - startDate: 开始日期 (ISO 8601)
 * - endDate: 结束日期 (ISO 8601)
 * - limit: 限制数量 (默认100)
 * - offset: 偏移量 (默认0)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const filter: TradingHistoryFilter = {};
    
    if (searchParams.has("wallet")) {
      filter.wallet = searchParams.get("wallet") || undefined;
    }
    
    if (searchParams.has("type")) {
      const type = searchParams.get("type");
      if (type === "strategy" || type === "distribution" || type === "swap") {
        filter.type = type;
      }
    }
    
    if (searchParams.has("status")) {
      const status = searchParams.get("status");
      if (status === "pending" || status === "success" || status === "failed") {
        filter.status = status;
      }
    }
    
    if (searchParams.has("network")) {
      const network = searchParams.get("network");
      if (network === "devnet" || network === "mainnet") {
        filter.network = network;
      }
    }
    
    if (searchParams.has("startDate")) {
      filter.startDate = searchParams.get("startDate") || undefined;
    }
    
    if (searchParams.has("endDate")) {
      filter.endDate = searchParams.get("endDate") || undefined;
    }
    
    if (searchParams.has("limit")) {
      filter.limit = parseInt(searchParams.get("limit") || "100");
    }
    
    if (searchParams.has("offset")) {
      filter.offset = parseInt(searchParams.get("offset") || "0");
    }

    const history = tradingHistoryManager.query(filter);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error("History query error:", error);
    return NextResponse.json(
      {
        error: "Failed to query history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/execution/history/stats
 * 获取交易统计信息
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, network } = body;

    const stats = tradingHistoryManager.getStats(
      wallet,
      network === "mainnet" ? "mainnet" : network === "devnet" ? "devnet" : undefined
    );

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("History stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to get stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
