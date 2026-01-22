#!/bin/bash

# API 测试脚本
# 用于测试所有 API 端点

BASE_URL="${1:-http://localhost:3000}"
echo "🧪 测试 API 端点: $BASE_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数：期望 2xx
test_api() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -n "测试 $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✅ 成功 (HTTP $http_code)${NC}"
    echo "   响应: $(echo "$body" | head -c 100)..."
    return 0
  else
    echo -e "${RED}❌ 失败 (HTTP $http_code)${NC}"
    echo "   响应: $body"
    return 1
  fi
}

# 测试函数：期望指定 HTTP 状态码（如 400）
test_api_expect() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expect=$5

  echo -n "测试 $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expect" ]; then
    echo -e "${GREEN}✅ 符合预期 (HTTP $http_code)${NC}"
    return 0
  else
    echo -e "${RED}❌ 期望 HTTP $expect，实际 $http_code${NC}"
    echo "   响应: $body"
    return 1
  fi
}

# 1. 测试聊天 API（普通模式）
echo "📱 聊天 API 测试"
test_api "普通聊天" "POST" "/api/chat" '{"prompt":"Hello, what is Solana?"}'
echo ""

# 2. 测试聊天 API（带 KOL）
test_api "KOL 聊天" "POST" "/api/chat" '{"prompt":"What is your favorite meme coin?","kolHandle":"blknoiz06"}'
echo ""

# 3. 测试聊天 API（RAG 模式）
test_api "RAG 聊天" "POST" "/api/chat" '{"prompt":"What do you know about crypto?","kolHandle":"blknoiz06","useRAG":true}'
echo ""

# 4. 测试知识库 API - 添加知识
echo "📚 知识库 API 测试"
test_api "添加知识" "POST" "/api/knowledge" '{
  "kolHandle":"blknoiz06",
  "content":"Ansem is a well-known crypto trader who focuses on meme coins and Solana ecosystem.",
  "metadata":{"source":"twitter","type":"bio"}
}'
echo ""

# 5. 测试知识库 API - 查询统计
test_api "查询统计" "GET" "/api/knowledge?kolHandle=blknoiz06" ""
echo ""

# 6. 测试 Mindshare API
echo "📊 Mindshare API 测试"
test_api "获取 Mindshare 数据" "GET" "/api/mindshare/blknoiz06" ""
echo ""

# 7. 测试 Agents API
echo "🤖 Agents API 测试"
test_api "获取 Agent 列表" "GET" "/api/agents" ""
echo ""

# 8. 执行层 API：Distribute / Strategy 校验（400）
echo "💰 执行层 API 测试（参数校验）"
test_api_expect "Distribute 缺 payer" "POST" "/api/execution/distribute" \
  '{"recipients":[{"address":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}],"network":"devnet"}' 400
test_api_expect "Distribute 空 recipients" "POST" "/api/execution/distribute" \
  '{"recipients":[],"payer":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","network":"devnet"}' 400
test_api_expect "Distribute 非法 payer" "POST" "/api/execution/distribute" \
  '{"recipients":[{"address":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}],"payer":"invalid-base58","network":"devnet"}' 400
test_api_expect "Strategy 缺 payer" "POST" "/api/execution/strategy" \
  '{"strategy":{"id":"s1","name":"Test","description":"","rules":[{"condition":"balance > 0","action":"transfer","parameters":{"recipient":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}}],"enabled":true},"network":"devnet"}' 400
test_api_expect "Strategy 缺 strategy" "POST" "/api/execution/strategy" \
  '{"payer":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","network":"devnet"}' 400
test_api_expect "Strategy 非法 payer" "POST" "/api/execution/strategy" \
  '{"strategy":{"id":"s1","name":"Test","description":"","rules":[{"condition":"balance > 0","action":"transfer","parameters":{"recipient":"HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH","amount":0.1}}],"enabled":true},"payer":"bad-pubkey","network":"devnet"}' 400
echo ""

echo "✅ API 测试完成！"
echo ""
echo "💡 提示："
echo "  - 如果服务器未运行，请先执行: npm run dev"
echo "  - 某些测试可能需要 Cloudflare 环境才能完全工作"
echo "  - RAG 测试需要先添加知识到知识库"
echo "  - Distribute/Strategy 成功用例需有余额的钱包，未在脚本中覆盖"
