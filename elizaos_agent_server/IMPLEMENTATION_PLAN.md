# ElizaOS Agent Server 实现计划

> 基于 PRD v1.0 (MVP) 的需求细化与开发计划

## 1. 项目结构设计

```
elizaos_agent_server/
├── src/
│   ├── index.ts                 # 应用入口
│   ├── app.ts                   # Express 应用配置
│   ├── config/
│   │   └── index.ts             # 环境变量与配置管理
│   ├── core/
│   │   ├── AgentManager.ts      # Agent 生命周期管理器
│   │   ├── RuntimePool.ts       # 活跃 Runtime 资源池 (LRU)
│   │   └── DirectClientBridge.ts # ElizaOS DirectClient 桥接
│   ├── services/
│   │   ├── AgentService.ts      # Agent CRUD 业务逻辑
│   │   ├── ChatService.ts       # 对话处理服务
│   │   └── ValidationService.ts # JSON 校验与安全清洗
│   ├── routes/
│   │   ├── index.ts             # 路由聚合
│   │   ├── agentRoutes.ts       # Agent 管理 API
│   │   ├── chatRoutes.ts        # 对话 API
│   │   └── adminRoutes.ts       # 管理员 API
│   ├── models/
│   │   └── Agent.ts             # Agent 数据模型
│   ├── middleware/
│   │   ├── auth.ts              # 认证中间件
│   │   ├── errorHandler.ts      # 全局错误处理
│   │   └── rateLimiter.ts       # 请求限流
│   ├── db/
│   │   ├── index.ts             # 数据库连接池
│   │   └── migrations/          # 数据库迁移脚本
│   ├── utils/
│   │   ├── logger.ts            # 日志工具
│   │   └── uuid.ts              # UUID 生成
│   └── types/
│       ├── agent.ts             # Agent 类型定义
│       └── eliza.ts             # ElizaOS 类型扩展
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 2. 需求细化与任务分解

### Phase 1: 基础架构搭建 (预计 2-3 天)

#### Task 1.1: 项目初始化
- [ ] 初始化 Node.js 项目 (Node v23+)
- [ ] 配置 TypeScript
- [ ] 安装核心依赖：
  - `express` - Web 框架
  - `pg` / `postgres` - PostgreSQL 客户端
  - `@elizaos/core` - ElizaOS 核心
  - `@elizaos/client-direct` - DirectClient
  - `uuid` - UUID 生成
  - `zod` - 运行时类型校验
  - `winston` - 日志
  - `dotenv` - 环境变量

#### Task 1.2: 数据库设计
```sql
-- agents 表：存储 Agent 配置
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,           -- 创作者 ID
    name VARCHAR(100) NOT NULL,
    character_json JSONB NOT NULL,      -- 完整 character 配置
    status VARCHAR(20) DEFAULT 'inactive', -- inactive/active/error
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,           -- 最后活跃时间
    UNIQUE(creator_id, name)
);

-- agent_memories 表：Agent 记忆存储 (可选，ElizaOS 可能自带)
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    room_id UUID,
    user_id UUID,
    content JSONB NOT NULL,
    embedding VECTOR(1536),             -- 向量存储 (需 pgvector)
    created_at TIMESTAMP DEFAULT NOW()
);

