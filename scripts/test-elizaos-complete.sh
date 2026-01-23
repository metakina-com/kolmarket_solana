#!/bin/bash

# ============================================
# ElizaOS 完整测试脚本（一键运行，无交互）
# ============================================
# 1. 运行 verify-elizaos 验证
# 2. 容器健康检查（可选 502）
# 3. Next.js App：创建 Suite → Avatar 发推 → Trader 交易（降级模式）
# ============================================

set -e

BASE_URL="${1:-http://localhost:3000}"
CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"
KOL_HANDLE="blknoiz06"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
WARN=0

echo "============================================"
echo "🧪 ElizaOS 完整测试"
echo "============================================"
echo "App URL:      $BASE_URL"
echo "Container:    $CONTAINER_URL"
echo "KOL:          $KOL_HANDLE"
echo ""

# -------------------- 1. 验证脚本 --------------------
if [ "${SKIP_VERIFY}" != "1" ]; then
  echo "📋 步骤 1: 运行 verify-elizaos.sh"
  echo "----------------------------------------"
  if [ -f "scripts/verify-elizaos.sh" ]; then
    export ELIZAOS_CONTAINER_URL="$CONTAINER_URL"
    bash scripts/verify-elizaos.sh || true
    echo ""
  else
    echo -e "${YELLOW}⚠️  scripts/verify-elizaos.sh 不存在，跳过${NC}"
    ((WARN++)) || true
  fi
else
  echo "📋 步骤 1: 跳过 verify（SKIP_VERIFY=1）"
  echo ""
fi

# -------------------- 2. 容器健康检查 --------------------
echo "📋 步骤 2: 容器健康检查"
echo "----------------------------------------"
HEALTH=$(curl -s -w "\n%{http_code}" --connect-timeout 5 "$CONTAINER_URL/health" 2>/dev/null) || true
HTTP=$(echo "$HEALTH" | tail -n1)
BODY=$(echo "$HEALTH" | sed '$d')

if [ "$HTTP" = "200" ]; then
  echo -e "${GREEN}✅ 容器健康 (HTTP 200)${NC}"
  echo "$BODY" | head -c 200
  echo ""
  ((PASSED++)) || true
else
  echo -e "${YELLOW}⚠️  容器 $HTTP（可能 502/超时），将使用降级模式${NC}"
  echo "   $BODY" | head -c 120
  echo ""
  ((WARN++)) || true
fi
echo ""

# -------------------- 3. Agent Suite API（依赖 Next.js） --------------------
echo "📋 步骤 3: Agent Suite API 测试（需先 npm run dev）"
echo "----------------------------------------"

# 3.1 创建 Suite
echo -n "  创建 Suite (POST /api/agent-suite)... "
CREATE_RESP=$(curl -s -w "\n%{http_code}" --connect-timeout 5 -m 15 -X POST "$BASE_URL/api/agent-suite" \
  -H "Content-Type: application/json" \
  -d "{\"kolHandle\":\"$KOL_HANDLE\",\"modules\":{\"avatar\":{},\"trader\":{}}}" 2>/dev/null) || true
CREATE_HTTP=$(echo "$CREATE_RESP" | tail -n1)
CREATE_BODY=$(echo "$CREATE_RESP" | sed '$d')

if [ "$CREATE_HTTP" -ge 200 ] 2>/dev/null && [ "$CREATE_HTTP" -lt 300 ] 2>/dev/null; then
  echo -e "${GREEN}✅ $CREATE_HTTP${NC}"
  SUITE_ID=""
  if command -v jq >/dev/null 2>&1; then
    SUITE_ID=$(echo "$CREATE_BODY" | jq -r '.suite.suiteId // empty')
  fi
  if [ -z "$SUITE_ID" ]; then
    SUITE_ID=$(echo "$CREATE_BODY" | grep -oE '"suiteId"\s*:\s*"[^"]*"' | head -1 | grep -oE '"[^"]*"' | tail -1 | tr -d '"')
  fi
  if [ -z "$SUITE_ID" ]; then
    echo "      (无法解析 suiteId，使用固定 ID 继续)"
    SUITE_ID="suite-$KOL_HANDLE-0"
  else
    echo "      suiteId: $SUITE_ID"
  fi
  ((PASSED++)) || true
else
  echo -e "${RED}❌ HTTP $CREATE_HTTP${NC}"
  echo "      $CREATE_BODY" | head -c 200
  echo ""
  SUITE_ID=""
  ((FAILED++)) || true
