#!/bin/bash

# Railway 容器深度诊断脚本
# 检查深层次的问题

echo "============================================"
echo "🔍 Railway 容器深度诊断"
echo "============================================"
echo ""

CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 诊断信息${NC}"
echo "容器 URL: $CONTAINER_URL"
echo ""

# 1. 检查健康检查端点
echo -e "${BLUE}1. 检查健康检查端点${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" "$CONTAINER_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n2 | head -n1)
TIME_TOTAL=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d' | sed '$d')

echo "HTTP 状态码: $HTTP_CODE"
echo "响应时间: ${TIME_TOTAL}s"
echo "响应内容:"
echo "$BODY" | head -10
echo ""

# 2. 检查根路径
echo -e "${BLUE}2. 检查根路径${NC}"
echo ""

ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$CONTAINER_URL/" 2>&1)
ROOT_HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
ROOT_BODY=$(echo "$ROOT_RESPONSE" | sed '$d')

echo "HTTP 状态码: $ROOT_HTTP_CODE"
echo "响应内容:"
echo "$ROOT_BODY" | head -10
echo ""

# 3. 检查不同的端点
echo -e "${BLUE}3. 检查 API 端点${NC}"
echo ""

ENDPOINTS=("/health" "/" "/api/twitter/post" "/api/discord/message" "/api/telegram/message" "/api/solana/trade")

for endpoint in "${ENDPOINTS[@]}"; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$CONTAINER_URL$endpoint" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d' | head -3)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "405" ]; then
        echo -e "${GREEN}✅ $endpoint - HTTP $HTTP_CODE${NC}"
    elif [ "$HTTP_CODE" = "502" ]; then
        echo -e "${RED}❌ $endpoint - HTTP $HTTP_CODE (网关错误)${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint - HTTP $HTTP_CODE${NC}"
    fi
done

echo ""

# 4. 检查 CORS 头
echo -e "${BLUE}4. 检查 CORS 配置${NC}"
echo ""

CORS_HEADERS=$(curl -s -I -X OPTIONS "$CONTAINER_URL/health" 2>&1 | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ CORS 头已配置${NC}"
    echo "$CORS_HEADERS"
else
    echo -e "${YELLOW}⚠️  CORS 头未找到（可能正常，取决于配置）${NC}"
fi
echo ""

# 5. 检查超时问题
echo -e "${BLUE}5. 检查超时问题${NC}"
echo ""

TIMEOUT_TEST=$(timeout 10 curl -s -w "\n%{http_code}\n%{time_total}" "$CONTAINER_URL/health" 2>&1)
TIMEOUT_HTTP_CODE=$(echo "$TIMEOUT_TEST" | tail -n2 | head -n1)
TIMEOUT_TIME=$(echo "$TIMEOUT_TEST" | tail -n1)

if [ "$TIMEOUT_HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ 请求超时（超过 10 秒）${NC}"
elif [ "$TIMEOUT_TIME" != "" ]; then
    if (( $(echo "$TIMEOUT_TIME > 5.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  响应时间较慢: ${TIMEOUT_TIME}s${NC}"
    else
        echo -e "${GREEN}✅ 响应时间正常: ${TIMEOUT_TIME}s${NC}"
    fi
fi
echo ""

# 6. 检查 DNS 解析
echo -e "${BLUE}6. 检查 DNS 解析${NC}"
echo ""

DOMAIN=$(echo "$CONTAINER_URL" | sed -e 's|https\?://||' -e 's|/.*||')
DNS_RESULT=$(dig +short "$DOMAIN" 2>&1 | head -3)

if [ -n "$DNS_RESULT" ] && [ "$DNS_RESULT" != "" ]; then
    echo -e "${GREEN}✅ DNS 解析正常${NC}"
    echo "IP 地址:"
    echo "$DNS_RESULT"
else
    echo -e "${RED}❌ DNS 解析失败${NC}"
fi
echo ""

# 7. 检查 SSL/TLS
echo -e "${BLUE}7. 检查 SSL/TLS 证书${NC}"
echo ""

SSL_INFO=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>&1 | grep -E "Verify return code|subject=|issuer=" | head -3)

if [ -n "$SSL_INFO" ]; then
    echo -e "${GREEN}✅ SSL 证书正常${NC}"
    echo "$SSL_INFO"
else
    echo -e "${YELLOW}⚠️  无法验证 SSL 证书（可能需要安装 openssl）${NC}"
fi
echo ""

# 8. 诊断总结
echo "============================================"
echo -e "${BLUE}📊 诊断总结${NC}"
echo "============================================"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 容器健康检查正常${NC}"
elif [ "$HTTP_CODE" = "502" ]; then
    echo -e "${YELLOW}⚠️  容器返回 502 错误${NC}"
    echo ""
    echo "可能的原因:"
    echo "1. Railway 容器正在重新部署"
    echo "2. 端口配置不匹配（Railway 自动分配端口）"
    echo "3. 应用未正确启动"
    echo "4. 健康检查超时"
    echo ""
    echo "建议检查:"
    echo "1. Railway Dashboard → Deployments → 查看最新部署状态"
    echo "2. Railway Dashboard → Variables → 确认 PORT 环境变量"
    echo "3. Railway Dashboard → Logs → 查看运行日志"
    echo "4. 确认应用是否监听在 Railway 分配的端口上"
else
    echo -e "${YELLOW}⚠️  容器状态异常 (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "============================================"
