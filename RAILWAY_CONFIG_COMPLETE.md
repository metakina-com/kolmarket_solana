# ✅ Railway 配置完成指南

**服务名称**: `kolmarket_solana`  
**服务 URL**: `https://kolmarketsolana-production.up.railway.app`

---

## 📋 当前配置状态

从 Railway Dashboard 可以看到：

- ✅ **Restart Policy**: "Always" - 容器退出时自动重启
- ✅ **Config-as-code**: `/elizaos-container/railway.json` - 配置文件已设置
- ⚠️ **2 Changes 待应用** - 需要部署更改

---

## 🚀 立即操作步骤

### 步骤 1: 应用并部署更改

在 Railway Dashboard 中：

1. 点击顶部的 **"Apply 2 changes"** 或 **"Deploy ↑+Enter"** 按钮
2. 等待部署完成（通常 2-5 分钟）
3. 查看部署状态，确认成功

### 步骤 2: 配置环境变量

在 Railway Dashboard 中：

1. 进入服务 `kolmarket_solana`
2. 点击 **"Variables"** 标签
3. 添加以下变量：

**基础配置**（必需）:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

**可选配置**（根据功能需求）:
```
TWITTER_API_KEY=your-key
TWITTER_API_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_TOKEN_SECRET=your-token-secret
DISCORD_BOT_TOKEN=your-token
TELEGRAM_BOT_TOKEN=your-token
SOLANA_PRIVATE_KEY=your-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 步骤 3: 测试服务

部署完成后，测试健康检查：

```bash
curl https://kolmarketsolana-production.up.railway.app/health
```

**预期响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T...",
  "agents": 0
}
```

### 步骤 4: 配置到 Cloudflare Pages

```bash
# 设置容器 URL 到 Cloudflare Pages
npx wrangler pages secret put ELIZAOS_CONTAINER_URL

# 输入: https://kolmarketsolana-production.up.railway.app
```

### 步骤 5: 验证集成

```bash
# 测试主应用是否可以调用容器
curl -X POST https://your-app.pages.dev/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文",
    "kolName": "Test KOL"
  }'
```

---

## 📝 Railway.json 配置说明

当前配置文件 (`elizaos-container/railway.json`):

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
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**配置说明**:
- ✅ 使用 Dockerfile 构建
- ✅ 启动命令: `node index.js`
- ✅ 失败时自动重启（最多 10 次）
- ✅ 健康检查路径: `/health`
- ✅ 健康检查超时: 100 秒

---

## 🔍 检查部署状态

### 在 Railway Dashboard 中

1. 进入服务页面
2. 点击 **"Deployments"** 标签
3. 查看最新的部署状态
4. 如果显示 "Active" 或 "Live"，说明部署成功

### 查看日志

1. 在服务页面，点击 **"Deployments"**
2. 选择最新的部署
3. 查看构建和运行日志
4. 确认没有错误

---

## ⚙️ Restart Policy 说明

当前设置为 **"Always"**，这意味着：

- ✅ 容器退出时自动重启
- ✅ 确保服务持续运行
- ✅ 适合生产环境

如果需要修改，可以在 Settings → Restart Policy 中更改。

---

## 🎉 配置完成后的功能

一旦配置完成并部署成功，以下功能将自动启用：

- ✅ **Avatar 模块**: Twitter 自动发推、互动
- ✅ **Mod 模块**: Discord/Telegram 机器人
- ✅ **Trader 模块**: Solana 链上交易、跟单

所有功能将自动从降级模式切换到完整功能模式！

---

## 📝 快速检查清单

- [x] Railway 服务已创建
- [x] 服务 URL 已获取
- [x] railway.json 配置文件已设置
- [x] Restart Policy 已配置为 "Always"
- [ ] 应用并部署 2 个待应用的更改
- [ ] 配置基础环境变量（NODE_ENV, PORT, HOST）
- [ ] 测试健康检查端点
- [ ] 设置 `ELIZAOS_CONTAINER_URL` 到 Cloudflare Pages
- [ ] 测试主应用集成
- [ ] 验证所有功能正常

---

## 🔗 相关链接

- Railway Dashboard: https://railway.app/
- 服务 URL: https://kolmarketsolana-production.up.railway.app
- [Railway 部署指南](./docs/RAILWAY_DEPLOY.md)

---

**最后更新**: 2024-01-22
