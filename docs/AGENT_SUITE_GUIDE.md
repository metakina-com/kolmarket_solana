# KOLMarket Agent Suite 产品指南

## 🎯 产品概述

**KOLMarket Agent Suite** 是基于 **ElizaOS** 框架的完整智能体套件，为 KOL 提供"数字生命"的核心能力。这是 KOLMarket 的**"灵魂注入器"**，让静态的数字分身变成能发推、能聊骚、能赚钱的"赛博打工人"。

---

## 🚀 三大核心模块

### 1. 数字分身 (Avatar) - Twitter 自动运营

**功能特性：**
- ✅ **24/7 自动发推** - 根据 KOL 人设自动生成并发布推文
- ✅ **自动互动** - 自动回复评论、点赞、转发
- ✅ **记忆能力** - 基于 RAG 技术，记住粉丝、互动历史
- ✅ **情绪分析** - 监控推特情绪，发现热门话题

**应用场景：**
- KOL 睡觉时，AI 分身继续在推特上维持热度
- 自动发现并参与热门话题讨论
- 记住忠实粉丝，建立长期关系

**技术实现：**
```typescript
// 使用 ElizaOS Twitter Client
import { TwitterClient } from "@elizaos/plugin-twitter";

const agent = new Agent({
  name: "Ansem",
  plugins: [new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY,
    autoPost: true,
    autoInteract: true,
  })],
});
```

---

### 2. 粉丝客服 (Mod) - Discord/Telegram 机器人

**功能特性：**
- ✅ **自动回复** - 24小时回复粉丝提问
- ✅ **新人引导** - 自动私聊新用户，引导买币、链接钱包
- ✅ **会议纪要** - 监听语音频道，自动总结会议内容
- ✅ **内容审核** - 自动审核群内消息，维护社区氛围

**应用场景：**
- 每个入驻 KOLMarket 的 KOL 都获得一个 Telegram 机器人
- 管理付费粉丝群，自动回复常见问题
- 自动引导新用户完成注册和首次交易

**技术实现：**
```typescript
// 使用 ElizaOS Discord/Telegram Client
import { DiscordClient } from "@elizaos/plugin-discord";
import { TelegramClient } from "@elizaos/plugin-telegram";

const agent = new Agent({
  plugins: [
    new DiscordClient({ guildId: "..." }),
    new TelegramClient({ botToken: "..." }),
  ],
});
```

---

### 3. 带单交易 (Trader) - Solana 链上交易

**功能特性：**
- ✅ **自动交易** - 监控市场，自动执行交易策略
- ✅ **跟单模式** - 粉丝可以直接跟单 KOL 的交易
- ✅ **自动分红** - 交易利润自动分配给 KOL 和跟单者
- ✅ **风险控制** - 可配置风险等级、最大仓位

**应用场景：**
- 用户给 KOLMarket 的 AI 代理打钱，AI 自动帮用户在 Solana 上冲土狗
- 赚了钱自动分红给 KOL 和跟单者
- KOL 可以设置交易策略，AI 自动执行

**技术实现：**
```typescript
// 使用 ElizaOS Solana Agent Kit Plugin
import { SolanaAgentKitPlugin } from "@elizaos/plugin-solana-agent-kit";

const agent = new Agent({
  plugins: [
    new SolanaAgentKitPlugin({
      privateKey: process.env.SOLANA_PRIVATE_KEY,
      rpcUrl: process.env.SOLANA_RPC_URL,
      autoTrading: true,
      followMode: true,
    }),
  ],
});
```

---

## 📦 产品包装

### 给 KOL 的卖点

| 功能模块 | 卖点 |
|---------|------|
| **数字分身 (Avatar)** | "你睡觉时，你的分身帮你发推维持热度。" |
| **粉丝客服 (Mod)** | "24小时回复粉丝提问，不用你自己盯着群。" |
| **带单交易 (Trader)** | "粉丝可以直接跟你的 AI 钱包买币，你拿自动分红。" |

### 定价策略（建议）

- **基础版** - 仅 Avatar 模块
- **专业版** - Avatar + Mod 模块
- **旗舰版** - 完整套件（Avatar + Mod + Trader）

---

## 🔧 快速开始

### 1. 创建 Agent Suite

