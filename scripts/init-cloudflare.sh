#!/bin/bash

echo "🚀 开始 Cloudflare 初始化..."
echo ""

# 1. 检查登录
echo "📋 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "❌ 未登录 Cloudflare"
  echo "   请先运行: npx wrangler login"
  exit 1
fi
echo "✅ 已登录 Cloudflare"
npx wrangler whoami
echo ""

# 2. 检查数据库是否已存在
echo "🗄️  检查 D1 数据库..."
if npx wrangler d1 list 2>/dev/null | grep -q "kolmarket-db"; then
  echo "⚠️  数据库 'kolmarket-db' 已存在"
  DB_ID=$(npx wrangler d1 list | grep "kolmarket-db" | head -1 | awk '{print $NF}' | tr -d '()')
  echo "数据库 ID: $DB_ID"
  echo "请确保 wrangler.toml 中的 database_id 已更新为: $DB_ID"
else
  echo "创建 D1 数据库..."
  DB_OUTPUT=$(npx wrangler d1 create kolmarket-db 2>&1)
  echo "$DB_OUTPUT"
  
  # 提取 database_id
  DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")
  if [ -z "$DB_ID" ]; then
    echo "⚠️  无法自动提取 database_id"
    echo "   请从上面的输出中手动复制 database_id 到 wrangler.toml"
  else
    echo ""
    echo "✅ 数据库创建成功！"
    echo "📝 数据库 ID: $DB_ID"
    echo "   请更新 wrangler.toml 中的 database_id 为: $DB_ID"
  fi
fi
echo ""

# 3. 运行数据库迁移
echo "📊 运行数据库迁移..."
if [ -f "./schema.sql" ]; then
  echo "本地迁移..."
  npx wrangler d1 execute kolmarket-db --local --file=./schema.sql 2>&1 | tail -10
  echo ""
  echo "生产环境迁移..."
  npx wrangler d1 execute kolmarket-db --file=./schema.sql 2>&1 | tail -10
  echo "✅ 数据库迁移完成"
else
  echo "⚠️  未找到 schema.sql 文件"
fi
echo ""

# 4. 检查 Vectorize 索引
echo "🔍 检查 Vectorize 索引..."
if npx wrangler vectorize list 2>/dev/null | grep -q "kol-knowledge-index"; then
  echo "✅ 索引 'kol-knowledge-index' 已存在"
else
  echo "创建 Vectorize 索引..."
  npx wrangler vectorize create kol-knowledge-index --dimensions=768 --metric=cosine 2>&1
  echo "✅ 索引创建完成"
fi
echo ""

# 5. 验证配置
echo "✅ Cloudflare 初始化完成！"
echo ""
echo "📝 下一步："
echo "1. 如果创建了新数据库，请更新 wrangler.toml 中的 database_id"
echo "2. 运行 npm run build 构建项目"
echo "3. 运行 npx wrangler pages deploy .next 部署到 Cloudflare Pages"
