# 🚂 Railway 部署指南 - Cloudflare Containers 替代方案

**推荐度**: ⭐⭐⭐⭐⭐  
**部署时间**: 5-10 分钟  
**成本**: 免费试用 $5/月，超出后按量付费

---

## ✅ 为什么选择 Railway

1. **简单快速** - 5 分钟即可部署
2. **免费试用** - $5 免费额度/月
3. **自动部署** - GitHub 集成，自动构建和部署
4. **完整功能** - 支持所有 Node.js 功能和原生模块
5. **全球 CDN** - 自动 HTTPS 和域名

---

## 📋 前置要求

- ✅ Docker 镜像已构建（已完成）
- ✅ GitHub 账户
- ✅ Railway 账户（免费注册）

---

## 🚀 方式 1: 通过 Railway Dashboard 部署（推荐）

### 步骤 1: 注册 Railway 账户

1. 访问: https://railway.app/
2. 点击 **"Login"** 或 **"Sign Up"**
3. 选择 **"Login with GitHub"**（推荐，方便后续集成）

### 步骤 2: 创建新项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权 Railway 访问您的 GitHub
4. 选择仓库: `metakina-com/kolmarket_solana`
5. 选择要部署的目录: `elizaos-container`

### 步骤 3: 配置部署

1. Railway 会自动检测 Dockerfile
2. 设置服务名称: `elizaos-server`
3. 配置端口: `3001`（Railway 会自动映射）

### 步骤 4: 配置环境变量

在 Railway Dashboard 中，进入服务设置，添加环境变量：

**基础配置**:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

**Twitter API** (可选，Avatar 模块需要):
```
TWITTER_API_KEY=your-key
TWITTER_API_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_TOKEN_SECRET=your-token-secret
```

**Discord Bot** (可选，Mod 模块需要):
```
DISCORD_BOT_TOKEN=your-token
```

**Telegram Bot** (可选，Mod 模块需要):
```
TELEGRAM_BOT_TOKEN=your-token
```

**Solana** (可选，Trader 模块需要):
```
SOLANA_PRIVATE_KEY=your-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 步骤 5: 部署

1. Railway 会自动开始构建和部署
2. 等待部署完成（通常 3-5 分钟）
3. 部署完成后，Railway 会提供一个 URL，例如: `https://elizaos-server-production.up.railway.app`

### 步骤 6: 配置主应用

```bash
# 设置容器 URL 到 Cloudflare Pages
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入: https://elizaos-server-production.up.railway.app
```

### 步骤 7: 测试

```bash
# 测试健康检查
curl https://elizaos-server-production.up.railway.app/health

# 应该返回:
# {"status":"ok","timestamp":"...","agents":0}
```

---

## 🚀 方式 2: 使用 Railway CLI 部署

### 步骤 1: 安装 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 或使用 curl
curl -fsSL https://railway.app/install.sh | sh
```

### 步骤 2: 登录 Railway

```bash
railway login
```

### 步骤 3: 初始化项目

```bash
cd elizaos-container
railway init
```

### 步骤 4: 链接到现有项目或创建新项目

```bash
# 创建新项目
railway up

# 或链接到现有项目
railway link
```

### 步骤 5: 配置环境变量

```bash
# 设置环境变量
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set HOST=0.0.0.0

# 设置 Secrets（可选）
railway variables set TWITTER_API_KEY=your-key
railway variables set TWITTER_API_SECRET=your-secret
# ... 其他变量
```

### 步骤 6: 部署

```bash
# 部署到 Railway
railway up
```

### 步骤 7: 获取 URL

```bash
# 获取服务 URL
railway domain

# 或查看服务信息
railway status
```

---

## 🔧 方式 3: 使用 Docker 镜像直接部署

如果您已经构建了 Docker 镜像，可以直接推送并部署：

### 步骤 1: 登录 Railway

```bash
railway login
```

### 步骤 2: 创建新服务

```bash
railway init
```

### 步骤 3: 配置 Docker 镜像

在 Railway Dashboard 中：
1. 进入服务设置
2. 选择 **"Settings"** → **"Source"**
3. 选择 **"Docker Hub"** 或 **"Container Registry"**
4. 输入镜像名称: `your-username/elizaos-server:latest`

### 步骤 4: 部署

Railway 会自动拉取镜像并部署。

---

## 📝 创建 railway.json 配置文件（可选）

在 `elizaos-container` 目录创建 `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔐 环境变量管理

