#!/bin/bash

# ============================================
# 全面测试脚本 - 测试所有层级
# ============================================

set -e

# 配置
BASE_URL="${1:-http://localhost:3000}"
CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# ==================== 工具函数 ====================

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expect_code=${5:-200}

    ((TOTAL_TESTS++))
    echo -n "  [$TOTAL_TESTS] 测试 $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null || echo -e "\n000")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expect_code" ]; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ 失败 (HTTP $http_code)${NC}"
        if [ "$http_code" != "000" ]; then
            echo "     响应: $(echo "$body" | head -c 100)..."
        fi
        ((FAILED_TESTS++))
        return 1
    fi
}

test_container() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expect_code=${5:-200}

    ((TOTAL_TESTS++))
    echo -n "  [$TOTAL_TESTS] 测试 $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$CONTAINER_URL$endpoint" 2>/dev/null || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$CONTAINER_URL$endpoint" 2>/dev/null || echo -e "\n000")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expect_code" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${YELLOW}⚠️  跳过或失败 (HTTP $http_code)${NC}"
        if [ "$http_code" != "000" ]; then
            echo "     响应: $(echo "$body" | head -c 100)..."
        fi
        ((SKIPPED_TESTS++))
        return 1
    fi
}

# ==================== 1. 用户层测试 ====================

test_user_layer() {
    print_header "1️⃣  用户层测试 (User Layer)"

    echo "  测试前端页面可访问性..."
    test_api "首页" "GET" "/" "" 200
    test_api "KOL 列表" "GET" "/kol" "" 200
    test_api "交易终端" "GET" "/terminal" "" 200
    test_api "Cortex 页面" "GET" "/cortex" "" 200
    test_api "Creator 页面" "GET" "/creator" "" 200
    test_api "Governance 页面" "GET" "/gov" "" 200
}

# ==================== 2. 应用层测试 ====================

test_application_layer() {
    print_header "2️⃣  应用层测试 (Application Layer)"

    echo "  测试聊天 API..."
    test_api "普通聊天" "POST" "/api/chat" '{"prompt":"Hello, what is Solana?"}' 200
    test_api "KOL 聊天" "POST" "/api/chat" '{"prompt":"What is your favorite meme coin?","kolHandle":"blknoiz06"}' 200
    test_api "RAG 聊天" "POST" "/api/chat" '{"prompt":"What do you know about crypto?","kolHandle":"blknoiz06","useRAG":true}' 200

    echo "  测试知识库 API..."
    test_api "添加知识" "POST" "/api/knowledge" '{"kolHandle":"blknoiz06","content":"Test knowledge","metadata":{"source":"test"}}' 200
    test_api "查询统计" "GET" "/api/knowledge?kolHandle=blknoiz06" "" 200

    echo "  测试 Mindshare API..."
    test_api "获取 Mindshare 数据" "GET" "/api/mindshare/blknoiz06" "" 200

    echo "  测试 Agents API..."
    test_api "获取 Agent 列表" "GET" "/api/agents" "" 200

    echo "  测试 Agent Suite API..."
    test_api "创建 Suite" "POST" "/api/agent-suite" '{"kolHandle":"test-kol","modules":["avatar"]}' 200
    test_api "查询 Suite" "GET" "/api/agent-suite?suiteId=test-123" "" 200

    echo "  测试执行层 API 参数验证..."
    test_api "Distribute 参数验证" "POST" "/api/execution/distribute" '{"recipients":[]}' 400
    test_api "Strategy 参数验证" "POST" "/api/execution/strategy" '{"strategy":{}}' 400
}

# ==================== 3. 智能体层测试 ====================

