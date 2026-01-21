# Cloudflare 初始化指南

本指南将帮助您完成 Cloudflare 登录、数据库和 AI 的初始化。

## 📋 前置要求

1. Cloudflare 账户（如果没有，请访问 https://dash.cloudflare.com/sign-up 注册）
2. 已安装 Node.js 和 npm
3. 已安装 Wrangler CLI

## 🔐 步骤 1: 登录 Cloudflare

### 方法 1: 使用 Wrangler CLI 登录（推荐）

```bash
# 登录 Cloudflare
npx wrangler login

# 这会打开浏览器，要求您授权 Wrangler 访问您的 Cloudflare 账户
# 登录后，Wrangler 会自动保存认证信息
```

### 方法 2: 使用 API Token

```bash
# 1. 在 Cloudflare Dashboard 创建 API Token
# 访问: https://dash.cloudflare.com/profile/api-tokens
# 创建具有以下权限的 Token:
#   - Account: Cloudflare Workers:Edit
#   - Account: Workers AI:Edit
#   - Account: D1:Edit
#   - Account: Vectorize:Edit

# 2. 设置环境变量
export CLOUDFLARE_API_TOKEN=your_api_token_here

# 或添加到 .env.local
echo "CLOUDFLARE_API_TOKEN=your_api_token_here" >> .env.local
```

### 验证登录

```bash
# 检查登录状态
npx wrangler whoami
```

## 🗄️ 步骤 2: 创建 D1 数据库

### 2.1 创建数据库

```bash
# 创建 D1 数据库
npx wrangler d1 create kolmarket-db
```

输出示例：
```
✅ Successfully created DB 'kolmarket-db' in region APAC
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "kolmarket-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 更新 wrangler.toml

将返回的 `database_id` 复制到 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "kolmarket-db"
database_id = "your-database-id-here"  # 替换为实际的 database_id
```

### 2.3 运行数据库迁移

```bash
# 在本地运行迁移（用于开发）
npx wrangler d1 execute kolmarket-db --local --file=./schema.sql

# 在生产环境运行迁移
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

### 2.4 验证数据库

```bash
# 查看数据库列表
npx wrangler d1 list

# 查看数据库信息
npx wrangler d1 info kolmarket-db

# 查询数据库（本地）
npx wrangler d1 execute kolmarket-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 🔍 步骤 3: 创建 Vectorize 索引

### 3.1 创建索引

```bash
# 创建 Vectorize 索引（768 维度，用于 BGE Base EN v1.5）
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine
```

输出示例：
```
✅ Successfully created index 'kol-knowledge-index'

[[vectorize]]
binding = "VECTORIZE"
index_name = "kol-knowledge-index"
```

### 3.2 验证索引

```bash
# 查看所有索引
npx wrangler vectorize list

# 查看索引详情
npx wrangler vectorize describe kol-knowledge-index
```

## 🤖 步骤 4: 验证 AI 绑定

### 4.1 检查 AI 绑定配置

AI 绑定已在 `wrangler.toml` 中配置：

```toml
[ai]
binding = "AI"
```

### 4.2 测试 AI 功能

```bash
# 使用 Wrangler 测试 AI（需要先部署）
# 或直接在代码中测试（见下方）
```

## ✅ 步骤 5: 验证完整配置

### 5.1 检查 wrangler.toml

确保 `wrangler.toml` 包含所有必要的绑定：

```toml
name = "kolmarket-ai"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
database_name = "kolmarket-db"
database_id = "your-database-id"  # 必须填写

[[vectorize]]
binding = "VECTORIZE"
index_name = "kol-knowledge-index"
```

### 5.2 测试配置

创建测试脚本 `scripts/test-cloudflare-config.ts`：

```typescript
// 测试 Cloudflare 绑定
async function testConfig() {
  // 这个脚本需要在 Cloudflare Workers 环境中运行
  // 实际测试应该在部署后进行
  console.log("配置验证需要在部署后测试");
}
```

## 🚀 步骤 6: 部署到 Cloudflare Pages

### 6.1 构建项目

```bash
npm run build
```

### 6.2 部署

```bash
# 使用 Wrangler 部署到 Cloudflare Pages
npx wrangler pages deploy .next

# 或使用 Cloudflare Dashboard
# 1. 访问 https://dash.cloudflare.com
# 2. 选择 Pages
# 3. 创建新项目
# 4. 连接 Git 仓库或直接上传
```

## 📝 快速初始化脚本

创建 `scripts/init-cloudflare.sh`：

```bash
#!/bin/bash

echo "🚀 开始 Cloudflare 初始化..."

# 1. 检查登录
echo "📋 检查 Cloudflare 登录状态..."
npx wrangler whoami || {
  echo "❌ 未登录，请先运行: npx wrangler login"
  exit 1
}

# 2. 创建 D1 数据库
echo "🗄️  创建 D1 数据库..."
DB_OUTPUT=$(npx wrangler d1 create kolmarket-db)
echo "$DB_OUTPUT"

# 提取 database_id
DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
if [ -z "$DB_ID" ]; then
  echo "⚠️  无法提取 database_id，请手动更新 wrangler.toml"
else
  echo "✅ 数据库 ID: $DB_ID"
  echo "请手动更新 wrangler.toml 中的 database_id"
fi

# 3. 运行数据库迁移
echo "📊 运行数据库迁移..."
npx wrangler d1 execute kolmarket-db --local --file=./schema.sql
npx wrangler d1 execute kolmarket-db --file=./schema.sql

# 4. 创建 Vectorize 索引
echo "🔍 创建 Vectorize 索引..."
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine

echo "✅ Cloudflare 初始化完成！"
echo ""
echo "📝 下一步："
echo "1. 更新 wrangler.toml 中的 database_id"
echo "2. 运行 npm run build"
echo "3. 部署到 Cloudflare Pages"
```

## ⚠️ 常见问题

### 问题 1: 登录失败

```bash
# 清除认证信息后重新登录
rm -rf ~/.wrangler
npx wrangler login
```

### 问题 2: 数据库创建失败

- 检查账户是否有 D1 访问权限
- 确认账户未达到数据库数量限制
- 尝试使用不同的数据库名称

### 问题 3: Vectorize 索引创建失败

- 检查账户是否有 Vectorize 访问权限
- 确认维度设置正确（768 用于 BGE Base）
- 检查索引名称是否已存在

### 问题 4: AI 绑定不可用

- 确认账户已启用 Workers AI
- 检查 `wrangler.toml` 中的 AI 绑定配置
- 在 Cloudflare Dashboard 中检查 Workers AI 状态

## 📚 相关资源

- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [Vectorize 文档](https://developers.cloudflare.com/vectorize/)
- [Workers AI 文档](https://developers.cloudflare.com/workers-ai/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 初始化指南已创建
