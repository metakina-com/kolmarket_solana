/**
 * Agent Suite 数据库访问层
 * 使用 Cloudflare D1 数据库进行数据持久化
 */

import type { AgentSuiteStatus, AvatarConfig, ModConfig, TraderConfig } from "@/lib/agents/agent-suite";

// ==================== 类型定义 ====================

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = any>(): Promise<D1Result<T>>;
}

interface D1Result<T = any> {
  success: boolean;
  meta: {
    changes: number;
    last_row_id: number;
    duration: number;
    rows_read: number;
    rows_written: number;
  };
  results?: T[];
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// ==================== 数据库操作 ====================

export class AgentSuiteDB {
  constructor(private db: D1Database) {}

  /**
   * 创建 Agent Suite
   */
  async createSuite(suite: AgentSuiteStatus): Promise<void> {
    const now = Date.now();

    // 插入 Suite 主记录
    await this.db
      .prepare(
        `INSERT INTO agent_suites (
        id, kol_handle, kol_name, status,
        avatar_config, mod_config, trader_config,
        avatar_stats, mod_stats, trader_stats,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        suite.suiteId,
        suite.kolHandle,
        suite.kolHandle, // kol_name 可以从其他地方获取
        suite.status,
        JSON.stringify(suite.modules.avatar.enabled ? {} : null),
        JSON.stringify(suite.modules.mod.enabled ? {} : null),
        JSON.stringify(suite.modules.trader.enabled ? {} : null),
        JSON.stringify(suite.stats.avatar || null),
        JSON.stringify(suite.stats.mod || null),
        JSON.stringify(suite.stats.trader || null),
        now,
        now
      )
      .run();

    // 插入模块状态记录
    const modules = [
      { name: "avatar", module: suite.modules.avatar },
      { name: "mod", module: suite.modules.mod },
      { name: "trader", module: suite.modules.trader },
    ];

    for (const { name, module } of modules) {
      await this.db
        .prepare(
          `INSERT INTO agent_suite_modules (
          suite_id, module_name, enabled, status, last_activity, error_message
        ) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          suite.suiteId,
          name,
          module.enabled ? 1 : 0,
          module.status,
          module.lastActivity ? new Date(module.lastActivity).getTime() : null,
          module.error || null
        )
        .run();
    }
  }

  /**
   * 获取 Suite
   */
  async getSuite(suiteId: string): Promise<AgentSuiteStatus | null> {
    const suite = await this.db
      .prepare("SELECT * FROM agent_suites WHERE id = ?")
      .bind(suiteId)
      .first<{
        id: string;
        kol_handle: string;
        kol_name: string;
        status: string;
        avatar_config: string | null;
        mod_config: string | null;
        trader_config: string | null;
        avatar_stats: string | null;
        mod_stats: string | null;
        trader_stats: string | null;
        created_at: number;
        updated_at: number;
      }>();

    if (!suite) {
      return null;
    }

    // 获取模块状态
    const modules = await this.db
      .prepare("SELECT * FROM agent_suite_modules WHERE suite_id = ?")
      .bind(suiteId)
      .all<{
        suite_id: string;
        module_name: string;
        enabled: number;
        status: string;
        last_activity: number | null;
        error_message: string | null;
      }>();

    const moduleMap = new Map(
      modules.results?.map((m) => [
        m.module_name,
        {
          enabled: m.enabled === 1,
          status: m.status as "running" | "stopped" | "error",
          lastActivity: m.last_activity
            ? new Date(m.last_activity).toISOString()
            : undefined,
          error: m.error_message || undefined,
        },
      ]) || []
    );

    return {
      suiteId: suite.id,
      kolHandle: suite.kol_handle,
      status: suite.status as "active" | "inactive" | "error",
      modules: {
        avatar: moduleMap.get("avatar") || {
          enabled: false,
          status: "stopped",
        },
        mod: moduleMap.get("mod") || {
          enabled: false,
          status: "stopped",
        },
        trader: moduleMap.get("trader") || {
          enabled: false,
          status: "stopped",
        },
      },
      stats: {
        avatar: suite.avatar_stats ? JSON.parse(suite.avatar_stats) : undefined,
        mod: suite.mod_stats ? JSON.parse(suite.mod_stats) : undefined,
        trader: suite.trader_stats ? JSON.parse(suite.trader_stats) : undefined,
      },
      createdAt: new Date(suite.created_at).toISOString(),
      lastUpdated: new Date(suite.updated_at).toISOString(),
    };
  }

  /**
   * 根据 KOL Handle 获取 Suite
   */
  async getSuiteByKOLHandle(kolHandle: string): Promise<AgentSuiteStatus | null> {
    const suite = await this.db
      .prepare("SELECT id FROM agent_suites WHERE kol_handle = ?")
      .bind(kolHandle)
      .first<{ id: string }>();

    if (!suite) {
      return null;
    }

    return this.getSuite(suite.id);
  }

  /**
   * 获取所有 Suite
   */
  async getAllSuites(): Promise<AgentSuiteStatus[]> {
    const suites = await this.db
      .prepare("SELECT id FROM agent_suites ORDER BY created_at DESC")
      .all<{ id: string }>();

    const results: AgentSuiteStatus[] = [];
    for (const suite of suites.results || []) {
      const fullSuite = await this.getSuite(suite.id);
      if (fullSuite) {
        results.push(fullSuite);
      }
    }

    return results;
  }

  /**
   * 更新 Suite 状态
   */
  async updateSuiteStatus(
    suiteId: string,
    status: "active" | "inactive" | "error"
  ): Promise<void> {
    await this.db
      .prepare("UPDATE agent_suites SET status = ?, updated_at = ? WHERE id = ?")
      .bind(status, Date.now(), suiteId)
      .run();
  }

  /**
   * 更新模块状态
   */
  async updateModuleStatus(
    suiteId: string,
    moduleName: "avatar" | "mod" | "trader",
    status: "running" | "stopped" | "error",
    error?: string
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE agent_suite_modules 
        SET status = ?, last_activity = ?, error_message = ? 
        WHERE suite_id = ? AND module_name = ?`
      )
      .bind(status, Date.now(), error || null, suiteId, moduleName)
      .run();
  }

  /**
   * 更新统计数据
   */
  async updateStats(
    suiteId: string,
    stats: {
      avatar?: any;
      mod?: any;
      trader?: any;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (stats.avatar !== undefined) {
      updates.push("avatar_stats = ?");
      values.push(JSON.stringify(stats.avatar));
    }
    if (stats.mod !== undefined) {
      updates.push("mod_stats = ?");
      values.push(JSON.stringify(stats.mod));
    }
    if (stats.trader !== undefined) {
      updates.push("trader_stats = ?");
      values.push(JSON.stringify(stats.trader));
    }

    if (updates.length === 0) {
      return;
    }

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(suiteId);

    await this.db
      .prepare(`UPDATE agent_suites SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  /**
   * 删除 Suite
   */
  async deleteSuite(suiteId: string): Promise<void> {
    // 外键约束会自动删除关联的模块记录
    await this.db.prepare("DELETE FROM agent_suites WHERE id = ?").bind(suiteId).run();
  }
}

/**
 * 获取数据库实例（在 Edge Runtime 中使用）
 */
export function getAgentSuiteDB(env: { DB?: D1Database }): AgentSuiteDB | null {
  if (!env.DB) {
    console.warn("D1 database not available. Agent Suite data will not be persisted.");
    return null;
  }
  return new AgentSuiteDB(env.DB);
}