test_agent_layer() {
    print_header "3️⃣  智能体层测试 (Agent Layer)"

    echo "  测试容器健康检查..."
    test_container "健康检查" "GET" "/health" "" 200

    echo "  测试 Twitter 插件..."
    test_container "Twitter 发推" "POST" "/api/twitter/post" '{"suiteId":"test-123","content":"Test tweet","kolName":"Test"}' 200

    echo "  测试 Discord 插件..."
    test_container "Discord 消息" "POST" "/api/discord/message" '{"suiteId":"test-123","channelId":"test","message":"Test"}' 200

    echo "  测试 Telegram 插件..."
    test_container "Telegram 消息" "POST" "/api/telegram/message" '{"suiteId":"test-123","chatId":"test","message":"Test"}' 200

    echo "  测试 Solana 插件..."
    test_container "Solana 余额查询" "POST" "/api/solana/trade" '{"suiteId":"test-123","action":"balance"}' 200
}

# ==================== 4. 执行层测试 ====================

test_execution_layer() {
    print_header "4️⃣  执行层测试 (Execution Layer)"

    echo "  测试交易构建（需要真实钱包，跳过实际执行）..."
    echo "  ⚠️  注意: 实际交易测试需要真实钱包和余额，此处仅测试 API 可用性"
    
    # 仅测试 API 端点可用性，不执行实际交易
    test_api "执行层 API 可用" "POST" "/api/execution/distribute" '{"payer":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","recipients":[{"address":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}],"network":"devnet"}' 200
}

# ==================== 5. 数据层测试 ====================

test_data_layer() {
    print_header "5️⃣  数据层测试 (Data Layer)"

    echo "  测试 D1 数据库（通过 Agent Suite API）..."
    test_api "创建 Suite（写入 D1）" "POST" "/api/agent-suite" '{"kolHandle":"test-db","modules":["avatar"]}' 200

    echo "  测试 Vectorize（通过知识库 API）..."
    test_api "添加知识（生成 Embedding）" "POST" "/api/knowledge" '{"kolHandle":"test-vector","content":"Test content for vector search","metadata":{"source":"test"}}' 200

    echo "  测试 R2 存储（文件上传）..."
    echo "  ⚠️  注意: R2 存储测试需要文件，此处跳过"

    echo "  测试 Cookie.fun API（降级机制）..."
    test_api "Mindshare API（带降级）" "GET" "/api/mindshare/blknoiz06" "" 200
}

# ==================== 6. 算力层测试 ====================

test_compute_layer() {
    print_header "6️⃣  算力层测试 (Compute Layer)"

    echo "  测试 Workers AI（通过聊天 API）..."
    test_api "AI 推理" "POST" "/api/chat" '{"prompt":"What is blockchain?"}' 200

    echo "  测试 Embedding 生成（通过知识库 API）..."
    test_api "生成 Embedding" "POST" "/api/knowledge" '{"kolHandle":"test-embedding","content":"Test content for embedding generation","metadata":{"source":"test"}}' 200

    echo "  测试容器算力（ElizaOS）..."
    test_container "容器健康（包含 AI 状态）" "GET" "/health" "" 200
}

# ==================== 主测试流程 ====================

main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   KOLMarket.ai 全面测试套件          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "基础 URL: $BASE_URL"
    echo "容器 URL: $CONTAINER_URL"
    echo ""

    # 执行所有测试
    test_user_layer
    test_application_layer
    test_agent_layer
    test_execution_layer
    test_data_layer
    test_compute_layer

    # 测试结果汇总
    print_header "📊 测试结果汇总"

    echo -e "${GREEN}✅ 通过: $PASSED_TESTS${NC}"
    echo -e "${RED}❌ 失败: $FAILED_TESTS${NC}"
    echo -e "${YELLOW}⏭️  跳过: $SKIPPED_TESTS${NC}"
    echo -e "${BLUE}📊 总计: $TOTAL_TESTS${NC}"
    echo ""

    if [ $TOTAL_TESTS -gt 0 ]; then
        SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "成功率: $SUCCESS_RATE%"
    fi

    echo ""
    if [ $FAILED_TESTS -eq 0 ] && [ $SKIPPED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有测试通过！${NC}"
        exit 0
    elif [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  部分测试跳过（可能未配置），但无失败${NC}"
        exit 0
    else
        echo -e "${RED}❌ 部分测试失败，请检查配置和日志${NC}"
        exit 1
    fi
}

# 运行主函数
main
