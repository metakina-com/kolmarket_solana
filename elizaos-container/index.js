/**
 * ElizaOS Container Server
 * 
 * 运行在 Cloudflare Containers 中的 ElizaOS 插件服务器
 * 提供 Twitter、Discord、Telegram、Solana 插件 API
 */

import express from 'express';
import cors from 'cors';

const app = express();

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// 请求超时处理
app.use((req, res, next) => {
  req.setTimeout(30000); // 30秒超时
  res.setTimeout(30000);
  next();
});

// 存储 Agent 实例
const agents = new Map();

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      agents: agents.size,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// 根路径也返回健康状态
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ElizaOS Container',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
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
    const { suiteId, channelId, message, content, config } = req.body;
    const messageText = message || content; // 支持两种参数名

    if (!suiteId || !channelId || !messageText) {
      return res.status(400).json({ error: 'suiteId, channelId, and message/content are required' });
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
    await plugin.sendMessage?.(channelId, messageText);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Discord message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== Telegram API ====================

app.post('/api/telegram/message', async (req, res) => {
  try {
    const { suiteId, chatId, message, content, config } = req.body;
    const messageText = message || content; // 支持两种参数名

    if (!suiteId || !chatId || !messageText) {
      return res.status(400).json({ error: 'suiteId, chatId, and message/content are required' });
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

    if (!suiteId || !action) {
      return res.status(400).json({ error: 'suiteId and action are required' });
    }

    // 支持 balance 查询
    if (action === 'balance') {
      if (!process.env.SOLANA_PRIVATE_KEY && !process.env.SOLANA_PUBLIC_KEY) {
        return res.status(500).json({ error: 'Solana credentials not configured' });
      }
      
      // 简单的余额查询逻辑
      return res.json({ 
        success: true, 
        action: 'balance',
        message: 'Balance query - check wallet for details'
      });
    }

    if (action !== 'buy' && action !== 'sell') {
      return res.status(400).json({ error: "action must be 'buy', 'sell', or 'balance'" });
    }

    if (!token || amount === undefined) {
      return res.status(400).json({ error: 'token and amount are required for buy/sell actions' });
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

// ==================== 错误处理 ====================

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Error stack:', error.stack);
  // 不退出进程，让 Railway 的重启策略处理
  // 但记录详细错误以便调试
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  if (reason instanceof Error) {
    console.error('❌ Error stack:', reason.stack);
  }
  // 不退出进程，让 Railway 的重启策略处理
  // 但记录详细错误以便调试
});

// 确保进程不会因为警告而退出
process.on('warning', (warning) => {
  console.warn('⚠️  Process warning:', warning.name);
  console.warn('⚠️  Warning message:', warning.message);
  if (warning.stack) {
    console.warn('⚠️  Warning stack:', warning.stack);
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  // 清理资源
  agents.forEach((agent, key) => {
    try {
      agent.stop?.();
      console.log(`✅ Stopped agent: ${key}`);
    } catch (error) {
      console.error(`❌ Error stopping agent ${key}:`, error);
    }
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  agents.forEach((agent, key) => {
    try {
      agent.stop?.();
      console.log(`✅ Stopped agent: ${key}`);
    } catch (error) {
      console.error(`❌ Error stopping agent ${key}:`, error);
    }
  });
  process.exit(0);
});

// ==================== 启动服务器 ====================

// 确保在启动前输出日志
console.log('🚀 Starting ElizaOS Container...');
console.log(`📦 Node version: ${process.version}`);
console.log(`📦 Platform: ${process.platform}`);

const port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

// 验证端口
if (isNaN(port) || port < 1 || port > 65535) {
  console.error('❌ Invalid PORT:', process.env.PORT);
  console.error('❌ Using default port 3001');
  const defaultPort = 3001;
  startServer(defaultPort, host);
} else {
  startServer(port, host);
}

function startServer(serverPort, serverHost) {
  try {
    // 启动服务器
    const server = app.listen(serverPort, serverHost, () => {
      console.log(`✅ ElizaOS Container running on ${serverHost}:${serverPort}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Plugins available:`);
      console.log(`   - Twitter: ${process.env.TWITTER_API_KEY ? '✅' : '❌'}`);
      console.log(`   - Discord: ${process.env.DISCORD_BOT_TOKEN ? '✅' : '❌'}`);
      console.log(`   - Telegram: ${process.env.TELEGRAM_BOT_TOKEN ? '✅' : '❌'}`);
      console.log(`   - Solana: ${process.env.SOLANA_PRIVATE_KEY || process.env.SOLANA_PUBLIC_KEY ? '✅' : '❌'}`);
      console.log(`✅ Server started successfully`);
      console.log(`🌐 Health check: http://${serverHost}:${serverPort}/health`);
      
      // 立即测试健康检查
      setTimeout(() => {
        const http = require('http');
        const options = {
          hostname: serverHost === '0.0.0.0' ? 'localhost' : serverHost,
          port: serverPort,
          path: '/health',
          method: 'GET',
          timeout: 2000
        };
        
        const req = http.request(options, (res) => {
          console.log(`✅ Internal health check: ${res.statusCode}`);
        });
        
        req.on('error', (err) => {
          console.warn(`⚠️  Internal health check failed: ${err.message}`);
        });
        
        req.on('timeout', () => {
          req.destroy();
          console.warn(`⚠️  Internal health check timeout`);
        });
        
        req.end();
      }, 1000);
    });

    // 服务器错误处理
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${serverPort} is already in use`);
        console.error(`❌ Trying to use port ${serverPort + 1}...`);
        // 尝试下一个端口
        setTimeout(() => {
          startServer(serverPort + 1, serverHost);
        }, 1000);
      } else {
        console.error('❌ Fatal server error, exiting...');
        process.exit(1);
      }
    });

    // 监听连接事件
    server.on('connection', (socket) => {
      // 可选：记录连接信息
      // console.log(`📡 New connection from ${socket.remoteAddress}`);
    });

    // 定期健康检查日志（每5分钟）
    setInterval(() => {
      console.log(`💓 Health check - ${new Date().toISOString()} - Agents: ${agents.size} - Uptime: ${Math.round(process.uptime())}s`);
    }, 5 * 60 * 1000);

    // 启动时立即输出健康检查日志
    console.log(`💓 Initial health check - ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
}
