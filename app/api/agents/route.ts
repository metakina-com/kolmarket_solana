import { NextRequest, NextResponse } from "next/server";
import { getAvailableKOLs, getKOLPersona } from "@/lib/agents/kol-personas";

export const runtime = "edge";

/**
 * GET /api/agents
 * 获取所有可用的 KOL 数字生命列表
 */
export async function GET(req: NextRequest) {
  try {
    const kolList = getAvailableKOLs();
    return NextResponse.json({
      agents: kolList.map(kol => ({
        handle: kol.handle,
        name: kol.name,
        personality: kol.personality,
        expertise: kol.expertise,
      })),
    });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * 获取特定 KOL 的详细信息
 */
export async function POST(req: NextRequest) {
  try {
    const { handle } = await req.json();

    if (!handle) {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    const persona = getKOLPersona(handle);

    if (!persona) {
      return NextResponse.json(
        { error: "KOL not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      handle: persona.handle,
      name: persona.name,
      personality: persona.personality,
      expertise: persona.expertise,
      speakingStyle: persona.speakingStyle,
      knowledgeBase: persona.knowledgeBase,
    });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent details" },
      { status: 500 }
    );
  }
}
