/**
 * ElizaOS PostgreSQL 数据库适配器
 * 
 * 为 ElizaOS Runtime 提供内存存储能力
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from './index.js';
import { logger } from '../utils/logger.js';
import type { ElizaMemory, ElizaContent, ElizaGoal, ElizaObjective } from '../types/eliza.js';

/**
 * Memory 查询参数
 */
interface GetMemoriesParams {
  roomId: string;
  count?: number;
  unique?: boolean;
  tableName?: string;
}

/**
 * Memory 搜索参数 (向量搜索)
 */
interface SearchMemoriesParams {
  tableName: string;
  roomId: string;
  embedding: number[];
  match_threshold: number;
  match_count: number;
  unique?: boolean;
}

/**
 * PostgreSQL 数据库适配器
 * 实现 ElizaOS IDatabaseAdapter 接口的核心方法
 */
export class PostgresDatabaseAdapter {
  /**
   * 创建 Memory 记录
   */
  async createMemory(memory: ElizaMemory, tableName?: string): Promise<void> {
    const table = tableName || 'agent_memories';
    
    try {
      await db.query(
        `INSERT INTO ${table} (id, agent_id, room_id, user_id, content, embedding, created_at, unique_flag)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           content = EXCLUDED.content,
           embedding = EXCLUDED.embedding`,
        [
          memory.id || uuidv4(),
          memory.agentId,
          memory.roomId,
          memory.userId,
          JSON.stringify(memory.content),
          memory.embedding ? JSON.stringify(memory.embedding) : null,
          new Date(memory.createdAt),
          memory.unique || false,
        ]
      );
      
      logger.debug(`Created memory ${memory.id} for agent ${memory.agentId}`);
    } catch (error) {
      logger.error('Failed to create memory:', error);
      throw error;
    }
  }

