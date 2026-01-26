/**
 * 认证中间件
 * 
 * 支持两种认证方式：
 * 1. JWT Token (Authorization: Bearer <token>)
 * 2. API Key (X-API-Key: <key>)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * JWT 认证中间件
 */
export async function jwtAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      },
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.userId,
      role: payload.role,
    };
    next();
  } catch (error) {
    logger.warn('JWT verification failed:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
}

/**
 * API Key 认证中间件
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing X-API-Key header',
      },
    });
    return;
  }

  try {
    // 查找 API Key (使用 hash 比较)
    const result = await db.query(
      `SELECT * FROM api_keys 
       WHERE (expires_at IS NULL OR expires_at > NOW())`,
    );

    let validKey = null;
    for (const row of result.rows) {
      if (await bcrypt.compare(apiKey, row.key_hash)) {
        validKey = row;
        break;
      }
    }

    if (!validKey) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key',
        },
      });
      return;
    }

    // 更新最后使用时间
    await db.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [validKey.id]
    );

    req.user = {
      id: validKey.user_id,
      role: 'api',
    };
    next();
  } catch (error) {
    logger.error('API key verification failed:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
      },
    });
  }
}

/**
 * 混合认证中间件 (支持 JWT 或 API Key)
 */
export async function hybridAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return jwtAuth(req, res, next);
  }

  if (apiKey) {
    return apiKeyAuth(req, res, next);
  }

  res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Missing authentication credentials',
    },
  });
}

/**
 * 可选认证中间件 (不强制要求认证)
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      req.user = {
        id: payload.userId,
        role: payload.role,
      };
    } catch {
      // 忽略无效 token，继续作为匿名用户
    }
  }

  // 如果没有认证，设置默认匿名用户
  if (!req.user) {
    req.user = {
      id: 'anonymous',
      role: 'anonymous',
    };
  }

  next();
}

/**
 * 生成 JWT Token
 */
export function generateToken(userId: string, role: string = 'user'): string {
  return jwt.sign(
    { userId, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

/**
 * 生成 API Key
 */
export async function generateApiKey(): Promise<{ key: string; hash: string }> {
  // 生成随机 API Key
  const key = `elk_${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')}`;
  const hash = await bcrypt.hash(key, 10);
  return { key, hash };
}
