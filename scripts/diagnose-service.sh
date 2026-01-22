#!/bin/bash

# ============================================
# 服务诊断脚本
# ============================================

CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"

echo "🔍 服务诊断"
echo "================================"
echo "服务 URL: $CONTAINER_URL"
echo ""

# 测试 1: 基本连接
echo "📡 测试 1: 基本连接"
echo "-------------------"
if curl -s --max-time 5 "$CONTAINER_URL" > /dev/null 2>&1; then
    echo "✅ 服务可以访问"
else
    echo "❌ 服务无法访问"
fi
echo ""

# 测试 2: 健康检查
echo "🏥 测试 2: 健康检查"
echo "-------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 10 "$CONTAINER_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应: $BODY"
echo ""

# 测试 3: 检查各个端点
echo "🔌 测试 3: API 端点检查"
echo "-------------------"

ENDPOINTS=(
    "/health"
    "/api/twitter/post"
    "/api/discord/message"
    "/api/telegram/message"
    "/api/solana/trade"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "测试 $endpoint ... "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CONTAINER_URL$endpoint" 2>&1)
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "401" ]; then
        echo "✅ (HTTP $RESPONSE)"
    else
        echo "❌ (HTTP $RESPONSE)"
    fi
done
echo ""

# 诊断建议
echo "💡 诊断建议"
echo "-------------------"
if [ "$HTTP_CODE" = "502" ]; then
    echo "❌ 服务返回 502 错误"
    echo ""
    echo "可能的原因:"
    echo "1. 服务正在重新部署中（添加环境变量后）"
    echo "2. 服务启动失败"
    echo "3. 端口配置问题"
    echo "4. 服务崩溃"
    echo ""
    echo "建议操作:"
    echo "1. 在 Railway Dashboard 中检查部署状态"
    echo "2. 查看部署日志，确认服务是否启动成功"
    echo "3. 检查环境变量配置（PORT=3001, HOST=0.0.0.0）"
    echo "4. 等待 2-3 分钟后重试"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 服务运行正常！"
    echo ""
    echo "可以继续测试各个插件功能"
else
    echo "⚠️  服务状态异常 (HTTP $HTTP_CODE)"
    echo ""
    echo "请检查 Railway Dashboard 中的服务状态和日志"
fi
