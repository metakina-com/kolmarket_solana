#!/bin/bash

# ============================================
# ElizaOS 部署到 Cloudflare Containers
# 简化版部署脚本
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始部署 ElizaOS 到 Cloudflare Containers...${NC}"
echo ""

# ============================================
# 步骤 1: 检查前置条件
# ============================================

echo -e "${BLUE}📋 步骤 1: 检查前置条件...${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "   请安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker 已安装${NC}"

# 检查 wrangler
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx 未安装，请先安装 Node.js${NC}"
    exit 1
fi

# 检查 wrangler 登录状态
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  未登录 Cloudflare${NC}"
    echo "   正在登录..."
    npx wrangler login
fi
echo -e "${GREEN}✅ 已登录 Cloudflare${NC}"

# 检查 Docker Hub 登录
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  请先登录 Docker Hub${NC}"
    echo "   运行: docker login"
    read -p "是否现在登录 Docker Hub? (y/n): " LOGIN_CHOICE
    if [ "$LOGIN_CHOICE" = "y" ] || [ "$LOGIN_CHOICE" = "Y" ]; then
        docker login
    else
        echo -e "${RED}❌ 需要 Docker Hub 登录才能推送镜像${NC}"
        exit 1
    fi
fi

# ============================================
# 步骤 2: 配置变量
# ============================================

echo ""
echo -e "${BLUE}⚙️  步骤 2: 配置部署参数...${NC}"

# 获取 Docker Hub 用户名
if [ -z "$DOCKER_USERNAME" ]; then
    read -p "请输入 Docker Hub 用户名: " DOCKER_USERNAME
fi

CONTAINER_NAME="elizaos-server"
IMAGE_NAME="${CONTAINER_NAME}:latest"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"
CONTAINER_DIR="./elizaos-container"

echo -e "${GREEN}✅ 配置完成:${NC}"
echo "   Docker Hub: $DOCKER_USERNAME"
echo "   镜像名称: $FULL_IMAGE_NAME"
echo "   容器名称: $CONTAINER_NAME"

# ============================================
# 步骤 3: 构建 Docker 镜像
# ============================================

echo ""
echo -e "${BLUE}📦 步骤 3: 构建 Docker 镜像...${NC}"

if [ ! -d "$CONTAINER_DIR" ]; then
    echo -e "${RED}❌ 容器目录不存在: $CONTAINER_DIR${NC}"
    exit 1
fi

cd "$CONTAINER_DIR"

# 检查 package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "   安装依赖..."
    npm install --legacy-peer-deps
fi

# 构建镜像
echo "   正在构建镜像..."
docker build -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker 镜像构建成功${NC}"
else
    echo -e "${RED}❌ Docker 镜像构建失败${NC}"
    exit 1
fi

# ============================================
# 步骤 4: 标记并推送镜像
# ============================================

echo ""
echo -e "${BLUE}🏷️  步骤 4: 标记并推送镜像到 Docker Hub...${NC}"

docker tag "$IMAGE_NAME" "$FULL_IMAGE_NAME"

echo "   正在推送镜像..."
docker push "$FULL_IMAGE_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像已推送到 Docker Hub${NC}"
else
    echo -e "${RED}❌ 镜像推送失败${NC}"
    exit 1
fi

cd ..

# ============================================
# 步骤 5: 部署到 Cloudflare Containers
# ============================================

echo ""
echo -e "${BLUE}☁️  步骤 5: 部署到 Cloudflare Containers...${NC}"

# 检查 Containers 功能是否可用
echo "   检查 Containers 功能..."
if ! npx wrangler containers list > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Cloudflare Containers 功能可能未启用${NC}"
    echo ""
    echo "   请确保："
    echo "   1. 您使用的是 Cloudflare 付费计划"
    echo "   2. Containers (Beta) 功能已启用"
    echo "   3. 访问: https://developers.cloudflare.com/containers/"
    echo ""
    read -p "是否继续尝试部署? (y/n): " CONTINUE_CHOICE
    if [ "$CONTINUE_CHOICE" != "y" ] && [ "$CONTINUE_CHOICE" != "Y" ]; then
        exit 1
    fi
fi

# 部署容器
echo "   正在部署容器..."
npx wrangler containers deploy "$CONTAINER_NAME" \
    --image "$FULL_IMAGE_NAME" \
    --port 3001

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 容器部署成功${NC}"
else
    echo -e "${RED}❌ 容器部署失败${NC}"
    echo ""
    echo "   可能的原因："
    echo "   1. Containers 功能未启用"
    echo "   2. 账户权限不足"
    echo "   3. 镜像名称错误"
    exit 1
fi

# ============================================
# 步骤 6: 获取容器 URL
# ============================================

echo ""
echo -e "${BLUE}🔗 步骤 6: 获取容器 URL...${NC}"

# 等待容器启动
echo "   等待容器启动..."
sleep 5

