-- KOLMarket.ai 数据库 Schema
-- 用于 Cloudflare D1 数据库

-- Agents 表：存储 KOL 数字生命 Agent 配置
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  kol_handle TEXT NOT NULL UNIQUE,
  kol_name TEXT NOT NULL,
  personality TEXT,
  config TEXT,  -- JSON 格式的完整配置
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 对话历史表：存储用户与 Agent 的对话记录
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 知识库元数据表：存储 RAG 知识库的元数据
-- 实际向量存储在 Cloudflare Vectorize 中
CREATE TABLE IF NOT EXISTS knowledge_metadata (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  source TEXT NOT NULL,  -- R2 文件路径或外部 URL
  chunk_id TEXT NOT NULL UNIQUE,  -- Vectorize 中的向量 ID
  content_preview TEXT,  -- 内容预览（前 200 字符）
  chunk_index INTEGER,  -- 在文档中的位置
  created_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 交易策略表：存储自动交易策略
CREATE TABLE IF NOT EXISTS trading_strategies (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,  -- JSON 格式的策略规则
  enabled INTEGER DEFAULT 0,  -- 0 = false, 1 = true
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- 交易执行记录表：存储策略执行历史
CREATE TABLE IF NOT EXISTS trading_executions (
  id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL,  -- 'pending', 'success', 'failed'
  error_message TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id)
);

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
CREATE INDEX IF NOT EXISTS idx_agents_kol_handle ON agents(kol_handle);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_agent_id ON knowledge_metadata(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunk_id ON knowledge_metadata(chunk_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_agent_id ON trading_strategies(agent_id);
CREATE INDEX IF NOT EXISTS idx_trading_executions_strategy_id ON trading_executions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trading_executions_timestamp ON trading_executions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_suites_kol_handle ON agent_suites(kol_handle);
CREATE INDEX IF NOT EXISTS idx_agent_suites_status ON agent_suites(status);
CREATE INDEX IF NOT EXISTS idx_agent_suite_modules_suite_id ON agent_suite_modules(suite_id);
