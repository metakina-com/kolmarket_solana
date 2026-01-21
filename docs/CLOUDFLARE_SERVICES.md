# Cloudflare 服务集成指南

本文档介绍如何在 KOLMarket.ai 项目中使用 Cloudflare 的数据库和 RAG 服务。

## ✅ 可用的 Cloudflare 服务

### 1. Cloudflare D1（数据库）

**用途**: 存储结构化数据
- Agent 状态和配置
- 对话历史
- 用户数据
- 元数据

**特点**:
- 基于 SQLite，支持标准 SQL
- 与 Workers 完美集成
- 全球边缘网络，低延迟
- 免费额度：5GB 存储，1000 万次读取/月

### 2. Cloudflare Vectorize（向量数据库）

**用途**: RAG 知识库
- 存储 KOL 知识库的 embeddings
- 语义搜索和检索
- 支持多种 embedding 模型

**特点**:
- 专为 AI/ML 应用设计
- 与 Workers AI 集成
- 支持近似最近邻搜索（ANN）
- 免费额度：500 万次查询/月

### 3. Cloudflare R2（对象存储）

**用途**: 存储源数据
- 文档文件（PDF、TXT、HTML）
- 图片和媒体文件
- 知识库原始内容

**特点**:
- S3 兼容 API
- 无出口费用
- 免费额度：10GB 存储

### 4. Cloudflare AutoRAG（托管 RAG 服务）

**用途**: 完整的 RAG 管道
- 自动数据摄取
- 自动 chunking 和 embedding
- 自动检索和生成

**特点**:
- 端到端托管服务
- 减少手动配置
- 目前处于 Beta 阶段

## 🔧 配置步骤

### 步骤 1: 配置 wrangler.toml

更新 `wrangler.toml` 文件：

```toml
name = "kolmarket-ai"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

# Workers AI 绑定
[ai]
binding = "AI"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "kolmarket-db"
database_id = "your-database-id"  # 创建数据库后获取

# Vectorize 向量数据库绑定
[[vectorize]]
binding = "VECTORIZE"
index_name = "kol-knowledge-index"
```

### 步骤 2: 创建 D1 数据库

```bash
# 创建数据库
npx wrangler d1 create kolmarket-db

# 初始化数据库 schema
npx wrangler d1 execute kolmarket-db --file=./schema.sql --local

# 在本地开发环境使用
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

### 步骤 3: 创建数据库 Schema

创建 `schema.sql` 文件：

```sql
-- Agents 表
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  kol_handle TEXT NOT NULL,
  kol_name TEXT NOT NULL,
  personality TEXT,
  config TEXT,  -- JSON 配置
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 对话历史表
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 知识库元数据表
CREATE TABLE IF NOT EXISTS knowledge_metadata (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  source TEXT NOT NULL,  -- R2 文件路径或 URL
  chunk_id TEXT NOT NULL,  -- Vectorize 中的向量 ID
  content_preview TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agents_kol_handle ON agents(kol_handle);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_knowledge_agent_id ON knowledge_metadata(agent_id);
```

### 步骤 4: 创建 Vectorize 索引

```bash
# 创建 Vectorize 索引
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine
```

### 步骤 5: 在代码中使用

#### 使用 D1 数据库

```typescript
// app/api/agents/route.ts
export async function POST(req: Request, env: any) {
  const db = env.DB;  // D1 数据库绑定
  
  // 插入 Agent
  await db.prepare(
    "INSERT INTO agents (id, kol_handle, kol_name, personality, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    agentId,
    kolHandle,
    kolName,
    personality,
    JSON.stringify(config),
    Date.now(),
    Date.now()
  ).run();
  
  // 查询 Agent
  const agent = await db.prepare(
    "SELECT * FROM agents WHERE kol_handle = ?"
  ).bind(kolHandle).first();
  
  return Response.json(agent);
}
```

#### 使用 Vectorize 向量数据库

```typescript
// lib/agents/rag-integration.ts
export async function addKnowledgeToVectorize(
  env: any,
  agentId: string,
  content: string,
  metadata: Record<string, any>
) {
  const vectorize = env.VECTORIZE;
  const ai = env.AI;
  
  // 1. 使用 Workers AI 生成 embedding
  const embedding = await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [content],
  });
  
  // 2. 存储到 Vectorize
  const vectorId = `knowledge-${agentId}-${Date.now()}`;
  await vectorize.insert([{
    id: vectorId,
    values: embedding.data[0],
    metadata: {
      agentId,
      ...metadata,
    },
  }]);
  
  return vectorId;
}

