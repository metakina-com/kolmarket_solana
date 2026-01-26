import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (支持 postgresql:// 格式)
  DATABASE_URL: z.string().min(1).refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    { message: 'DATABASE_URL must be a valid PostgreSQL connection string' }
  ),

  // Agent Pool
  MAX_ACTIVE_AGENTS: z.coerce.number().min(1).default(20),
  AGENT_IDLE_TIMEOUT_MS: z.coerce.number().min(60000).default(600000), // 10 min

  // ElizaOS LLM Configuration
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEFAULT_MODEL_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  DEFAULT_MODEL: z.string().default('gpt-4o-mini'),

  // Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * 验证 ElizaOS 必需的 API Key 是否存在
 */
function validateElizaOSConfig(config: Config): void {
  const provider = config.DEFAULT_MODEL_PROVIDER;
  
  if (provider === 'openai' && !config.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is required when DEFAULT_MODEL_PROVIDER is "openai"');
    process.exit(1);
  }
  
  if (provider === 'anthropic' && !config.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required when DEFAULT_MODEL_PROVIDER is "anthropic"');
    process.exit(1);
  }
}

/**
 * 验证 ElizaOS 依赖是否可正确导入
 */
async function validateElizaOSDependencies(): Promise<void> {
  try {
    await import('@elizaos/core');
    console.log('✅ ElizaOS core dependency verified');
  } catch (error) {
    console.error('❌ Failed to import @elizaos/core. Please run: npm install');
    console.error(error);
    process.exit(1);
  }
}

function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  // 验证 ElizaOS 配置
  validateElizaOSConfig(result.data);

  return result.data;
}

export const config = loadConfig();

// 导出验证函数供启动时调用
export { validateElizaOSDependencies };
