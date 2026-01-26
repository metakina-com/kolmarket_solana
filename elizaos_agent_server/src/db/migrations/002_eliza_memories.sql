-- ElizaOS Memory 存储迁移
-- 版本: 002
-- 日期: 2026-01-26

-- agent_memories 表：Agent 对话记忆存储
CREATE TABLE IF NOT EXISTS agent_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content JSONB NOT NULL,
    embedding JSONB,  -- 向量嵌入 (如果安装了 pgvector 可改为 VECTOR 类型)
    unique_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_memories_agent ON agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_room ON agent_memories(room_id);
CREATE INDEX IF NOT EXISTS idx_memories_user ON agent_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created ON agent_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_unique ON agent_memories(room_id, unique_flag) WHERE unique_flag = TRUE;

-- agent_goals 表：Agent 目标存储
CREATE TABLE IF NOT EXISTS agent_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'DONE', 'FAILED')),
    objectives JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_room ON agent_goals(room_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON agent_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON agent_goals(status);

-- 更新时间触发器
CREATE TRIGGER goals_updated_at
    BEFORE UPDATE ON agent_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 注释
COMMENT ON TABLE agent_memories IS 'ElizaOS Agent 对话记忆存储';
COMMENT ON COLUMN agent_memories.content IS '消息内容 (JSON 格式)';
COMMENT ON COLUMN agent_memories.embedding IS '向量嵌入用于语义搜索';
COMMENT ON COLUMN agent_memories.unique_flag IS '标记为唯一记忆 (用于去重)';

COMMENT ON TABLE agent_goals IS 'ElizaOS Agent 目标存储';
COMMENT ON COLUMN agent_goals.objectives IS '目标的子任务列表';
