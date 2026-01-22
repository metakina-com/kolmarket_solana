# 🚀 ElizaOS 部署到 Cloudflare Containers 指南

## 📋 前置要求

在开始部署之前，请确保满足以下条件：

- ✅ **Cloudflare 付费计划**（必需，Containers 功能需要付费计划）
- ✅ **Docker 已安装并运行**
- ✅ **Docker Hub 账户**（用于推送镜像）
- ✅ **Wrangler CLI 已登录 Cloudflare**

---

## 🎯 快速部署（推荐）

使用自动化脚本一键部署：

```bash
# 设置 Docker Hub 用户名（可选，脚本会提示）
export DOCKER_USERNAME=your-dockerhub-username

# 运行部署脚本
./scripts/deploy-elizaos-to-cloudflare.sh
```

脚本会自动完成以下步骤：
1. ✅ 检查前置条件
2. ✅ 构建 Docker 镜像
3. ✅ 推送镜像到 Docker Hub
4. ✅ 部署到 Cloudflare Containers
5. ✅ 配置环境变量
6. ✅ 配置 Secrets（可选）

---

## 📝 手动部署步骤

如果您想手动控制每个步骤，可以按照以下流程：

### 步骤 1: 准备环境

```bash
# 1. 登录 Docker Hub
docker login

# 2. 登录 Cloudflare
npx wrangler login

# 3. 进入容器目录
cd elizaos-container
```

### 步骤 2: 安装依赖

```bash
# 安装 Node.js 依赖
npm install --legacy-peer-deps
```

### 步骤 3: 构建 Docker 镜像

```bash
# 构建镜像
docker build -t elizaos-server:latest .

# 验证镜像
docker images | grep elizaos-server
```

### 步骤 4: 标记并推送镜像

```bash
# 替换 your-username 为您的 Docker Hub 用户名
export DOCKER_USERNAME=your-username

# 标记镜像
docker tag elizaos-server:latest ${DOCKER_USERNAME}/elizaos-server:latest

# 推送镜像
docker push ${DOCKER_USERNAME}/elizaos-server:latest
```

### 步骤 5: 部署到 Cloudflare

```bash
# 部署容器
npx wrangler containers deploy elizaos-server \
  --image ${DOCKER_USERNAME}/elizaos-server:latest \
  --port 3001
```

### 步骤 6: 获取容器 URL

```bash
# 列出所有容器
npx wrangler containers list

# 记下容器的 URL，例如: https://elizaos-server.xxx.workers.dev
```

### 步骤 7: 配置主应用

```bash
# 设置容器 URL（主应用会调用这个 URL）
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server.xxx.workers.dev
```

### 步骤 8: 配置容器 Secrets（可选）

根据您需要使用的功能，配置相应的 Secrets：

#### Twitter API（Avatar 模块）

```bash
npx wrangler secret put TWITTER_API_KEY --container=elizaos-server
npx wrangler secret put TWITTER_API_SECRET --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET --container=elizaos-server
```

#### Discord Bot（Mod 模块）

```bash
npx wrangler secret put DISCORD_BOT_TOKEN --container=elizaos-server
```

#### Telegram Bot（Mod 模块）

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN --container=elizaos-server
```

#### Solana 配置（Trader 模块）

```bash
npx wrangler secret put SOLANA_PRIVATE_KEY --container=elizaos-server
npx wrangler secret put SOLANA_RPC_URL --container=elizaos-server
```

---

## ✅ 验证部署

### 1. 测试容器健康检查

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
  "timestamp": "2024-01-22T10:00:00.000Z",
  "agents": 0
}
```

### 2. 查看容器日志

```bash
npx wrangler containers logs elizaos-server
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

## 🔧 故障排查

### 问题 1: Containers 功能不可用

**症状**: `npx wrangler containers list` 失败

**解决方案**:
1. 确认您使用的是 Cloudflare 付费计划
2. 在 Cloudflare Dashboard 中启用 Containers (Beta) 功能
3. 访问: https://developers.cloudflare.com/containers/

### 问题 2: 容器无法启动

**症状**: 容器部署成功但健康检查失败

**解决方案**:
```bash
# 查看容器日志
npx wrangler containers logs elizaos-server

# 检查常见问题：
# - 端口配置是否正确（应该是 3001）
# - 环境变量是否正确
# - 依赖是否安装完整
```

### 问题 3: 镜像构建失败

**症状**: `docker build` 失败

**解决方案**:
```bash
# 检查 Dockerfile
cat elizaos-container/Dockerfile

# 检查 package.json
cat elizaos-container/package.json

# 尝试清理并重新构建
docker system prune -a
cd elizaos-container
npm install --legacy-peer-deps
docker build -t elizaos-server:latest .
```

### 问题 4: API 调用失败

**症状**: 主应用无法调用容器 API

**解决方案**:
1. 验证容器 URL 是否正确：
   ```bash
   npx wrangler pages secret list
   ```

2. 检查容器是否运行：
   ```bash
   npx wrangler containers list
   curl ${CONTAINER_URL}/health
   ```

3. 检查 CORS 配置（容器已配置 CORS，无需额外配置）

### 问题 5: Secrets 未生效

**症状**: API 调用返回 "credentials not configured"

**解决方案**:
```bash
# 检查 Secrets 是否正确设置
npx wrangler secret list --container=elizaos-server

# 重启容器（Secrets 更改后需要重启）
npx wrangler containers restart elizaos-server
```

---

## 📊 容器管理命令

### 查看容器状态

```bash
npx wrangler containers list
npx wrangler containers status elizaos-server
```

### 查看容器日志

```bash
npx wrangler containers logs elizaos-server
npx wrangler containers logs elizaos-server --tail 100
```

### 重启容器

```bash
npx wrangler containers restart elizaos-server
```

### 删除容器

```bash
npx wrangler containers delete elizaos-server
```

### 更新容器

```bash
# 重新构建并推送镜像
cd elizaos-container
docker build -t elizaos-server:latest .
docker tag elizaos-server:latest ${DOCKER_USERNAME}/elizaos-server:latest
docker push ${DOCKER_USERNAME}/elizaos-server:latest

# 重新部署
npx wrangler containers deploy elizaos-server \
  --image ${DOCKER_USERNAME}/elizaos-server:latest \
  --port 3001
```

---

## 🔗 相关文档

- [Cloudflare Containers 官方文档](https://developers.cloudflare.com/containers/)
- [ElizaOS 文档](https://elizaos.github.io/)
- [Docker 文档](https://docs.docker.com/)
- [项目容器部署指南](./CONTAINER_DEPLOYMENT_STEPS.md)

---

## 💡 最佳实践

1. **使用自动化脚本**: 推荐使用 `deploy-elizaos-to-cloudflare.sh` 脚本，减少手动错误
2. **版本管理**: 使用标签管理镜像版本，例如 `elizaos-server:v1.0.0`
3. **环境分离**: 为开发、测试、生产环境使用不同的容器
4. **监控日志**: 定期查看容器日志，及时发现问题
5. **备份配置**: 记录所有 Secrets 的用途，但不要提交到代码仓库

---

**最后更新**: 2024-01-22
