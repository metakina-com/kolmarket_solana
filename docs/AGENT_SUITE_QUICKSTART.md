# KOLMarket Agent Suite - 快速开始

## 🚀 5 分钟快速上手

### 1. 创建 Agent Suite

```typescript
// 在 API 路由或服务端代码中
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

console.log("Suite created:", suite.suiteId);
```

### 2. 启动 Suite

```typescript
import { agentSuiteManager } from "@/lib/agents/agent-suite";

await agentSuiteManager.startSuite(suite.suiteId);
```

### 3. 在前端展示

```tsx
// 在 KOL 详情页面
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

### 4. 使用 API

#### 创建 Suite
```bash
curl -X POST http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{
    "kolHandle": "blknoiz06",
    "modules": {
      "avatar": { "enabled": true },
      "mod": { "enabled": true },
      "trader": { "enabled": true }
    }
  }'
```

#### 启动 Suite
```bash
curl -X PATCH http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "action": "start"
  }'
```

#### 手动发推
```bash
curl -X POST http://localhost:3000/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "content": "GM! 🚀 Bullish on $SOL today!"
  }'
```

#### 执行交易
```bash
curl -X POST http://localhost:3000/api/agent-suite/trader \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "action": "buy",
    "token": "SOL",
    "amount": 1.5
  }'
```

---

## 📦 核心文件

### 后端模块
- `lib/agents/agent-suite.ts` - Agent Suite 核心管理器
- `lib/agents/eliza-integration.ts` - ElizaOS 集成
- `lib/agents/kol-personas.ts` - KOL 个性化配置

### API 路由
- `app/api/agent-suite/route.ts` - Suite 管理 API
- `app/api/agent-suite/avatar/route.ts` - Avatar 模块 API
- `app/api/agent-suite/trader/route.ts` - Trader 模块 API

### 前端组件
- `components/AgentSuitePanel.tsx` - Suite 管理面板

---

## 🔧 配置环境变量

在 `.env.local` 中添加：

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
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct
```

---

## 📊 查看统计数据

每个 Suite 都会自动收集统计数据：

```typescript
const suite = agentSuiteManager.getSuite(suiteId);

// Avatar 统计
console.log("推文数:", suite.stats.avatar?.totalTweets);
console.log("互动数:", suite.stats.avatar?.totalInteractions);

// Mod 统计
console.log("消息数:", suite.stats.mod?.totalMessages);
console.log("用户数:", suite.stats.mod?.totalUsers);

// Trader 统计
console.log("交易数:", suite.stats.trader?.totalTrades);
console.log("总利润:", suite.stats.trader?.totalProfit);
```

---

## 🎯 下一步

1. 📖 阅读 [完整产品指南](./AGENT_SUITE_GUIDE.md)
2. 📖 查看 [产品包装文档](./AGENT_SUITE_PRODUCT.md)
3. 🔧 配置 ElizaOS 插件（Twitter, Discord, Telegram, Solana）
4. 🚀 开始内测！

---

**提示**: 当前版本是核心架构，完整功能需要集成 ElizaOS 的各个插件。详见 [集成指南](./INTEGRATION_GUIDE.md)。
