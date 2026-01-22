# 🚀 Cloudflare Containers 部署步骤

**当前状态**: ✅ 镜像已构建，正在推送到 Cloudflare Registry

---

## ✅ 已完成步骤

1. ✅ Docker 环境检查通过
2. ✅ Cloudflare 登录验证通过
3. ✅ Docker 镜像构建成功 (`elizaos-server:latest`, 2.25GB)
4. 🔄 镜像正在推送到 Cloudflare Registry（可能需要几分钟）

---

## 📋 下一步：通过 Dashboard 部署

### 步骤 1: 等待镜像推送完成

镜像推送可能需要 5-10 分钟（取决于网络速度）。您可以通过以下命令检查：

```bash
npx wrangler containers images list
```

如果看到 `elizaos-server:latest`，说明推送完成。

### 步骤 2: 访问 Cloudflare Dashboard

1. 打开浏览器，访问: https://dash.cloudflare.com/
2. 选择账户: **达普韦伯** (Account ID: acb6471710adbd7e73a05cc665a6fb94)
3. 进入: **Workers & Pages** → **Containers**
4. 点击 **"Create Container"** 或 **"Deploy Container"**

### 步骤 3: 配置容器

填写以下信息：

- **容器名称**: `elizaos-server`
- **镜像来源**: 
  - 选择 **"Cloudflare Registry"**
  - 镜像名称: `elizaos-server:latest`
  - 或者选择 **"Docker Hub"**，使用: `dappweb/elizaos-server:latest` (如果已推送)
- **端口**: `3001`
- **区域**: `Earth` (全局部署)
- **环境**: `production`

### 步骤 4: 配置环境变量

在容器设置中添加：

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### 步骤 5: 配置 Secrets（可选）

根据您需要的功能，添加以下 Secrets：

**Twitter API** (Avatar 模块):
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

**Discord Bot** (Mod 模块):
- `DISCORD_BOT_TOKEN`

**Telegram Bot** (Mod 模块):
- `TELEGRAM_BOT_TOKEN`

**Solana** (Trader 模块):
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

## 🔄 如果镜像推送未完成

如果 Cloudflare Registry 中还没有镜像，您可以：

### 选项 A: 等待推送完成

继续等待，然后使用 Cloudflare Registry 中的镜像。

### 选项 B: 推送到 Docker Hub

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag elizaos-server:latest your-username/elizaos-server:latest

# 推送镜像
docker push your-username/elizaos-server:latest

# 然后在 Dashboard 中使用 Docker Hub 镜像
```

### 选项 C: 使用已存在的镜像

如果之前已经推送过镜像到 Docker Hub，可以直接使用:
- `dappweb/elizaos-server:latest`

---

## ✅ 部署验证清单

部署完成后，请验证：

- [ ] 容器健康检查通过: `curl https://elizaos-server.xxx.workers.dev/health`
- [ ] 容器 URL 已配置到 Pages: `ELIZAOS_CONTAINER_URL`
- [ ] 主应用可以调用容器 API
- [ ] 相关 Secrets 已配置（如果需要）

---

## 🎉 完成后的功能

部署成功后，以下功能将自动启用：

- ✅ **Avatar 模块**: Twitter 自动发推、互动
- ✅ **Mod 模块**: Discord/Telegram 机器人
- ✅ **Trader 模块**: Solana 链上交易、跟单

所有功能将自动从降级模式切换到完整功能模式！

---

## 📚 相关文档

- [快速部署指南](./docs/DEPLOY_CONTAINERS_NOW.md)
- [容器方案对比](./docs/CONTAINER_SOLUTIONS.md)
- [完整部署指南](./docs/CONTAINERS_DEPLOYMENT.md)

---

**最后更新**: 2024-01-22
