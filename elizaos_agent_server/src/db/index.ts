import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

class Database {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database error', err);
    });
  }

  async query(text: string, params?: unknown[]): Promise<pg.QueryResult> {
    const start = Date.now();
    const result = await this.pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 100) {
      logger.warn(`Slow query (${duration}ms): ${text.slice(0, 100)}`);
    }

    return result;
  }

  async getClient(): Promise<pg.PoolClient> {
    return this.pool.connect();
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database connection pool closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
