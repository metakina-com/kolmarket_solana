import { NextRequest, NextResponse } from "next/server";
import { getAgentSuiteDB } from "@/lib/db/agent-suite-db";

export const runtime = "edge";

// 本地开发模式下的内存回退 (Non-persistent fallback for local development)
const memDb: Record<string, any> = {
    ansem: {
        aggression: 85,
        humor: 42,
        followers: 12500,
        revenue: 42902.50
    }
};

/**
 * 获取或更新 KOL Agent Suite 配置
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const kolHandle = searchParams.get("kolHandle") || "ansem";

        const env = (req as any).env;
        const db = getAgentSuiteDB(env);

        if (!db) {
            console.warn("D1 database not available, using memory fallback");
            return NextResponse.json({
                kolHandle,
                ...(memDb[kolHandle] || memDb.ansem)
            });
        }

        let suite = await db.getSuiteByKOLHandle(kolHandle);

        if (!suite) {
            // 如果不存在，返回一个默认配置或 Mock 数据
            return NextResponse.json({
                kolHandle,
                aggression: 85,
                humor: 42,
                status: "ACTIVE",
                revenue: 42902.50,
                followers: 12500
            });
        }

        // 解析配置
        const stats = suite.stats || {};
        const avatarStats = stats.avatar as any || {};
        return NextResponse.json({
            kolHandle: suite.kolHandle,
            status: suite.status,
            aggression: avatarStats.aggression || 85,
            humor: avatarStats.humor || 42,
            revenue: stats.trader?.totalProfit || 42902.50,
            followers: stats.avatar?.followers || 12500
        });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { kolHandle, aggression, humor } = await req.json();

        const env = (req as any).env;
        const db = getAgentSuiteDB(env);

        if (!db) {
            // 本地内存更新
            if (!memDb[kolHandle]) memDb[kolHandle] = { ...memDb.ansem };
            memDb[kolHandle].aggression = aggression;
            memDb[kolHandle].humor = humor;
            return NextResponse.json({ success: true, mode: "memory" });
        }

        let suite = await db.getSuiteByKOLHandle(kolHandle);

        if (!suite) {
            // 如果不存在，先创建一个
            const suiteId = `suite-${kolHandle}-${Date.now()}`;
            await db.createSuite({
                suiteId,
                kolHandle,
                status: "active",
                modules: {
                    avatar: { enabled: true, status: "running" },
                    mod: { enabled: true, status: "running" },
                    trader: { enabled: true, status: "stopped" }
                },
                stats: {
                    avatar: { totalTweets: 0, totalInteractions: 0, followers: 12500, engagementRate: 0, ...(aggression !== undefined && { aggression }), ...(humor !== undefined && { humor }) } as any,
                    trader: { totalTrades: 0, totalVolume: 0, totalProfit: 42902.50, winRate: 0, followers: 500 }
                },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        } else {
            // 更新现有统计数据（这里我们把性格参数暂存在 stats 中用于演示）
            await db.updateStats(suite.suiteId, {
                avatar: {
                    ...suite.stats.avatar,
                    aggression,
                    humor
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
