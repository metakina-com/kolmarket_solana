# 🚂 Railway 部署 - 使用 API Key

**API Key**: `ae75194a-44e2-44b4-93dd-16c7351cf7e8`

---

## 🔐 方式 1: 使用 API Key 通过 Dashboard 部署（推荐）

Railway API Key 主要用于 API 调用。**最简单的方式是通过 Dashboard 部署**：

### 步骤 1: 登录 Railway Dashboard

1. 访问: https://railway.app/
2. 使用您的账户登录（API Key 对应的账户）

### 步骤 2: 创建新项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权 Railway 访问 GitHub（如果还没授权）
4. 选择仓库: `metakina-com/kolmarket_solana`
5. 选择目录: `elizaos-container`

### 步骤 3: 配置部署

Railway 会自动：
- 检测 Dockerfile
- 开始构建和部署

### 步骤 4: 配置环境变量

在服务设置中添加：

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### 步骤 5: 获取 URL

部署完成后，Railway 会提供 URL，例如:
`https://elizaos-server-production.up.railway.app`

---

## 🔧 方式 2: 使用 CLI 和 API Key

### 步骤 1: 设置环境变量

```bash
export RAILWAY_TOKEN=ae75194a-44e2-44b4-93dd-16c7351cf7e8
```

### 步骤 2: 初始化项目

```bash
cd elizaos-container
npx @railway/cli init
```

### 步骤 3: 部署

```bash
npx @railway/cli up
```

---

## 🌐 方式 3: 使用 Railway API 直接部署

如果您想通过 API 直接部署，可以使用 Railway REST API：

### 创建项目

```bash
curl -X POST https://api.railway.app/v1/projects \
  -H "Authorization: Bearer ae75194a-44e2-44b4-93dd-16c7351cf7e8" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "elizaos-server"
  }'
```

但这种方式比较复杂，**推荐使用 Dashboard 方式**。

---

## 📋 快速部署脚本（使用 API Key）

我已经更新了部署脚本，支持使用 API Key：

```bash
# 设置 API Key
export RAILWAY_TOKEN=ae75194a-44e2-44b4-93dd-16c7351cf7e8

# 运行部署脚本
./scripts/deploy-to-railway.sh
```

---

## ✅ 推荐流程

**最简单的方式**:

1. 访问 https://railway.app/
2. 登录您的账户
3. 创建新项目
4. 选择 GitHub 仓库
5. 选择 `elizaos-container` 目录
6. 等待部署完成
7. 配置环境变量
8. 获取 URL 并配置到 Cloudflare Pages

---

## 🔍 如果 API Key 验证失败

可能的原因：

1. **API Key 已过期** - 需要在 Dashboard 中生成新的
2. **权限不足** - 需要检查 API Key 权限
3. **格式问题** - 确保没有多余空格

**解决方法**:

1. 访问 Railway Dashboard
2. 进入 **Settings** → **Tokens**
3. 生成新的 API Key
4. 或直接使用 Dashboard 部署（不需要 API Key）

---

## 📚 相关文档

- [Railway 快速开始](./RAILWAY_QUICK_START.md)
- [完整 Railway 部署指南](./docs/RAILWAY_DEPLOY.md)

---

**最后更新**: 2024-01-22
