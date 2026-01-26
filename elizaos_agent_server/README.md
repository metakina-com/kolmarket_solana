# ElizaOS Agent Server

ElizaOS 多 Agent 托管 SaaS 平台后端服务。

## 功能特性

- 🚀 单进程多实例架构，资源集约化
- ⚡ 按需唤醒 (On-Demand Hydration)
- 🔄 LRU 资源池管理，自动淘汰闲置 Agent
- 📦 支持 ElizaOS 标准 `character.json` 导入
- 🤖 集成 ElizaOS Core，支持 OpenAI/Anthropic
- 🔒 安全的 Character 验证和清洗
- 📝 RESTful API 接口

## 快速开始

### 环境要求

- Node.js >= 23.0.0
- PostgreSQL >= 14
- OpenAI API Key 或 Anthropic API Key

### 安装

```bash
npm install
```

### 配置

```bash
cp .env.example .env
```

编辑 `.env` 文件配置以下关键项：

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/elizaos_agents

# ElizaOS LLM 配置 (必须配置其中一个)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# 默认模型提供商 (openai 或 anthropic)
DEFAULT_MODEL_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini

# Agent 资源池
MAX_ACTIVE_AGENTS=20
AGENT_IDLE_TIMEOUT_MS=600000
```

### 数据库迁移

```bash
npm run db:migrate
```

### 启动

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API 端点

### Agent 管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/agents` | 创建 Agent (表单) |
| POST | `/api/agents/import` | 导入 character.json |
| GET | `/api/agents` | 列出用户的 Agents |
| GET | `/api/agents/:id` | 获取 Agent 详情 |
| PUT | `/api/agents/:id` | 更新 Agent 配置 |
| DELETE | `/api/agents/:id` | 删除 Agent |

### 对话 API

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/chat/:agentId` | 发送消息 |
| POST | `/api/chat/:agentId/session` | 创建新会话 |
| GET | `/api/chat/:agentId/history/:roomId` | 获取对话历史 |
| DELETE | `/api/chat/:agentId/history/:roomId` | 清除对话历史 |

#### 发送消息示例

```bash
curl -X POST http://localhost:3000/api/chat/{agentId} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "text": "你好，请介绍一下你自己"
  }'
```

响应：

```json
{
  "success": true,
  "data": {
    "messageId": "msg-uuid",
    "agentId": "agent-uuid",
    "roomId": "room-uuid",
    "text": "你好！我是...",
    "timestamp": "2026-01-26T10:00:00.000Z"
  }
}
```

### 管理员 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/admin/stats` | 系统统计 |
| GET | `/api/admin/pool` | 资源池状态 |
| POST | `/api/admin/agents/:id/evict` | 强制卸载 Agent |
| POST | `/api/admin/agents/:id/restart` | 重启错误状态的 Agent |

## 项目结构

```
src/
├── index.ts              # 入口
├── app.ts                # Express 配置
├── config/               # 配置管理
├── core/                 # 核心模块
│   ├── AgentManager.ts   # Agent 生命周期管理
│   ├── RuntimePool.ts    # LRU 资源池
│   └── ElizaRuntimeFactory.ts  # ElizaOS Runtime 工厂
├── services/             # 业务服务
│   ├── ChatService.ts    # 对话处理
│   └── ValidationService.ts  # Character 验证
├── routes/               # API 路由
│   ├── agentRoutes.ts
│   ├── chatRoutes.ts
│   └── adminRoutes.ts
├── middleware/           # 中间件
├── db/                   # 数据库
│   ├── index.ts
│   ├── ElizaDatabaseAdapter.ts  # ElizaOS 内存适配器
│   └── migrations/
└── types/                # 类型定义
    ├── agent.ts
    └── eliza.ts          # ElizaOS 类型扩展
```

## ElizaOS 集成

本服务集成了 ElizaOS Core (`@elizaos/core`)，支持：

- 标准 Character 配置格式
- OpenAI 和 Anthropic 模型
- 对话记忆和上下文管理
- 按需唤醒和自动休眠

### Character 配置示例

```json
{
  "name": "助手小明",
  "bio": "我是一个友好的 AI 助手",
  "lore": ["我喜欢帮助人们解决问题"],
  "style": {
    "all": ["友好", "专业"],
    "chat": ["简洁明了"]
  },
  "topics": ["技术", "生活"],
  "adjectives": ["热情", "耐心"]
}
```

## 开发计划

详见 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
