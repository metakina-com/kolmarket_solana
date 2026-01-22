#!/bin/bash

# Railway 部署脚本（使用 API Key）

set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-ae75194a-44e2-44b4-93dd-16c7351cf7e8}"

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ RAILWAY_TOKEN 未设置"
    echo "   请设置: export RAILWAY_TOKEN=your-token"
    exit 1
fi

export RAILWAY_TOKEN

echo "🚂 Railway 部署（使用 API Key）"
echo "================================"
echo ""

cd elizaos-container

# 检查 Railway CLI
if ! command -v railway &> /dev/null && ! npx @railway/cli --version &> /dev/null; then
    echo "📦 安装 Railway CLI..."
    npm install -g @railway/cli || true
fi

# 验证 Token
echo "🔐 验证 API Key..."
if npx @railway/cli whoami 2>&1 | grep -q "Unauthorized"; then
    echo "❌ API Key 验证失败"
    echo ""
    echo "可能的原因:"
    echo "  1. API Key 已过期"
    echo "  2. API Key 权限不足"
    echo "  3. API Key 格式错误"
    echo ""
    echo "建议: 使用 Dashboard 方式部署（更简单）"
    echo "  访问: https://railway.app/"
    exit 1
fi

echo "✅ API Key 验证成功"
echo ""

# 初始化项目（如果还没初始化）
if [ ! -f ".railway" ] && [ ! -f "railway.json" ]; then
    echo "📦 初始化 Railway 项目..."
    npx @railway/cli init --yes || true
fi

# 部署
echo "🚀 开始部署..."
npx @railway/cli up

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步:"
echo "  1. 在 Railway Dashboard 中查看服务 URL"
echo "  2. 配置环境变量（如果需要）"
echo "  3. 运行: npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
