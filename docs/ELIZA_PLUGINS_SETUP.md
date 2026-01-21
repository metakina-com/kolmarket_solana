# ElizaOS 插件集成配置指南

## ✅ 已安装的插件

- ✅ `@elizaos/core` - ElizaOS 核心运行时
- ✅ `@elizaos/plugin-twitter` - Twitter/X 插件
- ✅ `@elizaos/plugin-discord` - Discord 插件
- ✅ `@elizaos/plugin-telegram` - Telegram 插件
- ✅ `@elizaos/plugin-solana-agent-kit` - Solana 交易插件

## 🔧 环境变量配置

在 `.env.local` 文件中添加以下环境变量：

### Twitter (Avatar 模块)

```bash
# Twitter API 凭证
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

**获取 Twitter API 凭证：**
1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 创建应用并获取 API Keys 和 Access Tokens
3. 确保应用有读写权限

### Discord (Mod 模块)

```bash
# Discord Bot Token
DISCORD_BOT_TOKEN=your_discord_bot_token
```

**获取 Discord Bot Token：**
1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 创建新应用
3. 在 "Bot" 页面创建 Bot
4. 复制 Bot Token
5. 启用必要的权限（Send Messages, Read Messages, etc.）

### Telegram (Mod 模块)

```bash
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

**获取 Telegram Bot Token：**
1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按照提示创建 Bot
4. 复制返回的 Bot Token

### Solana (Trader 模块)

```bash
# Solana 配置
SOLANA_PRIVATE_KEY=your_private_key_hex  # 或 base58
SOLANA_PUBLIC_KEY=your_public_key        # 可选，如果只有 public key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # 或自定义 RPC
```

**获取 Solana 密钥：**
1. 使用 `solana-keygen` 生成密钥对
2. 或从现有钱包导出私钥
3. ⚠️ **安全提示**: 私钥应存储在安全的地方，不要提交到代码仓库

### ElizaOS 模型配置

```bash
# 模型提供者（可选，默认使用 Cloudflare AI）
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI  # 或 OPEN_AI, ANTHROPIC

# 模型名称（可选）
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct  # Cloudflare AI
# ELIZA_MODEL=gpt-4  # OpenAI
# ELIZA_MODEL=claude-3-opus  # Anthropic

# 如果使用 OpenAI
# OPENAI_API_KEY=your_openai_api_key

# 如果使用 Anthropic
# ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 🚀 使用示例

### 创建带 Twitter 插件的 Suite

```typescript
import { createFullAgentSuite } from "@/lib/agents/agent-suite";
import { getKOLPersona } from "@/lib/agents/kol-personas";

const persona = getKOLPersona("blknoiz06");
const suite = await createFullAgentSuite(
  "blknoiz06",
  "Ansem",
  persona,
  {
    avatar: {
      enabled: true,
      autoPost: true,
      autoInteract: true,
      postFrequency: "daily",
    },
  }
);
```

### 创建带 Discord/Telegram 插件的 Suite

```typescript
const suite = await createFullAgentSuite(
  "blknoiz06",
  "Ansem",
  persona,
  {
    mod: {
      enabled: true,
      platforms: ["discord", "telegram"],
      autoReply: true,
      onboardingEnabled: true,
    },
  }
);
```

### 创建带 Solana 插件的 Suite

```typescript
const suite = await createFullAgentSuite(
  "blknoiz06",
  "Ansem",
  persona,
  {
    trader: {
      enabled: true,
      autoTrading: false,
      followMode: true,
      profitShare: 10,
    },
  }
);
```

## 📝 插件功能说明

### Twitter 插件 (Avatar)

**功能：**
- ✅ 自动发推
- ✅ 自动回复
- ✅ 自动点赞和转发
- ✅ 时间线监控

**配置选项：**
- `autoPost`: 是否自动发推
- `autoInteract`: 是否自动互动

### Discord 插件 (Mod)

**功能：**
- ✅ 消息处理
- ✅ 自动回复
- ✅ 命令支持
- ✅ 频道管理

**配置选项：**
- `guildId`: Discord 服务器 ID（可选）
- `autoReply`: 是否自动回复

### Telegram 插件 (Mod)

**功能：**
- ✅ 消息处理
- ✅ 自动回复
- ✅ 命令支持
- ✅ 私聊和群组支持

**配置选项：**
- `autoReply`: 是否自动回复

### Solana 插件 (Trader)

**功能：**
- ✅ 代币转账
- ✅ 代币交换（通过 Jupiter）
- ✅ 代币创建
- ✅ 质押和借贷
- ✅ 60+ 种链上操作

**配置选项：**
- `autoTrading`: 是否自动交易
- `rpcUrl`: Solana RPC 端点

## ⚠️ 注意事项

1. **环境变量安全**
   - 不要将 `.env.local` 提交到 Git
   - 在生产环境使用环境变量或密钥管理服务
   - 定期轮换 API Keys 和 Tokens

2. **插件兼容性**
   - 某些插件可能需要在 Node.js 环境运行
   - Edge Runtime 可能不支持所有插件功能
   - 如果插件不可用，系统会自动降级到基础实现

3. **错误处理**
   - 插件初始化失败不会中断 Suite 创建
   - 错误会记录在模块状态中
   - 可以通过 API 查询模块状态

4. **性能考虑**
   - 每个插件都会创建独立的 Agent 实例
   - 多个 Suite 会消耗更多资源
   - 建议监控资源使用情况

## 🔍 故障排查

### 插件未初始化

**问题**: Suite 创建成功但插件未工作

**解决方案**:
1. 检查环境变量是否正确设置
2. 查看控制台错误日志
3. 验证 API Keys 和 Tokens 是否有效
4. 检查网络连接

### Twitter 发推失败

**问题**: `postTweet` 返回错误

**解决方案**:
1. 验证 Twitter API 凭证
2. 检查应用权限（需要读写权限）
3. 确认没有触发 Twitter 的速率限制
4. 检查推文内容是否符合 Twitter 规则

### Discord/Telegram 机器人无响应

**问题**: 机器人不回复消息

**解决方案**:
1. 验证 Bot Token 是否正确
2. 确认 Bot 已添加到服务器/群组
3. 检查 Bot 权限设置
4. 查看 Bot 是否在线

### Solana 交易失败

**问题**: 交易执行失败

**解决方案**:
1. 验证 Solana 私钥格式
2. 检查账户余额是否充足
3. 确认 RPC 端点可访问
4. 验证交易参数是否正确

## 📚 相关文档

- [ElizaOS 官方文档](https://docs.elizaos.ai)
- [Twitter API 文档](https://developer.twitter.com/en/docs)
- [Discord API 文档](https://discord.com/developers/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Solana Web3.js 文档](https://solana-labs.github.io/solana-web3.js/)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 插件集成完成
