#!/bin/bash

# ============================================
# Railway 部署脚本
# 用于部署 ElizaOS 容器到 Railway
# ============================================

set -e

echo "🚂 Railway 部署脚本"
echo "===================="
echo ""

# 配置变量
CONTAINER_DIR="./elizaos-container"
SERVICE_NAME="elizaos-server"

# 检查 Railway CLI 是否安装
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装"
    echo ""
    echo "请先安装 Railway CLI:"
    echo "  npm install -g @railway/cli"
    echo "  或"
    echo "  curl -fsSL https://railway.app/install.sh | sh"
    echo ""
    exit 1
fi
echo "✅ Railway CLI 已安装"

# 检查是否已登录
if ! railway whoami &> /dev/null; then
    echo "❌ 未登录 Railway"
    echo "   请先运行: railway login"
    exit 1
fi
echo "✅ 已登录 Railway"

# 进入容器目录
cd "$CONTAINER_DIR"

# 检查 Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile 不存在"
    exit 1
fi
echo "✅ Dockerfile 存在"

# 检查是否已初始化 Railway 项目
if [ ! -f "railway.json" ] && [ ! -f ".railway" ]; then
    echo ""
    echo "📦 初始化 Railway 项目..."
    railway init
    
    if [ $? -ne 0 ]; then
        echo "❌ Railway 初始化失败"
        exit 1
    fi
    echo "✅ Railway 项目已初始化"
else
    echo "✅ Railway 项目已存在"
fi

# 提示配置环境变量
echo ""
echo "🔐 配置环境变量..."
echo ""
echo "请确保已设置以下环境变量（在 Railway Dashboard 或使用 CLI）:"
echo ""
echo "基础配置:"
echo "  - NODE_ENV=production"
echo "  - PORT=3001"
echo "  - HOST=0.0.0.0"
echo ""
echo "可选配置（根据功能需求）:"
echo "  - TWITTER_API_KEY"
echo "  - TWITTER_API_SECRET"
echo "  - TWITTER_ACCESS_TOKEN"
echo "  - TWITTER_ACCESS_TOKEN_SECRET"
echo "  - DISCORD_BOT_TOKEN"
echo "  - TELEGRAM_BOT_TOKEN"
echo "  - SOLANA_PRIVATE_KEY"
echo "  - SOLANA_RPC_URL"
echo ""
read -p "是否现在配置环境变量? (y/n): " CONFIG_VARS

if [ "$CONFIG_VARS" = "y" ] || [ "$CONFIG_VARS" = "Y" ]; then
    echo ""
    echo "使用以下命令设置环境变量:"
    echo "  railway variables set NODE_ENV=production"
    echo "  railway variables set PORT=3001"
    echo "  railway variables set HOST=0.0.0.0"
    echo ""
    echo "或访问 Railway Dashboard 设置环境变量"
    echo ""
fi

# 部署
echo ""
echo "🚀 开始部署到 Railway..."
echo ""

railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    
    # 获取服务 URL
    echo "📋 获取服务信息..."
    SERVICE_URL=$(railway domain 2>/dev/null || railway status 2>/dev/null | grep -o 'https://[a-zA-Z0-9.-]*' | head -1)
    
    if [ -n "$SERVICE_URL" ]; then
        echo "✅ 服务 URL: $SERVICE_URL"
        echo ""
        echo "📝 下一步:"
        echo "  1. 配置主应用:"
        echo "     npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
        echo "     输入: $SERVICE_URL"
        echo ""
        echo "  2. 测试容器:"
        echo "     curl $SERVICE_URL/health"
        echo ""
    else
        echo "⚠️  无法自动获取服务 URL"
        echo "   请在 Railway Dashboard 中查看服务 URL"
        echo ""
        echo "   然后运行:"
        echo "   npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
        echo ""
    fi
else
    echo "❌ 部署失败"
    echo ""
    echo "请检查:"
    echo "  1. Railway 账户是否正常"
    echo "  2. 网络连接是否正常"
    echo "  3. 查看 Railway Dashboard 中的错误信息"
    exit 1
fi

echo ""
echo "============================================"
echo "✅ Railway 部署完成！"
echo "============================================"
echo ""
echo "📚 相关文档:"
echo "   - Railway 部署指南: docs/RAILWAY_DEPLOY.md"
echo "   - Railway Dashboard: https://railway.app/"
echo ""
