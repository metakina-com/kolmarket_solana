import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter, chatLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors());

// 请求解析
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// 限流
app.use('/api', apiLimiter);
app.use('/api/chat', chatLimiter);

// API 路由
app.use('/api', routes);

// 根路径
app.get('/', (_req, res) => {
  res.json({
    name: 'ElizaOS Agent Server',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
