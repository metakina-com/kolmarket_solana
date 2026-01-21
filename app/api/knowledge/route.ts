/**
 * 知识库管理 API
 * 用于添加、查询和管理 KOL 知识库
 */

import { NextRequest, NextResponse } from "next/server";
import { addKnowledgeToVectorize, addBatchKnowledgeToVectorize, indexDocument } from "@/lib/agents/rag-integration";

export const runtime = "edge";

/**
 * POST /api/knowledge
 * 添加知识到知识库
 */
export async function POST(req: NextRequest) {
  try {
    const { kolHandle, content, contents, document, metadata } = await req.json();

    if (!kolHandle) {
      return NextResponse.json({ error: "kolHandle is required" }, { status: 400 });
    }

    const ai = (globalThis as any).AI || (req as any).env?.AI;
    const env = (req as any).env;

    if (!ai || !env?.VECTORIZE) {
      return NextResponse.json(
        { error: "Cloudflare AI or Vectorize not available" },
        { status: 503 }
      );
    }

    let vectorIds: string | string[];

    // 处理单个内容
    if (content) {
      const vectorId = await addKnowledgeToVectorize(
        ai,
        env.VECTORIZE,
        env.DB,
        kolHandle,
        content,
        metadata || {}
      );
      vectorIds = vectorId;
    }
    // 处理批量内容
    else if (contents && Array.isArray(contents)) {
      vectorIds = await addBatchKnowledgeToVectorize(
        ai,
        env.VECTORIZE,
        env.DB,
        kolHandle,
        contents,
        metadata || {}
      );
    }
    // 处理文档索引
    else if (document) {
      vectorIds = await indexDocument(
        ai,
        env,
        kolHandle,
        document,
        metadata?.chunkSize || 500,
        metadata?.overlap || 50
      );
    }
    else {
      return NextResponse.json(
        { error: "content, contents, or document is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      vectorIds,
      kolHandle,
    });
  } catch (error) {
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add knowledge" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/knowledge?kolHandle=xxx
 * 查询知识库统计信息
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kolHandle = searchParams.get("kolHandle");

    if (!kolHandle) {
      return NextResponse.json({ error: "kolHandle is required" }, { status: 400 });
    }

    const env = (req as any).env;
    const db = env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // 查询知识库统计
    const stats = await db.prepare(
      `SELECT 
        COUNT(*) as total_chunks,
        COUNT(DISTINCT source) as total_sources,
        MIN(created_at) as first_added,
        MAX(created_at) as last_added
       FROM knowledge_metadata
       WHERE agent_id = ?`
    ).bind(kolHandle).first();

    return NextResponse.json({
      kolHandle,
      stats: {
        totalChunks: stats?.total_chunks || 0,
        totalSources: stats?.total_sources || 0,
        firstAdded: stats?.first_added || null,
        lastAdded: stats?.last_added || null,
      },
    });
  } catch (error) {
    console.error("Knowledge query error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to query knowledge" },
      { status: 500 }
    );
  }
}