# 获取容器 URL
CONTAINER_URL=$(npx wrangler containers list 2>/dev/null | grep "$CONTAINER_NAME" | awk '{print $NF}' | head -1)

if [ -z "$CONTAINER_URL" ]; then
    echo -e "${YELLOW}⚠️  无法自动获取容器 URL${NC}"
    echo "   请手动运行: npx wrangler containers list"
    read -p "请输入容器 URL: " CONTAINER_URL
fi

if [ -n "$CONTAINER_URL" ]; then
    echo -e "${GREEN}✅ 容器 URL: $CONTAINER_URL${NC}"
    
    # 测试健康检查
    echo "   测试健康检查..."
    sleep 3
    if curl -s "${CONTAINER_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ 容器健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  健康检查失败，容器可能还在启动中${NC}"
    fi
else
    echo -e "${RED}❌ 无法获取容器 URL${NC}"
    exit 1
fi

# ============================================
# 步骤 7: 配置主应用环境变量
# ============================================

echo ""
echo -e "${BLUE}🔐 步骤 7: 配置主应用环境变量...${NC}"

echo "   设置 ELIZAOS_CONTAINER_URL..."
echo "$CONTAINER_URL" | npx wrangler pages secret put ELIZAOS_CONTAINER_URL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 主应用环境变量已配置${NC}"
else
    echo -e "${YELLOW}⚠️  环境变量配置失败，请手动设置${NC}"
    echo "   运行: npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
    echo "   输入: $CONTAINER_URL"
fi

# ============================================
# 步骤 8: 配置容器 Secrets（可选）
# ============================================

echo ""
echo -e "${BLUE}🔑 步骤 8: 配置容器 Secrets（可选）...${NC}"

echo "   您可以为容器配置以下 Secrets："
echo "   - Twitter API (TWITTER_API_KEY, TWITTER_API_SECRET, etc.)"
echo "   - Discord Bot (DISCORD_BOT_TOKEN)"
echo "   - Telegram Bot (TELEGRAM_BOT_TOKEN)"
echo "   - Solana (SOLANA_PRIVATE_KEY, SOLANA_RPC_URL)"
echo ""

read -p "是否现在配置 Secrets? (y/n): " SECRETS_CHOICE

if [ "$SECRETS_CHOICE" = "y" ] || [ "$SECRETS_CHOICE" = "Y" ]; then
    echo ""
    read -p "配置 Twitter API? (y/n): " TWITTER_CHOICE
    if [ "$TWITTER_CHOICE" = "y" ]; then
        echo "   设置 Twitter API Key..."
        npx wrangler secret put TWITTER_API_KEY --container="$CONTAINER_NAME" || true
        npx wrangler secret put TWITTER_API_SECRET --container="$CONTAINER_NAME" || true
        npx wrangler secret put TWITTER_ACCESS_TOKEN --container="$CONTAINER_NAME" || true
        npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET --container="$CONTAINER_NAME" || true
    fi
    
    read -p "配置 Discord Bot? (y/n): " DISCORD_CHOICE
    if [ "$DISCORD_CHOICE" = "y" ]; then
        npx wrangler secret put DISCORD_BOT_TOKEN --container="$CONTAINER_NAME" || true
    fi
    
    read -p "配置 Telegram Bot? (y/n): " TELEGRAM_CHOICE
    if [ "$TELEGRAM_CHOICE" = "y" ]; then
        npx wrangler secret put TELEGRAM_BOT_TOKEN --container="$CONTAINER_NAME" || true
    fi
    
    read -p "配置 Solana? (y/n): " SOLANA_CHOICE
    if [ "$SOLANA_CHOICE" = "y" ]; then
        npx wrangler secret put SOLANA_PRIVATE_KEY --container="$CONTAINER_NAME" || true
        npx wrangler secret put SOLANA_RPC_URL --container="$CONTAINER_NAME" || true
    fi
    
    echo -e "${GREEN}✅ Secrets 配置完成${NC}"
else
    echo -e "${YELLOW}⏭️  跳过 Secrets 配置${NC}"
    echo "   您可以稍后运行以下命令配置："
    echo "   npx wrangler secret put SECRET_NAME --container=$CONTAINER_NAME"
fi

# ============================================
# 完成
# ============================================

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}📊 部署信息:${NC}"
echo "   容器名称: $CONTAINER_NAME"
echo "   镜像: $FULL_IMAGE_NAME"
echo "   端口: 3001"
echo "   URL: $CONTAINER_URL"
echo ""
echo -e "${BLUE}📝 下一步:${NC}"
echo "   1. 测试容器: curl $CONTAINER_URL/health"
echo "   2. 查看日志: npx wrangler containers logs $CONTAINER_NAME"
echo "   3. 重新部署前端: npm run deploy"
echo "   4. 在前端测试 Agent Suite 功能"
echo ""
echo -e "${BLUE}🔗 相关文档:${NC}"
echo "   https://developers.cloudflare.com/containers/"
echo ""
