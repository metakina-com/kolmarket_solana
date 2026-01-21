# Cloudflare Workers AI 模型指南

本文档介绍如何在 KOLMarket.ai 项目中使用 Cloudflare Workers AI 作为模型提供者。

## ✅ 为什么使用 Cloudflare Workers AI

### 优势

1. **无需 API Key**
   - 通过 `wrangler.toml` 配置即可使用
   - 无需管理 API 密钥

2. **免费额度充足**
   - 适合 MVP 和早期开发
   - 按使用量计费，透明定价

3. **边缘计算**
   - 全球 GPU 网络
   - 低延迟响应

4. **多种模型支持**
   - 文本生成（Llama, Mistral, Qwen 等）
   - Embedding 模型（用于 RAG）
   - 图像生成和分类

5. **与 Cloudflare 生态集成**
   - 与 D1、Vectorize、R2 完美配合
   - 统一的部署和管理

## 📋 可用的模型列表

### 文本生成模型

| 模型 | 标识符 | 特点 | 推荐场景 |
|------|--------|------|----------|
| **Llama 3 8B Instruct** | `@cf/meta/llama-3-8b-instruct` | 快速、高效 | ✅ 日常对话、KOL 聊天 |
| **Llama 3 70B Instruct** | `@cf/meta/llama-3-70b-instruct` | 更强大、更准确 | RAG、复杂推理 |
| **Mistral 7B Instruct** | `@cf/mistral/mistral-7b-instruct-v0.2` | 多语言支持好 | 国际化场景 |
| **Qwen 2.5 7B Instruct** | `@cf/qwen/qwen-2.5-7b-instruct` | 中文优化 | 中文对话 |
| **Gemma 7B IT** | `@cf/google/gemma-7b-it` | Google 模型 | 通用任务 |

### Embedding 模型（用于 RAG）

| 模型 | 标识符 | 维度 | 特点 |
|------|--------|------|------|
| **BGE Base EN v1.5** | `@cf/baai/bge-base-en-v1.5` | 768 | ✅ 推荐，平衡性能和速度 |
| **BGE Large EN v1.5** | `@cf/baai/bge-large-en-v1.5` | 1024 | 更高精度 |
| **Multilingual E5 Large** | `@cf/baai/bge-multilingual-base` | 768 | 多语言支持 |

### 图像模型

| 模型 | 标识符 | 用途 |
|------|--------|------|
| **Stable Diffusion XL** | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | 图像生成 |
| **ResNet-50** | `@cf/meta/resnet-50` | 图像分类 |

## 🔧 使用方法

### 1. 基础配置

在 `wrangler.toml` 中已配置：

```toml
[ai]
binding = "AI"
```

### 2. 在 API 路由中使用

```typescript
// app/api/chat/route.ts
export async function POST(req: NextRequest) {
  const ai = (globalThis as any).AI || (req as any).env?.AI;
  
  const response = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello!" },
    ],
    max_tokens: 250,
  });
  
  return NextResponse.json({ response: response.response });
}
```

### 3. 使用适配器（推荐）

```typescript
import { generateTextWithCloudflareAI } from "@/lib/agents/cloudflare-ai-adapter";

const response = await generateTextWithCloudflareAI(ai, [
  { role: "system", content: systemPrompt },
  { role: "user", content: userMessage },
], {
  model: "@cf/meta/llama-3-8b-instruct",
  maxTokens: 250,
  temperature: 0.7,
});
```

### 4. 生成 Embedding（用于 RAG）

```typescript
import { generateEmbeddingWithCloudflareAI } from "@/lib/agents/cloudflare-ai-adapter";

const embeddings = await generateEmbeddingWithCloudflareAI(
  ai,
  "Your text here",
  "@cf/baai/bge-base-en-v1.5"
);
```

### 5. RAG 查询

```typescript
import { ragQueryWithCloudflareAI } from "@/lib/agents/cloudflare-ai-adapter";

const answer = await ragQueryWithCloudflareAI(
  ai,
  "用户的问题",
  ["上下文1", "上下文2", "上下文3"],
  "你是一个 KOL 数字生命",
  {
    model: "@cf/meta/llama-3-70b-instruct",
    maxTokens: 500,
  }
);
```

