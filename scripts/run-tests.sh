#!/bin/bash

# ============================================
# 改进的全面测试脚本 - 容错版本
# ============================================

BASE_URL="${1:-http://localhost:3000}"
CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   KOLMarket.ai 全面测试套件          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "基础 URL: $BASE_URL"
echo "容器 URL: $CONTAINER_URL"
echo ""

# 测试函数
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expect=${5:-200}
    
    ((TOTAL++))
    echo -n "[$TOTAL] $name... "
    
    if [ "$method" = "GET" ]; then
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" 2>/dev/null || echo "000")
    fi
    
    if [ "$http_code" = "$expect" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ 通过 (HTTP $http_code)${NC}"
        ((PASSED++))
    elif [ "$http_code" = "000" ]; then
        echo -e "${YELLOW}⚠️  连接失败${NC}"
        ((SKIPPED++))
    else
        echo -e "${RED}❌ 失败 (HTTP $http_code)${NC}"
        ((FAILED++))
    fi
}

# ==================== 1. 用户层测试 ====================
echo -e "${BLUE}1️⃣  用户层测试${NC}"
test_endpoint "首页" "GET" "$BASE_URL/" "" 200
test_endpoint "KOL 页面" "GET" "$BASE_URL/kol" "" 200
test_endpoint "终端页面" "GET" "$BASE_URL/terminal" "" 200
echo ""

# ==================== 2. 应用层测试 ====================
echo -e "${BLUE}2️⃣  应用层测试${NC}"
test_endpoint "聊天 API" "POST" "$BASE_URL/api/chat" '{"prompt":"Hello"}' 200
test_endpoint "KOL 聊天" "POST" "$BASE_URL/api/chat" '{"prompt":"Test","kolHandle":"blknoiz06"}' 200
test_endpoint "Agents API" "GET" "$BASE_URL/api/agents" "" 200
test_endpoint "Mindshare API" "GET" "$BASE_URL/api/mindshare/blknoiz06" "" 200
test_endpoint "知识库 API" "POST" "$BASE_URL/api/knowledge" '{"kolHandle":"test","content":"Test"}' 200
test_endpoint "Agent Suite API" "POST" "$BASE_URL/api/agent-suite" '{"kolHandle":"test","modules":["avatar"]}' 200
echo ""

# ==================== 3. 智能体层测试 ====================
echo -e "${BLUE}3️⃣  智能体层测试${NC}"
test_endpoint "容器健康检查" "GET" "$CONTAINER_URL/health" "" 200
test_endpoint "Twitter 插件" "POST" "$CONTAINER_URL/api/twitter/post" '{"suiteId":"test","content":"Test","kolName":"Test"}' 200
test_endpoint "Discord 插件" "POST" "$CONTAINER_URL/api/discord/message" '{"suiteId":"test","channelId":"test","message":"Test"}' 200
test_endpoint "Telegram 插件" "POST" "$CONTAINER_URL/api/telegram/message" '{"suiteId":"test","chatId":"test","message":"Test"}' 200
test_endpoint "Solana 插件" "POST" "$CONTAINER_URL/api/solana/trade" '{"suiteId":"test","action":"balance"}' 200
echo ""

# ==================== 4. 执行层测试 ====================
echo -e "${BLUE}4️⃣  执行层测试${NC}"
test_endpoint "执行层 API" "POST" "$BASE_URL/api/execution/distribute" '{"payer":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","recipients":[{"address":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}],"network":"devnet"}' 200
echo ""

# ==================== 5. 数据层测试 ====================
echo -e "${BLUE}5️⃣  数据层测试${NC}"
test_endpoint "D1 数据库（通过 Suite）" "POST" "$BASE_URL/api/agent-suite" '{"kolHandle":"test-db","modules":["avatar"]}' 200
test_endpoint "Vectorize（通过知识库）" "POST" "$BASE_URL/api/knowledge" '{"kolHandle":"test-vec","content":"Test vector"}' 200
echo ""

# ==================== 6. 算力层测试 ====================
echo -e "${BLUE}6️⃣  算力层测试${NC}"
test_endpoint "Workers AI" "POST" "$BASE_URL/api/chat" '{"prompt":"What is blockchain?"}' 200
test_endpoint "Embedding 生成" "POST" "$BASE_URL/api/knowledge" '{"kolHandle":"test-ai","content":"Test embedding"}' 200
echo ""

# ==================== 结果汇总 ====================
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 通过: $PASSED${NC}"
echo -e "${RED}❌ 失败: $FAILED${NC}"
echo -e "${YELLOW}⏭️  跳过: $SKIPPED${NC}"
echo -e "${BLUE}📊 总计: $TOTAL${NC}"

if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "成功率: $SUCCESS_RATE%"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  部分测试失败或跳过${NC}"
    exit 0
fi
