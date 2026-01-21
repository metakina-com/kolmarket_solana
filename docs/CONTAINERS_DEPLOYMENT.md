# Cloudflare Containers 部署指南

## 🎯 部署策略

**如果您有 Cloudflare 付费计划，推荐使用 Cloudflare Containers 方案。**

---

## 📋 部署清单

### 前置要求

- [ ] Cloudflare 付费计划（必需）
- [ ] Docker 已安装
- [ ] Wrangler CLI 最新版本
- [ ] 已配置 Cloudflare 账户登录

### 环境变量准备

需要准备以下 API Keys 和 Tokens：

- [ ] Twitter API Keys（Avatar 模块）
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_TOKEN_SECRET`

- [ ] Discord Bot Token（Mod 模块）
  - `DISCORD_BOT_TOKEN`

- [ ] Telegram Bot Token（Mod 模块）
  - `TELEGRAM_BOT_TOKEN`

- [ ] Solana 配置（Trader 模块）
  - `SOLANA_PRIVATE_KEY`
  - `SOLANA_RPC_URL`

---

## 🚀 完整部署流程

### 步骤 1: 创建容器应用

```bash
# 创建目录
mkdir elizaos-container
cd elizaos-container

# 初始化项目
npm init -y
```

### 步骤 2: 安装依赖

```bash
npm install express @elizaos/core @elizaos/plugin-twitter @elizaos/plugin-discord @elizaos/plugin-telegram @elizaos/plugin-solana-agent-kit --legacy-peer-deps
```

### 步骤 3: 创建应用文件

参考 `docs/CONTAINERS_QUICK_START.md` 创建：
- `package.json`
- `Dockerfile`
- `index.js`

### 步骤 4: 构建和推送镜像

```bash
# 构建镜像
docker build -t elizaos-server:latest .

# 登录 Docker Hub
docker login

# 标记镜像
docker tag elizaos-server:latest your-username/elizaos-server:latest

# 推送镜像
docker push your-username/elizaos-server:latest
```

### 步骤 5: 配置 wrangler.toml

将 `wrangler.containers.toml.example` 的内容合并到 `wrangler.toml`：

```toml
[[containers]]
name = "elizaos-server"
image = "your-username/elizaos-server:latest"
port = 3001
region = "earth"
```

### 步骤 6: 部署容器

```bash
# 部署容器
npx wrangler containers deploy elizaos-server \
  --image your-username/elizaos-server:latest \
  --port 3001
```

### 步骤 7: 设置 Secrets

```bash
# Twitter
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET

# Discord
npx wrangler secret put DISCORD_BOT_TOKEN

# Telegram
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Solana
npx wrangler secret put SOLANA_PRIVATE_KEY
```

### 步骤 8: 获取容器 URL

部署后，获取容器 URL：

```bash
npx wrangler containers list
```

### 步骤 9: 配置主应用

在 Cloudflare Pages 设置中添加环境变量：

```bash
ELIZAOS_CONTAINER_URL=https://elizaos-server.your-account.workers.dev
```

或使用 Wrangler：

```bash
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
```

### 步骤 10: 部署主应用

```bash
npm run build
npx wrangler pages deploy .next
```

---

## ✅ 验证部署

### 1. 检查容器状态

```bash
npx wrangler containers list
```

### 2. 测试健康检查

```bash
curl https://elizaos-server.your-account.workers.dev/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T..."
}
```

### 3. 测试 Twitter API

```bash
curl -X POST https://elizaos-server.your-account.workers.dev/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "Test tweet from Cloudflare Container! 🚀",
    "config": {
      "name": "Test Agent"
    }
  }'
```

### 4. 测试主应用 API

```bash
curl -X POST https://your-pages.pages.dev/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "Test tweet via main app",
    "kolName": "Test KOL"
  }'
```

---

## 🔧 故障排查

### 容器无法启动

**检查**:
1. 镜像是否正确推送
2. 端口配置是否正确
3. 查看容器日志：`npx wrangler containers logs elizaos-server`

### API 调用失败

**检查**:
1. 容器 URL 是否正确配置
2. 容器是否正常运行（健康检查）
3. Secrets 是否正确设置
4. 查看主应用日志

### 环境变量未生效

**检查**:
1. Secrets 是否使用 `wrangler secret put` 设置
2. 容器重启后环境变量才会生效
3. 检查容器日志确认环境变量

---

## 📊 监控和维护

### 查看容器日志

```bash
npx wrangler containers logs elizaos-server
```

### 重启容器

```bash
npx wrangler containers restart elizaos-server
```

### 更新容器镜像

```bash
# 1. 构建新镜像
docker build -t elizaos-server:latest .

# 2. 推送新镜像
docker push your-username/elizaos-server:latest

# 3. 重新部署
npx wrangler containers deploy elizaos-server \
  --image your-username/elizaos-server:latest \
  --port 3001
```

---

## 💰 成本估算

Cloudflare Containers 成本（参考）：

- **基础费用**: 根据付费计划
- **运行时间**: 按实际使用计费
- **数据传输**: 包含在计划中

**建议**: 查看 Cloudflare 定价页面获取最新信息。

---

## 📚 相关文档

- [快速开始指南](./CONTAINERS_QUICK_START.md)
- [详细解决方案](./CLOUDFLARE_CONTAINERS_SOLUTION.md)
- [Cloudflare Containers 官方文档](https://developers.cloudflare.com/containers/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 完整部署指南已就绪
