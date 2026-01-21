# Cloudflare Containers 快速开始指南

## 🎯 目标

如果您有 **Cloudflare 付费计划**，使用 Cloudflare Containers 运行 ElizaOS 插件，获得完整功能。

---

## ✅ 前置要求

- ✅ Cloudflare 付费计划（Containers 需要付费计划）
- ✅ Docker 已安装
- ✅ Wrangler CLI 最新版本
- ✅ 已配置 Cloudflare 账户

---

## 🚀 5 步快速部署

### 步骤 1: 创建容器应用目录

```bash
mkdir elizaos-container
cd elizaos-container
```

### 步骤 2: 创建容器应用文件

#### `package.json`

```json
{
  "name": "elizaos-container",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@elizaos/core": "^1.7.2",
    "@elizaos/plugin-twitter": "latest",
    "@elizaos/plugin-discord": "latest",
    "@elizaos/plugin-telegram": "latest",
    "@elizaos/plugin-solana-agent-kit": "^0.25.6-alpha.1"
  }
}
```

#### `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# 复制代码
COPY . .

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "index.js"]
```

#### `index.js`

```javascript
import express from 'express';
import { Agent } from '@elizaos/core';
import TwitterPlugin from '@elizaos/plugin-twitter';
import DiscordPlugin from '@elizaos/plugin-discord';
import TelegramPlugin from '@elizaos/plugin-telegram';
import SolanaAgentKitPlugin from '@elizaos/plugin-solana-agent-kit';

const app = express();
app.use(express.json());

// 存储 Agent 实例
const agents = new Map();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== Twitter API ====================

