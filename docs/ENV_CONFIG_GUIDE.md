# 环境变量配置指南

本文档说明如何配置和持久化 KOLMarket.ai 项目的环境变量。

## 📋 环境变量列表

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SOLANA_RPC_URL` | Solana RPC 节点 URL | `https://api.mainnet-beta.solana.com` |
| `NODE_ENV` | 运行环境 | `production` 或 `development` |

### 可选的环境变量

#### Solana 配置
| 变量名 | 说明 | 格式 | 示例 |
|--------|------|------|------|
| `SOLANA_PRIVATE_KEY` | Solana 私钥（数组格式） | JSON 数组 | `[163,222,31,...]` |
| `SOLANA_DEVNET_PRIVATE_KEY` | Devnet 私钥（Hex 格式） | Hex 字符串 | `18f3280dfbf2c6...` |
| `SOLANA_MAINNET_PRIVATE_KEY` | Mainnet 私钥（Hex 格式） | Hex 字符串 | `18f3280dfbf2c6...` |

#### ElizaOS 配置
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ELIZA_MODEL_PROVIDER` | 模型提供商 | `CLOUDFLARE_AI` |
| `ELIZA_MODEL` | 模型名称 | `@cf/meta/llama-3-8b-instruct` |

#### 服务器配置
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `HOST` | 服务器监听地址 | `0.0.0.0` |
| `PORT` | 服务器端口 | `3001` |

#### Discord Bot
| 变量名 | 说明 |
|--------|------|
| `DISCORD_BOT_TOKEN` | Discord 机器人 Token |

#### Telegram Bot
| 变量名 | 说明 |
|--------|------|
| `TELEGRAM_BOT_TOKEN` | Telegram 机器人 Token |

#### Twitter API
| 变量名 | 说明 |
|--------|------|
| `TWITTER_API_KEY` | Twitter API Key |
| `TWITTER_API_SECRET` | Twitter API Secret |
| `TWITTER_ACCESS_TOKEN` | Twitter Access Token |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter Access Token Secret |

## 🔧 配置方法

### 1. 本地开发环境

创建 `.env.local` 文件（已自动添加到 `.gitignore`）：

```bash
# Solana 配置
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=[your_private_key_array_here]

# ElizaOS 配置
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct

# 服务器配置
NODE_ENV=production
HOST=0.0.0.0
PORT=3001

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Twitter API
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

### 2. Railway 部署

在 Railway Dashboard 中配置环境变量：

1. 进入项目 → 选择服务
2. 点击 **Variables** 标签
3. 添加所有需要的环境变量
4. Railway 会自动重新部署

### 3. Cloudflare Workers/Pages

使用 Wrangler CLI 设置 secrets：

```bash
# ElizaOS 容器 URL
npx wrangler secret put ELIZAOS_CONTAINER_URL

# Twitter API
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET

# Discord
npx wrangler secret put DISCORD_BOT_TOKEN

# Telegram
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Solana
npx wrangler secret put SOLANA_PRIVATE_KEY
npx wrangler secret put SOLANA_RPC_URL
```

## 🔍 验证配置

使用环境变量管理工具验证配置：

```typescript
import { loadEnvConfig, validateEnvConfig, printEnvConfigSummary } from '@/lib/utils/env-config';

// 加载配置
const config = loadEnvConfig();

// 验证配置
const validation = validateEnvConfig(config);

// 打印摘要
printEnvConfigSummary(config);
```

## 📝 Solana 私钥格式

### 数组格式（推荐）

```bash
SOLANA_PRIVATE_KEY=[your_private_key_array_here]
```

### Hex 字符串格式

```bash
SOLANA_DEVNET_PRIVATE_KEY=18f3280dfbf2c6360129af07034eef9c5e06fac91251f9fb58725c0451eecef43d3df1ed80b4f8f896f7c6b081eb68a0588d6069281678bfcf20055354baa8de
```

代码会自动检测并使用正确的格式。

## 🛡️ 安全注意事项

1. **永远不要提交 `.env.local` 到 Git**
   - 文件已自动添加到 `.gitignore`
   - 使用 `.env.example` 作为模板

2. **使用环境变量管理工具**
   - 使用 `lib/utils/env-config.ts` 中的工具函数
   - 自动验证和加载配置

3. **生产环境使用 Secrets**
   - Railway: 使用 Dashboard 的 Variables
   - Cloudflare: 使用 `wrangler secret put`
   - 不要在代码中硬编码敏感信息

## 📚 相关文件

- `.env.local` - 本地开发环境变量（不提交到 Git）
- `.env.container` - 容器部署环境变量配置
- `lib/utils/env-config.ts` - 环境变量管理工具
- `lib/utils/solana-keypair.ts` - Solana 密钥对加载工具

## 🔄 更新环境变量

1. 更新 `.env.local` 文件
2. 重启开发服务器：`npm run dev`
3. 对于生产环境，更新部署平台的环境变量配置

## ❓ 常见问题

### Q: 如何检查环境变量是否正确加载？

A: 使用 `printEnvConfigSummary()` 函数打印配置摘要。

### Q: Solana 私钥应该使用哪种格式？

A: 推荐使用数组格式（`SOLANA_PRIVATE_KEY`），代码会自动处理。

### Q: 环境变量更新后需要重启吗？

A: 是的，需要重启应用才能加载新的环境变量。
