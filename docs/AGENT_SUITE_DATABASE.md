# Agent Suite 数据库持久化指南

## 📊 数据库结构

Agent Suite 使用 Cloudflare D1 数据库进行数据持久化，包含以下表：

### 1. `agent_suites` 表

存储 Agent Suite 的主配置和状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT | Suite ID (主键) |
| `kol_handle` | TEXT | KOL Handle (唯一) |
| `kol_name` | TEXT | KOL 名称 |
| `status` | TEXT | 状态: 'active', 'inactive', 'error' |
| `avatar_config` | TEXT | Avatar 配置 (JSON) |
| `mod_config` | TEXT | Mod 配置 (JSON) |
| `trader_config` | TEXT | Trader 配置 (JSON) |
| `avatar_stats` | TEXT | Avatar 统计数据 (JSON) |
| `mod_stats` | TEXT | Mod 统计数据 (JSON) |
| `trader_stats` | TEXT | Trader 统计数据 (JSON) |
| `created_at` | INTEGER | 创建时间戳 |
| `updated_at` | INTEGER | 更新时间戳 |

### 2. `agent_suite_modules` 表

存储各模块的详细状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| `suite_id` | TEXT | Suite ID (外键) |
| `module_name` | TEXT | 模块名称: 'avatar', 'mod', 'trader' |
| `enabled` | INTEGER | 是否启用 (0/1) |
| `status` | TEXT | 状态: 'running', 'stopped', 'error' |
| `last_activity` | INTEGER | 最后活动时间戳 |
| `error_message` | TEXT | 错误消息 |

## 🚀 数据库迁移

### 运行迁移脚本

```bash
# 本地开发环境
npx wrangler d1 execute kolmarket-db --local --file=./scripts/migrate-agent-suite.sql

# 生产环境
npx wrangler d1 execute kolmarket-db --file=./scripts/migrate-agent-suite.sql
```

或者，迁移脚本已经包含在 `schema.sql` 中，运行完整迁移：

```bash
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

## 📝 使用示例

### 创建 Suite（自动保存到数据库）

```typescript
// API 调用
const response = await fetch("/api/agent-suite", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kolHandle: "blknoiz06",
    modules: {
      avatar: { enabled: true },
      mod: { enabled: true },
      trader: { enabled: true },
    },
  }),
});
```

### 查询 Suite

```typescript
// 根据 KOL Handle 查询
const response = await fetch("/api/agent-suite?kolHandle=blknoiz06");
const { suite } = await response.json();

// 根据 Suite ID 查询
const response = await fetch("/api/agent-suite?suiteId=suite-xxx");
const { suite } = await response.json();
```

### 更新 Suite 状态

```typescript
// 启动 Suite
await fetch("/api/agent-suite", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    suiteId: "suite-xxx",
    action: "start",
  }),
});

// 停止 Suite
await fetch("/api/agent-suite", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    suiteId: "suite-xxx",
    action: "stop",
  }),
});
```

## 🔧 数据库访问层

数据库操作通过 `lib/db/agent-suite-db.ts` 封装：

```typescript
import { getAgentSuiteDB } from "@/lib/db/agent-suite-db";

// 获取数据库实例
const db = getAgentSuiteDB({ DB: env.DB });

// 创建 Suite
await db.createSuite(suite);

// 获取 Suite
const suite = await db.getSuite(suiteId);

// 更新状态
await db.updateSuiteStatus(suiteId, "active");
await db.updateModuleStatus(suiteId, "avatar", "running");

// 更新统计数据
await db.updateStats(suiteId, {
  avatar: { totalTweets: 100, ... },
});
```

## ⚠️ 注意事项

1. **向后兼容**: API 路由支持数据库和内存存储两种模式。如果数据库不可用，会自动降级到内存存储。

2. **数据一致性**: 数据库操作是异步的，可能存在短暂的延迟。

3. **错误处理**: 数据库操作失败时会记录错误日志，但不会中断 API 响应（降级到内存存储）。

4. **索引优化**: 已创建必要的索引以提高查询性能：
   - `idx_agent_suites_kol_handle` - 根据 KOL Handle 快速查找
   - `idx_agent_suites_status` - 根据状态筛选
   - `idx_agent_suite_modules_suite_id` - 关联查询优化

## 📊 数据查询示例

### 使用 Wrangler CLI 查询

```bash
# 查看所有 Suite
npx wrangler d1 execute kolmarket-db --command "SELECT * FROM agent_suites"

# 查看特定 KOL 的 Suite
npx wrangler d1 execute kolmarket-db --command "SELECT * FROM agent_suites WHERE kol_handle = 'blknoiz06'"

# 查看运行中的 Suite
npx wrangler d1 execute kolmarket-db --command "SELECT * FROM agent_suites WHERE status = 'active'"

# 查看模块状态
npx wrangler d1 execute kolmarket-db --command "SELECT * FROM agent_suite_modules WHERE suite_id = 'suite-xxx'"
```

## 🔄 数据迁移

如果需要迁移现有数据：

1. **从内存存储迁移到数据库**:
   - 当前实现会在创建 Suite 时自动保存到数据库
   - 如果已有内存中的 Suite，需要重新创建

2. **数据备份**:
   ```bash
   # 导出数据
   npx wrangler d1 execute kolmarket-db --command "SELECT * FROM agent_suites" > backup.json
   ```

3. **数据恢复**:
   - 使用 API 重新创建 Suite
   - 或直接插入数据库记录

---

**最后更新**: 2026-01-21  
**状态**: ✅ 数据库持久化已完成
