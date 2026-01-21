# 测试指南

## 🧪 测试环境说明

### 本地测试环境

在本地开发环境中，某些 Cloudflare 服务不可用，因此会使用降级方案：

- **Cloudflare Workers AI**: 使用 Mock 响应
- **D1 数据库**: 不可用（需要 Cloudflare 环境）
- **Vectorize**: 不可用（需要 Cloudflare 环境）

### 生产测试环境

部署到 Cloudflare Pages 后，所有功能都可以正常使用。

## 📋 测试清单

### 本地可测试功能

- [x] **前端界面**
  - 页面加载
  - 组件渲染
  - 用户交互
  - 钱包连接（需要浏览器）

- [x] **基础 API**
  - `/api/chat` - 聊天 API（降级模式）
  - `/api/agents` - Agents 列表
  - `/api/mindshare/[handle]` - Mindshare API（降级数据）

### 需要 Cloudflare 环境的功能

- [ ] **知识库功能**
  - `/api/knowledge` - 添加/查询知识
  - RAG 查询
  - Vectorize 搜索

- [ ] **完整 AI 功能**
  - Cloudflare Workers AI
  - 真实 AI 对话
  - Embedding 生成

- [ ] **数据库功能**
  - D1 数据库查询
  - 对话历史存储
  - 知识库元数据

## 🔧 本地测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问应用

打开浏览器访问: http://localhost:3000

### 3. 测试前端功能

- [ ] 查看首页
- [ ] 查看 KOL 卡片
- [ ] 选择 KOL
- [ ] 尝试聊天
- [ ] 查看知识库管理界面

### 4. 测试 API

```bash
# 运行测试脚本
npm run test:api

# 或手动测试
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'
```

## 🚀 生产环境测试

### 部署后测试

1. **部署到 Cloudflare Pages**
   ```bash
   npm run deploy
   ```

2. **访问部署的网站**
   - 获取部署 URL（例如：`https://kolmarket-ai.pages.dev`）

3. **测试完整功能**
   ```bash
   # 使用部署 URL 测试
   ./scripts/test-apis.sh https://kolmarket-ai.pages.dev
   ```

### 生产环境测试清单

- [ ] 网站可以正常访问
- [ ] 聊天 API 使用真实 AI
- [ ] 可以添加知识到知识库
- [ ] RAG 查询正常工作
- [ ] 数据库查询正常
- [ ] 钱包连接正常
- [ ] 所有 API 端点正常

## 🐛 常见问题

### 问题 1: 本地测试返回 Mock 数据

**原因**: 本地环境无法访问 Cloudflare Workers AI

**解决**: 
- 这是正常的降级行为
- 部署到 Cloudflare Pages 后会自动使用真实 AI

### 问题 2: 知识库 API 返回 503

**原因**: 需要 Cloudflare Vectorize 环境

**解决**: 
- 部署到 Cloudflare Pages
- 确保 Vectorize 绑定已配置

### 问题 3: 数据库查询失败

**原因**: 需要 Cloudflare D1 环境

**解决**: 
- 部署到 Cloudflare Pages
- 确保 D1 绑定已配置
- 运行数据库迁移

## 📊 测试结果示例

### 本地测试结果

```
✅ 聊天 API (降级模式) - HTTP 200
✅ Agents API - HTTP 200
⚠️  知识库 API - HTTP 503 (需要 Cloudflare 环境)
⚠️  RAG 查询 - 降级到普通聊天
```

### 生产测试结果（预期）

```
✅ 聊天 API (真实 AI) - HTTP 200
✅ 知识库 API - HTTP 200
✅ RAG 查询 - HTTP 200 (使用知识库)
✅ 数据库查询 - HTTP 200
```

## 💡 测试建议

1. **本地测试**: 重点测试 UI 和基础功能
2. **部署测试**: 测试完整功能，包括 AI 和数据库
3. **性能测试**: 测试响应时间和并发处理
4. **安全测试**: 测试输入验证和错误处理

---

**测试状态**: ✅ **本地测试通过，准备部署测试**
