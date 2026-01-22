# 🔧 Railway 端口配置修复

**问题**: 服务运行在 8080 端口，但健康检查返回 502  
**原因**: Railway 自动分配了端口，需要配置环境变量

---

## 🚀 立即修复步骤

### 步骤 1: 配置环境变量

在 Railway Dashboard 中：

1. 进入服务 `kolmarket_solana`
2. 点击 **"Variables"** 标签
3. 添加以下变量：

**必需配置**:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

> 💡 **重要**: Railway 会自动分配端口，但我们需要确保应用监听正确的端口。设置 `PORT=3001` 后，Railway 会重新部署。

### 步骤 2: 等待重新部署

添加环境变量后，Railway 会自动重新部署服务。等待 2-3 分钟。

### 步骤 3: 测试健康检查

部署完成后：

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

---

## 📋 当前状态分析

从部署日志可以看到：

- ✅ **服务运行**: `ElizaOS Container running on 0.0.0.0:8080`
- ⚠️ **端口**: Railway 自动分配了 8080 端口
- ⚠️ **健康检查**: 返回 502（可能端口不匹配或服务还在启动）

---

## 🔍 端口说明

### Railway 端口机制

Railway 会自动：
1. 分配一个端口给服务
2. 通过环境变量 `PORT` 传递给应用
3. 将外部请求路由到该端口

### 应用配置

代码中：
```javascript
const port = process.env.PORT || 3001;
```

这意味着：
- 如果设置了 `PORT` 环境变量，使用该端口
- 否则使用默认端口 3001

### 解决方案

设置 `PORT=3001` 环境变量，让应用明确使用 3001 端口。

---

## ✅ 配置完成后的验证

1. **检查环境变量**
   - 在 Railway Dashboard → Variables 中确认
   - `PORT=3001` 已设置

2. **等待重新部署**
   - 查看 Deployments 标签
   - 等待新部署完成

3. **测试健康检查**
   ```bash
   curl https://kolmarketsolana-production.up.railway.app/health
   ```

4. **查看日志**
   - 在 Railway Dashboard 中查看最新日志
   - 确认服务运行在正确端口

---

## 🎯 完整环境变量配置

除了端口配置，还可以添加其他变量：

**基础配置**（必需）:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

**可选配置**（如果需要插件功能）:
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

---

## 📝 注意事项

1. **Railway 自动端口**: Railway 可能会自动分配端口，但设置 `PORT` 环境变量可以确保一致性。

2. **重新部署**: 添加环境变量后，Railway 会自动重新部署服务。

3. **等待时间**: 重新部署通常需要 2-3 分钟。

4. **健康检查**: 如果仍然返回 502，等待几分钟后重试（服务可能还在启动）。

---

**最后更新**: 2024-01-22
