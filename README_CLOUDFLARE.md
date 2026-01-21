# Cloudflare 快速初始化

## 🚀 一键初始化

运行以下命令完成 Cloudflare 登录和初始化：

```bash
# 1. 登录 Cloudflare（首次需要）
npx wrangler login

# 2. 运行初始化脚本
./scripts/init-cloudflare.sh
```

## 📋 手动步骤

如果自动脚本失败，可以手动执行：

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 创建 D1 数据库

```bash
npx wrangler d1 create kolmarket-db
```

复制返回的 `database_id`，更新到 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "kolmarket-db"
database_id = "your-database-id-here"  # 替换这里
```

### 3. 运行数据库迁移

```bash
# 本地
npx wrangler d1 execute kolmarket-db --local --file=./schema.sql

# 生产
npx wrangler d1 execute kolmarket-db --file=./schema.sql
```

### 4. 创建 Vectorize 索引

```bash
npx wrangler vectorize create kol-knowledge-index \
  --dimensions=768 \
  --metric=cosine
```

### 5. 验证配置

```bash
# 查看数据库
npx wrangler d1 list

# 查看索引
npx wrangler vectorize list
```

## ✅ 验证清单

- [ ] 已登录 Cloudflare (`npx wrangler whoami`)
- [ ] D1 数据库已创建 (`npx wrangler d1 list`)
- [ ] `wrangler.toml` 中的 `database_id` 已更新
- [ ] 数据库迁移已运行
- [ ] Vectorize 索引已创建 (`npx wrangler vectorize list`)
- [ ] AI 绑定已配置（在 `wrangler.toml` 中）

## 📚 详细文档

查看 [docs/CLOUDFLARE_SETUP.md](./docs/CLOUDFLARE_SETUP.md) 获取完整指南。
