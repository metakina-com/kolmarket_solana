# 🤖 Discord Bot Token 获取详细指南

**用途**: 配置 Discord 插件，使 Mod 模块可以作为 Discord 机器人运行

---

## 📋 获取步骤（详细）

### 步骤 1: 访问 Discord Developer Portal

1. 打开浏览器，访问: https://discord.com/developers/applications
2. 使用您的 Discord 账户登录
3. 如果没有账户，先注册: https://discord.com/register

---

### 步骤 2: 创建新应用

1. 在 Discord Developer Portal 页面
2. 点击右上角的 **"New Application"** 按钮
3. 输入应用名称，例如: `KOLMarket Bot`
4. 点击 **"Create"** 创建应用

---

### 步骤 3: 创建 Bot

1. 在应用设置页面，点击左侧菜单的 **"Bot"**
2. 点击 **"Add Bot"** 或 **"Create a Bot"** 按钮
3. 确认创建（点击 "Yes, do it!"）

---

### 步骤 4: 获取 Bot Token

1. 在 **"Bot"** 页面，找到 **"Token"** 部分
2. 点击 **"Reset Token"** 或 **"Copy"** 按钮
3. **重要**: 立即复制 Token（只显示一次）
4. Token 格式类似: `YOUR_BOT_TOKEN_HERE.ABC123.XyZ789`（实际 Token 会更长）

> ⚠️ **安全提示**: 
> - Token 相当于机器人的密码，不要分享给任何人
> - 如果泄露，立即点击 "Reset Token" 重置
> - 不要将 Token 提交到 Git 仓库

---

### 步骤 5: 配置 Bot 权限

1. 在 **"Bot"** 页面，找到 **"Privileged Gateway Intents"** 部分
2. **必须启用以下权限**:
   - ✅ **MESSAGE CONTENT INTENT** - 允许机器人读取消息内容（必需）
   - ✅ **SERVER MEMBERS INTENT** - 允许机器人查看服务器成员（可选，但推荐）
   - ✅ **PRESENCE INTENT** - 允许机器人查看用户状态（可选）

3. 点击 **"Save Changes"** 保存

---

### 步骤 6: 生成邀请链接（可选）

如果您想将机器人添加到 Discord 服务器：

1. 点击左侧菜单的 **"OAuth2"** → **"URL Generator"**
2. 在 **"Scopes"** 部分，勾选:
   - ✅ `bot`
   - ✅ `applications.commands`（如果使用斜杠命令）
3. 在 **"Bot Permissions"** 部分，勾选需要的权限:
   - ✅ `Send Messages`
   - ✅ `Read Message History`
   - ✅ `Manage Messages`（如果需要）
   - ✅ `Embed Links`
   - ✅ `Attach Files`
4. 复制生成的 **"Generated URL"**
5. 在浏览器中打开该 URL，选择要添加机器人的服务器
6. 授权机器人加入服务器

---

### 步骤 7: 配置到 Railway

1. 访问 Railway Dashboard: https://railway.app/
2. 进入服务 `kolmarket_solana`
3. 点击 **"Variables"** 标签
4. 点击 **"+ New Variable"** 或 **"Add Variable"**
5. 输入:
   - **Name**: `DISCORD_BOT_TOKEN`
   - **Value**: 粘贴您复制的 Bot Token
6. 点击 **"Add"** 保存

---

## 📝 配置示例

在 Railway Dashboard → Variables 中添加：

```
DISCORD_BOT_TOKEN=YOUR_ACTUAL_BOT_TOKEN_HERE
```

> 💡 **提示**: 将 `YOUR_ACTUAL_BOT_TOKEN_HERE` 替换为您从 Discord Developer Portal 复制的实际 Token

---

## ✅ 配置后的验证

### 步骤 1: 等待重新部署

添加环境变量后，Railway 会自动重新部署服务（通常 2-3 分钟）。

### 步骤 2: 查看部署日志

在 Railway Dashboard 中：

1. 进入服务 → **"Deployments"** 标签
2. 查看最新的部署日志
3. 确认 Discord 插件状态：

**配置前**:
```
Discord: ❌
```

**配置后**:
```
Discord: ✅
```

### 步骤 3: 测试功能

#### 测试 Discord API

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/discord/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "channelId": "your-channel-id",
    "content": "测试消息"
  }'
```

#### 在 Discord 中测试

1. 将机器人添加到您的 Discord 服务器
2. 在频道中发送消息
3. 机器人应该能够响应（如果配置了响应逻辑）

---

## 🔍 常见问题

### Q1: Token 在哪里找到？

**A**: 在 Discord Developer Portal → 您的应用 → Bot → Token 部分

### Q2: Token 显示为 "Hidden" 怎么办？

**A**: 点击 **"Reset Token"** 或 **"Copy"** 按钮，Token 会显示出来

### Q3: Token 泄露了怎么办？

**A**: 立即在 Discord Developer Portal 中点击 **"Reset Token"** 重置，然后更新 Railway 中的环境变量

### Q4: 机器人无法读取消息？

**A**: 确保在 Bot 设置中启用了 **"MESSAGE CONTENT INTENT"** 权限

### Q5: 机器人无法加入服务器？

**A**: 检查 OAuth2 权限设置，确保勾选了 `bot` scope 和必要的权限

---

## 🔐 安全最佳实践

1. **保护 Token**
   - ✅ 只在 Railway Variables 中配置
   - ✅ 不要提交到 Git 仓库
   - ✅ 不要分享给他人
   - ✅ 定期轮换 Token

2. **权限最小化**
   - ✅ 只授予机器人必要的权限
   - ✅ 定期审查权限设置

3. **监控使用**
   - ✅ 定期检查机器人活动
   - ✅ 如果发现异常，立即重置 Token

---

## 📚 相关资源

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord API 文档**: https://discord.com/developers/docs
- **Bot 权限说明**: https://discord.com/developers/docs/topics/permissions
- **Gateway Intents**: https://discord.com/developers/docs/topics/gateway#gateway-intents

---

## 🎯 快速检查清单

- [ ] 在 Discord Developer Portal 创建应用
- [ ] 创建 Bot
- [ ] 复制 Bot Token
- [ ] 启用 MESSAGE CONTENT INTENT
- [ ] 在 Railway Variables 中添加 DISCORD_BOT_TOKEN
- [ ] 等待重新部署
- [ ] 查看日志确认 Discord: ✅
- [ ] 测试 Discord 功能

---

**最后更新**: 2024-01-22