### 在 Dashboard 中设置

1. 进入服务设置
2. 点击 **"Variables"** 标签
3. 添加环境变量
4. 点击 **"Add"** 保存

### 使用 CLI 设置

```bash
# 设置单个变量
railway variables set KEY=value

# 从文件导入
railway variables set < .env

# 查看所有变量
railway variables
```

---

## 🌐 自定义域名（可选）

### 步骤 1: 添加自定义域名

1. 在 Railway Dashboard 中，进入服务设置
2. 点击 **"Settings"** → **"Domains"**
3. 点击 **"Generate Domain"** 或 **"Custom Domain"**
4. 输入域名，例如: `elizaos.yourdomain.com`

### 步骤 2: 配置 DNS

按照 Railway 提供的 DNS 记录配置您的域名。

---

## 📊 监控和日志

### 查看日志

```bash
# 使用 CLI
railway logs

# 在 Dashboard 中
# 进入服务 → "Deployments" → 选择部署 → "View Logs"
```

### 查看指标

在 Dashboard 中：
- **Metrics** - CPU、内存使用情况
- **Deployments** - 部署历史
- **Logs** - 实时日志

---

## 🔄 自动部署（GitHub 集成）

### 启用自动部署

1. 在 Railway Dashboard 中，进入项目设置
2. 选择 **"Settings"** → **"Source"**
3. 确保 **"Auto Deploy"** 已启用
4. 选择分支: `main`

### 工作流程

- 每次推送到 `main` 分支，Railway 会自动：
  1. 检测更改
  2. 构建 Docker 镜像
  3. 部署新版本

---

## 💰 成本估算

### 免费计划

- **免费额度**: $5/月
- **适合**: 小规模使用、测试

### 付费计划

- **按使用量计费**
- **预计成本**: $5-20/月（取决于使用量）

---

## ✅ 部署验证清单

部署完成后，请验证：

- [ ] 服务健康检查通过: `curl https://your-service.railway.app/health`
- [ ] 环境变量已正确配置
- [ ] 容器 URL 已配置到 Cloudflare Pages
- [ ] 主应用可以调用容器 API
- [ ] 日志正常，无错误

---

## 🧪 测试容器功能

### 测试健康检查

```bash
curl https://elizaos-server-production.up.railway.app/health
```

### 测试 Twitter API（如果配置了）

```bash
curl -X POST https://elizaos-server-production.up.railway.app/api/twitter/post \
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

### 部署失败

1. **检查 Dockerfile**: 确保 Dockerfile 正确
2. **查看日志**: `railway logs` 或 Dashboard 日志
3. **检查环境变量**: 确保所有必需变量已设置

### 服务无法访问

1. **检查端口**: 确保服务监听 `0.0.0.0:3001`
2. **检查健康检查**: 确保 `/health` 端点正常
3. **查看日志**: 检查是否有错误

### 环境变量未生效

1. **重新部署**: 修改环境变量后需要重新部署
2. **检查格式**: 确保变量名和值格式正确
3. **查看日志**: 确认变量是否正确加载

---

## 🎉 完成后的功能

部署成功后，以下功能将自动启用：

- ✅ **Avatar 模块**: Twitter 自动发推、互动
- ✅ **Mod 模块**: Discord/Telegram 机器人
- ✅ **Trader 模块**: Solana 链上交易、跟单

所有功能将自动从降级模式切换到完整功能模式！

---

## 📚 相关资源

- [Railway 文档](https://docs.railway.app/)
- [Railway CLI 文档](https://docs.railway.app/develop/cli)
- [Railway 定价](https://railway.app/pricing)

---

## 🔄 从 Railway 迁移到 Cloudflare Containers

如果将来想迁移到 Cloudflare Containers：

1. 在 Cloudflare Dashboard 中创建容器
2. 使用相同的 Docker 镜像
3. 更新 `ELIZAOS_CONTAINER_URL` 环境变量
4. 无需修改代码

---

**最后更新**: 2024-01-22  
**推荐**: ⭐⭐⭐⭐⭐ 最简单快速的部署方式
