# 🔧 Railway 容器深层次问题修复

**问题**: Railway Dashboard 显示容器正常，但外部访问返回 502  
**诊断结果**: DNS、SSL 正常，但应用层返回 502

---

## 🔍 问题分析

### 诊断结果

✅ **正常项**:
- DNS 解析正常
- SSL 证书正常
- 响应时间正常（< 1秒）

❌ **问题项**:
- 所有端点返回 502
- 应用层无法响应

### 可能的原因

1. **Railway V2 端口配置问题**
   - Railway V2 使用不同的端口机制
   - 应用可能没有监听在 Railway 分配的端口上

2. **健康检查超时**
   - Railway 的健康检查可能超时
   - 应用启动时间过长

3. **应用启动失败**
   - 依赖加载失败
   - 初始化错误

4. **路由配置问题**
   - Railway V2 的路由配置可能不正确

---

## 🚀 修复方案

### 方案 1: 修复端口配置（最可能的问题）

Railway V2 会自动分配端口，但需要确保应用监听在正确的端口上。

#### 步骤 1: 修改代码以支持 Railway V2 端口

```javascript
// elizaos-container/index.js
// 修改端口配置部分

// Railway V2 会自动设置 PORT 环境变量
// 如果没有设置，使用默认端口 3001
const port = parseInt(process.env.PORT || process.env.RAILWAY_PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

// 添加日志输出，确认端口
console.log(`🔌 Port from env: ${process.env.PORT}`);
console.log(`🔌 Railway port: ${process.env.RAILWAY_PORT}`);
console.log(`🔌 Using port: ${port}`);
console.log(`🔌 Using host: ${host}`);
```

#### 步骤 2: 确保 Railway 环境变量正确

在 Railway Dashboard → Variables 中确认：

**必需变量**:
```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

**注意**: Railway V2 可能会自动设置 `PORT` 环境变量，但为了确保一致性，建议显式设置。

#### 步骤 3: 检查 railway.json 配置

确认 `railway.json` 中的配置：

```json
{
  "deploy": {
    "runtime": "V2",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 60,
    "healthcheckInterval": 10
  }
}
```

---

### 方案 2: 修复健康检查超时

如果应用启动时间过长，Railway 的健康检查可能会超时。

#### 步骤 1: 增加健康检查超时时间

在 `railway.json` 中：

```json
{
  "deploy": {
    "healthcheckTimeout": 120,  // 增加到 120 秒
    "healthcheckInterval": 15   // 增加到 15 秒
  }
}
```

#### 步骤 2: 优化应用启动

在 `index.js` 中添加快速启动检查：

```javascript
// 在应用启动后立即响应健康检查
app.get('/health', (req, res) => {
  // 快速响应，不等待插件初始化
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

### 方案 3: 添加启动日志和错误处理

#### 步骤 1: 增强启动日志

```javascript
// 在启动时输出详细信息
console.log('🚀 Starting ElizaOS Container...');
console.log(`📦 Node version: ${process.version}`);
console.log(`📦 Platform: ${process.platform}`);
console.log(`📦 Process ID: ${process.pid}`);
console.log(`📦 Working directory: ${process.cwd()}`);
console.log(`📦 Environment variables:`);
console.log(`   - PORT: ${process.env.PORT}`);
console.log(`   - HOST: ${process.env.HOST}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
```

#### 步骤 2: 添加错误捕获

```javascript
// 捕获未处理的错误
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Error stack:', error.stack);
  // 不退出进程，让 Railway 的重启策略处理
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
});
```

---

### 方案 4: 检查 Railway V2 特定配置

#### 步骤 1: 确认 Railway V2 运行时

在 `railway.json` 中确认：

```json
{
  "deploy": {
    "runtime": "V2",  // 确保使用 V2
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 步骤 2: 检查 Dockerfile 端口暴露

在 `Dockerfile` 中确认：

```dockerfile
# 暴露端口（Railway 会自动映射）
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3001}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

---

## 🔧 立即修复步骤

### 1. 更新端口配置代码

修改 `elizaos-container/index.js` 的端口配置部分：

```javascript
// 获取端口（优先使用 Railway 分配的端口）
const port = parseInt(
  process.env.PORT || 
  process.env.RAILWAY_PORT || 
  process.env.PORT || 
  '3001', 
  10
);

// 添加详细的端口日志
console.log('🔌 Port configuration:');
console.log(`   - PORT env: ${process.env.PORT}`);
console.log(`   - Railway PORT: ${process.env.RAILWAY_PORT}`);
console.log(`   - Final port: ${port}`);
console.log(`   - Host: ${process.env.HOST || '0.0.0.0'}`);
```

### 2. 确保 Railway 环境变量

在 Railway Dashboard → Variables 中设置：

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### 3. 更新 railway.json

确保健康检查配置正确：

```json
{
  "deploy": {
    "runtime": "V2",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "healthcheckInterval": 15
  }
}
```

### 4. 重新部署

提交更改后，Railway 会自动重新部署。

### 5. 检查日志

在 Railway Dashboard → Logs 中查看：
- 应用是否成功启动
- 监听的端口是什么
- 是否有错误信息

---

## 📋 检查清单

在 Railway Dashboard 中检查：

- [ ] **Deployments** → 最新部署状态为 "Active" 或 "Live"
- [ ] **Variables** → `PORT=3001` 已设置
- [ ] **Variables** → `HOST=0.0.0.0` 已设置
- [ ] **Variables** → `NODE_ENV=production` 已设置
- [ ] **Logs** → 应用成功启动
- [ ] **Logs** → 显示 "ElizaOS Container running on 0.0.0.0:XXXX"
- [ ] **Logs** → 没有错误信息

---

## 🎯 预期结果

修复后，应该看到：

1. **健康检查正常**:
   ```bash
   curl https://kolmarketsolana-production.up.railway.app/health
   ```
   返回:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-23T...",
     "agents": 0,
     "uptime": 123.45
   }
   ```

2. **日志显示**:
   ```
   ✅ ElizaOS Container running on 0.0.0.0:3001
   📊 Environment: production
   ✅ Server started successfully
   ```

---

## 📚 相关文档

- [Railway V2 文档](https://docs.railway.app/reference/runtime-v2)
- [Railway 端口配置](https://docs.railway.app/reference/port-binding)
- [Railway 健康检查](https://docs.railway.app/reference/healthchecks)

---

**最后更新**: 2026-01-23
