import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import type { IElizaRuntime } from './ElizaRuntimeFactory.js';

// 使用 ElizaOS Runtime 接口
export type AgentRuntime = IElizaRuntime;

interface PoolEntry {
  runtime: AgentRuntime;
  lastAccessTime: number;
}

/**
 * RuntimePool - LRU 资源池管理器
 * 
 * 功能：
 * - 管理活跃 Agent Runtime 实例
 * - LRU 淘汰策略
 * - 超时自动清理
 */
export class RuntimePool {
  private pool: Map<string, PoolEntry> = new Map();
  private maxSize: number;
  private idleTimeoutMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    maxSize: number = config.MAX_ACTIVE_AGENTS,
    idleTimeoutMs: number = config.AGENT_IDLE_TIMEOUT_MS
  ) {
    this.maxSize = maxSize;
    this.idleTimeoutMs = idleTimeoutMs;
  }

  /**
   * 获取 Runtime，更新访问时间
   */
  get(agentId: string): AgentRuntime | null {
    const entry = this.pool.get(agentId);
    if (!entry) return null;

    // 更新访问时间 (LRU)
    entry.lastAccessTime = Date.now();
    
    // 移到末尾保持 LRU 顺序
    this.pool.delete(agentId);
    this.pool.set(agentId, entry);

    logger.debug(`RuntimePool: accessed agent ${agentId}`);
    return entry.runtime;
  }

  /**
   * 添加 Runtime 到池中
   */
  async set(agentId: string, runtime: AgentRuntime): Promise<void> {
    // 如果已存在，先移除
    if (this.pool.has(agentId)) {
      await this.evict(agentId);
    }

    // 检查是否需要淘汰
    if (this.pool.size >= this.maxSize) {
      await this.evictLRU();
    }

    this.pool.set(agentId, {
      runtime,
      lastAccessTime: Date.now(),
    });

    logger.info(`RuntimePool: added agent ${agentId}, pool size: ${this.pool.size}`);
  }

  /**
   * 移除指定 Agent
   */
  async evict(agentId: string): Promise<boolean> {
    const entry = this.pool.get(agentId);
    if (!entry) return false;

    try {
      // 调用 ElizaOS Runtime 的 stop 方法释放资源
      await entry.runtime.stop();
      logger.debug(`RuntimePool: stopped runtime for agent ${agentId}`);
    } catch (error) {
      logger.error(`RuntimePool: error stopping agent ${agentId}`, error);
    }

    this.pool.delete(agentId);
    logger.info(`RuntimePool: evicted agent ${agentId}, pool size: ${this.pool.size}`);
    return true;
  }

  /**
   * LRU 淘汰 - 移除最久未访问的
   */
  private async evictLRU(): Promise<void> {
    // Map 保持插入顺序，第一个就是最旧的
    const oldestKey = this.pool.keys().next().value;
    if (oldestKey) {
      logger.info(`RuntimePool: LRU evicting agent ${oldestKey}`);
      await this.evict(oldestKey);
    }
  }

  /**
   * 启动定时清理任务
   */
  startIdleCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      await this.cleanupIdleAgents();
    }, intervalMs);

    logger.info(`RuntimePool: idle cleanup started, interval: ${intervalMs}ms`);
  }

  /**
   * 清理超时闲置的 Agent
   */
  private async cleanupIdleAgents(): Promise<void> {
    const now = Date.now();
    const toEvict: string[] = [];

    for (const [agentId, entry] of this.pool) {
      if (now - entry.lastAccessTime > this.idleTimeoutMs) {
        toEvict.push(agentId);
      }
    }

    for (const agentId of toEvict) {
      logger.info(`RuntimePool: idle timeout evicting agent ${agentId}`);
      await this.evict(agentId);
    }
  }

  /**
   * 停止清理任务
   */
  stopIdleCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 获取池状态
   */
  getStats(): { size: number; maxSize: number; agents: string[] } {
    return {
      size: this.pool.size,
      maxSize: this.maxSize,
      agents: Array.from(this.pool.keys()),
    };
  }

  /**
   * 检查 Agent 是否在池中
   */
  has(agentId: string): boolean {
    return this.pool.has(agentId);
  }

  /**
   * 清空池
   */
  async clear(): Promise<void> {
    for (const agentId of this.pool.keys()) {
      await this.evict(agentId);
    }
  }

  /**
   * 优雅关闭 - 停止所有 Runtime
   */
  async shutdown(): Promise<void> {
    logger.info(`RuntimePool: shutting down ${this.pool.size} runtimes...`);
    
    // 停止清理任务
    this.stopIdleCleanup();
    
    // 并行停止所有 Runtime
    const stopPromises = Array.from(this.pool.keys()).map(async (agentId) => {
      try {
        await this.evict(agentId);
      } catch (error) {
        logger.error(`RuntimePool: error during shutdown for agent ${agentId}`, error);
      }
    });
    
    await Promise.allSettled(stopPromises);
    logger.info('RuntimePool: all runtimes stopped');
  }
}

// 单例导出
export const runtimePool = new RuntimePool();
