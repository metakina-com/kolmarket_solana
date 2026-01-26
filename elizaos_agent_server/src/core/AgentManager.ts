import { v4 as uuidv4 } from 'uuid';
import { RuntimePool, AgentRuntime, runtimePool } from './RuntimePool.js';
import { elizaRuntimeFactory } from './ElizaRuntimeFactory.js';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';
import type { Agent, Character, CreateAgentRequest } from '../types/agent.js';

/**
 * AgentManager - Agent 生命周期管理器
 * 
 * 核心职责：
 * - Agent CRUD 操作
 * - 按需唤醒 (On-Demand Hydration)
 * - 配置热更新
 * - 错误恢复
 */
export class AgentManager {
  private pool: RuntimePool;
  private errorCounts: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 1;

  constructor(pool: RuntimePool = runtimePool) {
    this.pool = pool;
  }

  /**
   * 创建 Agent (表单模式)
   */
  async createAgent(creatorId: string, data: CreateAgentRequest): Promise<Agent> {
    const character: Character = {
      name: data.name,
      bio: data.bio,
      lore: data.lore || [],
      style: data.style || {},
    };

    return this.saveAgent(creatorId, character);
  }

  /**
   * 导入 Agent (JSON 模式)
   */
  async importAgent(creatorId: string, character: Character): Promise<Agent> {
    // 安全清洗已在 ValidationService 完成
    return this.saveAgent(creatorId, character);
  }

  /**
   * 保存 Agent 到数据库
   */
  private async saveAgent(creatorId: string, character: Character): Promise<Agent> {
    const id = uuidv4();
    const now = new Date();

    const agent: Agent = {
      id,
      creatorId,
      name: character.name,
      characterJson: character,
      status: 'inactive',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: null,
    };

    await db.query(
      `INSERT INTO agents (id, creator_id, name, character_json, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [agent.id, agent.creatorId, agent.name, JSON.stringify(agent.characterJson), 
       agent.status, agent.createdAt, agent.updatedAt]
    );

    logger.info(`AgentManager: created agent ${id} (${character.name})`);
    return agent;
  }

  /**
   * 按需唤醒 - 核心方法
   */
  async getOrHydrate(agentId: string): Promise<AgentRuntime> {
    // 1. 检查内存池
    let runtime = this.pool.get(agentId);
    if (runtime) {
      logger.debug(`AgentManager: agent ${agentId} found in pool`);
      // 重置错误计数
      this.errorCounts.delete(agentId);
      return runtime;
    }

    // 2. 从 DB 加载配置
    const agent = await this.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // 3. 尝试初始化 Runtime (带错误恢复)
    try {
      runtime = await this.createRuntimeWithRecovery(agent);
    } catch (error) {
      logger.error(`AgentManager: failed to create runtime for agent ${agentId}`, error);
      throw error;
    }

    // 4. 存入池
    await this.pool.set(agentId, runtime);

    // 5. 更新状态
    await this.updateAgentStatus(agentId, 'active');

    // 6. 重置错误计数
    this.errorCounts.delete(agentId);

    logger.info(`AgentManager: hydrated agent ${agentId}`);
    return runtime;
  }

  /**
   * 创建 Runtime 带错误恢复
   */
  private async createRuntimeWithRecovery(agent: Agent): Promise<AgentRuntime> {
    try {
      return await this.createRuntime(agent);
    } catch (error) {
      const errorCount = (this.errorCounts.get(agent.id) || 0) + 1;
      this.errorCounts.set(agent.id, errorCount);

      if (errorCount <= this.MAX_RETRIES) {
        logger.warn(`AgentManager: retrying runtime creation for agent ${agent.id} (attempt ${errorCount + 1})`);
        // 清理可能的残留状态
        await this.pool.evict(agent.id);
        return await this.createRuntime(agent);
      }

      // 超过重试次数，标记为错误状态
      await this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  /**
   * 创建 ElizaOS Runtime
   */
  private async createRuntime(agent: Agent): Promise<AgentRuntime> {
    try {
      const runtime = await elizaRuntimeFactory.createRuntime({
        character: agent.characterJson as any,
        modelProvider: config.DEFAULT_MODEL_PROVIDER as 'openai' | 'anthropic',
        modelName: config.DEFAULT_MODEL,
      });

      logger.info(`AgentManager: created ElizaOS runtime for agent ${agent.id} (${agent.name})`);
      return runtime;
    } catch (error) {
      logger.error(`AgentManager: failed to create runtime for agent ${agent.id}:`, error);
      await this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  /**
   * 配置热更新
   */
  async reloadAgent(agentId: string): Promise<void> {
    // 如果在池中，先移除再重新加载
    if (this.pool.has(agentId)) {
      await this.pool.evict(agentId);
      await this.getOrHydrate(agentId);
      logger.info(`AgentManager: reloaded agent ${agentId}`);
    }
  }

  /**
   * 手动重启错误状态的 Agent
   */
  async restartAgent(agentId: string): Promise<AgentRuntime> {
    const agent = await this.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // 重置错误计数
    this.errorCounts.delete(agentId);

    // 从池中移除（如果存在）
    await this.pool.evict(agentId);

    // 重新唤醒
    logger.info(`AgentManager: manually restarting agent ${agentId}`);
    return await this.getOrHydrate(agentId);
  }

  /**
   * 更新 Agent 配置
   */
  async updateAgent(agentId: string, character: Partial<Character>): Promise<Agent | null> {
    const agent = await this.getAgentById(agentId);
    if (!agent) return null;

    const updatedCharacter = { ...agent.characterJson, ...character };
    const now = new Date();

    await db.query(
      `UPDATE agents SET character_json = $1, name = $2, updated_at = $3 WHERE id = $4`,
      [JSON.stringify(updatedCharacter), updatedCharacter.name, now, agentId]
    );

    // 触发热更新
    await this.reloadAgent(agentId);

    return { ...agent, characterJson: updatedCharacter, updatedAt: now };
  }

  /**
   * 删除 Agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    // 先从池中移除
    await this.pool.evict(agentId);

    const result = await db.query('DELETE FROM agents WHERE id = $1', [agentId]);
    const deleted = (result.rowCount ?? 0) > 0;

    if (deleted) {
      logger.info(`AgentManager: deleted agent ${agentId}`);
    }
    return deleted;
  }

  /**
   * 获取单个 Agent
   */
  async getAgentById(agentId: string): Promise<Agent | null> {
    const result = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
    if (result.rows.length === 0) return null;

    return this.rowToAgent(result.rows[0]);
  }

  /**
   * 获取用户的所有 Agent
   */
  async getAgentsByCreator(creatorId: string): Promise<Agent[]> {
    const result = await db.query(
      'SELECT * FROM agents WHERE creator_id = $1 ORDER BY created_at DESC',
      [creatorId]
    );
    return result.rows.map(this.rowToAgent);
  }

  /**
   * 更新 Agent 状态
   */
  private async updateAgentStatus(agentId: string, status: Agent['status']): Promise<void> {
    await db.query(
      'UPDATE agents SET status = $1, last_active_at = $2 WHERE id = $3',
      [status, new Date(), agentId]
    );
  }

  /**
   * 数据库行转 Agent 对象
   */
  private rowToAgent(row: Record<string, unknown>): Agent {
    return {
      id: row.id as string,
      creatorId: row.creator_id as string,
      name: row.name as string,
      characterJson: row.character_json as Character,
      status: row.status as Agent['status'],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      lastActiveAt: row.last_active_at ? new Date(row.last_active_at as string) : null,
    };
  }
}

// 单例导出
export const agentManager = new AgentManager();