```typescript
import { createFullAgentSuite } from "@/lib/agents/agent-suite";
import { getKOLPersona } from "@/lib/agents/kol-personas";

const persona = getKOLPersona("blknoiz06"); // Ansem
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
    mod: {
      enabled: true,
      platforms: ["discord", "telegram"],
      autoReply: true,
    },
    trader: {
      enabled: true,
      followMode: true,
      profitShare: 10, // 10% 分成
    },
  }
);
```

### 2. 启动 Suite

```typescript
import { agentSuiteManager } from "@/lib/agents/agent-suite";

await agentSuiteManager.startSuite(suite.suiteId);
```

### 3. 使用 API

#### 创建 Suite
```bash
POST /api/agent-suite
{
  "kolHandle": "blknoiz06",
  "modules": {
    "avatar": { "enabled": true },
    "mod": { "enabled": true },
    "trader": { "enabled": true }
  }
}
```

#### 启动/停止 Suite
```bash
PATCH /api/agent-suite
{
  "suiteId": "suite-xxx",
  "action": "start" // 或 "stop"
}
```

#### 手动发推
```bash
POST /api/agent-suite/avatar
{
  "suiteId": "suite-xxx",
  "content": "GM! 🚀 Bullish on $SOL today!"
}
```

#### 执行交易
```bash
POST /api/agent-suite/trader
{
  "suiteId": "suite-xxx",
  "action": "buy",
  "token": "SOL",
  "amount": 1.5
}
```

---

## 🎨 前端组件使用

```tsx
import AgentSuitePanel from "@/components/AgentSuitePanel";

export default function KOLPage({ params }: { params: { handle: string } }) {
  return (
    <div>
      <AgentSuitePanel 
        kolHandle={params.handle}
        kolName="Ansem"
      />
    </div>
  );
}
```

---

## 📊 统计数据

每个模块都会自动收集统计数据：

### Avatar 统计
- 总推文数
- 总互动数
- 粉丝数
- 互动率

### Mod 统计
- 总消息数
- 总用户数
- 响应率
- 平均响应时间

### Trader 统计
- 总交易数
- 总交易量（SOL）
- 总利润（SOL）
- 胜率
- 跟单人数

---

## 🔐 环境配置

### 必需的环境变量

```bash
# Solana 配置
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_private_key_hex

# Twitter API (Avatar 模块)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Discord Bot (Mod 模块)
DISCORD_BOT_TOKEN=your_discord_bot_token

# Telegram Bot (Mod 模块)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# ElizaOS 模型配置
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI  # 或 OPEN_AI, ANTHROPIC
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct
```

---

## 🚧 待完成功能

### 短期（1-2周）
- [ ] 完整集成 ElizaOS Twitter Client
- [ ] 完整集成 ElizaOS Discord/Telegram Client
- [ ] 完整集成 ElizaOS Solana Agent Kit Plugin
- [ ] 实现 RAG 记忆系统

### 中期（1个月）
- [ ] 交易策略配置界面
- [ ] 推文内容审核系统
- [ ] 多语言支持
- [ ] 数据分析仪表盘

### 长期（3个月）
- [ ] AI 内容生成优化
- [ ] 多链支持（除了 Solana）
- [ ] 社区治理集成
- [ ] 白标解决方案

---

## 📚 相关文档

- [ElizaOS 官方文档](https://docs.elizaos.ai)
- [ElizaOS Twitter 插件](https://docs.elizaos.ai/plugin-registry/social/twitter)
- [ElizaOS Discord 插件](https://docs.elizaos.ai/plugin-registry/social/discord)
- [ElizaOS Solana 插件](https://docs.elizaos.ai/plugin-registry/defi/solana)
- [项目架构文档](./ARCHITECTURE.md)
- [集成指南](./INTEGRATION_GUIDE.md)

---

## 💡 最佳实践

1. **渐进式启用** - 先启用 Avatar，再启用 Mod，最后启用 Trader
2. **监控数据** - 定期查看统计数据，优化配置
3. **内容审核** - 启用内容审核，避免不当言论
4. **风险控制** - Trader 模块设置合理的风险等级和最大仓位
5. **定期更新** - 定期更新 KOL 知识库，保持 AI 分身的"新鲜度"

---

**最后更新**: 2026-01-21  
**版本**: 1.0.0  
**状态**: ✅ 核心架构完成，待完整集成 ElizaOS 插件
