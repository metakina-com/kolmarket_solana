# 🧪 全面测试指南

**更新时间**: 2026-01-22  
**状态**: ✅ 完整测试方案

---

## 📋 测试概览

本指南涵盖 KOLMarket.ai 项目的**所有层级**的全面测试方案：

1. **用户层测试** - 前端界面和交互
2. **应用层测试** - API 路由和业务逻辑
3. **智能体层测试** - ElizaOS 容器和插件
4. **执行层测试** - Solana 交易和分红
5. **数据层测试** - D1/Vectorize/R2 存储
6. **算力层测试** - Workers AI 推理

---

## 1️⃣ 用户层测试 (User Layer)

### 测试范围

- ✅ 页面渲染和加载
- ✅ 组件交互
- ✅ 响应式设计
- ✅ 钱包连接
- ✅ 数据可视化

### 测试方法

#### 1.1 手动测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

**测试清单**:
- [ ] 首页加载正常
- [ ] KOL 卡片显示正常
- [ ] 雷达图渲染正常
- [ ] 导航栏功能正常
- [ ] 钱包连接功能正常
- [ ] 聊天界面交互正常
- [ ] 知识库管理界面正常
- [ ] 交易终端界面正常
- [ ] 响应式设计（移动端/桌面端）

#### 1.2 浏览器自动化测试

```bash
# 使用 Playwright 或 Cypress（需要安装）
npm install -D @playwright/test
npx playwright test
```

