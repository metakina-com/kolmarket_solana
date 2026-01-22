# 🚀 ElizaOS 容器部署 - 最终方案

## ✅ 当前状态

- ✅ Docker 镜像已构建: `elizaos-server:latest` (2.25GB)
- ✅ 镜像已推送到 Docker Hub: `dappweb/elizaos-server:latest`
- ✅ 所有准备工作已完成

## 📋 部署方式说明

根据当前 Cloudflare Wrangler CLI (v4.59.3) 的实际命令，**`wrangler containers deploy` 命令不存在**。

可用的容器命令：
- `wrangler containers build` - 构建镜像
- `wrangler containers push` - 推送镜像
- `wrangler containers list` - 列出容器
- `wrangler containers info` - 查看容器信息
- `wrangler containers delete` - 删除容器

## 🎯 推荐部署方式：通过 Cloudflare Dashboard

由于 CLI 中没有直接的 `deploy` 命令，**推荐通过 Dashboard 部署**：

### 步骤 1: 访问 Dashboard
```
https://dash.cloudflare.com/
→ Workers & Pages
→ Containers
→ Create Container
```

### 步骤 2: 配置容器
- **名称**: `elizaos-server`
- **镜像**: `dappweb/elizaos-server:latest` (Docker Hub)
- **端口**: `3001`

### 步骤 3: 部署并获取 URL
部署完成后，记下容器 URL，例如: `https://elizaos-server.xxx.workers.dev`

### 步骤 4: 配置主应用
```bash
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入容器 URL
```

## 🔄 或者：使用 CLI 推送镜像后通过 Dashboard 部署

```bash
# 1. 推送镜像到 Cloudflare Registry
cd /home/zyj_dev/Documents/kolmarket_solana
npx wrangler containers push elizaos-server:latest

# 2. 检查镜像
npx wrangler containers images list

# 3. 通过 Dashboard 创建容器，使用 Cloudflare Registry 中的镜像
```

## 📚 详细文档

- **Dashboard 部署指南**: `DASHBOARD_DEPLOY_GUIDE.md`
- **完整部署文档**: `docs/DEPLOY_ELIZAOS_CLOUDFLARE.md`
- **下一步操作**: `NEXT_STEPS.md`

---

**注意**: 如果您的 Cloudflare 账户支持通过 CLI 直接部署容器，请查看最新的 Cloudflare Containers 文档。
