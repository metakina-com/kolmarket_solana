# ElizaOS Container

运行在 Cloudflare Containers 中的 ElizaOS 插件服务器。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写：

```bash
cp .env.example .env
# 编辑 .env 文件
```

### 3. 本地测试

```bash
npm start
# 或
npm run dev
```

### 4. 构建 Docker 镜像

```bash
docker build -t elizaos-server:latest .
```

### 5. 测试运行

```bash
docker run -p 3001:3001 \
  --env-file .env \
  elizaos-server:latest
```

### 6. 推送到 Docker Hub

```bash
docker tag elizaos-server:latest your-username/elizaos-server:latest
docker push your-username/elizaos-server:latest
```

### 7. 部署到 Cloudflare Containers

```bash
npx wrangler containers deploy elizaos-server \
  --image your-username/elizaos-server:latest \
  --port 3001
```

## 📡 API 端点

### 健康检查

```bash
GET /health
```

### Twitter

```bash
POST /api/twitter/post
{
  "suiteId": "suite-123",
  "content": "Hello from container!",
  "config": {
    "name": "KOL Agent",
    "autoPost": true
  }
}
```

### Discord

```bash
POST /api/discord/message
{
  "suiteId": "suite-123",
  "channelId": "channel-123",
  "message": "Hello from Discord!",
  "config": {
    "name": "KOL Agent"
  }
}
```

### Telegram

```bash
POST /api/telegram/message
{
  "suiteId": "suite-123",
  "chatId": "chat-123",
  "message": "Hello from Telegram!",
  "config": {
    "name": "KOL Agent"
  }
}
```

### Solana

```bash
POST /api/solana/trade
{
  "suiteId": "suite-123",
  "action": "buy",
  "token": "SOL",
  "amount": 1.5,
  "config": {
    "name": "KOL Agent"
  }
}
```

## 🔧 环境变量

参考 `.env.example` 文件。

## 📚 相关文档

- [快速开始指南](../docs/CONTAINERS_QUICK_START.md)
- [完整部署指南](../docs/CONTAINERS_DEPLOYMENT.md)
