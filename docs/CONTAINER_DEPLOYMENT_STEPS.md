# 🐳 Cloudflare Containers 部署步骤

## 📋 前置要求

- ✅ Cloudflare 付费计划（必需）
- ✅ Docker 已安装
- ✅ Docker Hub 账户
- ✅ Wrangler CLI 已登录

---

## 🚀 完整部署流程

### 步骤 1: 准备 Docker 镜像

```bash
cd elizaos-container

# 安装依赖（如果还没安装）
npm install --legacy-peer-deps

# 构建 Docker 镜像
docker build -t elizaos-server:latest .
```

### 步骤 2: 登录 Docker Hub

```bash
docker login
# 输入您的 Docker Hub 用户名和密码
```

### 步骤 3: 标记并推送镜像

```bash
# 替换 your-username 为您的 Docker Hub 用户名
export DOCKER_USERNAME=your-username

# 标记镜像
docker tag elizaos-server:latest ${DOCKER_USERNAME}/elizaos-server:latest

# 推送镜像
docker push ${DOCKER_USERNAME}/elizaos-server:latest
```

### 步骤 4: 部署到 Cloudflare Containers

```bash
# 部署容器
npx wrangler containers deploy elizaos-server \
  --image ${DOCKER_USERNAME}/elizaos-server:latest \
  --port 3001
```

### 步骤 5: 获取容器 URL

```bash
# 列出所有容器
npx wrangler containers list

# 记下容器的 URL，例如: https://elizaos-server.xxx.workers.dev
```

### 步骤 6: 配置主应用

```bash
# 设置容器 URL（主应用会调用这个 URL）
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server.xxx.workers.dev
```

### 步骤 7: 配置容器 Secrets

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

---

## ✅ 验证部署

### 测试容器健康检查

```bash
# 获取容器 URL
CONTAINER_URL=$(npx wrangler containers list | grep elizaos-server | awk '{print $NF}')

# 测试健康检查
curl ${CONTAINER_URL}/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "agents": 0
}
```

### 测试主应用连接

访问主应用并测试 Agent Suite 功能：
- 创建 Agent Suite
- 测试 Avatar 模块（发推）
- 测试 Trader 模块（交易）

---

## 🔧 故障排查

### 容器无法启动

1. 检查容器日志：
```bash
npx wrangler containers logs elizaos-server
```

2. 验证镜像是否正确推送：
```bash
docker pull ${DOCKER_USERNAME}/elizaos-server:latest
```

### API 调用失败

1. 验证容器 URL 是否正确：
```bash
curl ${CONTAINER_URL}/health
```

2. 检查主应用的环境变量：
```bash
npx wrangler pages secret list --project-name=kolmarket-solana
```

### Secrets 未生效

1. 重启容器：
```bash
npx wrangler containers restart elizaos-server
```

2. 检查 Secrets 是否正确设置：
```bash
npx wrangler secret list --container=elizaos-server
```

---

## 📚 相关文档

- [Containers 快速开始](./CONTAINERS_QUICK_START.md)
- [Containers 部署指南](./CONTAINERS_DEPLOYMENT.md)
- [容器应用 README](../elizaos-container/README.md)

---

**最后更新**: 2026-01-22
