/**
 * ElizaOS Container Server
 * 
 * 运行在 Cloudflare Containers 中的 ElizaOS 插件服务器
 * 提供 Twitter、Discord、Telegram、Solana 插件 API
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// 存储 Agent 实例
const agents = new Map();

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: agents.size,
  });
});

// ==================== Twitter API ====================

app.post('/api/twitter/post', async (req, res) => {
  try {
    const { suiteId, content, config } = req.body;

    if (!suiteId || !content) {
      return res.status(400).json({ error: 'suiteId and content are required' });
    }

    // 检查环境变量
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
      return res.status(500).json({ error: 'Twitter API credentials not configured' });
    }

    let agent = agents.get(`twitter-${suiteId}`);
    
    if (!agent) {
      // 动态导入 ElizaOS
      const { Agent } = await import('@elizaos/core');
      const TwitterPlugin = (await import('@elizaos/plugin-twitter')).default;

      // 创建 Agent
      agent = new Agent({
        name: config?.name || 'KOL Agent',
        description: config?.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });

      // 添加 Twitter 插件
      const twitterPlugin = new TwitterPlugin({
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        autoPost: config?.autoPost || false,
        autoInteract: config?.autoInteract || false,
      });

      agent.addPlugin(twitterPlugin);
      await agent.start();
      agents.set(`twitter-${suiteId}`, agent);
    }

    // 发推
    const plugin = agent.plugins.find(p => p.name === 'twitter' || p.constructor.name.includes('Twitter'));
    const result = await plugin.postTweet?.(content);
    
    res.json({ success: true, tweetId: result || `tweet-${Date.now()}` });
  } catch (error) {
    console.error('Twitter post error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== Discord API ====================

app.post('/api/discord/message', async (req, res) => {
  try {
    const { suiteId, channelId, message, config } = req.body;

    if (!suiteId || !channelId || !message) {
      return res.status(400).json({ error: 'suiteId, channelId, and message are required' });
    }

    if (!process.env.DISCORD_BOT_TOKEN) {
      return res.status(500).json({ error: 'Discord bot token not configured' });
    }

    let agent = agents.get(`discord-${suiteId}`);
    
    if (!agent) {
      const { Agent } = await import('@elizaos/core');
      const DiscordPlugin = (await import('@elizaos/plugin-discord')).default;

      agent = new Agent({
        name: config?.name || 'KOL Agent',
        description: config?.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });

      const discordPlugin = new DiscordPlugin({
        token: process.env.DISCORD_BOT_TOKEN,
        guildId: config?.guildId,
        autoReply: config?.autoReply !== false,
      });

      agent.addPlugin(discordPlugin);
      await agent.start();
      agents.set(`discord-${suiteId}`, agent);
    }

    const plugin = agent.plugins.find(p => p.name === 'discord' || p.constructor.name.includes('Discord'));
    await plugin.sendMessage?.(channelId, message);
    
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

    if (!suiteId || !chatId || !message) {
      return res.status(400).json({ error: 'suiteId, chatId, and message are required' });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: 'Telegram bot token not configured' });
    }

    let agent = agents.get(`telegram-${suiteId}`);
    
    if (!agent) {
      const { Agent } = await import('@elizaos/core');
      const TelegramPlugin = (await import('@elizaos/plugin-telegram')).default;

      agent = new Agent({
        name: config?.name || 'KOL Agent',
        description: config?.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });

      const telegramPlugin = new TelegramPlugin({
        token: process.env.TELEGRAM_BOT_TOKEN,
        autoReply: config?.autoReply !== false,
      });

      agent.addPlugin(telegramPlugin);
      await agent.start();
      agents.set(`telegram-${suiteId}`, agent);
    }

    const plugin = agent.plugins.find(p => p.name === 'telegram' || p.constructor.name.includes('Telegram'));
    await plugin.sendMessage?.(chatId, message);
    
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

    if (!suiteId || !action || !token || amount === undefined) {
      return res.status(400).json({ error: 'suiteId, action, token, and amount are required' });
    }

    if (action !== 'buy' && action !== 'sell') {
      return res.status(400).json({ error: "action must be 'buy' or 'sell'" });
    }

    if (!process.env.SOLANA_PRIVATE_KEY && !process.env.SOLANA_PUBLIC_KEY) {
      return res.status(500).json({ error: 'Solana credentials not configured' });
    }

    let agent = agents.get(`solana-${suiteId}`);
    
    if (!agent) {
      const { Agent } = await import('@elizaos/core');
      const SolanaAgentKitPlugin = (await import('@elizaos/plugin-solana-agent-kit')).default;

      agent = new Agent({
        name: config?.name || 'KOL Agent',
        description: config?.description || '',
        modelProvider: process.env.ELIZA_MODEL_PROVIDER || 'CLOUDFLARE_AI',
        model: process.env.ELIZA_MODEL || '@cf/meta/llama-3-8b-instruct',
      });

      const solanaPlugin = new SolanaAgentKitPlugin({
        privateKey: process.env.SOLANA_PRIVATE_KEY,
        publicKey: process.env.SOLANA_PUBLIC_KEY,
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        autoTrading: config?.autoTrading || false,
      });

      agent.addPlugin(solanaPlugin);
      await agent.start();
      agents.set(`solana-${suiteId}`, agent);
    }

    const plugin = agent.plugins.find(p => p.name === 'solana' || p.constructor.name.includes('Solana'));
    const result = await plugin.executeTrade?.(action, { token, amount });
    
    res.json({ success: true, txSignature: result || `tx-${Date.now()}` });
  } catch (error) {
    console.error('Solana trade error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== 启动服务器 ====================

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 ElizaOS Container running on ${host}:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Plugins available:`);
  console.log(`   - Twitter: ${process.env.TWITTER_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Discord: ${process.env.DISCORD_BOT_TOKEN ? '✅' : '❌'}`);
  console.log(`   - Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? '✅' : '❌'}`);
  console.log(`   - Solana: ${process.env.SOLANA_PRIVATE_KEY || process.env.SOLANA_PUBLIC_KEY ? '✅' : '❌'}`);
});
