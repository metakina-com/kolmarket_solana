# 📋 Cloudflare Pages 配置指南

## ⚠️ 重要提示

**您的项目应该部署到 Cloudflare Pages，而不是 Workers！**

- ✅ **Cloudflare Pages**: 适合 Next.js 应用（您的项目）
- ❌ **Cloudflare Workers**: 适合轻量级脚本和 API

---

## 🎯 正确的配置步骤

### 方式 1: 通过 Dashboard 配置（推荐）

#### 步骤 1: 进入 Pages 项目

1. 访问: https://dash.cloudflare.com/
2. 点击左侧: **Workers & Pages**
3. 点击: **Create application** 或 **Create project**
4. 选择: **Pages**（不是 Workers）

#### 步骤 2: 连接 Git 仓库

1. 选择: **Connect to Git**
2. 授权 Cloudflare 访问您的 GitHub 仓库
3. 选择仓库: `metakina-com/kolmarket_solana`

#### 步骤 3: 配置构建设置

填写以下信息：

```
项目名称 (Project name): kolmarket-ai
生产分支 (Production branch): main

构建设置 (Build settings):
  框架预设 (Framework preset): Next.js
  构建命令 (Build command): npm run build
  构建输出目录 (Build output directory): .next
  根目录 (Root directory): / (项目根目录)
```

#### 步骤 4: 环境变量配置

在项目设置中添加环境变量：

```bash
# 基础配置
SOLANA_RPC_URL=https://api.devnet.solana.com
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct
NODE_ENV=production
```

#### 步骤 5: 配置绑定

在项目设置 → **Functions** 中配置：

- **D1 Database**: `DB` → `kolmarket-db` (6bdc857b-ec3e-4508-8094-f9a1d8452eea)
- **Vectorize**: `VECTORIZE` → `kol-knowledge-index`
- **Workers AI**: `AI` (自动绑定)

#### 步骤 6: 自定义域名

1. 进入: **Custom domains**
2. 添加: `kolmarket.ai`
3. 按照提示配置 DNS

---

### 方式 2: 使用现有项目配置

如果项目已创建（kolmarket-ai），直接配置：

#### 步骤 1: 连接 Git 仓库

1. 进入: **Workers & Pages** → **kolmarket-ai**
2. 进入: **Settings** → **Builds & deployments**
3. 点击: **Connect to Git**
4. 选择仓库并授权

#### 步骤 2: 配置构建设置

在 **Settings** → **Builds & deployments** 中：

```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
```

#### 步骤 3: 配置环境变量

在 **Settings** → **Environment variables** 中添加变量

#### 步骤 4: 配置绑定

在 **Settings** → **Functions** 中配置 D1 和 Vectorize 绑定

---

## 📊 配置对比

| 配置项 | Workers | Pages (正确) |
|--------|---------|--------------|
| **项目类型** | 脚本/API | Next.js 应用 |
| **构建命令** | 不需要 | `npm run build` |
| **输出目录** | 不需要 | `.next` |
| **框架** | 无 | Next.js |
| **部署命令** | `npx wrangler deploy` | 自动（Git） |

---

## ✅ 配置检查清单

- [ ] 项目类型选择为 **Pages**（不是 Workers）
- [ ] Git 仓库已连接
- [ ] 构建设置已配置（Next.js）
- [ ] 环境变量已添加
- [ ] D1 数据库绑定已配置
- [ ] Vectorize 索引绑定已配置
- [ ] 自定义域名已配置（可选）

---

## 🔧 如果已创建 Workers 项目

如果误创建了 Workers 项目：

1. **删除 Workers 项目**（如果不需要）
2. **创建 Pages 项目**（使用上面的步骤）
3. 或**将现有项目转换为 Pages**（在 Dashboard 中操作）

---

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 部署指南](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [项目配置说明](./CONFIGURE_DOMAIN.md)

---

**重要**: 确保选择 **Pages** 而不是 **Workers**！🎯
