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

    // 1. 优先尝试连接到 ElizaOS 服务器 (如果配置了环境变量)
    // 这里的 ELIZA_API_URL 可以通过 .env.local 配置
    const elizaApiUrl = process.env.ELIZA_API_URL || "http://localhost:3001";

    // 如果是 Eliza 模式，我们可以尝试转发
    if (process.env.USE_ELIZA === "true" || kolHandle) {
      try {
        console.log(`Attempting to reach ElizaOS at ${elizaApiUrl} for KOL: ${kolHandle}`);
        const elizaResponse = await fetch(`${elizaApiUrl}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: prompt,
            userId: "user",
            userName: "vibe_user",
            agentId: kolHandle || "default", // 将 kolHandle 映射为 Eliza 的 agentId
          }),
          // 设置较短的超时时间，如果 Eliza 没开，迅速降级到 Workers AI
          signal: AbortSignal.timeout(5000),
        });

        if (elizaResponse.ok) {
          const elizaData = await elizaResponse.json();
          // Eliza 返回的通常是一个数组 [{ text: "..." }]
          const responseText = Array.isArray(elizaData) ? elizaData[0]?.text : elizaData.text;
          if (responseText) {
            return NextResponse.json({ response: responseText });
          }
        }
      } catch (e) {
        console.warn("ElizaOS connection failed or timed out, falling back to Workers AI:", e);
      }
    }

    // --- 以下是原有的 Cloudflare Workers AI 逻辑 ---

    const ai = (globalThis as any).AI || (req as any).env?.AI;
    const env = (req as any).env;

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

  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({
      response: "🤖 System overload! Please recalibrate and try again in a moment.",
    });
  }
}
