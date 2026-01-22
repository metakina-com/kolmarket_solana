# 🚂 Railway 快速部署指南

**预计时间**: 5-10 分钟  
**难度**: ⭐ 非常简单

---

## 🎯 快速开始（3 步）

### 步骤 1: 注册 Railway 账户

1. 访问: https://railway.app/
2. 点击 **"Login"** → **"Login with GitHub"**
3. 授权 Railway 访问您的 GitHub

### 步骤 2: 部署项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择仓库: `metakina-com/kolmarket_solana`
4. 选择目录: `elizaos-container`
5. Railway 会自动检测 Dockerfile 并开始部署

### 步骤 3: 配置环境变量

在 Railway Dashboard 中：

1. 进入服务设置
2. 点击 **"Variables"** 标签
3. 添加以下变量：

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

4. 点击 **"Add"** 保存

### 步骤 4: 获取 URL 并配置

部署完成后：

1. Railway 会提供一个 URL，例如: `https://elizaos-server-production.up.railway.app`
2. 配置到 Cloudflare Pages:

```bash
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
# 输入 Railway 提供的 URL
```

3. 测试:

```bash
curl https://elizaos-server-production.up.railway.app/health
```

---

## ✅ 完成！

就这么简单！您的容器已经部署完成。

---

## 🔧 使用 CLI 部署（可选）

如果您喜欢使用命令行：

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 进入容器目录
cd elizaos-container

# 4. 初始化项目
railway init

# 5. 部署
railway up

# 6. 获取 URL
railway domain
```

或使用自动化脚本：

```bash
./scripts/deploy-to-railway.sh
```

---

## 📋 可选配置

### 添加 Twitter API（Avatar 模块）

在 Railway Dashboard 的 Variables 中添加：

```
TWITTER_API_KEY=your-key
TWITTER_API_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_TOKEN_SECRET=your-token-secret
```

### 添加 Discord Bot（Mod 模块）

```
DISCORD_BOT_TOKEN=your-token
```

### 添加 Telegram Bot（Mod 模块）

```
TELEGRAM_BOT_TOKEN=your-token
```

### 添加 Solana（Trader 模块）

```
SOLANA_PRIVATE_KEY=your-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 📚 详细文档

- [完整 Railway 部署指南](./docs/RAILWAY_DEPLOY.md)
- [Railway 官方文档](https://docs.railway.app/)

---

**最后更新**: 2024-01-22
