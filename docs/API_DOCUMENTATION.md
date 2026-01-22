# 📡 KOLMarket.ai API 文档

## 概述

KOLMarket.ai 提供完整的 RESTful API，支持 KOL 数字生命管理、AI 聊天、知识库管理、交易执行等功能。

**Base URL**: `https://kolmarket.ai/api` (生产环境)  
**Base URL**: `http://localhost:3000/api` (开发环境)

---

## 🔐 认证

目前 API 使用基于 Cloudflare Pages 的环境变量认证。未来将支持：
- API Key 认证
- JWT Token 认证
- Solana 钱包签名认证

---

## 📚 API 端点

### 1. 聊天 API

#### POST `/api/chat`

与 KOL 数字生命进行对话，支持 RAG 知识库增强。

**请求体**:
```json
{
  "prompt": "What is your favorite meme coin?",
  "kolHandle": "blknoiz06",  // 可选，指定 KOL
  "useRAG": true,             // 可选，是否使用知识库
  "conversationId": "conv-123" // 可选，对话 ID
}
```

**响应**:
```json
{
  "response": "I'm really bullish on $BONK...",
  "kolHandle": "blknoiz06",
  "timestamp": "2024-01-22T10:00:00Z",
  "ragUsed": true,
  "sources": ["knowledge-chunk-1", "knowledge-chunk-2"]
}
```

**状态码**:
- `200`: 成功
- `400`: 请求参数错误
- `500`: 服务器错误

---

### 2. Agent Suite API

#### POST `/api/agent-suite`

创建新的 Agent Suite（KOL 数字生命套件）。

**请求体**:
```json
{
  "kolHandle": "blknoiz06",
  "modules": {
    "avatar": { "enabled": true },
    "mod": { "enabled": true },
    "trader": { "enabled": false }
  },
  "config": {
    "name": "Ansem Digital Twin",
    "personality": "aggressive",
    "tradingStyle": "momentum"
  }
}
```

**响应**:
```json
{
  "suiteId": "suite-blknoiz06-1234567890",
  "status": "active",
  "kolHandle": "blknoiz06",
  "modules": {
    "avatar": { "enabled": true, "status": "running" },
    "mod": { "enabled": true, "status": "running" },
    "trader": { "enabled": false, "status": "stopped" }
  },
  "createdAt": "2024-01-22T10:00:00Z"
}
```

#### GET `/api/agent-suite?kolHandle=blknoiz06`

获取指定 KOL 的 Agent Suite 信息。

#### PUT `/api/agent-suite/{suiteId}`

更新 Agent Suite 配置。

#### DELETE `/api/agent-suite/{suiteId}`

删除 Agent Suite。

---

### 3. Avatar 模块 API

#### POST `/api/agent-suite/avatar`

Avatar 模块操作（发推、互动等）。

**请求体**:
```json
{
  "suiteId": "suite-blknoiz06-1234567890",
  "action": "post",
  "content": "Just discovered an amazing alpha...",
  "config": {
    "autoPost": true,
    "autoInteract": false
  }
}
```

**响应**:
```json
{
  "success": true,
  "tweetId": "tweet-123456",
  "timestamp": "2024-01-22T10:00:00Z"
}
```

---

### 4. Trader 模块 API

#### POST `/api/agent-suite/trader`

执行交易操作。

**请求体**:
```json
{
  "suiteId": "suite-blknoiz06-1234567890",
  "action": "buy",
  "token": "SOL",
  "amount": 1.5,
  "strategy": "momentum"
}
```

**响应**:
```json
{
  "success": true,
  "txSignature": "5j7s8K9...",
  "amount": 1.5,
  "token": "SOL",
  "timestamp": "2024-01-22T10:00:00Z"
}
```

---

### 5. 知识库 API

#### POST `/api/knowledge`

添加知识到向量数据库。

**请求体**:
```json
{
  "kolHandle": "blknoiz06",
  "content": "Ansem is a well-known crypto trader...",
  "metadata": {
    "source": "twitter",
    "type": "bio",
    "url": "https://twitter.com/blknoiz06"
  }
}
```

**响应**:
```json
{
  "success": true,
  "chunkId": "chunk-123",
  "kolHandle": "blknoiz06",
  "timestamp": "2024-01-22T10:00:00Z"
}
```

#### GET `/api/knowledge?kolHandle=blknoiz06`

获取知识库统计信息。

**响应**:
```json
{
  "kolHandle": "blknoiz06",
  "totalChunks": 150,
  "totalSize": "2.5MB",
  "lastUpdated": "2024-01-22T10:00:00Z"
}
```

---

### 6. Mindshare API

#### GET `/api/mindshare/{handle}`

获取 KOL 的 Mindshare 数据（影响力指标）。

**响应**:
```json
{
  "handle": "blknoiz06",
  "mindshareScore": 92,
  "volume": "$2.4M",
  "followers": "450K",
  "stats": {
    "volume": 95,
    "loyalty": 88,
    "alpha": 92,
    "growth": 85,
    "engage": 90
  },
  "timestamp": "2024-01-22T10:00:00Z"
}
```

---

### 7. 交易执行 API

#### POST `/api/execution/strategy`

创建或更新交易策略。

**请求体**:
```json
{
  "suiteId": "suite-blknoiz06-1234567890",
  "strategy": {
    "name": "Momentum Trading",
    "rules": {
      "entry": "price_change_24h > 10%",
      "exit": "profit_target > 20% OR stop_loss < -10%"
    },
    "enabled": true
  }
}
```

#### POST `/api/execution/distribute`

执行分红分配。

**请求体**:
```json
{
  "suiteId": "suite-blknoiz06-1234567890",
  "recipients": [
    { "address": "wallet1...", "percentage": 50 },
    { "address": "wallet2...", "percentage": 30 }
  ],
  "token": "SOL",
  "amount": 100
}
```

---

### 8. Cortex API

#### POST `/api/cortex/upload`

上传训练数据集到 Cortex。

**请求体**:
```json
{
  "projectId": "project-123",
  "data": "训练数据内容...",
  "format": "json"
}
```

---

### 9. Creator API

#### GET `/api/creator/settings?kolHandle=blknoiz06`

获取创作者设置。

**响应**:
```json
{
  "kolHandle": "blknoiz06",
  "status": "active",
  "aggression": 85,
  "humor": 42,
  "revenue": 42902.50,
  "followers": 12500
}
```

---

## 🔄 数据流

### 典型请求流程

```
用户请求
  ↓
API 路由 (Edge Runtime)
  ↓
数据验证
  ↓
业务逻辑处理
  ↓
数据存储 (D1 / Vectorize)
  ↓
AI 处理 (Workers AI)
  ↓
返回响应
```

---

## ⚠️ 错误处理

### 错误响应格式

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional info"
  },
  "timestamp": "2024-01-22T10:00:00Z"
}
```

### 常见错误码

- `INVALID_REQUEST`: 请求参数无效
- `NOT_FOUND`: 资源不存在
- `UNAUTHORIZED`: 未授权
- `RATE_LIMIT`: 请求频率超限
- `SERVICE_UNAVAILABLE`: 服务不可用
- `INTERNAL_ERROR`: 服务器内部错误

---

## 📊 Rate Limits

当前版本无严格限制，但建议：
- 单个 IP: 100 请求/分钟
- 单个用户: 1000 请求/小时

未来将实施更严格的限制。

---

## 🔗 相关文档

- [架构文档](./ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [测试指南](./TESTING_GUIDE.md)

---

**最后更新**: 2024-01-22
