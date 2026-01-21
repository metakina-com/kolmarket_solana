import { NextRequest, NextResponse } from "next/server";
import { agentSuiteManager, createFullAgentSuite } from "@/lib/agents/agent-suite";
import { getKOLPersona } from "@/lib/agents/kol-personas";
import { getAgentSuiteDB } from "@/lib/db/agent-suite-db";

// 使用 Node.js runtime，因为 ElizaOS 插件需要 Node.js 环境
export const runtime = "nodejs";

// 获取数据库实例（在 Cloudflare Pages 中，DB 绑定通过 env 访问）
function getDB() {
  // 在 Cloudflare Pages 环境中，env 对象可能通过不同的方式访问
  // 这里尝试多种方式获取数据库绑定
  const env = (globalThis as any).env || (process.env as any);
  return getAgentSuiteDB({ DB: env?.DB });
}

/**
 * GET /api/agent-suite
 * 获取所有 Agent Suite 列表或特定 Suite 状态
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const suiteId = searchParams.get("suiteId");
    const kolHandle = searchParams.get("kolHandle");

    const db = getDB();

    // 优先使用数据库，如果不可用则使用内存存储
    if (db) {
      if (suiteId) {
        const suite = await db.getSuite(suiteId);
        if (!suite) {
          return NextResponse.json(
            { error: "Suite not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ suite });
      }

      if (kolHandle) {
        const suite = await db.getSuiteByKOLHandle(kolHandle);
        if (!suite) {
          return NextResponse.json(
            { error: "Suite not found for this KOL" },
            { status: 404 }
          );
        }
        return NextResponse.json({ suite });
      }

      const suites = await db.getAllSuites();
      return NextResponse.json({ suites });
    } else {
      // 降级到内存存储
      if (suiteId) {
        const suite = agentSuiteManager.getSuite(suiteId);
        if (!suite) {
          return NextResponse.json(
            { error: "Suite not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ suite });
      }

      if (kolHandle) {
        const allSuites = agentSuiteManager.getAllSuites();
        const suite = allSuites.find(s => s.kolHandle === kolHandle);
        if (!suite) {
          return NextResponse.json(
            { error: "Suite not found for this KOL" },
            { status: 404 }
          );
        }
        return NextResponse.json({ suite });
      }

      const suites = agentSuiteManager.getAllSuites();
      return NextResponse.json({ suites });
    }
  } catch (error) {
    console.error("Agent Suite API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent suites" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-suite
 * 创建新的 Agent Suite
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kolHandle, modules } = body;

    if (!kolHandle) {
      return NextResponse.json(
        { error: "kolHandle is required" },
        { status: 400 }
      );
    }

    // 获取 KOL Persona
    const persona = getKOLPersona(kolHandle);
    if (!persona) {
      return NextResponse.json(
        { error: `KOL persona not found for ${kolHandle}` },
        { status: 404 }
      );
    }

    // 创建 Suite
    const suite = await createFullAgentSuite(
      kolHandle,
      persona.name,
      persona,
      {
        avatar: modules?.avatar,
        mod: modules?.mod,
        trader: modules?.trader,
      }
    );

    // 保存到数据库（如果可用）
    const db = getDB();
    if (db) {
      await db.createSuite(suite);
    }

    return NextResponse.json({
      success: true,
      suite,
      message: "Agent Suite created successfully",
    });
  } catch (error) {
    console.error("Agent Suite creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create agent suite" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agent-suite
 * 更新 Suite 状态（启动/停止）
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { suiteId, action } = body;

    if (!suiteId || !action) {
      return NextResponse.json(
        { error: "suiteId and action are required" },
        { status: 400 }
      );
    }

    const db = getDB();

    if (action === "start") {
      await agentSuiteManager.startSuite(suiteId);
      
      // 更新数据库状态
      if (db) {
        await db.updateSuiteStatus(suiteId, "active");
        // 更新各模块状态
        const suite = await db.getSuite(suiteId);
        if (suite) {
          if (suite.modules.avatar.enabled) {
            await db.updateModuleStatus(suiteId, "avatar", "running");
          }
          if (suite.modules.mod.enabled) {
            await db.updateModuleStatus(suiteId, "mod", "running");
          }
          if (suite.modules.trader.enabled) {
            await db.updateModuleStatus(suiteId, "trader", "running");
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Suite started successfully",
      });
    } else if (action === "stop") {
      await agentSuiteManager.stopSuite(suiteId);
      
      // 更新数据库状态
      if (db) {
        await db.updateSuiteStatus(suiteId, "inactive");
        // 更新各模块状态
        const suite = await db.getSuite(suiteId);
        if (suite) {
          if (suite.modules.avatar.enabled) {
            await db.updateModuleStatus(suiteId, "avatar", "stopped");
          }
          if (suite.modules.mod.enabled) {
            await db.updateModuleStatus(suiteId, "mod", "stopped");
          }
          if (suite.modules.trader.enabled) {
            await db.updateModuleStatus(suiteId, "trader", "stopped");
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Suite stopped successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'start' or 'stop'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Agent Suite update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update suite" },
      { status: 500 }
    );
  }
}
