# 🎯 Cloudflare Containers Dashboard 部署指南

## 📋 当前状态

✅ **已完成**:
- Docker 镜像已构建: `elizaos-server:latest` (2.25GB)
- 镜像已推送到 Docker Hub: `dappweb/elizaos-server:latest`
- 镜像正在推送到 Cloudflare Registry

---

## 🚀 通过 Dashboard 部署（推荐方式）

### 步骤 1: 访问 Cloudflare Dashboard

1. 登录: https://dash.cloudflare.com/
2. 选择您的账户
3. 进入: **Workers & Pages** → **Containers**

### 步骤 2: 创建新容器

1. 点击 **"Create Container"** 或 **"Deploy Container"**
2. 填写容器信息:
   - **名称**: `elizaos-server`
   - **镜像来源**: 选择以下之一:
     - **Cloudflare Registry**: `elizaos-server:latest` (如果已推送)
     - **Docker Hub**: `dappweb/elizaos-server:latest`
   - **端口**: `3001`
   - **区域**: `Earth` (全局部署)

### 步骤 3: 配置环境变量

在容器设置中添加环境变量（可选，根据功能需求）:

```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### 步骤 4: 配置 Secrets

在容器设置中添加 Secrets（根据功能需求）:

- **Twitter API** (Avatar 模块):
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_TOKEN_SECRET`

- **Discord Bot** (Mod 模块):
  - `DISCORD_BOT_TOKEN`

- **Telegram Bot** (Mod 模块):
  - `TELEGRAM_BOT_TOKEN`

- **Solana** (Trader 模块):
  - `SOLANA_PRIVATE_KEY`
  - `SOLANA_RPC_URL`

### 步骤 5: 部署并获取 URL

1. 点击 **"Deploy"** 或 **"Save"**
2. 等待部署完成（通常需要几分钟）
3. 记下容器 URL，例如: `https://elizaos-server.xxx.workers.dev`

### 步骤 6: 配置主应用

```bash
# 设置容器 URL
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server.xxx.workers.dev
```

---

## 🔧 通过 CLI 部署（如果支持）

### 方式 1: 使用已构建的镜像

```bash
# 确保镜像已推送到 Cloudflare Registry
cd /home/zyj_dev/Documents/kolmarket_solana
npx wrangler containers push elizaos-server:latest

# 等待推送完成，然后检查
npx wrangler containers images list
```

### 方式 2: 使用 Dockerfile 路径（如果支持）

更新 `wrangler.toml`:

```toml
[[containers]]
name = "elizaos-server"
image = "./elizaos-container/Dockerfile"
port = 3001
```

然后部署:

```bash
npx wrangler deploy
```

---

## ✅ 验证部署

### 1. 测试健康检查

```bash
# 获取容器 URL（从 Dashboard 或 CLI）
CONTAINER_URL="https://elizaos-server.xxx.workers.dev"

# 测试健康检查
curl ${CONTAINER_URL}/health
```

应该返回:
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T...",
  "agents": 0
}
```

### 2. 查看容器日志

```bash
# 通过 CLI
npx wrangler containers logs elizaos-server

# 或通过 Dashboard
# Workers & Pages → Containers → elizaos-server → Logs
```

### 3. 测试 API 端点

```bash
# 测试 Twitter API（需要配置 Secrets）
curl -X POST ${CONTAINER_URL}/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "Hello from container!",
    "config": {
      "name": "Test Agent"
    }
  }'
```

---

## 🔍 故障排查

### 问题 1: 找不到 Containers 选项

**原因**: Containers 功能需要付费计划

**解决**:
1. 确认您使用的是 Cloudflare 付费计划
2. 访问: https://developers.cloudflare.com/containers/
3. 检查功能是否已启用

### 问题 2: 镜像推送失败

**解决**:
1. 检查网络连接
2. 确认 Docker 已登录: `docker login`
3. 尝试使用 Docker Hub 镜像: `dappweb/elizaos-server:latest`

### 问题 3: 容器无法启动

**解决**:
1. 查看容器日志
2. 检查端口配置（应该是 3001）
3. 验证环境变量和 Secrets 是否正确

### 问题 4: 健康检查失败

**解决**:
1. 等待几分钟（容器启动需要时间）
2. 检查容器日志
3. 验证应用代码是否正确

---

## 📊 容器管理

### 查看容器状态

```bash
# CLI
npx wrangler containers list
npx wrangler containers info elizaos-server

# Dashboard
Workers & Pages → Containers → elizaos-server
```

### 重启容器

```bash
# CLI
npx wrangler containers restart elizaos-server

# Dashboard
Workers & Pages → Containers → elizaos-server → Restart
```

### 更新容器

1. 重新构建镜像
2. 推送到 registry
3. 在 Dashboard 中更新容器镜像，或重新部署

---

## 📚 相关资源

- [Cloudflare Containers 文档](https://developers.cloudflare.com/containers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目部署指南](./docs/DEPLOY_ELIZAOS_CLOUDFLARE.md)

---

**最后更新**: 2024-01-22
