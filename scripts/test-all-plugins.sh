#!/bin/bash

# ============================================
# 测试所有 ElizaOS 插件
# ============================================

set -e

# 配置
CONTAINER_URL="${ELIZAOS_CONTAINER_URL:-https://kolmarketsolana-production.up.railway.app}"
SUITE_ID="test-$(date +%s)"

echo "🤖 开始测试所有机器人插件"
echo "================================"
echo ""
echo "容器 URL: $CONTAINER_URL"
echo "Suite ID: $SUITE_ID"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASSED=0
FAILED=0

# ==================== 测试函数 ====================

test_health() {
    echo "📊 测试 1: 健康检查"
    echo "-------------------"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$CONTAINER_URL/health")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
        echo "响应: $BODY"
        ((PASSED++))
    else
        echo -e "${RED}❌ 健康检查失败${NC}"
        echo "HTTP 状态码: $HTTP_CODE"
        echo "响应: $BODY"
        ((FAILED++))
    fi
    echo ""
}

test_twitter() {
    echo "🐦 测试 2: Twitter 插件 (Avatar 模块)"
    echo "-----------------------------------"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTAINER_URL/api/twitter/post" \
        -H "Content-Type: application/json" \
        -d "{
            \"suiteId\": \"$SUITE_ID\",
            \"content\": \"测试推文 - 来自 KOLMarket 测试脚本 - $(date)\",
            \"kolName\": \"Test KOL\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Twitter 插件测试通过${NC}"
        echo "响应: $BODY"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  Twitter 插件测试失败或未配置${NC}"
        echo "HTTP 状态码: $HTTP_CODE"
        echo "响应: $BODY"
        if echo "$BODY" | grep -q "not configured\|credentials"; then
            echo "提示: Twitter API Keys 可能未配置或无效"
        fi
        ((FAILED++))
    fi
    echo ""
}

test_discord() {
    echo "💬 测试 3: Discord 插件 (Mod 模块)"
    echo "--------------------------------"
    
    echo "请输入 Discord Channel ID (或按 Enter 跳过): "
    read -r CHANNEL_ID
    
    if [ -z "$CHANNEL_ID" ]; then
        echo -e "${YELLOW}⏭️  跳过 Discord 测试（需要 Channel ID）${NC}"
        echo ""
        return
    fi
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTAINER_URL/api/discord/message" \
        -H "Content-Type: application/json" \
        -d "{
            \"suiteId\": \"$SUITE_ID\",
            \"channelId\": \"$CHANNEL_ID\",
            \"content\": \"测试 Discord 消息 - 来自 KOLMarket 测试脚本 - $(date)\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Discord 插件测试通过${NC}"
        echo "响应: $BODY"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  Discord 插件测试失败或未配置${NC}"
        echo "HTTP 状态码: $HTTP_CODE"
        echo "响应: $BODY"
        if echo "$BODY" | grep -q "not configured\|token"; then
            echo "提示: Discord Bot Token 可能未配置或无效"
        fi
        ((FAILED++))
    fi
    echo ""
}

test_telegram() {
    echo "📱 测试 4: Telegram 插件 (Mod 模块)"
    echo "----------------------------------"
    
    echo "请输入 Telegram Chat ID (或按 Enter 跳过): "
    read -r CHAT_ID
    
    if [ -z "$CHAT_ID" ]; then
        echo -e "${YELLOW}⏭️  跳过 Telegram 测试（需要 Chat ID）${NC}"
        echo ""
        return
    fi
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTAINER_URL/api/telegram/message" \
        -H "Content-Type: application/json" \
        -d "{
            \"suiteId\": \"$SUITE_ID\",
            \"chatId\": \"$CHAT_ID\",
            \"content\": \"测试 Telegram 消息 - 来自 KOLMarket 测试脚本 - $(date)\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Telegram 插件测试通过${NC}"
        echo "响应: $BODY"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  Telegram 插件测试失败或未配置${NC}"
        echo "HTTP 状态码: $HTTP_CODE"
        echo "响应: $BODY"
        if echo "$BODY" | grep -q "not configured\|token"; then
            echo "提示: Telegram Bot Token 可能未配置或无效"
        fi
        ((FAILED++))
    fi
    echo ""
}

test_solana() {
    echo "💰 测试 5: Solana 插件 (Trader 模块)"
    echo "----------------------------------"
    
    echo "⚠️  警告: 这将测试真实的 Solana 交易功能"
    echo "是否继续? (y/n): "
    read -r CONFIRM
    
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        echo -e "${YELLOW}⏭️  跳过 Solana 测试${NC}"
        echo ""
        return
    fi
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CONTAINER_URL/api/solana/trade" \
        -H "Content-Type: application/json" \
        -d "{
            \"suiteId\": \"$SUITE_ID\",
            \"action\": \"balance\",
            \"token\": \"SOL\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Solana 插件测试通过${NC}"
        echo "响应: $BODY"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  Solana 插件测试失败或未配置${NC}"
        echo "HTTP 状态码: $HTTP_CODE"
        echo "响应: $BODY"
        if echo "$BODY" | grep -q "not configured\|private key"; then
            echo "提示: Solana Private Key 可能未配置或无效"
        fi
        ((FAILED++))
    fi
    echo ""
}

# ==================== 执行测试 ====================

echo "开始测试..."
echo ""

# 测试健康检查
test_health

# 测试 Twitter
test_twitter

# 测试 Discord
test_discord

# 测试 Telegram
test_telegram

# 测试 Solana
test_solana

# ==================== 测试结果 ====================

echo "================================"
echo "📊 测试结果汇总"
echo "================================"
echo -e "${GREEN}✅ 通过: $PASSED${NC}"
echo -e "${RED}❌ 失败: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "成功率: $SUCCESS_RATE%"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  部分测试失败，请检查配置${NC}"
    exit 1
fi
