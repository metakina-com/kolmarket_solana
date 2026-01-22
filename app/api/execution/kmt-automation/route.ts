import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Keypair, clusterApiUrl } from "@solana/web3.js";
import { KMTAutomationManager, AutomationTask } from "@/lib/execution/kmt-automation";
import { getOrCreateKeypair } from "@/lib/utils/solana-keypair";

export const runtime = "edge";

// 内存中存储自动化管理器实例（生产环境应使用数据库）
const automationManagers = new Map<string, KMTAutomationManager>();

/**
 * GET /api/execution/kmt-automation
 * 获取所有自动化任务
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const network = (searchParams.get("network") || "devnet") as "devnet" | "mainnet-beta";
    const tokenMint = searchParams.get("tokenMint");
    
    if (!tokenMint) {
      return NextResponse.json({ error: "tokenMint is required" }, { status: 400 });
    }

    const manager = getOrCreateManager(network, tokenMint);
    const tasks = manager.getTasks();

    return NextResponse.json({
      success: true,
      tasks: tasks.map((task) => ({
        ...task,
        // 不返回敏感信息
        distribution: {
          ...task.distribution,
          recipients: task.distribution.recipients.map((r) => ({
            address: r.address.toBase58(),
            amount: r.amount,
            percentage: r.percentage,
          })),
        },
      })),
    });
  } catch (e) {
    console.error("Get automation tasks error:", e);
    return NextResponse.json(
      {
        error: "Failed to get automation tasks",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/execution/kmt-automation
 * 创建新的自动化任务
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { network = "devnet", tokenMint, task } = body;

    if (!tokenMint) {
      return NextResponse.json({ error: "tokenMint is required" }, { status: 400 });
    }

    if (!task) {
      return NextResponse.json({ error: "task is required" }, { status: 400 });
    }

    const manager = getOrCreateManager(network, tokenMint);
    
    // 转换地址字符串为 PublicKey
    const processedTask: AutomationTask = {
      ...task,
      distribution: {
        ...task.distribution,
        recipients: task.distribution.recipients.map((r: any) => ({
          address: new PublicKey(r.address),
          amount: r.amount,
          percentage: r.percentage,
        })),
      },
    };

    manager.addTask(processedTask);

    return NextResponse.json({
      success: true,
      task: {
        ...processedTask,
        distribution: {
          ...processedTask.distribution,
          recipients: processedTask.distribution.recipients.map((r) => ({
            address: r.address.toBase58(),
            amount: r.amount,
            percentage: r.percentage,
          })),
        },
      },
    });
  } catch (e) {
    console.error("Create automation task error:", e);
    return NextResponse.json(
      {
        error: "Failed to create automation task",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/execution/kmt-automation
 * 更新任务（启用/禁用/执行）
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { network = "devnet", tokenMint, taskId, action, enabled } = body;

    if (!tokenMint || !taskId) {
      return NextResponse.json(
        { error: "tokenMint and taskId are required" },
        { status: 400 }
      );
    }

    const manager = getOrCreateManager(network, tokenMint);

    if (action === "execute") {
      // 执行任务
      const result = await manager.executeTask(taskId);
      return NextResponse.json({
        success: result.success,
        result,
      });
    } else if (action === "toggle") {
      // 启用/禁用任务
      if (enabled === undefined) {
        return NextResponse.json({ error: "enabled is required" }, { status: 400 });
      }
      const success = manager.setTaskEnabled(taskId, enabled);
      if (!success) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else if (action === "delete") {
      // 删除任务
      manager.removeTask(taskId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    console.error("Update automation task error:", e);
    return NextResponse.json(
      {
        error: "Failed to update automation task",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * 获取或创建自动化管理器实例
 */
function getOrCreateManager(
  network: "devnet" | "mainnet-beta",
  tokenMint: string
): KMTAutomationManager {
  const key = `${network}-${tokenMint}`;
  
  if (!automationManagers.has(key)) {
    const signerKeypair = getOrCreateKeypair();
    
    const manager = new KMTAutomationManager({
      tokenMint,
      signerKeypair,
      network,
    });
    
    automationManagers.set(key, manager);
  }
  
  return automationManagers.get(key)!;
}
