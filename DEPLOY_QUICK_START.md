# 🚀 ElizaOS 部署到 Cloudflare 容器 - 快速开始

## 一键部署

```bash
# 运行部署脚本
./scripts/deploy-elizaos-to-cloudflare.sh
```

脚本会自动完成所有步骤！

---

## 手动部署（5 步）

### 1️⃣ 准备环境

```bash
docker login
npx wrangler login
```

### 2️⃣ 构建并推送镜像

```bash
cd elizaos-container
npm install --legacy-peer-deps
docker build -t elizaos-server:latest .
docker tag elizaos-server:latest YOUR_USERNAME/elizaos-server:latest
docker push YOUR_USERNAME/elizaos-server:latest
cd ..
```

### 3️⃣ 部署到 Cloudflare

```bash
npx wrangler containers deploy elizaos-server \
  --image YOUR_USERNAME/elizaos-server:latest \
  --port 3001
```

### 4️⃣ 获取容器 URL

```bash
npx wrangler containers list
# 记下 URL，例如: https://elizaos-server.xxx.workers.dev
```

### 5️⃣ 配置主应用

```bash
# 设置容器 URL
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入容器 URL
```

---

## ✅ 验证

```bash
# 测试健康检查
curl https://elizaos-server.xxx.workers.dev/health
```

---

## 📚 详细文档

查看完整文档: [docs/DEPLOY_ELIZAOS_CLOUDFLARE.md](./docs/DEPLOY_ELIZAOS_CLOUDFLARE.md)

---

## ⚠️ 重要提示

1. **需要 Cloudflare 付费计划**（Containers 功能需要）
2. **需要 Docker Hub 账户**（用于推送镜像）
3. **Secrets 配置**（可选，根据功能需求配置）
