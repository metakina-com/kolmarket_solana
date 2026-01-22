# 🔄 切换 Cloudflare 账号部署指南

## ✅ 账号切换完成

已成功切换到新的 Cloudflare 账号。

---

## 📋 当前账号信息

运行以下命令查看当前账号信息：

```bash
npx wrangler whoami
```

---

## 🚀 继续部署流程

### 步骤 1: 验证账号权限

确保新账号有 Containers 权限：

```bash
npx wrangler whoami
```

检查是否包含 `containers (write)` 权限。

### 步骤 2: 检查 Containers 功能

```bash
npx wrangler containers list
```

### 步骤 3: 推送镜像到新账号的 Registry

```bash
# 推送镜像到新账号的 Cloudflare Registry
npx wrangler containers push elizaos-server:latest
```

### 步骤 4: 部署容器

**方式 A: 通过 Dashboard（推荐）**

1. 访问: https://dash.cloudflare.com/
2. 进入: Workers & Pages → Containers
3. 创建容器:
   - 名称: `elizaos-server`
   - 镜像: `dappweb/elizaos-server:latest` (Docker Hub)
   - 或使用 Cloudflare Registry 中的镜像
   - 端口: `3001`

**方式 B: 使用 wrangler deploy**

如果使用 Worker 项目：

1. 配置 `wrangler.toml`:
   ```toml
   [[containers]]
   class_name = "ElizaOSContainer"
   image = "./elizaos-container/Dockerfile"
   ```

2. 部署:
   ```bash
   npx wrangler deploy
   ```

---

## ⚠️ 重要提示

1. **账号权限**: 确保新账号有 Containers 功能权限（需要付费计划）
2. **镜像推送**: 如果使用 Cloudflare Registry，需要重新推送镜像
3. **环境变量**: 需要在新账号中重新配置所有 Secrets
4. **数据库绑定**: 如果使用 D1 数据库，需要在新账号中创建或绑定

---

## 🔑 配置 Secrets（新账号）

部署完成后，在新账号中配置 Secrets：

```bash
# 容器 Secrets
npx wrangler secret put TWITTER_API_KEY --container=elizaos-server
npx wrangler secret put TWITTER_API_SECRET --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN --container=elizaos-server
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET --container=elizaos-server
npx wrangler secret put DISCORD_BOT_TOKEN --container=elizaos-server
npx wrangler secret put TELEGRAM_BOT_TOKEN --container=elizaos-server
npx wrangler secret put SOLANA_PRIVATE_KEY --container=elizaos-server
npx wrangler secret put SOLANA_RPC_URL --container=elizaos-server

# 主应用 Secrets
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
```

---

## 📚 相关文档

- [部署指南](./docs/DEPLOY_ELIZAOS_CLOUDFLARE.md)
- [Dashboard 部署](./DASHBOARD_DEPLOY_GUIDE.md)
- [Cloudflare Docker 部署](./CLOUDFLARE_DOCKER_DEPLOY.md)

---

**账号切换完成！可以开始在新账号中部署了！** 🚀
