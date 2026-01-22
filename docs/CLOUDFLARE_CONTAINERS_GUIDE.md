# Cloudflare Containers 配置指南

## 🚀 概述

本项目已配置完整的 ElizaOS 容器，可以部署到 Cloudflare Containers 以启用高级功能：

- **Twitter 自动发推** - 24/7 自动发推、互动
- **Discord/Telegram 机器人** - 粉丝客服自动回复
- **Solana 自动交易** - 链上交易、跟单功能

## 📋 前置要求

1. **Cloudflare 付费计划** - Containers 功能需要付费计划
2. **Docker** - 用于构建容器镜像
3. **API Keys** - Twitter、Discord、Telegram、Solana 的凭证

## 🔧 部署步骤

### 步骤 1: 构建 Docker 镜像

```bash
cd elizaos-container
docker build -t kolmarket/elizaos-server:latest .
```

### 步骤 2: 推送到 Docker Hub (可选)

```bash
docker login
docker push kolmarket/elizaos-server:latest
```

### 步骤 3: 部署到 Cloudflare Containers

```bash
# 查看可用容器
npx wrangler containers list

# 部署容器
npx wrangler containers deploy elizaos-server \
  --image kolmarket/elizaos-server:latest \
  --port 3001
```

### 步骤 4: 配置环境变量 (Secrets)

```bash
# ElizaOS 容器 URL (部署后获取)
npx wrangler secret put ELIZAOS_CONTAINER_URL

# Twitter API (可选)
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET

# Discord Bot (可选)
npx wrangler secret put DISCORD_BOT_TOKEN

# Telegram Bot (可选)
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Solana (可选)
npx wrangler secret put SOLANA_PRIVATE_KEY
npx wrangler secret put SOLANA_RPC_URL
```

### 步骤 5: 重新部署前端

```bash
npm run deploy
```

## 🔌 API 端点

容器提供以下 API：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/twitter/post` | POST | 发送推文 |
| `/api/discord/message` | POST | 发送 Discord 消息 |
| `/api/telegram/message` | POST | 发送 Telegram 消息 |
| `/api/solana/trade` | POST | 执行 Solana 交易 |

## 🔄 替代方案

如果 Cloudflare Containers 不可用，可以使用以下替代方案：

### Railway

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
cd elizaos-container
railway init
railway up
```

### Fly.io

```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录并部署
fly auth login
cd elizaos-container
fly launch
fly deploy
```

### Render

1. 访问 [render.com](https://render.com)
2. 创建新的 Web Service
3. 连接 GitHub 仓库
4. 设置 Root Directory 为 `elizaos-container`
5. 添加环境变量

## 📊 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ Next.js App │   │ Workers AI  │   │  D1 / R2    │       │
│  │  (Pages)    │   │  (LLM)      │   │ (Database)  │       │
│  └──────┬──────┘   └─────────────┘   └─────────────┘       │
│         │                                                   │
│         │ API Calls                                         │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Cloudflare Containers                     │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │              ElizaOS Server                    │  │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │   │
│  │  │  │ Twitter │ │ Discord │ │Telegram │         │  │   │
│  │  │  │ Plugin  │ │ Plugin  │ │ Plugin  │         │  │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘         │  │   │
│  │  │  ┌─────────────────────────────────┐         │  │   │
│  │  │  │     Solana Agent Kit            │         │  │   │
│  │  │  └─────────────────────────────────┘         │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 安全注意事项

1. **永远不要** 在代码中硬编码 API Keys
2. 使用 `wrangler secret` 管理敏感信息
3. 定期轮换 API 凭证
4. 限制容器的网络访问权限

## 📚 相关文档

- [Cloudflare Containers 文档](https://developers.cloudflare.com/containers/)
- [ElizaOS 文档](https://elizaos.ai/)
- [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit)
