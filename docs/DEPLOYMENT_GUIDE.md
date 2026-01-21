# 部署指南

## 🚀 部署到 Cloudflare Pages

### ⚠️ 重要提示：ElizaOS 插件兼容性

**ElizaOS 插件不适合直接在 Cloudflare Edge Runtime 中运行**。

**原因**:
- ElizaOS 插件依赖 Node.js 原生模块（如 `onnxruntime-node`）
- Cloudflare Edge Runtime 不支持 Node.js 原生模块
- 会导致构建失败或运行时错误

**解决方案**:
1. **使用降级实现**（推荐用于快速上线）- 系统已内置，无需配置
2. **分离架构**（推荐用于生产）- 将 ElizaOS 插件运行在独立服务器
3. 详细说明请参考 [Cloudflare 兼容性分析](./CLOUDFLARE_COMPATIBILITY.md)

### 前置要求

- ✅ Cloudflare 账户已登录
- ✅ D1 数据库已创建
- ✅ Vectorize 索引已创建
- ✅ 项目构建成功
- ⚠️ 如果使用 ElizaOS 插件，需要独立服务器（见下方说明）

### 步骤 1: 最终构建检查

```bash
# 确保项目可以成功构建
npm run build

# 检查构建输出
ls -la .next
```

### 步骤 2: 部署到 Cloudflare Pages

#### 方法 1: 使用 Wrangler CLI（推荐）

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy .next

# 或指定项目名称
npx wrangler pages deploy .next --project-name=kolmarket-ai
```

#### 方法 2: 使用 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 **Pages** → **Create a project**
3. 选择 **Upload assets**
4. 上传 `.next` 目录的内容
5. 配置项目设置：
   - **Project name**: `kolmarket-ai`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`

#### 方法 3: 连接 Git 仓库（推荐用于持续部署）

1. 在 Cloudflare Dashboard 中选择 **Pages** → **Create a project**
2. 选择 **Connect to Git**
3. 授权 Cloudflare 访问您的 Git 仓库
4. 配置构建设置：
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (或项目根目录)

### 步骤 3: 配置环境变量

在 Cloudflare Pages 项目中：

1. 进入 **Settings** → **Environment variables**
2. 添加以下变量：

```bash
# Solana 配置
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# ElizaOS 配置（如果使用独立服务器）
ELIZAOS_SERVER_URL=https://your-elizaos-server.com  # 可选，仅在使用分离架构时需要

# AI 模型配置
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct

# 网络环境
NODE_ENV=production
```

**注意**: 
- 私钥等敏感信息应使用 **Secrets** 功能，而不是环境变量
- 使用 `npx wrangler pages secret put SOLANA_DEVNET_PRIVATE_KEY` 设置密钥
- **ElizaOS 插件相关环境变量**（Twitter、Discord、Telegram API Keys）应在独立服务器上配置，不在 Cloudflare 中配置

### 步骤 4: 配置绑定

确保 `wrangler.toml` 中的绑定已正确配置：

```toml
[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
```

### 步骤 5: ElizaOS 插件部署（可选）

如果使用 ElizaOS 插件的完整功能，需要部署独立服务器：

#### 选项 A: 使用降级实现（推荐用于快速上线）

**无需额外配置**，系统会自动使用降级实现：
- ✅ 完全兼容 Cloudflare Edge Runtime
- ✅ 功能可用但功能有限
- ✅ 无需额外服务器成本

#### 选项 B: 分离架构（推荐用于生产）

1. **创建独立服务器**（参考 `docs/CLOUDFLARE_COMPATIBILITY.md`）
2. **部署到**:
   - Railway
   - Render
   - Fly.io
   - 或任何 VPS
3. **配置环境变量**:
   ```bash
   ELIZAOS_SERVER_URL=https://your-elizaos-server.com
   ```
4. **更新 API 路由**以调用外部服务器

详细说明请参考 [Cloudflare 兼容性分析](./CLOUDFLARE_COMPATIBILITY.md)
database_name = "kolmarket-db"
database_id = "8edcc00c-63a1-4268-8968-527043eb6450"

[[vectorize]]
binding = "VECTORIZE"
index_name = "kol-knowledge-index"
```

在 Cloudflare Dashboard 中验证绑定：
1. 进入 **Settings** → **Functions**
2. 检查 **D1 database bindings** 和 **Vectorize bindings**

### 步骤 5: 验证部署

部署完成后：

1. **检查部署状态**
   ```bash
   npx wrangler pages deployment list
   ```

2. **访问网站**
   - 部署完成后会获得一个 URL，例如：`https://kolmarket-ai.pages.dev`
   - 访问并测试功能

3. **测试 API**
   ```bash
   # 使用测试脚本
   ./scripts/test-apis.sh https://kolmarket-ai.pages.dev
   ```

### 步骤 6: 自定义域名（可选）

1. 在 Cloudflare Dashboard 中进入 **Custom domains**
2. 添加您的域名
3. 按照提示配置 DNS 记录

## 🔍 部署后验证清单

- [ ] 网站可以正常访问
- [ ] 聊天 API 正常工作 (`/api/chat`)
- [ ] 知识库 API 正常工作 (`/api/knowledge`)
- [ ] RAG 功能正常工作（需要先添加知识）
- [ ] Mindshare API 正常工作 (`/api/mindshare/[handle]`)
- [ ] Solana 钱包连接正常工作
- [ ] 所有 Cloudflare 绑定正常工作

## 🐛 故障排除

### 问题 1: 构建失败

```bash
# 检查构建日志
npm run build 2>&1 | tee build.log

# 常见问题：
# - 依赖缺失：npm install
# - TypeScript 错误：检查类型定义
# - 环境变量缺失：检查 .env.local
```

### 问题 2: API 返回 500 错误

- 检查 Cloudflare Workers 日志
- 验证所有绑定是否正确配置
- 检查环境变量是否设置

### 问题 3: D1 数据库不可用

```bash
# 验证数据库绑定
npx wrangler d1 list

# 检查数据库 ID 是否正确
npx wrangler d1 info kolmarket-db
```

### 问题 4: Vectorize 索引不可用

```bash
# 验证索引
npx wrangler vectorize list

# 检查索引详情
npx wrangler vectorize describe kol-knowledge-index
```

### 问题 5: AI 绑定不可用

- 检查账户是否启用 Workers AI
- 验证 `wrangler.toml` 中的 AI 绑定配置
- 检查是否有足够的配额

## 📊 监控和维护

### 查看日志

```bash
# 实时日志
npx wrangler pages deployment tail

# 或使用 Cloudflare Dashboard
# Analytics → Logs
```

### 性能监控

- 访问 Cloudflare Dashboard → **Analytics**
- 查看请求量、错误率、响应时间
- 监控 D1 和 Vectorize 使用量

### 更新部署

```bash
# 重新构建和部署
npm run build
npx wrangler pages deploy .next
```

## 🔐 安全最佳实践

1. **使用 Secrets 存储敏感信息**
   ```bash
   npx wrangler pages secret put SOLANA_DEVNET_PRIVATE_KEY
   ```

2. **限制 API 访问**
   - 添加 CORS 配置
   - 实现速率限制
   - 添加身份验证（如需要）

3. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

## 📚 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 部署指南已创建
