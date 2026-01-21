import { NextRequest, NextResponse } from "next/server";
import { getKOLPersona, getDefaultSystemPrompt } from "@/lib/agents/kol-personas";
import { generateTextWithCloudflareAI, getRecommendedModelConfig } from "@/lib/agents/cloudflare-ai-adapter";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, kolHandle, useRAG } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Get AI binding from Cloudflare environment
    // In Cloudflare Pages, the AI binding is available via globalThis.AI
    const ai = (globalThis as any).AI || (req as any).env?.AI;
    const env = (req as any).env;

    // Get KOL persona if specified
    let systemPrompt: string;
    if (kolHandle) {
      const persona = getKOLPersona(kolHandle);
      systemPrompt = persona?.systemPrompt || getDefaultSystemPrompt(kolHandle);
    } else {
      systemPrompt = getDefaultSystemPrompt();
    }

    if (!ai) {
      // Fallback for local development - return a mock response with KOL personality
      const mockResponses = [
        "🚀 GM anon! This is a demo response. In production, I'd be powered by Cloudflare Workers AI. What's your alpha?",
        "💎 HODL strong! This is a demo - real AI coming soon. What's on your mind?",
        "🦍 Ape in! Demo mode activated. What do you want to know?",
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return NextResponse.json({
        response: randomResponse,
      });
    }

    // 如果启用 RAG 且有 Vectorize 绑定，使用 RAG 查询
    if (useRAG && env?.VECTORIZE && kolHandle) {
      try {
        const { ragQueryWithKOL } = await import("@/lib/agents/rag-integration");
        const response = await ragQueryWithKOL(ai, env, kolHandle, prompt, systemPrompt);
        return NextResponse.json({ response });
      } catch (ragError) {
        console.warn("RAG query failed, falling back to regular chat:", ragError);
        // 降级到普通对话
      }
    }

    // 使用 Cloudflare AI 适配器生成响应
    const config = getRecommendedModelConfig("chat");
    const response = await generateTextWithCloudflareAI(
      ai,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      config
    );

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error("AI API error:", error);
    // Return a fallback response instead of error for better UX
    const fallbackResponses = [
      "🚀 GM! I'm having a moment. In production, I'd be chatting with you via Cloudflare Workers AI. What's your alpha?",
      "💎 HODL on! Something went wrong. Try again?",
      "🦍 Ape moment! Let's try that again.",
    ];
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return NextResponse.json({
      response: randomResponse,
    });
  }
}