**测试脚本示例** (`tests/e2e/homepage.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('首页加载正常', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-testid="kol-card"]')).toHaveCount(3);
});

test('钱包连接功能', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="wallet-connect"]');
  // 测试钱包连接流程
});
```

---

## 2️⃣ 应用层测试 (Application Layer)

### 测试范围

- ✅ API 路由功能
- ✅ 请求验证
- ✅ 错误处理
- ✅ 数据转换
- ✅ 降级机制

### 测试方法

#### 2.1 使用现有测试脚本

```bash
# 测试所有 API 端点
bash scripts/test-apis.sh http://localhost:3000

# 或指定生产环境
bash scripts/test-apis.sh https://your-domain.pages.dev
```

#### 2.2 手动 API 测试

**聊天 API**:
```bash
# 普通聊天
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, what is Solana?"}'

# KOL 聊天
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is your favorite meme coin?","kolHandle":"blknoiz06"}'

# RAG 聊天
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What do you know about crypto?","kolHandle":"blknoiz06","useRAG":true}'
```

**知识库 API**:
```bash
# 添加知识
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle":"blknoiz06",
    "content":"Ansem is a well-known crypto trader.",
    "metadata":{"source":"twitter"}
  }'

# 查询统计
curl http://localhost:3000/api/knowledge?kolHandle=blknoiz06
```

**Mindshare API**:
```bash
curl http://localhost:3000/api/mindshare/blknoiz06
```

**Agent Suite API**:
```bash
# 创建 Suite
curl -X POST http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle":"blknoiz06",
    "modules":["avatar","trader"]
  }'

# 启动 Suite
curl -X POST http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{"action":"start","suiteId":"xxx"}'
```

#### 2.3 单元测试（推荐添加）

创建 `tests/api/chat.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Chat API', () => {
  it('应该处理普通聊天请求', async () => {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('response');
  });
});
```

---

## 3️⃣ 智能体层测试 (Agent Layer)

### 测试范围

- ✅ ElizaOS 容器健康检查
- ✅ Twitter 插件
- ✅ Discord 插件
- ✅ Telegram 插件
- ✅ Solana 插件
- ✅ 降级机制

### 测试方法

#### 3.1 使用自动化测试脚本

```bash
# 设置容器 URL
export ELIZAOS_CONTAINER_URL=https://kolmarketsolana-production.up.railway.app

# 运行测试脚本
bash scripts/test-all-plugins.sh
```

#### 3.2 手动测试

**健康检查**:
```bash
curl https://kolmarketsolana-production.up.railway.app/health
```

**Twitter 插件**:
```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文",
    "kolName": "Test KOL"
  }'
```

**Discord 插件**:
```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/discord/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "channelId": "YOUR_CHANNEL_ID",
    "message": "测试消息"
  }'
```

**Telegram 插件**:
```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/telegram/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "chatId": "YOUR_CHAT_ID",
    "message": "测试消息"
  }'
```

**Solana 插件**:
```bash
# 查询余额
curl -X POST https://kolmarketsolana-production.up.railway.app/api/solana/trade \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "action": "balance"
  }'

# 执行交易（谨慎使用）
curl -X POST https://kolmarketsolana-production.up.railway.app/api/solana/trade \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "action": "buy",
    "token": "SOL",
    "amount": 0.001
  }'
```

#### 3.3 降级机制测试

测试容器不可用时的降级行为：

```bash
# 设置错误的容器 URL
export ELIZAOS_CONTAINER_URL=http://invalid-url:3001

# 测试应用是否正常降级
curl -X POST http://localhost:3000/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "action": "postTweet",
    "content": "测试"
  }'
```

**预期**: 应该返回降级响应，而不是错误。

---

## 4️⃣ 执行层测试 (Execution Layer)

### 测试范围

- ✅ 交易构建
- ✅ 交易签名
- ✅ 分红分配
- ✅ 策略执行
- ✅ 错误处理

### 测试方法

#### 4.1 API 测试

**分红分配**:
```bash
# 测试参数验证（应该返回 400）
curl -X POST http://localhost:3000/api/execution/distribute \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [],
    "network": "devnet"
  }'

# 测试正常请求（需要真实钱包）
curl -X POST http://localhost:3000/api/execution/distribute \
  -H "Content-Type: application/json" \
  -d '{
    "payer": "YOUR_WALLET_ADDRESS",
    "recipients": [
      {"address": "RECIPIENT_ADDRESS", "amount": 0.1}
    ],
    "network": "devnet"
  }'
```

**交易策略**:
```bash
# 测试参数验证
curl -X POST http://localhost:3000/api/execution/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": {
      "id": "s1",
      "name": "Test",
      "rules": [{"condition": "balance > 0", "action": "transfer"}]
    },
    "network": "devnet"
  }'
```

#### 4.2 单元测试

创建 `tests/execution/distribution.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { distributeSOL } from '@/lib/execution/distribution';

describe('分红分配', () => {
  it('应该验证参数', () => {
    expect(() => distributeSOL([], 'payer')).toThrow();
  });

  it('应该构建正确的交易', async () => {
    const transaction = await distributeSOL(
      [{ address: 'recipient', amount: 0.1 }],
      'payer'
    );
    expect(transaction).toBeDefined();
  });
});
```

---

## 5️⃣ 数据层测试 (Data Layer)

### 测试范围

- ✅ D1 数据库操作
- ✅ Vectorize 向量搜索
- ✅ R2 文件存储
- ✅ Cookie.fun API 集成
- ✅ 缓存机制

### 测试方法

#### 5.1 D1 数据库测试

```bash
# 使用 Wrangler 本地测试
npx wrangler d1 execute kolmarket-db --local --file=schema.sql

# 查询数据
npx wrangler d1 execute kolmarket-db --local --command="SELECT * FROM agent_suites"
```

**API 测试**:
```bash
# 创建 Agent Suite（会写入 D1）
curl -X POST http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle": "test-kol",
    "modules": ["avatar"]
  }'

# 查询 Suite（从 D1 读取）
curl http://localhost:3000/api/agent-suite?suiteId=xxx
```

#### 5.2 Vectorize 测试

```bash
# 添加知识（会生成 Embedding 并存储到 Vectorize）
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle": "blknoiz06",
    "content": "Ansem is a crypto trader"
  }'

# RAG 查询（会从 Vectorize 搜索）
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Who is Ansem?",
    "kolHandle": "blknoiz06",
    "useRAG": true
  }'
```

#### 5.3 R2 存储测试

```bash
# 上传文件
curl -X POST http://localhost:3000/api/storage/upload \
  -F "file=@test-image.png" \
  -F "path=test/test-image.png"

# 访问文件
curl http://localhost:3000/api/storage/test/test-image.png
```

#### 5.4 Cookie.fun API 测试

```bash
# 获取 Mindshare 数据
curl http://localhost:3000/api/mindshare/blknoiz06

# 测试降级（当 API Key 未配置时）
# 应该返回降级数据而不是错误
```

---

## 6️⃣ 算力层测试 (Compute Layer)

### 测试范围

- ✅ Workers AI LLM 推理
- ✅ Embedding 生成
- ✅ RAG 查询
- ✅ 容器算力

### 测试方法

#### 6.1 Workers AI 测试

**LLM 推理**:
```bash
# 测试聊天 API（使用 Workers AI）
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is Solana?"}'
```

**Embedding 生成**:
```bash
# 添加知识（会自动生成 Embedding）
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle": "blknoiz06",
    "content": "Test content for embedding"
  }'
```

#### 6.2 容器算力测试

测试 ElizaOS 容器中的 AI 功能：

```bash
# 测试容器健康（包含 AI 模型加载状态）
curl https://kolmarketsolana-production.up.railway.app/health
```

---

## 🔄 集成测试

### 端到端测试流程

#### 完整用户流程测试

1. **用户访问首页**
   ```bash
   curl http://localhost:3000/
   ```

2. **用户选择 KOL 并聊天**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","kolHandle":"blknoiz06"}'
   ```

3. **用户添加知识**
   ```bash
   curl -X POST http://localhost:3000/api/knowledge \
     -H "Content-Type: application/json" \
     -d '{"kolHandle":"blknoiz06","content":"New knowledge"}'
   ```

4. **用户使用 RAG 查询**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Query knowledge","kolHandle":"blknoiz06","useRAG":true}'
   ```

5. **用户创建 Agent Suite**
   ```bash
   curl -X POST http://localhost:3000/api/agent-suite \
     -H "Content-Type: application/json" \
     -d '{"kolHandle":"blknoiz06","modules":["avatar"]}'
   ```

6. **用户启动 Suite 并发送推文**
   ```bash
   curl -X POST http://localhost:3000/api/agent-suite/avatar \
     -H "Content-Type: application/json" \
     -d '{"action":"postTweet","content":"Test tweet"}'
   ```

---

## 📊 测试报告

### 创建测试报告脚本

创建 `scripts/generate-test-report.sh`:

```bash
#!/bin/bash

echo "# 测试报告 - $(date)" > test-report.md
echo "" >> test-report.md

# 运行所有测试并记录结果
bash scripts/test-apis.sh http://localhost:3000 >> test-report.md
bash scripts/test-all-plugins.sh >> test-report.md

echo "测试报告已生成: test-report.md"
```

---

## 🛠️ 测试工具推荐

### 1. API 测试工具

- **curl**: 命令行测试（已使用）
- **Postman**: GUI API 测试
- **Insomnia**: 轻量级 API 客户端
- **HTTPie**: 更友好的 curl 替代

### 2. 前端测试工具

- **Playwright**: 浏览器自动化
- **Cypress**: E2E 测试框架
- **React Testing Library**: React 组件测试
- **Jest**: JavaScript 测试框架

### 3. 性能测试工具

- **Apache Bench (ab)**: 简单负载测试
- **k6**: 现代负载测试工具
- **Lighthouse**: 性能分析

### 4. 监控工具

- **Cloudflare Analytics**: 访问统计
- **Railway Metrics**: 容器监控
- **Sentry**: 错误追踪

---

## 📋 测试清单

### 开发环境测试

- [ ] 前端页面加载
- [ ] API 端点响应
- [ ] 钱包连接功能
- [ ] 聊天功能（降级模式）
- [ ] 知识库管理（本地模式）

### 生产环境测试

- [ ] 网站可访问性
- [ ] Workers AI 功能
- [ ] D1 数据库操作
- [ ] Vectorize 向量搜索
- [ ] R2 文件存储
- [ ] ElizaOS 容器功能
- [ ] 降级机制
- [ ] 错误处理

### 性能测试

- [ ] API 响应时间
- [ ] 页面加载速度
- [ ] 并发请求处理
- [ ] 数据库查询性能
- [ ] AI 推理延迟

### 安全测试

- [ ] 输入验证
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CORS 配置
- [ ] 环境变量安全

---

## 🚀 快速测试命令

```bash
# 1. 启动开发服务器
npm run dev

# 2. 测试所有 API
bash scripts/test-apis.sh http://localhost:3000

# 3. 测试 ElizaOS 容器
bash scripts/test-all-plugins.sh

# 4. 测试容器健康
bash scripts/test-container.sh

# 5. 生成测试报告
bash scripts/generate-test-report.sh
```

---

## 📚 相关文档

- [测试指南](./TESTING_GUIDE.md) - 基础测试说明
- [测试结果](./docs/TEST_RESULTS.md) - 历史测试结果
- [API 文档](./docs/API_DOCUMENTATION.md) - API 详细说明
- [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 部署和测试

---

**最后更新**: 2026-01-22  
**状态**: ✅ 全面测试方案已就绪