fi

# 3.2 Avatar 发推（仅当创建成功时）
if [ -n "$SUITE_ID" ]; then
  echo -n "  Avatar 发推 (POST /api/agent-suite/avatar)... "
  AVATAR_RESP=$(curl -s -w "\n%{http_code}" --connect-timeout 5 -m 15 -X POST "$BASE_URL/api/agent-suite/avatar" \
    -H "Content-Type: application/json" \
    -d "{\"suiteId\":\"$SUITE_ID\",\"content\":\"ElizaOS 测试推文 $(date +%H:%M)\"}" 2>/dev/null) || true
  AVATAR_HTTP=$(echo "$AVATAR_RESP" | tail -n1)
  AVATAR_BODY=$(echo "$AVATAR_RESP" | sed '$d')

  if [ "$AVATAR_HTTP" -ge 200 ] 2>/dev/null && [ "$AVATAR_HTTP" -lt 300 ] 2>/dev/null; then
    echo -e "${GREEN}✅ $AVATAR_HTTP${NC}"
    echo "$AVATAR_BODY" | grep -o '"tweetId":"[^"]*"' | head -1 || true
    ((PASSED++)) || true
  else
    echo -e "${RED}❌ HTTP $AVATAR_HTTP${NC}"
    echo "      $AVATAR_BODY" | head -c 150
    ((FAILED++)) || true
  fi
  echo ""

  # 3.3 Trader 交易（降级返回 tx-fallback-*，不执行真实链上交易）
  echo -n "  Trader 交易 (POST /api/agent-suite/trader)... "
  TRADER_RESP=$(curl -s -w "\n%{http_code}" --connect-timeout 5 -m 15 -X POST "$BASE_URL/api/agent-suite/trader" \
    -H "Content-Type: application/json" \
    -d "{\"suiteId\":\"$SUITE_ID\",\"action\":\"buy\",\"token\":\"SOL\",\"amount\":0.001}" 2>/dev/null) || true
  TRADER_HTTP=$(echo "$TRADER_RESP" | tail -n1)
  TRADER_BODY=$(echo "$TRADER_RESP" | sed '$d')

  if [ "$TRADER_HTTP" -ge 200 ] 2>/dev/null && [ "$TRADER_HTTP" -lt 300 ] 2>/dev/null; then
    echo -e "${GREEN}✅ $TRADER_HTTP${NC}"
    echo "$TRADER_BODY" | grep -oE '"txSignature":"[^"]*"' | head -1 || true
    ((PASSED++)) || true
  else
    echo -e "${RED}❌ HTTP $TRADER_HTTP${NC}"
    echo "      $TRADER_BODY" | head -c 150
    ((FAILED++)) || true
  fi
  echo ""

  # -------------------- 4. GET Suite --------------------
  echo -n "  查询 Suite (GET /api/agent-suite?kolHandle=...)... "
  GET_RESP=$(curl -s -w "\n%{http_code}" --connect-timeout 5 -m 15 "$BASE_URL/api/agent-suite?kolHandle=$KOL_HANDLE" 2>/dev/null) || true
  GET_HTTP=$(echo "$GET_RESP" | tail -n1)
  if [ "$GET_HTTP" -ge 200 ] 2>/dev/null && [ "$GET_HTTP" -lt 300 ] 2>/dev/null; then
    echo -e "${GREEN}✅ $GET_HTTP${NC}"
    ((PASSED++)) || true
  else
    echo -e "${YELLOW}⚠️  HTTP $GET_HTTP（可能无 DB 或 404）${NC}"
    ((WARN++)) || true
  fi
  echo ""
else
  echo -e "${YELLOW}⏭️  跳过 Avatar / Trader / GET Suite（创建 Suite 未成功）${NC}"
  echo ""
fi

# -------------------- 汇总 --------------------
echo "============================================"
echo "📊 ElizaOS 测试结果"
echo "============================================"
echo -e "${GREEN}✅ 通过: $PASSED${NC}"
echo -e "${YELLOW}⚠️  警告: $WARN${NC}"
echo -e "${RED}❌ 失败: $FAILED${NC}"
echo ""

if [ "$FAILED" -gt 0 ]; then
  echo "💡 若 API 失败，请先执行: npm run dev"
  echo "   再运行: bash scripts/test-elizaos-complete.sh http://localhost:3000"
  exit 1
fi

echo -e "${GREEN}🎉 ElizaOS 测试完成${NC}"
exit 0
