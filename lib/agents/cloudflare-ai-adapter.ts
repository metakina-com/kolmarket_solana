/**
 * Cloudflare Workers AI 适配器
 * 用于将 Cloudflare Workers AI 集成到 ElizaOS 或其他 AI 系统中
 */

export interface CloudflareAIConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Cloudflare Workers AI 可用的模型列表
 */
export const CLOUDFLARE_AI_MODELS = {
  // 文本生成模型
  TEXT_GENERATION: {
    "llama-3-8b-instruct": "@cf/meta/llama-3-8b-instruct",
    "llama-3-70b-instruct": "@cf/meta/llama-3-70b-instruct",
    "mistral-7b-instruct": "@cf/mistral/mistral-7b-instruct-v0.2",
    "qwen-2.5-7b-instruct": "@cf/qwen/qwen-2.5-7b-instruct",
    "gemma-7b-it": "@cf/google/gemma-7b-it",
  },
  
  // Embedding 模型（用于 RAG）
  EMBEDDING: {
    "bge-base-en-v1.5": "@cf/baai/bge-base-en-v1.5",
    "bge-large-en-v1.5": "@cf/baai/bge-large-en-v1.5",
    "multilingual-e5-large": "@cf/baai/bge-multilingual-base",
  },
  
  // 图像生成模型
  IMAGE_GENERATION: {
    "stable-diffusion-xl": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  },
  
  // 图像分类模型
  IMAGE_CLASSIFICATION: {
    "resnet-50": "@cf/meta/resnet-50",
  },
} as const;

/**
 * 使用 Cloudflare Workers AI 生成文本
 * 
 * @param ai - Cloudflare AI 绑定（从 env.AI 获取）
 * @param messages - 对话消息列表
 * @param config - 配置选项
 * @returns 生成的文本响应
 */
export async function generateTextWithCloudflareAI(
  ai: any,
  messages: Array<{ role: string; content: string }>,
  config: CloudflareAIConfig = {}
): Promise<string> {
  const model = config.model || CLOUDFLARE_AI_MODELS.TEXT_GENERATION["llama-3-8b-instruct"];
  const maxTokens = config.maxTokens || 250;
  const temperature = config.temperature || 0.7;

  try {
    const response = await ai.run(model, {
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    // 处理不同的响应格式
    if (typeof response === "string") {
      return response;
    }
    
    if (response.response) {
      return response.response;
    }
    
    if (response.text) {
      return response.text;
    }
    
    if (response.description) {
      return response.description;
    }
    
    // 如果响应是数组，尝试提取文本
    if (Array.isArray(response)) {
      return response.map((r: any) => r.text || r.response || r).join("\n");
    }
    
    // 最后尝试 JSON 序列化
    return JSON.stringify(response);
  } catch (error) {
    console.error("Cloudflare AI generation error:", error);
    throw error;
  }
}

/**
 * 使用 Cloudflare Workers AI 生成 Embedding
 * 
 * @param ai - Cloudflare AI 绑定
 * @param text - 要生成 embedding 的文本
 * @param model - Embedding 模型（可选）
 * @returns Embedding 向量
 */
export async function generateEmbeddingWithCloudflareAI(
  ai: any,
  text: string | string[],
  model: string = CLOUDFLARE_AI_MODELS.EMBEDDING["bge-base-en-v1.5"]
): Promise<number[][]> {
  try {
    const texts = Array.isArray(text) ? text : [text];
    
    const response = await ai.run(model, {
      text: texts,
    });

    // 处理响应格式
    if (response.data) {
      return response.data;
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    if (response.embeddings) {
      return response.embeddings;
    }
    
    throw new Error("Unexpected embedding response format");
  } catch (error) {
    console.error("Cloudflare AI embedding error:", error);
    throw error;
  }
}

/**
 * 使用 Cloudflare Workers AI 进行 RAG 查询
 * 
 * @param ai - Cloudflare AI 绑定
 * @param query - 用户查询
 * @param context - 检索到的上下文
 * @param systemPrompt - 系统提示词
 * @param config - 配置选项
 * @returns 生成的回答
 */
export async function ragQueryWithCloudflareAI(
  ai: any,
  query: string,
  context: string[],
  systemPrompt?: string,
  config: CloudflareAIConfig = {}
): Promise<string> {
  const contextText = context
    .map((c, idx) => `[${idx + 1}] ${c}`)
    .join("\n\n");

  const messages: Array<{ role: string; content: string }> = [];
  
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: `${systemPrompt}\n\n使用以下上下文信息回答用户的问题：\n\n${contextText}`,
    });
  } else {
    messages.push({
      role: "system",
      content: `你是一个有用的 AI 助手。使用以下上下文信息回答用户的问题：\n\n${contextText}`,
    });
  }
  
  messages.push({
    role: "user",
    content: query,
  });

  return generateTextWithCloudflareAI(ai, messages, config);
}

/**
 * 获取推荐的模型配置
 */
export function getRecommendedModelConfig(task: "chat" | "rag" | "embedding"): {
  model: string;
  maxTokens?: number;
  temperature?: number;
} {
  switch (task) {
    case "chat":
      return {
        model: CLOUDFLARE_AI_MODELS.TEXT_GENERATION["llama-3-8b-instruct"],
        maxTokens: 250,
        temperature: 0.7,
      };
    
    case "rag":
      return {
        model: CLOUDFLARE_AI_MODELS.TEXT_GENERATION["llama-3-70b-instruct"],
        maxTokens: 500,
        temperature: 0.7,
      };
    
    case "embedding":
      return {
        model: CLOUDFLARE_AI_MODELS.EMBEDDING["bge-base-en-v1.5"],
      };
    
    default:
      return {
        model: CLOUDFLARE_AI_MODELS.TEXT_GENERATION["llama-3-8b-instruct"],
      };
  }
}
