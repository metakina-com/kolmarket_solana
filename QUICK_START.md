# 快速启动指南

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 2. 测试 API

```bash
# 测试所有 API 端点
npm run test:api

# 或指定 URL
./scripts/test-apis.sh http://localhost:3000
```

### 3. 部署到生产环境

```bash
# 构建并部署
npm run deploy
```

## 📋 功能测试清单

### 基础功能
- [ ] 访问首页
- [ ] 查看 KOL 卡片
- [ ] 连接 Solana 钱包
- [ ] 选择 KOL 进行聊天

### 聊天功能
- [ ] 普通聊天（无 KOL）
- [ ] KOL 聊天（选择 KOL）
- [ ] RAG 聊天（启用知识库增强）

### 知识库功能
- [ ] 查看知识库统计
- [ ] 添加知识
- [ ] 索引文档
- [ ] 使用 RAG 查询

### API 测试
- [ ] `/api/chat` - 聊天 API
- [ ] `/api/knowledge` - 知识库 API
- [ ] `/api/mindshare/[handle]` - Mindshare API
- [ ] `/api/agents` - Agents API

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建项目
npm run lint             # 代码检查

# 测试
npm run test:api         # 测试 API

# 部署
npm run deploy           # 部署到 Cloudflare Pages
npm run deploy:preview   # 部署预览版本

# Cloudflare
npx wrangler whoami      # 查看登录状态
npx wrangler d1 list     # 查看数据库
npx wrangler vectorize list  # 查看索引
```

## 📚 文档索引

- [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 完整部署说明
- [Cloudflare 设置](./docs/CLOUDFLARE_SETUP.md) - Cloudflare 初始化
- [RAG 集成](./docs/RAG_INTEGRATION.md) - RAG 功能说明
- [前端更新](./docs/FRONTEND_UPDATES.md) - 前端功能说明
- [集成指南](./docs/INTEGRATION_GUIDE.md) - 技术集成说明

---

**快速开始**: `npm run dev` → 访问 http://localhost:3000
