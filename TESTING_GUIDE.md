# 🧪 机器人测试指南

**服务 URL**: `https://kolmarketsolana-production.up.railway.app`

---

## 🚀 快速测试

### 使用自动化测试脚本

```bash
# 设置容器 URL（可选，默认使用 Railway URL）
export ELIZAOS_CONTAINER_URL=https://kolmarketsolana-production.up.railway.app

# 运行测试脚本
./scripts/test-all-plugins.sh
```

脚本会自动测试：
1. ✅ 健康检查
2. ✅ Twitter 插件
3. ✅ Discord 插件
4. ✅ Telegram 插件
5. ✅ Solana 插件

---

## 📋 手动测试步骤

### 测试 1: 健康检查

```bash
curl https://kolmarketsolana-production.up.railway.app/health
```

**预期响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T...",
  "agents": 0
}
```

---

### 测试 2: Twitter 插件 (Avatar 模块)

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文 - 来自 KOLMarket 测试",
    "kolName": "Test KOL"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "tweetId": "...",
  "message": "Tweet posted successfully"
}
```

**成功标志**: 
- HTTP 状态码: 200 或 201
- 返回 `success: true`
- 在 Twitter 上可以看到推文

---

### 测试 3: Discord 插件 (Mod 模块)

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/discord/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "channelId": "YOUR_CHANNEL_ID",
    "content": "测试 Discord 消息 - 来自 KOLMarket"
  }'
```

**需要的信息**:
- `channelId`: Discord 频道 ID（右键点击频道 → 复制 ID）

**预期响应**:
```json
{
  "success": true,
  "messageId": "...",
  "message": "Message sent successfully"
}
```

**成功标志**:
- HTTP 状态码: 200 或 201
- 返回 `success: true`
- 在 Discord 频道中可以看到消息

---

### 测试 4: Telegram 插件 (Mod 模块)

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/telegram/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "chatId": "YOUR_CHAT_ID",
    "content": "测试 Telegram 消息 - 来自 KOLMarket"
  }'
```

**需要的信息**:
- `chatId`: Telegram 聊天 ID（可以使用 `@userinfobot` 获取）

**预期响应**:
```json
{
  "success": true,
  "messageId": "...",
  "message": "Message sent successfully"
}
```

**成功标志**:
- HTTP 状态码: 200 或 201
- 返回 `success: true`
- 在 Telegram 中可以看到消息

---

### 测试 5: Solana 插件 (Trader 模块)

#### 测试余额查询（安全）

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/solana/trade \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "action": "balance",
    "token": "SOL"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "balance": "1.234567",
  "address": "..."
}
```

#### 测试交易（谨慎使用）

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/solana/trade \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "action": "buy",
    "token": "SOL",
    "amount": 0.1
  }'
```

**⚠️ 警告**: 这会执行真实的链上交易，请谨慎测试！

---

## 🔍 测试结果判断

### ✅ 成功标志

- HTTP 状态码: 200 或 201
- 响应包含 `success: true`
- 功能正常工作（消息发送、推文发布等）

### ❌ 失败标志

- HTTP 状态码: 400, 401, 403, 500 等
- 响应包含错误信息
- 常见错误:
  - `not configured` - 插件未配置
  - `invalid credentials` - API Keys 无效
  - `unauthorized` - 权限不足

---

## 📊 测试检查清单

- [ ] 健康检查通过
- [ ] Twitter 插件测试通过
- [ ] Discord 插件测试通过
- [ ] Telegram 插件测试通过
- [ ] Solana 插件测试通过（余额查询）
- [ ] 所有插件在日志中显示 ✅

---

## 🔧 故障排查

### 如果测试失败

1. **检查服务状态**
   ```bash
   curl https://kolmarketsolana-production.up.railway.app/health
   ```

2. **查看 Railway 日志**
   - 在 Railway Dashboard 中查看部署日志
   - 确认所有插件显示 ✅

3. **验证环境变量**
   - 在 Railway Dashboard → Variables 中确认
   - 确保所有 API Keys 和 Token 已配置

4. **检查 API Keys**
   - 确认 API Keys 有效且未过期
   - 确认权限设置正确

---

## 📚 相关文档

- [插件验证指南](./PLUGINS_VERIFICATION.md)
- [Railway 部署指南](./docs/RAILWAY_DEPLOY.md)
- [插件配置指南](./RAILWAY_PLUGINS_CONFIG.md)

---

**最后更新**: 2024-01-22