  /**
   * 获取 Memory 列表
   */
  async getMemories(params: GetMemoriesParams): Promise<ElizaMemory[]> {
    const { roomId, count = 50, unique = false, tableName = 'agent_memories' } = params;
    
    try {
      let query = `
        SELECT * FROM ${tableName}
        WHERE room_id = $1
      `;
      
      if (unique) {
        query += ' AND unique_flag = true';
      }
      
      query += ' ORDER BY created_at DESC LIMIT $2';
      
      const result = await db.query(query, [roomId, count]);
      return result.rows.map(this.rowToMemory);
    } catch (error) {
      logger.error('Failed to get memories:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 获取单个 Memory
   */
  async getMemoryById(id: string): Promise<ElizaMemory | null> {
    try {
      const result = await db.query(
        'SELECT * FROM agent_memories WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) return null;
      return this.rowToMemory(result.rows[0]);
    } catch (error) {
      logger.error('Failed to get memory by id:', error);
      throw error;
    }
  }

  /**
   * 删除 Memory
   */
  async removeMemory(id: string, tableName?: string): Promise<void> {
    const table = tableName || 'agent_memories';
    
    try {
      await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      logger.debug(`Removed memory ${id}`);
    } catch (error) {
      logger.error('Failed to remove memory:', error);
      throw error;
    }
  }

  /**
   * 删除房间的所有 Memory
   */
  async removeAllMemories(roomId: string, tableName?: string): Promise<void> {
    const table = tableName || 'agent_memories';
    
    try {
      const result = await db.query(
        `DELETE FROM ${table} WHERE room_id = $1`,
        [roomId]
      );
      logger.debug(`Removed ${result.rowCount} memories from room ${roomId}`);
    } catch (error) {
      logger.error('Failed to remove all memories:', error);
      throw error;
    }
  }

  /**
   * 统计房间的 Memory 数量
   */
  async countMemories(roomId: string, unique?: boolean, tableName?: string): Promise<number> {
    const table = tableName || 'agent_memories';
    
    try {
      let query = `SELECT COUNT(*) FROM ${table} WHERE room_id = $1`;
      if (unique) {
        query += ' AND unique_flag = true';
      }
      
      const result = await db.query(query, [roomId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Failed to count memories:', error);
      throw error;
    }
  }

  /**
   * 向量搜索 Memory (需要 pgvector 扩展)
   * 注意：如果没有安装 pgvector，此方法会回退到普通查询
   */
  async searchMemoriesByEmbedding(params: SearchMemoriesParams): Promise<ElizaMemory[]> {
    const { roomId, embedding, match_threshold, match_count, unique, tableName = 'agent_memories' } = params;
    
    try {
      // 尝试使用向量搜索
      let query = `
        SELECT *, 
          1 - (embedding::vector <=> $1::vector) as similarity
        FROM ${tableName}
        WHERE room_id = $2
          AND embedding IS NOT NULL
          AND 1 - (embedding::vector <=> $1::vector) > $3
      `;
      
      if (unique) {
        query += ' AND unique_flag = true';
      }
      
      query += ' ORDER BY similarity DESC LIMIT $4';
      
      const result = await db.query(query, [
        JSON.stringify(embedding),
        roomId,
        match_threshold,
        match_count,
      ]);
      
      return result.rows.map(this.rowToMemory);
    } catch (error) {
      // 如果 pgvector 不可用，回退到普通查询
      logger.warn('Vector search failed, falling back to regular query:', error);
      return this.getMemories({ roomId, count: match_count, unique, tableName });
    }
  }

  /**
   * 创建 Goal
   */
  async createGoal(goal: ElizaGoal): Promise<void> {
    try {
      await db.query(
        `INSERT INTO agent_goals (id, room_id, user_id, name, status, objectives)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          goal.id || uuidv4(),
          goal.roomId,
          goal.userId,
          goal.name,
          goal.status,
          JSON.stringify(goal.objectives),
        ]
      );
    } catch (error) {
      logger.error('Failed to create goal:', error);
      throw error;
    }
  }

  /**
   * 获取 Goals
   */
  async getGoals(params: { roomId: string; userId?: string; onlyInProgress?: boolean }): Promise<ElizaGoal[]> {
    try {
      let query = 'SELECT * FROM agent_goals WHERE room_id = $1';
      const queryParams: unknown[] = [params.roomId];
      
      if (params.userId) {
        query += ' AND user_id = $2';
        queryParams.push(params.userId);
      }
      
      if (params.onlyInProgress) {
        query += ` AND status = 'IN_PROGRESS'`;
      }
      
      const result = await db.query(query, queryParams);
      return result.rows.map(this.rowToGoal);
    } catch (error) {
      logger.error('Failed to get goals:', error);
      throw error;
    }
  }

  /**
   * 更新 Goal
   */
  async updateGoal(goal: ElizaGoal): Promise<void> {
    try {
      await db.query(
        `UPDATE agent_goals SET status = $1, objectives = $2 WHERE id = $3`,
        [goal.status, JSON.stringify(goal.objectives), goal.id]
      );
    } catch (error) {
      logger.error('Failed to update goal:', error);
      throw error;
    }
  }

  /**
   * 数据库行转 Memory 对象
   */
  private rowToMemory(row: Record<string, unknown>): ElizaMemory {
    return {
      id: row.id as string,
      agentId: row.agent_id as string,
      roomId: row.room_id as string,
      userId: row.user_id as string,
      content: row.content as ElizaContent,
      embedding: row.embedding ? (row.embedding as number[]) : undefined,
      createdAt: new Date(row.created_at as string).getTime(),
      unique: row.unique_flag as boolean,
    };
  }

  /**
   * 数据库行转 Goal 对象
   */
  private rowToGoal(row: Record<string, unknown>): ElizaGoal {
    return {
      id: row.id as string,
      roomId: row.room_id as string,
      userId: row.user_id as string,
      name: row.name as string,
      status: row.status as ElizaGoal['status'],
      objectives: row.objectives as ElizaObjective[],
    };
  }
}

// 单例导出
export const elizaDbAdapter = new PostgresDatabaseAdapter();
