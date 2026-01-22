# 🎯 Cloudflare Containers Dashboard 部署指南

## 📍 当前页面

您当前在 **Containers** 页面，这个页面主要用于查看和管理已部署的容器。

## ✅ 正确的部署方式

Cloudflare Containers 需要通过 **Workers** 来部署，而不是直接在 Containers 页面创建。

---

## 🚀 方式 1: 通过 Workers 页面部署（推荐）

### 步骤 1: 进入 Workers 页面

1. 在左侧边栏，找到 **"Workers 和 Pages"** (Workers & Pages)
2. 点击进入
3. 选择 **"Workers"** 标签页
4. 点击 **"创建 Worker"** (Create Worker) 或 **"创建"** (Create)

### 步骤 2: 创建 Worker 项目

1. 选择 **"从头开始创建"** (Create from scratch) 或使用模板
2. 项目名称: `elizaos-container-worker`
3. 点击 **"创建"** (Create)

### 步骤 3: 配置 Worker 使用容器

在 Worker 代码中，您需要：

1. 在 `wrangler.toml` 中配置容器（见下方）
2. 在 Worker 代码中路由请求到容器

---

## 🚀 方式 2: 使用 CLI 部署（更简单）

由于 Dashboard 界面可能比较复杂，**推荐使用 CLI 方式**：

### 步骤 1: 创建 Worker 配置文件

在项目根目录创建 `worker-container` 目录：

```bash
mkdir -p worker-container
cd worker-container
```

### 步骤 2: 创建 `wrangler.toml`

```toml
name = "elizaos-container-worker"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[containers]]
class_name = "ElizaOSContainer"
image = "registry.cloudflare.com/acb6471710adbd7e73a05cc665a6fb94/elizaos-server:latest"
port = 3001
```

### 步骤 3: 创建 Worker 代码 `src/index.ts`

```typescript
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // 路由所有请求到容器
    const container = env.ElizaOSContainer;
    return container.fetch(request);
  }
};
```

### 步骤 4: 部署

```bash
npx wrangler deploy
```

---

## 🚀 方式 3: 使用已构建的镜像（最简单）

### 步骤 1: 检查镜像是否可用

```bash
# 检查 Cloudflare Registry 中的镜像
npx wrangler containers images list
```

### 步骤 2: 如果镜像可用，创建 Worker 项目

```bash
# 在项目根目录
mkdir -p worker-container
cd worker-container

# 初始化 Worker 项目
npm create cloudflare@latest -- --template=cloudflare/templates/containers-template
```

### 步骤 3: 配置容器

编辑生成的 `wrangler.toml`，添加容器配置：

```toml
[[containers]]
class_name = "ElizaOSContainer"
image = "elizaos-server:latest"  # 或完整路径
port = 3001
```

### 步骤 4: 部署

```bash
npx wrangler deploy
```

---

## 📋 快速部署脚本

我已经为您准备了快速部署脚本。执行以下命令：

```bash
cd /home/zyj_dev/Documents/kolmarket_solana
./scripts/deploy-containers.sh
```

或者手动执行：

```bash
# 1. 创建 Worker 项目目录
mkdir -p worker-container
cd worker-container

# 2. 创建 wrangler.toml
cat > wrangler.toml << 'EOF'
name = "elizaos-container-worker"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[containers]]
class_name = "ElizaOSContainer"
image = "registry.cloudflare.com/acb6471710adbd7e73a05cc665a6fb94/elizaos-server:latest"
port = 3001
EOF

# 3. 创建 Worker 代码
mkdir -p src
cat > src/index.ts << 'EOF'
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const container = env.ElizaOSContainer;
    return container.fetch(request);
  }
};
EOF

# 4. 部署
npx wrangler deploy
```

---

## 🔍 如果找不到创建按钮

如果 Dashboard 中没有明显的创建按钮，可以：

1. **使用 CLI 方式**（推荐）- 如上所示
2. **检查权限** - 确保账户有 Containers 权限
3. **查看 Workers 页面** - 容器是通过 Workers 部署的

---

## ✅ 部署后

部署成功后：

1. 获取 Worker URL，例如: `https://elizaos-container-worker.xxx.workers.dev`
2. 配置主应用:
   ```bash
   npx wrangler pages secret put ELIZAOS_CONTAINER_URL
   # 输入: https://elizaos-container-worker.xxx.workers.dev
   ```
3. 测试:
   ```bash
   curl https://elizaos-container-worker.xxx.workers.dev/health
   ```

---

**推荐**: 使用 **方式 2 (CLI)** 或 **快速部署脚本**，最简单直接！