app.post('/api/twitter/post', async (req, res) => {
  try {
    const { suiteId, content, config } = req.body;
    
    let agent = agents.get(`twitter-${suiteId}`);
    if (!agent) {
      // 创建新的 Twitter Agent
      agent = new Agent({
        name: config.name || 'KOL Agent',
        description: config.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });
      
      agent.addPlugin(new TwitterPlugin({
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        autoPost: config.autoPost || false,
        autoInteract: config.autoInteract || false,
      }));
      
      await agent.start();
      agents.set(`twitter-${suiteId}`, agent);
    }
    
    // 发推
    const result = await agent.plugins[0].postTweet(content);
    res.json({ success: true, tweetId: result });
  } catch (error) {
    console.error('Twitter post error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== Discord API ====================

app.post('/api/discord/message', async (req, res) => {
  try {
    const { suiteId, channelId, message, config } = req.body;
    
    let agent = agents.get(`discord-${suiteId}`);
    if (!agent) {
      agent = new Agent({
        name: config.name || 'KOL Agent',
        description: config.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });
      
      agent.addPlugin(new DiscordPlugin({
        token: process.env.DISCORD_BOT_TOKEN,
        guildId: config.guildId,
        autoReply: config.autoReply || true,
      }));
      
      await agent.start();
      agents.set(`discord-${suiteId}`, agent);
    }
    
    await agent.plugins[0].sendMessage(channelId, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Discord message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== Telegram API ====================

app.post('/api/telegram/message', async (req, res) => {
  try {
    const { suiteId, chatId, message, config } = req.body;
    
    let agent = agents.get(`telegram-${suiteId}`);
    if (!agent) {
      agent = new Agent({
        name: config.name || 'KOL Agent',
        description: config.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });
      
      agent.addPlugin(new TelegramPlugin({
        token: process.env.TELEGRAM_BOT_TOKEN,
        autoReply: config.autoReply || true,
      }));
      
      await agent.start();
      agents.set(`telegram-${suiteId}`, agent);
    }
    
    await agent.plugins[0].sendMessage(chatId, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Telegram message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== Solana API ====================

app.post('/api/solana/trade', async (req, res) => {
  try {
    const { suiteId, action, token, amount, config } = req.body;
    
    let agent = agents.get(`solana-${suiteId}`);
    if (!agent) {
      agent = new Agent({
        name: config.name || 'KOL Agent',
        description: config.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });
      
      agent.addPlugin(new SolanaAgentKitPlugin({
        privateKey: process.env.SOLANA_PRIVATE_KEY,
        publicKey: process.env.SOLANA_PUBLIC_KEY,
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        autoTrading: config.autoTrading || false,
      }));
      
      await agent.start();
      agents.set(`solana-${suiteId}`, agent);
    }
    
    const result = await agent.plugins[0].executeTrade(action, { token, amount });
    res.json({ success: true, txSignature: result });
  } catch (error) {
    console.error('Solana trade error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`ElizaOS Container running on port ${port}`);
});
```

### 步骤 3: 构建 Docker 镜像

```bash
# 安装依赖
npm install --legacy-peer-deps

# 构建镜像
docker build -t elizaos-server:latest .

# 测试运行（可选）
docker run -p 3001:3001 \
  -e TWITTER_API_KEY=your_key \
  -e TWITTER_API_SECRET=your_secret \
  elizaos-server:latest
```

### 步骤 4: 推送到容器注册表

```bash
# 登录 Docker Hub（或其他注册表）
docker login

# 标记镜像
docker tag elizaos-server:latest your-username/elizaos-server:latest

# 推送镜像
docker push your-username/elizaos-server:latest
```

### 步骤 5: 部署到 Cloudflare Containers

```bash
# 更新 wrangler.toml（添加容器配置）
# 参考 wrangler.containers.toml.example

# 部署容器
npx wrangler containers deploy elizaos-server \
  --image your-username/elizaos-server:latest \
  --port 3001

# 设置环境变量（Secrets）
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put SOLANA_PRIVATE_KEY
```

---

## 🔧 更新主应用 API 路由

更新 API 路由以调用容器：

```typescript
// app/api/agent-suite/avatar/route.ts
export const runtime = "edge"; // ✅ 可以使用 Edge Runtime

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // 从环境变量获取容器 URL
  const containerUrl = process.env.ELIZAOS_CONTAINER_URL || 
    "https://elizaos-server.your-account.workers.dev";
  
  try {
    // 调用容器 API
    const response = await fetch(`${containerUrl}/api/twitter/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suiteId: body.suiteId,
        content: body.content,
        config: {
          name: body.kolName,
          description: body.description,
          autoPost: body.autoPost,
          autoInteract: body.autoInteract,
        },
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to post tweet');
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Container API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

## 📝 配置环境变量

在 Cloudflare Pages Dashboard 中设置：

1. 进入 **Settings** → **Environment variables**
2. 添加：

```bash
ELIZAOS_CONTAINER_URL=https://elizaos-server.your-account.workers.dev
```

或使用 Wrangler：

```bash
npx wrangler pages secret put ELIZAOS_CONTAINER_URL
```

---

## ✅ 验证部署

```bash
# 检查容器状态
npx wrangler containers list

# 测试健康检查
curl https://elizaos-server.your-account.workers.dev/health

# 测试 Twitter API
curl -X POST https://elizaos-server.your-account.workers.dev/api/twitter/post \
  -H "Content-Type: application/json" \
  -d '{
    "suiteId": "test-123",
    "content": "Test tweet from container!",
    "config": {
      "name": "Test Agent"
    }
  }'
```

---

## 🎯 优势

使用 Cloudflare Containers 的优势：

1. ✅ **完整功能** - 支持所有 ElizaOS 插件
2. ✅ **全局部署** - 自动部署到全球边缘
3. ✅ **统一平台** - 所有服务都在 Cloudflare
4. ✅ **易于管理** - 通过 Wrangler 统一管理
5. ✅ **自动扩展** - Cloudflare 自动处理扩展

---

## 📚 相关文档

- [Cloudflare Containers 文档](https://developers.cloudflare.com/containers/)
- [Containers Beta 信息](https://developers.cloudflare.com/containers/beta-info/)
- [详细解决方案](./CLOUDFLARE_CONTAINERS_SOLUTION.md)

---

**最后更新**: 2026-01-21  
**状态**: ✅ 准备就绪，等待部署
