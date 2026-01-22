# 📊 KOLMarket.ai 数据接口文档

## 概述

本文档详细说明 KOLMarket.ai 平台的数据结构、接口格式和数据流。

---

## 🗄️ 数据库结构

### D1 数据库 Schema

#### agents 表

存储 KOL 数字生命 Agent 配置。

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  kol_handle TEXT NOT NULL UNIQUE,
  kol_name TEXT NOT NULL,
  personality TEXT,
  config TEXT,  -- JSON 格式
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**字段说明**:
- `id`: Agent 唯一标识
- `kol_handle`: KOL Twitter 用户名
- `kol_name`: KOL 显示名称
- `personality`: 个性描述（JSON）
- `config`: 完整配置（JSON）
- `created_at`: 创建时间戳
- `updated_at`: 更新时间戳

#### conversations 表

存储用户与 Agent 的对话记录。

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

#### knowledge_metadata 表

存储 RAG 知识库的元数据。

```sql
CREATE TABLE knowledge_metadata (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  source TEXT NOT NULL,
  chunk_id TEXT NOT NULL UNIQUE,
  content_preview TEXT,
  chunk_index INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

#### trading_strategies 表

存储自动交易策略。

```sql
CREATE TABLE trading_strategies (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,  -- JSON 格式
  enabled INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

#### agent_suites 表

存储 Agent Suite 信息。

```sql
CREATE TABLE agent_suites (
  suite_id TEXT PRIMARY KEY,
  kol_handle TEXT NOT NULL,
  status TEXT NOT NULL,
  modules TEXT NOT NULL,  -- JSON 格式
  stats TEXT,  -- JSON 格式
  config TEXT,  -- JSON 格式
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 🔄 数据接口格式

### Agent Suite 数据格式

```typescript
interface AgentSuite {
  suiteId: string;
  kolHandle: string;
  status: "active" | "stopped" | "paused";
  modules: {
    avatar: {
      enabled: boolean;
      status: "running" | "stopped" | "error";
      stats?: AvatarStats;
    };
    mod: {
      enabled: boolean;
      status: "running" | "stopped" | "error";
      stats?: ModStats;
    };
    trader: {
      enabled: boolean;
      status: "running" | "stopped" | "error";
      stats?: TraderStats;
    };
  };
  stats: {
    avatar?: AvatarStats;
    mod?: ModStats;
    trader?: TraderStats;
  };
  config?: {
    name?: string;
    personality?: string;
    tradingStyle?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Avatar Stats 格式

```typescript
interface AvatarStats {
  totalTweets: number;
  totalInteractions: number;
  followers: number;
  engagementRate: number;
  lastTweetTime?: string;
  // 扩展字段
  aggression?: number;  // 0-100
  humor?: number;       // 0-100
}
```

### Mod Stats 格式

```typescript
interface ModStats {
  totalMessages: number;
  totalUsers: number;
  responseRate: number;
  averageResponseTime: number;  // 秒
  lastActivity?: string;
}
```

### Trader Stats 格式

```typescript
interface TraderStats {
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  winRate: number;
  followers: number;
  lastTradeTime?: string;
}
```

### Mindshare 数据格式

```typescript
interface MindshareData {
  handle: string;
  mindshareScore: number;  // 0-100
  volume: string;          // "$2.4M"
  followers: string;       // "450K"
  stats: {
    volume: number;        // 0-100
    loyalty: number;       // 0-100
    alpha: number;         // 0-100
    growth: number;       // 0-100
    engage: number;       // 0-100
  };
  timestamp: string;
}
```

---

## 🔌 外部 API 接口

### Cookie.fun API

**Base URL**: `https://api.cookie.fun`

#### GET `/api/mindshare/{handle}`

获取 KOL Mindshare 数据。

**请求头**:
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**响应**:
```json
{
  "handle": "blknoiz06",
  "mindshare_score": 92,
  "volume_24h": 2400000,
  "followers": 450000,
  "metrics": {
    "volume": 95,
    "loyalty": 88,
    "alpha": 92,
    "growth": 85,
    "engage": 90
  }
}
```

### Cloudflare Workers AI

**绑定**: `env.AI`

#### 文本生成

```typescript
const response = await env.AI.run(
  '@cf/meta/llama-3-8b-instruct',
  {
    messages: [
      { role: 'system', content: 'You are a crypto trader...' },
      { role: 'user', content: 'What is your favorite coin?' }
    ]
  }
);
```

#### Embeddings 生成

```typescript
const embeddings = await env.AI.run(
  '@cf/meta/all-minilm-l6-v2',
  {
    text: ['Your text here']
  }
);
```

### Cloudflare Vectorize

**绑定**: `env.VECTORIZE`

#### 插入向量

```typescript
await env.VECTORIZE.insert([
  {
    id: 'chunk-123',
    values: [0.1, 0.2, ...],  // 768 维向量
    metadata: {
      kolHandle: 'blknoiz06',
      content: '...',
      source: 'twitter'
    }
  }
]);
```

#### 查询向量

```typescript
const results = await env.VECTORIZE.query(
  [0.1, 0.2, ...],  // 查询向量
  {
    topK: 5,
    filter: {
      kolHandle: { $eq: 'blknoiz06' }
    }
  }
);
```

---

## 📡 WebSocket 接口（未来）

### 实时数据推送

```typescript
// 连接 WebSocket
const ws = new WebSocket('wss://kolmarket.ai/ws');

// 订阅 Agent Suite 更新
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'agent-suite',
  suiteId: 'suite-123'
}));

// 接收更新
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 处理实时更新
};
```

---

## 🔐 数据安全

### 加密

- 敏感数据使用 AES-256 加密
- API 密钥存储在 Cloudflare Secrets
- 钱包私钥使用硬件钱包或加密存储

### 访问控制

- 基于角色的访问控制 (RBAC)
- API Key 认证
- Solana 钱包签名验证

### 数据隐私

- 用户数据所有权
- GDPR 合规
- 数据导出功能
- 数据删除功能

---

## 📊 数据流图

```
用户请求
  ↓
API Gateway (Cloudflare Pages)
  ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   D1 Database   │   Vectorize     │   Workers AI    │
│   (结构化数据)   │   (向量数据)     │   (AI 处理)      │
└─────────────────┴─────────────────┴─────────────────┘
  ↓
业务逻辑处理
  ↓
外部 API (Cookie.fun, Twitter, etc.)
  ↓
响应返回
```

---

## 🔗 相关文档

- [API 文档](./API_DOCUMENTATION.md)
- [架构文档](./ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

---

**最后更新**: 2024-01-22
