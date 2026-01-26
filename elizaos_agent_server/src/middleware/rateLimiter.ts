import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 对话 API 更严格的限流
export const chatLimiter = rateLimit({
  windowMs: 60000, // 1 分钟
  max: 30, // 每分钟 30 条消息
  message: {
    success: false,
    error: 'Message rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
