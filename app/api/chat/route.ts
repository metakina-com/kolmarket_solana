import { NextRequest, NextResponse } from "next/server";
import { getKOLPersona, getDefaultSystemPrompt } from "@/lib/agents/kol-personas";
import { generateTextWithCloudflareAI, getRecommendedModelConfig } from "@/lib/agents/cloudflare-ai-adapter";
import { generateAgentResponse, isAIServiceAvailable } from "@/lib/agents/lightweight-agent";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, kolHandle, useRAG } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. 优先使用轻量级 Agent (Vercel AI SDK)
    if (isAIServiceAvailable()) {
      try {
        const agentResult = await generateAgentResponse(prompt, {
          kolHandle,
          useRAG,
        });
        return NextResponse.json({ response: agentResult.text });
      } catch (e) {
        console.warn("Lightweight Agent failed, falling back to Workers AI:", e);
      }
    }

    // --- 以下是原有的 Cloudflare Workers AI 逻辑 ---

    // 在 Edge Runtime 中，AI 绑定通过 context 传递
    const ai = (globalThis as any).AI || (req as any).env?.AI;
    const env = (req as any).env || {};

    let systemPrompt: string;
    if (kolHandle) {
      const persona = getKOLPersona(kolHandle);
      systemPrompt = persona?.systemPrompt || getDefaultSystemPrompt(kolHandle);
    } else {
      systemPrompt = getDefaultSystemPrompt();
    }

    if (!ai) {
      // Fallback for local development if neither Eliza nor Workers AI is available
      const persona = kolHandle ? getKOLPersona(kolHandle) : null;
      const kolName = persona?.name || "AI Assistant";

      const promptLower = prompt.toLowerCase();
      let mockResponse: string;

      if (promptLower.includes("gm") || promptLower.includes("hello") || promptLower.includes("hi")) {
        mockResponse = `GM! 👋 I'm ${kolName}'s digital twin. ElizaOS is currently offline, so I'm in demo mode. What's your alpha today?`;
      } else {
        mockResponse = `🚀 ${kolName} here. My neural processor (ElizaOS) isn't responding, but I'm still here in demo mode. You asked: "${prompt.slice(0, 30)}..."`;
      }

      return NextResponse.json({ response: mockResponse });
    }

    // RAG 逻辑
    if (useRAG && env?.VECTORIZE && kolHandle) {
      try {
        const { ragQueryWithKOL } = await import("@/lib/agents/rag-integration");
        const response = await ragQueryWithKOL(ai, env, kolHandle, prompt, systemPrompt);
        return NextResponse.json({ response });
      } catch (ragError) {
        console.warn("RAG query failed:", ragError);
      }
    }

    // Workers AI 逻辑
    try {
      const config = getRecommendedModelConfig("chat");
      const response = await generateTextWithCloudflareAI(
        ai,
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        config
      );

      return NextResponse.json({ response });
    } catch (aiError) {
      console.error("Workers AI error:", aiError);
      // 如果 Workers AI 失败，返回降级响应
      const persona = kolHandle ? getKOLPersona(kolHandle) : null;
      const kolName = persona?.name || "AI Assistant";
      return NextResponse.json({
        response: `🚀 ${kolName} here. Workers AI is temporarily unavailable. You asked: "${prompt.slice(0, 50)}..." Please try again later.`,
      });
    }

  } catch (error) {
    console.error("AI API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        response: "🤖 System overload! Please recalibrate and try again in a moment.",
      },
      { status: 500 }
    );
  }
}
