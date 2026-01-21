-- Agent Suite 数据库迁移脚本
-- 运行此脚本添加 Agent Suite 相关的表

-- Agent Suite 表：存储 Agent Suite 配置和状态
CREATE TABLE IF NOT EXISTS agent_suites (
  id TEXT PRIMARY KEY,
  kol_handle TEXT NOT NULL UNIQUE,
  kol_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',  -- 'active', 'inactive', 'error'
  avatar_config TEXT,  -- JSON 格式的 Avatar 配置
  mod_config TEXT,     -- JSON 格式的 Mod 配置
  trader_config TEXT,  -- JSON 格式的 Trader 配置
  avatar_stats TEXT,   -- JSON 格式的 Avatar 统计数据
  mod_stats TEXT,      -- JSON 格式的 Mod 统计数据
  trader_stats TEXT,   -- JSON 格式的 Trader 统计数据
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Agent Suite 模块状态表：存储各模块的详细状态
CREATE TABLE IF NOT EXISTS agent_suite_modules (
  suite_id TEXT NOT NULL,
  module_name TEXT NOT NULL,  -- 'avatar', 'mod', 'trader'
  enabled INTEGER DEFAULT 0,  -- 0 = false, 1 = true
  status TEXT NOT NULL DEFAULT 'stopped',  -- 'running', 'stopped', 'error'
  last_activity INTEGER,
  error_message TEXT,
  PRIMARY KEY (suite_id, module_name),
  FOREIGN KEY (suite_id) REFERENCES agent_suites(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_agent_suites_kol_handle ON agent_suites(kol_handle);
CREATE INDEX IF NOT EXISTS idx_agent_suites_status ON agent_suites(status);
CREATE INDEX IF NOT EXISTS idx_agent_suite_modules_suite_id ON agent_suite_modules(suite_id);
