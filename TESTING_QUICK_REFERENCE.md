# 🧪 测试快速参考

**更新时间**: 2026-01-22

---

## 🚀 快速开始

### 一键全面测试

```bash
# 启动开发服务器（新终端）
npm run dev

# 运行全面测试（另一个终端）
npm test

# 或指定 URL
npm test https://your-domain.pages.dev
```

---

## 📋 测试命令速查

### 基础测试

```bash
# 全面测试（所有6个层级）
npm test

# API 测试
npm run test:api

# 插件测试（ElizaOS 容器）
npm run test:plugins

# 容器健康检查
npm run test:container
```

### 手动测试

```bash
# 测试聊天 API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'

# 测试知识库
curl -X POST http://localhost:3000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{"kolHandle":"test","content":"Test"}'

# 测试容器健康
curl https://kolmarketsolana-production.up.railway.app/health
```

---

## 🎯 测试层级

### 1️⃣ 用户层
- ✅ 页面加载
- ✅ 组件渲染
- ✅ 钱包连接
- ✅ 数据可视化

### 2️⃣ 应用层
- ✅ API 路由
- ✅ 请求验证
- ✅ 错误处理
- ✅ 降级机制

### 3️⃣ 智能体层
- ✅ ElizaOS 容器
- ✅ Twitter/Discord/Telegram/Solana 插件
- ✅ 降级机制

### 4️⃣ 执行层
- ✅ 交易构建
- ✅ 分红分配
- ✅ 策略执行

### 5️⃣ 数据层
- ✅ D1 数据库
- ✅ Vectorize 向量库
- ✅ R2 存储
- ✅ Cookie.fun API

### 6️⃣ 算力层
- ✅ Workers AI
- ✅ Embedding 生成
- ✅ RAG 查询

---

## 📊 测试结果解读

### 成功标志

- ✅ **HTTP 200/201**: 请求成功
- ✅ **响应包含数据**: 功能正常
- ✅ **无错误日志**: 系统稳定

### 警告标志

- ⚠️ **HTTP 502**: 容器可能未配置或不可用（有降级机制）
- ⚠️ **HTTP 503**: Cloudflare 服务未绑定（本地环境正常）
- ⚠️ **降级响应**: 功能可用但使用降级方案

### 失败标志

- ❌ **HTTP 400**: 参数错误（检查请求格式）
- ❌ **HTTP 500**: 服务器错误（检查日志）
- ❌ **连接超时**: 服务不可用（检查部署状态）

---

## 🔧 常见问题

### Q: 本地测试返回 Mock 数据？

**A**: 正常。本地环境无法访问 Cloudflare Workers AI，会使用降级方案。部署到 Cloudflare Pages 后会自动使用真实 AI。

### Q: 容器测试返回 502？

**A**: 检查：
1. Railway 容器是否运行
2. 环境变量是否配置
3. 容器 URL 是否正确

### Q: 知识库 API 返回 503？

**A**: 需要 Cloudflare Vectorize 环境。部署到 Cloudflare Pages 后即可使用。

---

## 📚 详细文档

- [全面测试指南](./docs/COMPREHENSIVE_TESTING_GUIDE.md) - 完整测试方案
- [测试指南](./docs/TESTING_GUIDE.md) - 基础测试说明
- [测试结果](./docs/TEST_RESULTS.md) - 历史测试结果

---

**快速测试**: `npm test` 🚀
