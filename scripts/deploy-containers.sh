#!/bin/bash

# ============================================
# Cloudflare Containers 部署脚本
# 用于部署 ElizaOS 完整功能
# ============================================

set -e

echo "🚀 开始 Cloudflare Containers 部署..."
echo ""

# 配置变量
CONTAINER_NAME="elizaos-server"
CONTAINER_DIR="./elizaos-container"
DOCKER_IMAGE="kolmarket/elizaos-server:latest"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker 已安装"

# 检查 wrangler 登录状态
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ 未登录 Cloudflare"
    echo "   请先运行: npx wrangler login"
    exit 1
fi
echo "✅ 已登录 Cloudflare"

# 步骤 1: 构建 Docker 镜像
echo ""
echo "📦 步骤 1: 构建 Docker 镜像..."
cd "$CONTAINER_DIR"

docker build -t "$DOCKER_IMAGE" .

if [ $? -eq 0 ]; then
    echo "✅ Docker 镜像构建成功"
else
    echo "❌ Docker 镜像构建失败"
    exit 1
fi

cd ..

# 步骤 2: 推送镜像到 Docker Hub (可选)
echo ""
echo "📤 步骤 2: 推送镜像到 Docker Hub..."
echo "⚠️  注意: 如果使用私有仓库，请先登录 Docker Hub"
echo "   docker login"
echo ""
read -p "是否推送到 Docker Hub? (y/n): " PUSH_CHOICE

if [ "$PUSH_CHOICE" = "y" ] || [ "$PUSH_CHOICE" = "Y" ]; then
    docker push "$DOCKER_IMAGE"
    echo "✅ 镜像已推送到 Docker Hub"
else
    echo "⏭️  跳过推送，将使用本地镜像"
fi

# 步骤 3: 部署到 Cloudflare Containers
echo ""
echo "🌐 步骤 3: 部署到 Cloudflare Containers..."
echo ""
echo "⚠️  重要提示:"
echo "   Cloudflare Containers 目前处于 Beta 阶段"
echo "   需要付费计划才能使用"
echo ""
echo "   如果您还没有启用 Containers，请访问:"
echo "   https://developers.cloudflare.com/containers/"
echo ""

# 检查 containers 是否可用
npx wrangler containers list 2>/dev/null

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Cloudflare Containers 功能未启用或不可用"
    echo ""
    echo "请按以下步骤操作:"
    echo "1. 登录 Cloudflare Dashboard"
    echo "2. 进入 Workers & Pages"
    echo "3. 启用 Containers (Beta)"
    echo "4. 确保您使用的是付费计划"
    echo ""
    echo "或者使用替代方案:"
    echo "  - 部署到 Railway/Fly.io/Render"
    echo "  - 运行 ./scripts/deploy-to-railway.sh"
    exit 1
fi

# 部署容器
echo "正在部署容器..."
npx wrangler containers deploy "$CONTAINER_NAME" \
    --image "$DOCKER_IMAGE" \
    --port 3001

if [ $? -eq 0 ]; then
    echo "✅ 容器部署成功"
else
    echo "❌ 容器部署失败"
    exit 1
fi

# 步骤 4: 配置环境变量 (Secrets)
echo ""
echo "🔐 步骤 4: 配置 Secrets..."
echo ""
echo "请为容器配置以下环境变量:"
echo ""

read -p "配置 Twitter API? (y/n): " TWITTER_CHOICE
if [ "$TWITTER_CHOICE" = "y" ]; then
    echo "请输入 Twitter API Key:"
    npx wrangler secret put TWITTER_API_KEY
    npx wrangler secret put TWITTER_API_SECRET
    npx wrangler secret put TWITTER_ACCESS_TOKEN
    npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
    echo "✅ Twitter API 已配置"
fi

read -p "配置 Discord Bot? (y/n): " DISCORD_CHOICE
if [ "$DISCORD_CHOICE" = "y" ]; then
    npx wrangler secret put DISCORD_BOT_TOKEN
    echo "✅ Discord Bot Token 已配置"
fi

read -p "配置 Telegram Bot? (y/n): " TELEGRAM_CHOICE
if [ "$TELEGRAM_CHOICE" = "y" ]; then
    npx wrangler secret put TELEGRAM_BOT_TOKEN
    echo "✅ Telegram Bot Token 已配置"
fi

read -p "配置 Solana 钱包? (y/n): " SOLANA_CHOICE
if [ "$SOLANA_CHOICE" = "y" ]; then
    npx wrangler secret put SOLANA_PRIVATE_KEY
    npx wrangler secret put SOLANA_RPC_URL
    echo "✅ Solana 钱包已配置"
fi

# 步骤 5: 获取容器 URL
echo ""
echo "📋 步骤 5: 获取容器 URL..."
CONTAINER_URL=$(npx wrangler containers status "$CONTAINER_NAME" 2>/dev/null | grep -o 'https://[a-zA-Z0-9.-]*')

if [ -n "$CONTAINER_URL" ]; then
    echo "✅ 容器 URL: $CONTAINER_URL"
    
    # 更新环境变量
    echo ""
    echo "更新 ELIZAOS_CONTAINER_URL..."
    npx wrangler secret put ELIZAOS_CONTAINER_URL <<< "$CONTAINER_URL"
    echo "✅ 环境变量已更新"
else
    echo "⚠️  无法获取容器 URL，请手动检查"
fi

# 完成
echo ""
echo "============================================"
echo "✅ Cloudflare Containers 部署完成！"
echo "============================================"
echo ""
echo "📊 部署信息:"
echo "   容器名称: $CONTAINER_NAME"
echo "   镜像: $DOCKER_IMAGE"
echo "   端口: 3001"
if [ -n "$CONTAINER_URL" ]; then
    echo "   URL: $CONTAINER_URL"
fi
echo ""
echo "📝 下一步:"
echo "   1. 测试容器健康检查: curl $CONTAINER_URL/health"
echo "   2. 重新部署前端: npm run deploy"
echo "   3. 在前端测试 Agent Suite 功能"
echo ""
echo "🔗 文档: https://developers.cloudflare.com/containers/"
