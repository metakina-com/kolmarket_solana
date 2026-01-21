/**
 * RAG (Retrieval-Augmented Generation) 集成模块
 * 使用 Cloudflare Vectorize + D1 实现知识库检索增强生成
 */

import { generateEmbeddingWithCloudflareAI, ragQueryWithCloudflareAI, getRecommendedModelConfig } from "./cloudflare-ai-adapter";

/**
 * 在 Vectorize 中搜索相关知识
 * 
 * @param vectorize - Cloudflare Vectorize 绑定
 * @param queryEmbedding - 查询的 embedding 向量
 * @param kolHandle - KOL 标识（用于过滤）
 * @param topK - 返回最相关的 K 个结果
 * @returns 搜索结果
 */
export async function searchKnowledgeInVectorize(
  vectorize: any,
  queryEmbedding: number[],
  kolHandle?: string,
  topK: number = 5
) {
  try {
    const filter = kolHandle ? { agentId: kolHandle } : undefined;
    
    const results = await vectorize.query(queryEmbedding, {
      topK,
      filter,
    });

    return results;
  } catch (error) {
    console.error("Vectorize search error:", error);
    return { matches: [] };
  }
}

/**
 * 添加知识到 Vectorize
 * 
 * @param ai - Cloudflare AI 绑定
 * @param vectorize - Cloudflare Vectorize 绑定
 * @param db - Cloudflare D1 数据库绑定
 * @param kolHandle - KOL 标识
 * @param content - 知识内容
 * @param metadata - 元数据（来源、类型等）
 * @returns 向量 ID
 */
export async function addKnowledgeToVectorize(
  ai: any,
  vectorize: any,
  db: any,
  kolHandle: string,
  content: string,
  metadata: {
    source?: string;
    type?: string;
    chunkIndex?: number;
  } = {}
) {
  try {
    // 1. 生成 embedding
    const embeddings = await generateEmbeddingWithCloudflareAI(ai, content);
    const embedding = embeddings[0];

    // 2. 存储到 Vectorize
    const vectorId = `knowledge-${kolHandle}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await vectorize.insert([
      {
        id: vectorId,
        values: embedding,
        metadata: {
          agentId: kolHandle,
          content: content.substring(0, 500), // 存储前 500 字符作为预览
          ...metadata,
        },
      },
    ]);

    // 3. 存储元数据到 D1（如果数据库可用）
    if (db) {
      try {
        await db.prepare(
          `INSERT INTO knowledge_metadata (id, agent_id, source, chunk_id, content_preview, chunk_index, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          `meta-${vectorId}`,
          kolHandle,
          metadata.source || "manual",
          vectorId,
          content.substring(0, 200),
          metadata.chunkIndex || 0,
          Date.now()
        ).run();
      } catch (dbError) {
        console.warn("Failed to save metadata to D1:", dbError);
        // 继续执行，不阻塞主流程
      }
    }

    return vectorId;
  } catch (error) {
    console.error("Error adding knowledge to Vectorize:", error);
    throw error;
  }
}

/**
 * 批量添加知识到 Vectorize
 * 
 * @param ai - Cloudflare AI 绑定
 * @param vectorize - Cloudflare Vectorize 绑定
 * @param db - Cloudflare D1 数据库绑定
 * @param kolHandle - KOL 标识
 * @param contents - 知识内容列表
 * @param metadata - 元数据
 * @returns 向量 ID 列表
 */
