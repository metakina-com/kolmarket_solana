import { NextRequest, NextResponse } from "next/server";
import { getMindshareData } from "@/lib/data/cookie-fun";

export const runtime = "edge";

/**
 * GET /api/mindshare/[handle]
 * 获取指定 KOL 的 Mindshare 数据
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  try {
    // Next.js 15 中 params 是 Promise
    const { handle } = await context.params;

    if (!handle) {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    const data = await getMindshareData(handle);

    if (!data) {
      return NextResponse.json(
        { error: "Mindshare data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Mindshare API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Mindshare data" },
      { status: 500 }
    );
  }
}
