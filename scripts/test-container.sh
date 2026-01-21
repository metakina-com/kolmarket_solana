#!/bin/bash

# 测试 Cloudflare Container API

set -e

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-http://localhost:3001}"

echo -e "${GREEN}🧪 测试 ElizaOS Container API...${NC}"
echo -e "Container URL: ${CONTAINER_URL}\n"

# 测试健康检查
echo -e "${YELLOW}1. 测试健康检查...${NC}"
HEALTH_RESPONSE=$(curl -s "${CONTAINER_URL}/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ 健康检查失败${NC}"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""

# 测试 Twitter API（如果配置了）
if [ -n "$TWITTER_API_KEY" ]; then
    echo -e "${YELLOW}2. 测试 Twitter API...${NC}"
    TWITTER_RESPONSE=$(curl -s -X POST "${CONTAINER_URL}/api/twitter/post" \
        -H "Content-Type: application/json" \
        -d '{
            "suiteId": "test-123",
            "content": "Test tweet from container! 🚀",
            "config": {
                "name": "Test Agent"
            }
        }')
    
    if echo "$TWITTER_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✅ Twitter API 测试通过${NC}"
        echo "$TWITTER_RESPONSE" | jq '.' 2>/dev/null || echo "$TWITTER_RESPONSE"
    else
        echo -e "${RED}❌ Twitter API 测试失败${NC}"
        echo "$TWITTER_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  跳过 Twitter API 测试（未配置 TWITTER_API_KEY）${NC}"
fi

echo ""
echo -e "${GREEN}✅ 测试完成！${NC}"
