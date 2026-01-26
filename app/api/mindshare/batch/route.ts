import { NextRequest, NextResponse } from "next/server";
import { getMindshareData, MindshareData } from "@/lib/data/cookie-fun";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handlesParam = searchParams.get("handles") || "";

    const handles = handlesParam
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    if (handles.length === 0) {
      return NextResponse.json({ error: "handles is required" }, { status: 400 });
    }

    if (handles.length > 50) {
      return NextResponse.json({ error: "Too many handles" }, { status: 400 });
    }

    const results = await Promise.all(
      handles.map(async (handle) => {
        const data = await getMindshareData(handle);
        return { handle, data };
      })
    );

    const data: Record<string, MindshareData> = {};
    const missing: string[] = [];

    for (const item of results) {
      if (item.data) {
        data[item.handle] = item.data;
      } else {
        missing.push(item.handle);
      }
    }

    return NextResponse.json(
      { data, missing },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Mindshare batch API error:", error);
    return NextResponse.json({ error: "Failed to fetch Mindshare data" }, { status: 500 });
  }
}