-- api_keys 表：API 密钥管理
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    key_hash VARCHAR(64) NOT NULL,      -- SHA256 哈希
    name VARCHAR(100),
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_agents_creator ON agents(creator_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_memories_agent ON agent_memories(agent_id);
```

#### Task 1.3: 配置管理
```typescript
// src/config/index.ts 核心配置项
interface Config {
  // 服务器
  PORT: number;                    // 默认 3000
  NODE_ENV: 'development' | 'production';
  
  // 数据库
  DATABASE_URL: string;
  
  // Agent 资源池
  MAX_ACTIVE_AGENTS: number;       // 默认 20
  AGENT_IDLE_TIMEOUT_MS: number;   // 默认 10 分钟
  
  // ElizaOS
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  
  // 安全
  JWT_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}
```

---

### Phase 2: 核心模块开发 (预计 4-5 天)

#### Task 2.1: RuntimePool 实现 (FR-05)
```typescript
// src/core/RuntimePool.ts 核心逻辑
class RuntimePool {
  private pool: Map<string, PoolEntry>;  // agentId -> { runtime, lastAccess }
  private maxSize: number;
  
  // 核心方法
  async get(agentId: string): Promise<AgentRuntime | null>;
  async set(agentId: string, runtime: AgentRuntime): Promise<void>;
  async evict(agentId: string): Promise<void>;
  
  // LRU 淘汰
  private evictLRU(): void;
  
  // 定时清理
  startIdleCleanup(intervalMs: number): void;
}
```

关键实现点：
- 使用 `Map` 保持插入顺序实现 LRU
- 定时器扫描清理超时实例
- 销毁时正确释放 ElizaOS Runtime 资源

#### Task 2.2: AgentManager 实现 (FR-04)
```typescript
// src/core/AgentManager.ts 核心逻辑
class AgentManager {
  constructor(
    private pool: RuntimePool,
    private db: Database,
    private directClient: DirectClient
  ) {}
  
  // 按需唤醒核心流程
  async getOrHydrate(agentId: string): Promise<AgentRuntime> {
    // 1. 检查内存池
    let runtime = await this.pool.get(agentId);
    if (runtime) return runtime;
    
    // 2. 从 DB 加载配置
    const config = await this.db.getAgentConfig(agentId);
    if (!config) throw new NotFoundError();
    
    // 3. 初始化 Runtime
    runtime = await this.createRuntime(config);
    
    // 4. 注册到 DirectClient
    this.directClient.registerAgent(runtime);
    
    // 5. 存入池
    await this.pool.set(agentId, runtime);
    
    return runtime;
  }
  
  // 热更新
  async reload(agentId: string): Promise<void>;
}
```

#### Task 2.3: DirectClient 桥接 (FR-06)
```typescript
// src/core/DirectClientBridge.ts
class DirectClientBridge {
  private client: DirectClient;
  
  // 动态注册/注销 Agent
  registerAgent(runtime: AgentRuntime): void;
  unregisterAgent(agentId: string): void;
  
  // 消息路由
  async handleMessage(agentId: string, message: Message): Promise<Response>;
}
```

---

### Phase 3: API 层开发 (预计 2-3 天)

#### Task 3.1: Agent 管理 API

| 端点 | 方法 | 描述 | 对应需求 |
|------|------|------|----------|
| `/api/agents` | POST | 创建 Agent (表单) | FR-01 |
| `/api/agents/import` | POST | 导入 character.json | FR-02 |
| `/api/agents/:id` | GET | 获取 Agent 详情 | - |
| `/api/agents/:id` | PUT | 更新 Agent 配置 | FR-03 |
| `/api/agents/:id` | DELETE | 删除 Agent | - |
| `/api/agents` | GET | 列出用户的 Agents | - |

#### Task 3.2: 对话 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat/:agentId` | POST | 发送消息 |
| `/api/chat/:agentId/history` | GET | 获取对话历史 |

请求体示例：
```json
{
  "userId": "user-uuid",
  "roomId": "room-uuid",
  "text": "你好，请介绍一下你自己"
}
```

#### Task 3.3: 管理员 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/stats` | GET | 系统统计 (活跃数、内存等) |
| `/api/admin/agents/:id/evict` | POST | 强制卸载 Agent |
| `/api/admin/pool` | GET | 查看资源池状态 |

---

### Phase 4: 安全与校验 (预计 1-2 天)

#### Task 4.1: character.json 校验 (FR-02)
```typescript
// src/services/ValidationService.ts
import { z } from 'zod';

const CharacterSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.union([z.string(), z.array(z.string())]),
  lore: z.array(z.string()).optional(),
  style: z.object({
    all: z.array(z.string()).optional(),
    chat: z.array(z.string()).optional(),
    post: z.array(z.string()).optional(),
  }).optional(),
  // ... 其他字段
});

// 安全清洗
function sanitizeCharacter(input: unknown): Character {
  // 1. Schema 校验
  const parsed = CharacterSchema.parse(input);
  
  // 2. 移除危险字段
  delete parsed.id;           // 强制由平台生成
  delete parsed.secrets;      // 不允许导入密钥
  delete parsed.plugins;      // 插件需单独审核
  
  // 3. 内容过滤 (可选)
  // - XSS 清洗
  // - 敏感词过滤
  
  return parsed;
}
```

#### Task 4.2: 认证与授权
- JWT Token 认证
- 基于角色的权限控制 (Admin/Creator/User)
- API Key 支持 (用于程序化访问)

---

## 3. 开发里程碑

| 里程碑 | 目标 | 预计完成 |
|--------|------|----------|
| M1 | 项目骨架 + DB 迁移 | Day 2 |
| M2 | RuntimePool + AgentManager | Day 5 |
| M3 | Agent CRUD API | Day 7 |
| M4 | 对话 API + DirectClient 集成 | Day 9 |
| M5 | 安全校验 + 测试 | Day 11 |
| M6 | 文档 + 部署配置 | Day 12 |

---

## 4. 技术风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| ElizaOS Runtime 内存泄漏 | 服务不稳定 | 定期重启 + 内存监控告警 |
| DirectClient 不支持动态注册 | 架构需调整 | 预研 ElizaOS 源码，必要时 fork 修改 |
| 高并发下 LRU 竞争 | 性能下降 | 使用读写锁或无锁数据结构 |
| character.json 格式变更 | 导入失败 | 版本化 Schema，向后兼容 |

---

## 5. 待确认事项

1. **ElizaOS 版本**：确认使用的 ElizaOS 版本及 API 兼容性
2. **用户系统**：是否复用现有用户系统，还是独立实现？
3. **部署环境**：Docker / Kubernetes / 裸机？
4. **监控需求**：是否需要集成 Prometheus/Grafana？
5. **多语言模型**：除 OpenAI 外，是否需要支持其他 LLM？

---

## 6. 下一步行动

1. 确认待确认事项
2. 搭建项目骨架
3. 预研 ElizaOS DirectClient 动态注册能力
4. 开始 Phase 1 开发
