#!/bin/bash

# Cloudflare Pages 部署后配置脚本
# 用于快速完成所有必需的配置步骤

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始配置 Cloudflare Pages 部署...${NC}\n"

# 1. 检查数据库迁移
echo -e "${YELLOW}📊 步骤 1: 检查数据库迁移...${NC}"
if npx wrangler d1 execute kolmarket-db --command="SELECT name FROM sqlite_master WHERE type='table';" 2>&1 | grep -q "agent_suites"; then
    echo -e "${GREEN}✅ 数据库表已存在${NC}"
else
    echo -e "${YELLOW}⚠️  数据库表不存在，运行迁移...${NC}"
    echo -e "${YELLOW}   运行: npx wrangler d1 execute kolmarket-db --file=./schema.sql${NC}"
    echo -e "${YELLOW}   运行: npx wrangler d1 execute kolmarket-db --file=./scripts/migrate-agent-suite.sql${NC}"
fi

# 2. 检查 Vectorize 索引
echo -e "\n${YELLOW}🔍 步骤 2: 检查 Vectorize 索引...${NC}"
if npx wrangler vectorize list 2>&1 | grep -q "kol-knowledge-index"; then
    echo -e "${GREEN}✅ Vectorize 索引已存在${NC}"
else
    echo -e "${YELLOW}⚠️  Vectorize 索引不存在，创建中...${NC}"
    npx wrangler vectorize create kol-knowledge-index \
      --dimensions=768 \
      --metric=cosine
    echo -e "${GREEN}✅ Vectorize 索引已创建${NC}"
fi

# 3. 环境变量配置提示
echo -e "\n${YELLOW}⚙️  步骤 3: 环境变量配置${NC}"
echo -e "${YELLOW}请在 Cloudflare Dashboard 中配置以下环境变量：${NC}"
echo ""
echo -e "${GREEN}必需的环境变量：${NC}"
echo "  - SOLANA_RPC_URL (在 Dashboard → Pages → Settings → Environment Variables)"
echo ""
echo -e "${GREEN}可选的 Secrets（使用 wrangler pages secret put）：${NC}"
echo "  - COOKIE_FUN_API_KEY (如果使用 Cookie.fun API)"
echo "  - SOLANA_PRIVATE_KEY (仅开发环境，⚠️ 生产环境应使用用户钱包)"
echo ""
echo -e "${YELLOW}设置 Secrets 命令：${NC}"
echo "  npx wrangler pages secret put COOKIE_FUN_API_KEY"
echo "  npx wrangler pages secret put SOLANA_PRIVATE_KEY"

# 4. ElizaOS 容器配置（可选）
echo -e "\n${YELLOW}🐳 步骤 4: ElizaOS 容器配置（可选）${NC}"
echo -e "${YELLOW}如果您有 Cloudflare 付费计划，可以部署 ElizaOS 容器以获得完整功能：${NC}"
echo ""
echo -e "${GREEN}部署容器：${NC}"
echo "  ./scripts/deploy-container.sh"
echo ""
echo -e "${GREEN}配置容器 URL：${NC}"
echo "  npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
echo ""
echo -e "${GREEN}配置容器 Secrets：${NC}"
echo "  npx wrangler secret put TWITTER_API_KEY --container=elizaos-server"
echo "  npx wrangler secret put DISCORD_BOT_TOKEN --container=elizaos-server"
echo "  npx wrangler secret put TELEGRAM_BOT_TOKEN --container=elizaos-server"
echo "  npx wrangler secret put SOLANA_PRIVATE_KEY --container=elizaos-server"

# 5. 验证配置
echo -e "\n${YELLOW}✅ 步骤 5: 配置验证${NC}"
echo -e "${GREEN}检查 D1 数据库：${NC}"
npx wrangler d1 list | grep kolmarket-db || echo -e "${RED}❌ 数据库未找到${NC}"

echo -e "\n${GREEN}检查 Vectorize 索引：${NC}"
npx wrangler vectorize list | grep kol-knowledge-index || echo -e "${RED}❌ 索引未找到${NC}"

echo -e "\n${GREEN}✅ 配置检查完成！${NC}"
echo -e "\n${YELLOW}📝 下一步：${NC}"
echo "  1. 访问 https://kolmarket-solana.pages.dev 查看应用"
echo "  2. 在 Cloudflare Dashboard 中配置环境变量"
echo "  3. （可选）部署 ElizaOS 容器以获得完整功能"
echo ""
echo -e "${GREEN}📚 详细文档：${NC}"
echo "  - 部署配置清单: docs/DEPLOYMENT_CHECKLIST.md"
echo "  - ElizaOS 插件配置: docs/ELIZA_PLUGINS_SETUP.md"
echo "  - Containers 快速开始: docs/CONTAINERS_QUICK_START.md"
