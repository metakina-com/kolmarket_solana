# 🔧 Railway 插件配置指南 - 消除 "X" 标记

**问题**: 部署日志显示插件标记为 "X"（未配置）  
**解决**: 在 Railway Dashboard 中配置相应的环境变量

---

## 📍 配置位置

### 在 Railway Dashboard 中

1. **访问 Railway Dashboard**
   - 打开: https://railway.app/
   - 登录您的账户

2. **进入服务设置**
   - 选择项目 `kolmarket_solana`
   - 点击服务 `kolmarket_solana`
   - 点击 **"Variables"** 标签

3. **添加环境变量**
   - 点击 **"+ New Variable"** 或 **"Add Variable"**
   - 输入变量名和值
   - 点击 **"Add"** 保存

---

## 🔐 各插件配置说明

### 1. Twitter 插件（Avatar 模块）

**需要配置的变量**:

```
TWITTER_API_KEY=your-api-key
TWITTER_API_SECRET=your-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
```

**如何获取**:
1. 访问: https://developer.twitter.com/
2. 创建 Twitter Developer 账户
3. 创建应用（App）
4. 获取 API Keys 和 Access Tokens

**配置后**: Twitter 插件将显示 ✅，Avatar 模块可以自动发推

---

### 2. Discord 插件（Mod 模块）

**需要配置的变量**:

```
DISCORD_BOT_TOKEN=your-bot-token
```

**如何获取**:
1. 访问: https://discord.com/developers/applications
2. 创建新应用（New Application）
3. 进入 **"Bot"** 标签
4. 点击 **"Reset Token"** 或 **"Copy"** 获取 Bot Token
5. 确保启用 **"Message Content Intent"** 权限

**配置后**: Discord 插件将显示 ✅，Mod 模块可以作为 Discord 机器人运行

---

### 3. Telegram 插件（Mod 模块）

**需要配置的变量**:

```
TELEGRAM_BOT_TOKEN=your-bot-token
```

**如何获取**:
1. 在 Telegram 中搜索: `@BotFather`
2. 发送命令: `/newbot`
3. 按照提示创建机器人
4. 获取 Bot Token（格式: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

**配置后**: Telegram 插件将显示 ✅，Mod 模块可以作为 Telegram 机器人运行

---

### 4. Solana 插件（Trader 模块）

**需要配置的变量**:

```
SOLANA_PRIVATE_KEY=your-private-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**如何获取**:
1. **Private Key**: 
   - 使用 Solana CLI: `solana-keygen new`
   - 或从现有钱包导出
   - 格式: Base58 编码的私钥

2. **RPC URL**:
   - 主网: `https://api.mainnet-beta.solana.com`
   - 测试网: `https://api.testnet.solana.com`
   - 或使用第三方 RPC（如 QuickNode、Alchemy）

**配置后**: Solana 插件将显示 ✅，Trader 模块可以执行链上交易

---

## 📋 完整配置示例

在 Railway Dashboard → Variables 中添加：

### 基础配置（必需）

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

### Twitter 配置（可选）

```
TWITTER_API_KEY=your-api-key-here
TWITTER_API_SECRET=your-api-secret-here
TWITTER_ACCESS_TOKEN=your-access-token-here
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret-here
```

### Discord 配置（可选）

```
DISCORD_BOT_TOKEN=your-discord-bot-token-here
```

### Telegram 配置（可选）

```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
```

### Solana 配置（可选）

```
SOLANA_PRIVATE_KEY=your-solana-private-key-here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## ✅ 配置后的验证

### 步骤 1: 等待重新部署

添加环境变量后，Railway 会自动重新部署服务（通常 2-3 分钟）。

### 步骤 2: 查看部署日志

在 Railway Dashboard 中：

1. 进入服务 → **"Deployments"** 标签
2. 查看最新的部署日志
3. 确认插件状态：

**配置前**:
```
Twitter: ❌
Discord: ❌
Telegram: ❌
Solana: ❌
```

**配置后**:
```
Twitter: ✅
Discord: ✅
Telegram: ✅
Solana: ✅
```

### 步骤 3: 测试功能

#### 测试 Twitter（如果配置了）

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "测试推文",
    "kolName": "Test KOL"
  }'
```

#### 测试 Discord（如果配置了）

```bash
curl -X POST https://kolmarketsolana-production.up.railway.app/api/discord/message \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "channelId": "your-channel-id",
    "content": "测试消息"
  }'
```

---

## 🎯 配置优先级

### 必需配置（立即配置）

1. ✅ `NODE_ENV=production`
2. ✅ `PORT=3001`
3. ✅ `HOST=0.0.0.0`

### 可选配置（根据需要）

- **如果需要 Twitter 功能** → 配置 Twitter API Keys
- **如果需要 Discord 功能** → 配置 Discord Bot Token
- **如果需要 Telegram 功能** → 配置 Telegram Bot Token
- **如果需要 Solana 交易** → 配置 Solana Private Key 和 RPC URL

---

## ⚠️ 安全注意事项

1. **不要泄露 API Keys**
   - 只在 Railway Dashboard 中配置
   - 不要提交到 Git 仓库
   - 不要分享给他人

2. **定期轮换密钥**
   - 定期更新 API Keys
   - 如果泄露，立即重置

3. **使用环境变量**
   - 永远不要在代码中硬编码
   - 使用 Railway 的 Variables 功能

---

## 📝 配置检查清单

- [ ] 基础环境变量已配置（NODE_ENV, PORT, HOST）
- [ ] Twitter API Keys 已配置（如果需要）
- [ ] Discord Bot Token 已配置（如果需要）
- [ ] Telegram Bot Token 已配置（如果需要）
- [ ] Solana 配置已配置（如果需要）
- [ ] 等待重新部署完成
- [ ] 查看日志确认插件状态为 ✅
- [ ] 测试相关功能

---

## 🔗 相关资源

- **Twitter Developer**: https://developer.twitter.com/
- **Discord Developer**: https://discord.com/developers/applications
- **Telegram BotFather**: https://t.me/BotFather
- **Solana RPC**: https://docs.solana.com/cluster/rpc-endpoints

---

## 💡 提示

1. **逐步配置**: 不需要一次性配置所有插件，可以根据需要逐步添加。

2. **测试单个插件**: 配置一个插件后，先测试该插件功能，再配置下一个。

3. **查看日志**: 配置后查看部署日志，确认插件状态从 ❌ 变为 ✅。

4. **自动重新部署**: 添加环境变量后，Railway 会自动重新部署，无需手动操作。

---

**最后更新**: 2024-01-22
