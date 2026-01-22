# 🚀 Cloudflare Containers 快速部署指南（已付费）

**状态**: ✅ 您已付费，可以立即部署！  
**预计时间**: 15-30 分钟

---

## 🎯 部署方式选择

### 方式 1: Dashboard 部署（推荐，最简单）⭐⭐⭐⭐⭐

**优点**: 
- ✅ 最简单，无需 CLI
- ✅ 可视化配置
- ✅ 自动处理镜像拉取

**时间**: 10-15 分钟

### 方式 2: CLI 部署（适合自动化）⭐⭐⭐⭐

**优点**:
- ✅ 可脚本化
- ✅ 适合 CI/CD
- ✅ 更灵活

**时间**: 15-30 分钟

---

## 📋 方式 1: Dashboard 部署（推荐）

### 步骤 1: 准备 Docker 镜像

首先需要将镜像推送到 Docker Hub 或 Cloudflare Registry：

```bash
# 进入容器目录
cd elizaos-container

# 构建镜像
docker build -t elizaos-server:latest .

# 登录 Docker Hub（如果没有账户，先注册）
docker login

# 标记并推送镜像（替换 your-username）
docker tag elizaos-server:latest your-username/elizaos-server:latest
docker push your-username/elizaos-server:latest
```

**或者使用已存在的镜像**:
- Docker Hub: `dappweb/elizaos-server:latest` (如果已推送)

### 步骤 2: 访问 Cloudflare Dashboard

1. 登录: https://dash.cloudflare.com/
2. 选择您的账户
3. 进入: **Workers & Pages** → **Containers**
4. 点击 **"Create Container"** 或 **"Deploy Container"**

### 步骤 3: 配置容器

填写以下信息：

- **容器名称**: `elizaos-server`
- **镜像来源**: 
  - 选择 **"Docker Hub"** 或 **"Cloudflare Registry"**
  - 镜像名称: `your-username/elizaos-server:latest` 或 `dappweb/elizaos-server:latest`
- **端口**: `3001`
- **区域**: `Earth` (全局部署)
- **环境**: `production`

### 步骤 4: 配置环境变量

在容器设置中添加以下环境变量：

**基础配置**:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### 步骤 5: 配置 Secrets（可选，根据功能需求）

在容器设置中添加 Secrets：

**Twitter API** (Avatar 模块需要):
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

**Discord Bot** (Mod 模块需要):
- `DISCORD_BOT_TOKEN`

**Telegram Bot** (Mod 模块需要):
- `TELEGRAM_BOT_TOKEN`

**Solana** (Trader 模块需要):
- `SOLANA_PRIVATE_KEY`
- `SOLANA_RPC_URL`

> 💡 **提示**: 可以先部署容器，后续再添加 Secrets。容器会正常运行，只是相关功能不可用。

### 步骤 6: 部署

1. 点击 **"Deploy"** 或 **"Save"**
2. 等待部署完成（通常需要 2-5 分钟）
3. 记下容器 URL，例如: `https://elizaos-server.xxx.workers.dev`

### 步骤 7: 配置主应用

```bash
# 设置容器 URL 到 Pages 项目
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server.xxx.workers.dev
```

### 步骤 8: 测试容器

```bash
# 测试健康检查
curl https://elizaos-server.xxx.workers.dev/health

# 应该返回:
# {"status":"ok","timestamp":"...","agents":0}
```

---

## 📋 方式 2: CLI 部署

### 步骤 1: 检查登录状态

```bash
# 检查是否已登录
npx wrangler whoami

# 如果未登录，执行:
npx wrangler login
```

### 步骤 2: 构建镜像

```bash
cd elizaos-container
docker build -t elizaos-server:latest .
```

### 步骤 3: 推送镜像到 Cloudflare Registry

```bash
# 推送镜像到 Cloudflare Registry
npx wrangler containers push elizaos-server:latest

# 验证镜像
npx wrangler containers images list
```

### 步骤 4: 通过 Dashboard 创建容器

由于 CLI 暂不支持直接部署容器，需要：

