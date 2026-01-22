# 🚀 Cloudflare Pages 部署后配置清单

## ✅ 部署状态

- ✅ 代码已部署到 Cloudflare Pages
- ✅ 项目 URL: https://kolmarket-solana.pages.dev
- ⚠️ **以下配置需要在 Cloudflare Dashboard 中完成**

---

## 📋 必需配置清单

### 1. D1 数据库配置 ✅ 已配置（wrangler.toml）

**状态**: 数据库 ID 已在 `wrangler.toml` 中配置

**验证步骤**:
```bash
# 检查数据库是否存在
npx wrangler d1 list

# 如果数据库不存在，创建它
npx wrangler d1 create kolmarket-db

# 运行迁移
npx wrangler d1 execute kolmarket-db --file=./schema.sql
npx wrangler d1 execute kolmarket-db --file=./scripts/migrate-agent-suite.sql
```

**在 Cloudflare Dashboard 中**:
1. 进入 Pages 项目 → Settings → Functions
2. 确认 D1 数据库绑定已配置（`DB` binding）

---

### 2. Vectorize 向量数据库配置 ⚠️ 需要创建

**状态**: 索引需要创建

**创建步骤**:
```bash
# 创建向量索引（用于 RAG 知识库）
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine
```

**在 Cloudflare Dashboard 中**:
1. 进入 Pages 项目 → Settings → Functions
2. 确认 Vectorize 绑定已配置（`VECTORIZE` binding）

---

### 3. Workers AI 配置 ✅ 自动可用

**状态**: Workers AI 自动绑定，无需额外配置

**验证**: 在代码中通过 `env.AI` 访问

---

### 4. 环境变量配置 ⚠️ 需要设置

#### 4.1 基础环境变量

在 Cloudflare Dashboard → Pages → kolmarket-solana → Settings → Environment Variables 中设置：

```bash
# Solana 网络配置
SOLANA_NETWORK=devnet  # 或 mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # 主网
# 或
SOLANA_RPC_URL=https://api.devnet.solana.com  # 测试网

# Cookie.fun API（可选，用于 KOL 数据）
COOKIE_FUN_API_KEY=your_cookie_fun_api_key
```

#### 4.2 Secrets（敏感信息）

使用 Wrangler CLI 设置 Secrets：

```bash
# Solana 钱包密钥（用于交易执行，⚠️ 仅开发环境）
npx wrangler pages secret put SOLANA_PRIVATE_KEY

# Cookie.fun API Key（如果使用）
npx wrangler pages secret put COOKIE_FUN_API_KEY
```

---

### 5. ElizaOS 容器配置（可选，推荐）⭐

#### 5.1 如果使用 Cloudflare Containers 方案

**部署容器**:
```bash
# 使用部署脚本
./scripts/deploy-container.sh

# 或手动部署
cd elizaos-container
docker build -t elizaos-server:latest .
docker push your-username/elizaos-server:latest
npx wrangler containers deploy elizaos-server \
  --image your-username/elizaos-server:latest \
  --port 3001
```

**获取容器 URL**:
```bash
npx wrangler containers list
# 记下容器的 URL，例如: https://elizaos-server.xxx.workers.dev
```

**配置主应用**:
```bash
# 设置容器 URL
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server.xxx.workers.dev
```

**配置容器 Secrets**:
```bash
# Twitter API（Avatar 模块）
npx wrangler secret put TWITTER_API_KEY --container=elizaos-server
npx wrangler secret put TWITTER_API_SECRET --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET --container=elizaos-server

# Discord Bot（Mod 模块）
npx wrangler secret put DISCORD_BOT_TOKEN --container=elizaos-server

# Telegram Bot（Mod 模块）
npx wrangler secret put TELEGRAM_BOT_TOKEN --container=elizaos-server

# Solana 配置（Trader 模块）
npx wrangler secret put SOLANA_PRIVATE_KEY --container=elizaos-server
npx wrangler secret put SOLANA_RPC_URL --container=elizaos-server
```

#### 5.2 如果不使用容器（降级实现）

**无需额外配置**，系统会自动使用降级实现。

---

### 6. 自定义域名配置（可选）

**在 Cloudflare Dashboard 中**:
1. 进入 Pages → kolmarket-solana → Custom domains
2. 添加您的域名
3. 配置 DNS 记录（CNAME 指向 `kolmarket-solana.pages.dev`）

---

## 🔍 配置验证

### 验证 D1 数据库

```bash
# 测试数据库连接
npx wrangler d1 execute kolmarket-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 验证 Vectorize

```bash
# 列出所有索引
npx wrangler vectorize list
```

### 验证环境变量

访问应用并检查：
- API 路由是否正常工作
- 数据库查询是否成功
- 错误日志中是否有配置缺失提示

---

## 📊 配置优先级

### 必需配置（应用基础功能）
1. ✅ D1 数据库绑定（已在 wrangler.toml 中配置）
2. ⚠️ 运行数据库迁移
3. ⚠️ Vectorize 索引创建

### 推荐配置（完整功能）
4. ⭐ ElizaOS 容器部署（如需完整 Agent Suite 功能）
5. ⭐ 容器 Secrets 配置（Twitter/Discord/Telegram/Solana）

### 可选配置（增强功能）
6. Cookie.fun API Key（KOL 数据）
7. 自定义域名
8. 生产环境 Solana RPC URL

---

## 🚨 常见问题

### Q: 数据库迁移失败？
```bash
# 确保数据库已创建
npx wrangler d1 list

# 手动执行 SQL
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

### Q: 环境变量未生效？
- 确保使用 `wrangler pages secret put` 设置 Secrets
- 重启部署：在 Dashboard 中触发新的部署
- 检查变量名拼写是否正确

### Q: 容器无法连接？
- 验证容器 URL 是否正确
- 检查容器健康状态：`curl https://your-container-url/health`
- 确认容器 Secrets 已正确设置

---

## 📚 相关文档

- [Cloudflare 设置指南](./CLOUDFLARE_SETUP.md)
- [ElizaOS 插件配置](./ELIZA_PLUGINS_SETUP.md)
- [Containers 快速开始](./CONTAINERS_QUICK_START.md)
- [Containers 部署指南](./CONTAINERS_DEPLOYMENT.md)

---

## ✅ 快速配置命令汇总

```bash
# 1. 数据库迁移
npx wrangler d1 execute kolmarket-db --file=./schema.sql
npx wrangler d1 execute kolmarket-db --file=./scripts/migrate-agent-suite.sql

# 2. 创建 Vectorize 索引
npx wrangler vectorize create kol-knowledge-index --dimensions=768 --metric=cosine

# 3. 设置基础环境变量（在 Dashboard 中设置，或使用 wrangler.toml）

# 4. 部署容器（如果使用）
./scripts/deploy-container.sh

# 5. 设置容器 URL
npx wrangler pages secret put ELIZAOS_CONTAINER_URL

# 6. 设置容器 Secrets
npx wrangler secret put TWITTER_API_KEY --container=elizaos-server
# ... 其他 Secrets
```

---

**最后更新**: 2026-01-21  
**状态**: ✅ 部署完成，等待配置