export async function searchKnowledge(
  env: any,
  query: string,
  agentId: string,
  topK: number = 5
) {
  const vectorize = env.VECTORIZE;
  const ai = env.AI;
  
  // 1. 将查询转换为向量
  const queryEmbedding = await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [query],
  });
  
  // 2. 在 Vectorize 中搜索
  const results = await vectorize.query(queryEmbedding.data[0], {
    topK,
    filter: { agentId },
  });
  
  return results;
}
```

#### 使用 R2 存储

```typescript
// lib/storage/r2-integration.ts
export async function uploadDocumentToR2(
  env: any,
  fileName: string,
  content: string | ArrayBuffer
) {
  const r2 = env.R2_BUCKET;  // 需要在 wrangler.toml 中配置
  
  await r2.put(fileName, content, {
    httpMetadata: {
      contentType: "text/plain",
    },
  });
  
  return fileName;
}

export async function getDocumentFromR2(
  env: any,
  fileName: string
) {
  const r2 = env.R2_BUCKET;
  
  const object = await r2.get(fileName);
  if (!object) {
    return null;
  }
  
  return await object.text();
}
```

## 📝 完整 RAG 流程示例

```typescript
// lib/agents/cloudflare-rag.ts
export async function processRAGQuery(
  env: any,
  agentId: string,
  userQuery: string
) {
  const db = env.DB;
  const vectorize = env.VECTORIZE;
  const ai = env.AI;
  
  // 1. 在 Vectorize 中搜索相关知识
  const knowledgeResults = await searchKnowledge(env, userQuery, agentId);
  
  // 2. 从 D1 获取相关元数据
  const chunkIds = knowledgeResults.matches.map(m => m.id);
  const metadata = await db.prepare(
    `SELECT * FROM knowledge_metadata WHERE chunk_id IN (${chunkIds.map(() => '?').join(',')})`
  ).bind(...chunkIds).all();
  
  // 3. 构建上下文
  const context = knowledgeResults.matches
    .map((match, idx) => {
      const meta = metadata.results.find(m => m.chunk_id === match.id);
      return `[${idx + 1}] ${meta?.content_preview || match.metadata?.content || ''}`;
    })
    .join('\n\n');
  
  // 4. 使用 Workers AI 生成回答
  const response = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content: `You are a digital clone of a KOL. Use the following knowledge to answer the user's question:\n\n${context}`,
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
  });
  
  // 5. 保存对话历史到 D1
  await db.prepare(
    "INSERT INTO conversations (id, agent_id, user_id, message, response, timestamp) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    `conv-${Date.now()}`,
    agentId,
    "user",
    userQuery,
    response.response,
    Date.now()
  ).run();
  
  return response.response;
}
```

## 🚀 部署步骤

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create kolmarket-db
```

复制返回的 `database_id` 到 `wrangler.toml`。

### 2. 运行数据库迁移

```bash
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

### 3. 创建 Vectorize 索引

```bash
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine
```

### 4. 创建 R2 存储桶（可选）

```bash
npx wrangler r2 bucket create kolmarket-documents
```

然后在 `wrangler.toml` 中添加：

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "kolmarket-documents"
```

### 5. 部署到 Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy .next
```

## ⚠️ 注意事项

1. **D1 限制**
   - 单次查询最多 100MB 结果
   - 写入操作有延迟（最终一致性）
   - 不支持事务（但支持批量操作）

2. **Vectorize 限制**
   - 每个索引最多 1000 万向量
   - 向量维度限制（取决于模型）
   - 查询延迟可能较高（需要优化）

3. **成本考虑**
   - D1: 免费额度充足，超出后按使用量计费
   - Vectorize: 免费额度 500 万次查询/月
   - R2: 免费额度 10GB 存储
   - Workers AI: 按请求计费

4. **Beta 功能**
   - AutoRAG 仍在 Beta 阶段
   - 某些功能可能不稳定

## 📚 相关资源

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Vectorize 文档](https://developers.cloudflare.com/vectorize/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Cloudflare AutoRAG 博客](https://blog.cloudflare.com/introducing-autorag-on-cloudflare/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 配置指南已创建，等待实施