## 📝 完整示例

### 示例 1: KOL 对话

```typescript
// lib/agents/kol-chat.ts
import { generateTextWithCloudflareAI, getRecommendedModelConfig } from "./cloudflare-ai-adapter";
import { getKOLPersona } from "./kol-personas";

export async function chatWithKOL(
  ai: any,
  kolHandle: string,
  userMessage: string
): Promise<string> {
  const persona = getKOLPersona(kolHandle);
  const config = getRecommendedModelConfig("chat");
  
  return generateTextWithCloudflareAI(ai, [
    {
      role: "system",
      content: persona?.systemPrompt || "You are a crypto KOL.",
    },
    {
      role: "user",
      content: userMessage,
    },
  ], config);
}
```

### 示例 2: RAG 增强对话

```typescript
// lib/agents/rag-chat.ts
import { ragQueryWithCloudflareAI, generateEmbeddingWithCloudflareAI } from "./cloudflare-ai-adapter";
import { searchKnowledge } from "./cloudflare-rag"; // 从 Vectorize 搜索

export async function ragChatWithKOL(
  ai: any,
  env: any,
  kolHandle: string,
  userMessage: string
): Promise<string> {
  // 1. 生成查询的 embedding
  const queryEmbedding = await generateEmbeddingWithCloudflareAI(ai, userMessage);
  
  // 2. 在 Vectorize 中搜索相关知识
  const knowledgeResults = await searchKnowledge(env, queryEmbedding[0], kolHandle);
  
  // 3. 提取上下文
  const contexts = knowledgeResults.matches.map(m => m.metadata?.content || "");
  
  // 4. 使用 RAG 生成回答
  return ragQueryWithCloudflareAI(
    ai,
    userMessage,
    contexts,
    `You are ${kolHandle}, a crypto KOL.`,
    {
      model: "@cf/meta/llama-3-70b-instruct",
      maxTokens: 500,
    }
  );
}
```

## 🎯 模型选择建议

### 日常对话
- **推荐**: `@cf/meta/llama-3-8b-instruct`
- **原因**: 快速、成本低、质量好

### RAG 查询
- **推荐**: `@cf/meta/llama-3-70b-instruct`
- **原因**: 更强的推理能力，能更好利用上下文

### 中文对话
- **推荐**: `@cf/qwen/qwen-2.5-7b-instruct`
- **原因**: 针对中文优化

### Embedding
- **推荐**: `@cf/baai/bge-base-en-v1.5`
- **原因**: 平衡性能和速度

## ⚙️ 配置参数

### 文本生成参数

```typescript
{
  max_tokens: 250,      // 最大生成 token 数
  temperature: 0.7,    // 创造性（0-1，越高越随机）
  top_p: 0.9,          // 核采样（可选）
  top_k: 50,           // Top-K 采样（可选）
}
```

### Embedding 参数

```typescript
{
  text: string | string[],  // 单个文本或文本数组
}
```

## 💰 成本考虑

### 免费额度
- Workers AI 有免费额度
- 适合 MVP 和早期开发

### 计费方式
- 按请求计费
- 不同模型价格不同
- 查看 [Cloudflare 定价页面](https://developers.cloudflare.com/workers-ai/platform/pricing/)

### 优化建议
1. 使用较小的模型（如 8B）进行日常对话
2. 仅在需要时使用大模型（如 70B）
3. 缓存常见查询结果
4. 使用 KV 缓存 Embedding

## ⚠️ 注意事项

1. **模型限制**
   - 某些模型可能有上下文长度限制
   - 检查模型文档了解具体限制

2. **响应格式**
   - 不同模型可能返回不同格式
   - 使用适配器统一处理

3. **错误处理**
   - 实现重试机制
   - 提供降级方案

4. **延迟**
   - 大模型（70B）响应时间较长
   - 考虑使用流式响应

## 📚 相关资源

- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [模型目录](https://developers.cloudflare.com/workers-ai/models/)
- [API 参考](https://developers.cloudflare.com/workers-ai/api-reference/)
- [定价信息](https://developers.cloudflare.com/workers-ai/platform/pricing/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 适配器已创建，可在项目中使用