export async function addBatchKnowledgeToVectorize(
  ai: any,
  vectorize: any,
  db: any,
  kolHandle: string,
  contents: string[],
  metadata: {
    source?: string;
    type?: string;
  } = {}
) {
  try {
    // 1. 批量生成 embeddings
    const embeddings = await generateEmbeddingWithCloudflareAI(ai, contents);

    // 2. 准备插入数据
    const vectors = embeddings.map((embedding, index) => {
      const vectorId = `knowledge-${kolHandle}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: vectorId,
        values: embedding,
        metadata: {
          agentId: kolHandle,
          content: contents[index].substring(0, 500),
          ...metadata,
        },
      };
    });

    // 3. 批量插入到 Vectorize
    await vectorize.insert(vectors);

    // 4. 批量存储元数据到 D1
    if (db) {
      try {
        const stmt = db.prepare(
          `INSERT INTO knowledge_metadata (id, agent_id, source, chunk_id, content_preview, chunk_index, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        const batch = db.batch(
          vectors.map((vector, index) =>
            stmt.bind(
              `meta-${vector.id}`,
              kolHandle,
              metadata.source || "manual",
              vector.id,
              contents[index].substring(0, 200),
              index,
              Date.now()
            )
          )
        );

        await batch;
      } catch (dbError) {
        console.warn("Failed to save batch metadata to D1:", dbError);
      }
    }

    return vectors.map(v => v.id);
  } catch (error) {
    console.error("Error adding batch knowledge to Vectorize:", error);
    throw error;
  }
}

/**
 * 使用 RAG 查询 KOL 知识库
 * 
 * @param ai - Cloudflare AI 绑定
 * @param env - Cloudflare 环境（包含 VECTORIZE 和 DB 绑定）
 * @param kolHandle - KOL 标识
 * @param query - 用户查询
 * @param systemPrompt - 系统提示词
 * @returns 生成的回答
 */
export async function ragQueryWithKOL(
  ai: any,
  env: any,
  kolHandle: string,
  query: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const vectorize = env.VECTORIZE;
    const db = env.DB;

    if (!vectorize) {
      throw new Error("Vectorize binding not available");
    }

    // 1. 生成查询的 embedding
    const queryEmbeddings = await generateEmbeddingWithCloudflareAI(ai, query);
    const queryEmbedding = queryEmbeddings[0];

    // 2. 在 Vectorize 中搜索相关知识
    const searchResults = await searchKnowledgeInVectorize(
      vectorize,
      queryEmbedding,
      kolHandle,
      5 // top 5 相关结果
    );

    // 3. 提取上下文
    const contexts = searchResults.matches.map((match: any) => {
      // 优先使用 metadata 中的完整内容，否则使用 content
      return match.metadata?.content || match.metadata?.content_preview || "";
    }).filter((c: string) => c.length > 0);

    // 4. 如果没有找到相关上下文，降级到普通对话
    if (contexts.length === 0) {
      console.warn("No relevant context found, falling back to regular chat");
      const { generateTextWithCloudflareAI, getRecommendedModelConfig } = await import("./cloudflare-ai-adapter");
      const config = getRecommendedModelConfig("chat");
      return generateTextWithCloudflareAI(
        ai,
        [
          { role: "system", content: systemPrompt || "You are a helpful assistant." },
          { role: "user", content: query },
        ],
        config
      );
    }

    // 5. 使用 RAG 生成回答
    const ragConfig = getRecommendedModelConfig("rag");
    const answer = await ragQueryWithCloudflareAI(
      ai,
      query,
      contexts,
      systemPrompt,
      ragConfig
    );

    // 6. 可选：保存对话历史到 D1
    if (db) {
      try {
        await db.prepare(
          `INSERT INTO conversations (id, agent_id, user_id, message, response, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          kolHandle,
          "user",
          query,
          answer,
          Date.now()
        ).run();
      } catch (dbError) {
        console.warn("Failed to save conversation to D1:", dbError);
      }
    }

    return answer;
  } catch (error) {
    console.error("RAG query error:", error);
    throw error;
  }
}

/**
 * 从文档中提取并索引知识
 * 
 * @param ai - Cloudflare AI 绑定
 * @param env - Cloudflare 环境
 * @param kolHandle - KOL 标识
 * @param document - 文档内容
 * @param chunkSize - 分块大小（字符数）
 * @param overlap - 分块重叠（字符数）
 * @returns 索引的向量 ID 列表
 */
export async function indexDocument(
  ai: any,
  env: any,
  kolHandle: string,
  document: string,
  chunkSize: number = 500,
  overlap: number = 50
): Promise<string[]> {
  try {
    // 简单的文本分块（可以改进为更智能的分块）
    const chunks: string[] = [];
    let start = 0;

    while (start < document.length) {
      const end = Math.min(start + chunkSize, document.length);
      const chunk = document.substring(start, end);
      chunks.push(chunk);
      start = end - overlap; // 重叠以保持上下文
    }

    // 批量添加到 Vectorize
    const vectorIds = await addBatchKnowledgeToVectorize(
      ai,
      env.VECTORIZE,
      env.DB,
      kolHandle,
      chunks,
      {
        source: "document",
        type: "text",
      }
    );

    return vectorIds;
  } catch (error) {
    console.error("Error indexing document:", error);
    throw error;
  }
}
