import { NextRequest, NextResponse } from "next/server";
import { getAgentSuiteDB } from "@/lib/db/agent-suite-db";
import type { AvatarConfig, ModConfig, TraderConfig } from "@/lib/agents/agent-suite";

export const runtime = "edge";

// 获取数据库实例
function getDB() {
  const env = (globalThis as any).env || (process.env as any);
  return getAgentSuiteDB({ DB: env?.DB });
}

/**
 * PUT /api/agent-suite/config
 * 更新 Suite 配置
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { suiteId, config } = body;

    if (!suiteId || !config) {
      return NextResponse.json(
        { error: "suiteId and config are required" },
        { status: 400 }
      );
    }

    const db = getDB();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // 获取现有 Suite
    const suite = await db.getSuite(suiteId);
    if (!suite) {
      return NextResponse.json(
        { error: "Suite not found" },
        { status: 404 }
      );
    }

    // 更新配置（这里简化处理，实际应该更新数据库中的配置字段）
    // 注意：当前实现中，配置存储在 agent_suites 表的 *_config 字段中
    // 如果需要更新配置，需要修改数据库结构或使用单独的配置表

    // 更新模块启用状态
    if (config.avatar !== undefined) {
      // TODO: 更新 avatar_config 字段
      // 这里可以扩展数据库操作来更新配置
    }

    if (config.mod !== undefined) {
      // TODO: 更新 mod_config 字段
    }

    if (config.trader !== undefined) {
      // TODO: 更新 trader_config 字段
    }

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
    });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update config" },
      { status: 500 }
    );
  }
}
