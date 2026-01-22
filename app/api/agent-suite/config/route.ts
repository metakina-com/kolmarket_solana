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

    const configUpdates: { avatar?: AvatarConfig; mod?: ModConfig; trader?: TraderConfig } = {};
    if (config.avatar !== undefined) configUpdates.avatar = config.avatar as AvatarConfig;
    if (config.mod !== undefined) configUpdates.mod = config.mod as ModConfig;
    if (config.trader !== undefined) configUpdates.trader = config.trader as TraderConfig;

    if (Object.keys(configUpdates).length > 0) {
      await db.updateSuiteConfig(suiteId, configUpdates);
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
