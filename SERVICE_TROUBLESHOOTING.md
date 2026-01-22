# 🔧 服务故障排查指南

**当前状态**: 服务返回 502 错误  
**服务 URL**: `https://kolmarketsolana-production.up.railway.app`

---

## 🔍 问题诊断

### 当前问题

健康检查返回:
```json
{
  "status": "error",
  "code": 502,
  "message": "Application failed to respond"
}
```

**502 错误含义**: 网关无法从上游服务器获取有效响应

---

## 🚀 排查步骤

### 步骤 1: 检查 Railway 部署状态

在 Railway Dashboard 中：

1. **访问**: https://railway.app/
2. **进入服务**: `kolmarket_solana`
3. **查看部署状态**:
   - 点击 **"Deployments"** 标签
   - 查看最新部署的状态

**状态说明**:
- **"Building"** → 正在构建，等待完成
- **"Deploying"** → 正在部署，等待完成
- **"Active"** 或 **"Live"** → 部署成功，继续检查
- **"Failed"** → 部署失败，查看错误日志

### 步骤 2: 查看部署日志

1. 在 Railway Dashboard 中
2. 进入服务 → **"Deployments"**
3. 点击最新的部署
4. 查看 **"Deploy Logs"** 或 **"Build Logs"**

**检查要点**:
- ✅ 容器是否启动成功
- ✅ 服务是否运行在正确端口
- ✅ 是否有错误信息
- ✅ 所有插件状态如何

**正常日志应该显示**:
```
🚀 ElizaOS Container running on 0.0.0.0:3001
📊 Environment: production
🔌 Plugins available:
   - Twitter: ✅
   - Discord: ✅
   - Telegram: ✅
   - Solana: ✅
```

### 步骤 3: 检查环境变量

在 Railway Dashboard → Variables 中确认：

**必需变量**:
- ✅ `NODE_ENV=production`
- ✅ `PORT=3001`
- ✅ `HOST=0.0.0.0`

**插件变量**（如果已配置）:
- ✅ `TWITTER_API_KEY=***`
- ✅ `DISCORD_BOT_TOKEN=***`
- ✅ `TELEGRAM_BOT_TOKEN=***`
- ✅ `SOLANA_PRIVATE_KEY=***`

### 步骤 4: 检查端口配置

**问题**: 日志显示服务运行在 `8080`，但代码期望 `3001`

**解决**:
1. 在 Railway Dashboard → Variables 中
2. 确保设置了 `PORT=3001`
3. 确保设置了 `HOST=0.0.0.0`
4. 等待自动重新部署

### 步骤 5: 查看实时日志

在 Railway Dashboard 中：

1. 进入服务 → **"Deployments"**
2. 点击最新的部署
3. 查看 **"HTTP Logs"** 或实时日志
4. 检查是否有错误信息

---

## 🔧 常见问题解决

### 问题 1: 服务一直在重新部署

**原因**: 环境变量配置错误或服务崩溃

**解决**:
1. 检查环境变量格式是否正确
2. 检查是否有语法错误
3. 查看错误日志

### 问题 2: 端口不匹配

**原因**: Railway 自动分配了端口，但应用使用默认端口

**解决**:
1. 在 Variables 中设置 `PORT=3001`
2. 确保 `HOST=0.0.0.0`
3. 等待重新部署

### 问题 3: 服务启动失败

**原因**: 代码错误、依赖问题或配置错误

**解决**:
1. 查看部署日志中的错误信息
2. 检查 Dockerfile 是否正确
3. 检查代码是否有错误

### 问题 4: 插件初始化失败

**原因**: API Keys 无效或格式错误

**解决**:
1. 检查 API Keys 是否正确
2. 检查格式（是否有多余空格）
3. 确认 API Keys 未过期

---

## 🧪 使用诊断脚本

运行诊断脚本检查服务状态：

```bash
./scripts/diagnose-service.sh
```

脚本会检查：
- ✅ 基本连接
- ✅ 健康检查
- ✅ 各个 API 端点

---

## 📋 检查清单

- [ ] Railway 部署状态检查
- [ ] 部署日志检查
- [ ] 环境变量检查
- [ ] 端口配置检查
- [ ] 实时日志检查
- [ ] 诊断脚本运行

---

## 🎯 下一步操作

### 如果部署状态是 "Building" 或 "Deploying"

**操作**: 等待部署完成（通常 2-5 分钟）

### 如果部署状态是 "Active" 但健康检查失败

**操作**:
1. 等待 1-2 分钟（服务可能还在启动）
2. 检查环境变量配置
3. 查看实时日志
4. 重新测试

### 如果部署状态是 "Failed"

**操作**:
1. 查看错误日志
2. 根据错误信息修复问题
3. 重新部署

---

## 📚 相关文档

- [Railway 部署指南](./docs/RAILWAY_DEPLOY.md)
- [测试指南](./TESTING_GUIDE.md)
- [插件配置指南](./RAILWAY_PLUGINS_CONFIG.md)

---

**最后更新**: 2024-01-22
