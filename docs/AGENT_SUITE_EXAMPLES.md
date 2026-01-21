# Agent Suite 使用示例

## 🚀 快速开始示例

### 1. 创建 Agent Suite

```typescript
// 前端代码
async function createAgentSuite(kolHandle: string) {
  const response = await fetch("/api/agent-suite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kolHandle,
      modules: {
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
          profitShare: 10,
        },
      },
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log("Suite created:", data.suite);
    return data.suite;
  }
}
```

### 2. 启动/停止 Suite

```typescript
async function toggleSuite(suiteId: string, action: "start" | "stop") {
  const response = await fetch("/api/agent-suite", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      suiteId,
      action,
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log(`Suite ${action}ed successfully`);
  }
}
```

### 3. 查询 Suite 状态

```typescript
async function getSuiteStatus(kolHandle: string) {
  const response = await fetch(`/api/agent-suite?kolHandle=${kolHandle}`);
  const { suite } = await response.json();
  
  console.log("Suite status:", suite.status);
  console.log("Avatar module:", suite.modules.avatar);
  console.log("Stats:", suite.stats);
  
  return suite;
}
```

### 4. 手动发推（Avatar 模块）

```typescript
async function postTweet(suiteId: string, content: string) {
  const response = await fetch("/api/agent-suite/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      suiteId,
      content,
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log("Tweet posted:", data.tweetId);
  }
}
```

### 5. 执行交易（Trader 模块）

```typescript
async function executeTrade(
  suiteId: string,
  action: "buy" | "sell",
  token: string,
  amount: number
) {
  const response = await fetch("/api/agent-suite/trader", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      suiteId,
      action,
      token,
      amount,
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log("Trade executed:", data.txSignature);
  }
}
```

## 📱 React 组件示例

### 完整的 Agent Suite 管理组件

```tsx
"use client";

import { useState, useEffect } from "react";
import AgentSuitePanel from "@/components/AgentSuitePanel";

export default function KOLAgentSuitePage({ kolHandle }: { kolHandle: string }) {
  const [suite, setSuite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuite();
  }, [kolHandle]);

  const loadSuite = async () => {
    try {
      const res = await fetch(`/api/agent-suite?kolHandle=${kolHandle}`);
      if (res.ok) {
        const data = await res.json();
        setSuite(data.suite);
      }
    } catch (error) {
      console.error("Failed to load suite:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AgentSuitePanel 
        kolHandle={kolHandle}
        kolName={suite?.kolHandle || kolHandle}
      />
    </div>
  );
}
```

## 🔧 服务端使用示例

### 在 API 路由中使用

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createFullAgentSuite } from "@/lib/agents/agent-suite";
import { getKOLPersona } from "@/lib/agents/kol-personas";
import { getAgentSuiteDB } from "@/lib/db/agent-suite-db";

export async function POST(req: NextRequest) {
  const { kolHandle } = await req.json();
  
  // 获取 KOL Persona
  const persona = getKOLPersona(kolHandle);
  if (!persona) {
    return NextResponse.json({ error: "KOL not found" }, { status: 404 });
  }

  // 创建 Suite
  const suite = await createFullAgentSuite(
    kolHandle,
    persona.name,
    persona
  );

  // 保存到数据库
  const env = (globalThis as any).env || {};
  const db = getAgentSuiteDB({ DB: env.DB });
  if (db) {
    await db.createSuite(suite);
  }

  return NextResponse.json({ success: true, suite });
}
```

## 🧪 测试脚本示例

### 使用 curl 测试 API

```bash
# 创建 Suite
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

# 查询 Suite
curl http://localhost:3000/api/agent-suite?kolHandle=blknoiz06

# 启动 Suite
curl -X PATCH http://localhost:3000/api/agent-suite \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "action": "start"
  }'

# 手动发推
curl -X POST http://localhost:3000/api/agent-suite/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "content": "GM! 🚀 Bullish on $SOL today!"
  }'

# 执行交易
curl -X POST http://localhost:3000/api/agent-suite/trader \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "suite-xxx",
    "action": "buy",
    "token": "SOL",
    "amount": 1.5
  }'
```

## 📊 监控和统计示例

### 获取统计数据

```typescript
async function getSuiteStats(kolHandle: string) {
  const response = await fetch(`/api/agent-suite?kolHandle=${kolHandle}`);
  const { suite } = await response.json();

  return {
    avatar: {
      totalTweets: suite.stats.avatar?.totalTweets || 0,
      totalInteractions: suite.stats.avatar?.totalInteractions || 0,
      followers: suite.stats.avatar?.followers || 0,
      engagementRate: suite.stats.avatar?.engagementRate || 0,
    },
    mod: {
      totalMessages: suite.stats.mod?.totalMessages || 0,
      totalUsers: suite.stats.mod?.totalUsers || 0,
      responseRate: suite.stats.mod?.responseRate || 0,
    },
    trader: {
      totalTrades: suite.stats.trader?.totalTrades || 0,
      totalVolume: suite.stats.trader?.totalVolume || 0,
      totalProfit: suite.stats.trader?.totalProfit || 0,
      winRate: suite.stats.trader?.winRate || 0,
    },
  };
}
```

## 🔄 完整工作流示例

```typescript
async function setupKOLAgentSuite(kolHandle: string) {
  // 1. 检查 Suite 是否已存在
  let suite;
  try {
    const res = await fetch(`/api/agent-suite?kolHandle=${kolHandle}`);
    if (res.ok) {
      const data = await res.json();
      suite = data.suite;
    }
  } catch (error) {
    console.error("Error checking suite:", error);
  }

  // 2. 如果不存在，创建 Suite
  if (!suite) {
    const res = await fetch("/api/agent-suite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kolHandle,
        modules: {
          avatar: { enabled: true },
          mod: { enabled: true },
          trader: { enabled: true },
        },
      }),
    });
    const data = await res.json();
    suite = data.suite;
  }

  // 3. 启动 Suite
  await fetch("/api/agent-suite", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      suiteId: suite.suiteId,
      action: "start",
    }),
  });

  console.log("Agent Suite setup complete:", suite.suiteId);
  return suite;
}
```

---

**提示**: 更多详细信息请参考：
- [产品指南](./AGENT_SUITE_GUIDE.md)
- [数据库持久化](./AGENT_SUITE_DATABASE.md)
- [快速开始](./AGENT_SUITE_QUICKSTART.md)