1. 访问 Dashboard: https://dash.cloudflare.com/
2. 进入: **Workers & Pages** → **Containers**
3. 点击 **"Create Container"**
4. 选择镜像: `elizaos-server:latest` (从 Cloudflare Registry)
5. 配置端口: `3001`
6. 部署

### 步骤 5: 配置 Secrets（使用 CLI）

```bash
# 设置容器 URL（部署后获取）
npx wrangler pages secret put ELIZAOS_CONTAINER_URL

# 配置 Twitter API（可选）
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET

# 配置 Discord Bot（可选）
npx wrangler secret put DISCORD_BOT_TOKEN

# 配置 Telegram Bot（可选）
npx wrangler secret put TELEGRAM_BOT_TOKEN

# 配置 Solana（可选）
npx wrangler secret put SOLANA_PRIVATE_KEY
npx wrangler secret put SOLANA_RPC_URL
```

---

## 🔧 使用自动化脚本

项目提供了自动化部署脚本：

```bash
# 使用部署脚本
./scripts/deploy-containers.sh
```

脚本会自动完成：
1. ✅ 检查环境
2. ✅ 构建镜像
3. ✅ 推送镜像（可选）
4. ✅ 提示部署步骤
5. ✅ 配置 Secrets

---

## ✅ 部署验证清单

部署完成后，请验证以下项目：

- [ ] 容器健康检查通过: `curl https://elizaos-server.xxx.workers.dev/health`
- [ ] 容器 URL 已配置到 Pages: `ELIZAOS_CONTAINER_URL`
- [ ] 主应用可以调用容器 API
- [ ] 相关 Secrets 已配置（如果需要）

---

## 🧪 测试容器功能

### 测试健康检查

```bash
curl https://elizaos-server.xxx.workers.dev/health
```

**预期响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T...",
  "agents": 0
}
```

### 测试 Twitter API（如果配置了 Twitter）

```bash
curl -X POST https://elizaos-server.xxx.workers.dev/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文",
    "kolName": "Test KOL"
  }'
```

### 测试主应用集成

```bash
curl -X POST https://your-app.pages.dev/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文",
    "kolName": "Test KOL"
  }'
```

---

## 🔍 故障排查

### 容器无法启动

1. **检查镜像是否正确**:
   ```bash
   npx wrangler containers images list
   ```

2. **查看容器日志**:
   - 在 Dashboard 中查看容器日志
   - 或使用: `npx wrangler containers logs elizaos-server`

3. **检查环境变量**:
   - 确认 `PORT=3001` 已设置
   - 确认 `NODE_ENV=production` 已设置

### API 调用失败

1. **验证容器 URL**:
   ```bash
   curl https://elizaos-server.xxx.workers.dev/health
   ```

2. **检查 Secrets**:
   - 确认 `ELIZAOS_CONTAINER_URL` 已正确设置
   - 确认容器 URL 格式正确

3. **检查 CORS**:
   - 容器已配置 CORS，应该可以跨域调用

### 镜像推送失败

1. **检查 Docker 登录**:
   ```bash
   docker login
   ```

2. **检查镜像大小**:
   - 镜像可能较大（2-3GB），推送需要时间
   - 确保网络连接稳定

---

## 📊 部署后状态

部署成功后，您的系统将具备：

- ✅ **Avatar 模块**: Twitter 自动发推、互动
- ✅ **Mod 模块**: Discord/Telegram 机器人
- ✅ **Trader 模块**: Solana 链上交易、跟单

所有功能将自动从降级模式切换到完整功能模式！

---

## 🎉 完成！

恭喜！您已成功部署 Cloudflare Containers！

**下一步**:
1. 测试各个模块功能
2. 配置必要的 API Keys
3. 监控容器运行状态
4. 优化性能（如需要）

---

## 📚 相关文档

- [容器方案对比](./CONTAINER_SOLUTIONS.md) - 所有方案详细对比
- [容器部署指南](./CONTAINERS_DEPLOYMENT.md) - 详细部署步骤
- [容器快速开始](./CONTAINERS_QUICK_START.md) - 5 步快速开始
- [故障排查](./CLOUDFLARE_CONTAINERS_GUIDE.md) - 常见问题解决

---

**最后更新**: 2024-01-22  
**状态**: ✅ 已付费用户可直接部署
