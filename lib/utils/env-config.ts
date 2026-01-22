/**
 * 环境变量配置管理工具
 * 用于验证、加载和持久化环境变量配置
 */

export interface EnvConfig {
  // Solana 配置
  solana: {
    rpcUrl: string;
    privateKey?: string;
  };
  // ElizaOS 配置
  eliza: {
    modelProvider: string;
    model: string;
  };
  // 服务器配置
  server: {
    host: string;
    port: number;
    nodeEnv: string;
  };
  // Discord 配置
  discord?: {
    botToken: string;
  };
  // Telegram 配置
  telegram?: {
    botToken: string;
  };
  // Twitter 配置
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
}

/**
 * 环境变量验证结果
 */
export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 从环境变量加载配置
 */
export function loadEnvConfig(): EnvConfig {
  return {
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      privateKey: process.env.SOLANA_PRIVATE_KEY,
    },
    eliza: {
      modelProvider: process.env.ELIZA_MODEL_PROVIDER || "CLOUDFLARE_AI",
      model: process.env.ELIZA_MODEL || "@cf/meta/llama-3-8b-instruct",
    },
    server: {
      host: process.env.HOST || "0.0.0.0",
      port: parseInt(process.env.PORT || "3001", 10),
      nodeEnv: process.env.NODE_ENV || "development",
    },
    discord: process.env.DISCORD_BOT_TOKEN
      ? { botToken: process.env.DISCORD_BOT_TOKEN }
      : undefined,
    telegram: process.env.TELEGRAM_BOT_TOKEN
      ? { botToken: process.env.TELEGRAM_BOT_TOKEN }
      : undefined,
    twitter:
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
        ? {
            apiKey: process.env.TWITTER_API_KEY,
            apiSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
          }
        : undefined,
  };
}

/**
 * 验证环境变量配置
 */
export function validateEnvConfig(config?: EnvConfig): EnvValidationResult {
  const envConfig = config || loadEnvConfig();
  const missing: string[] = [];
  const warnings: string[] = [];

  // 必需的环境变量
  if (!envConfig.solana.rpcUrl) {
    missing.push("SOLANA_RPC_URL");
  }

  // 可选但推荐的环境变量
  if (!envConfig.solana.privateKey) {
    warnings.push("SOLANA_PRIVATE_KEY (可选，用于交易功能)");
  }

  if (!envConfig.discord) {
    warnings.push("DISCORD_BOT_TOKEN (可选，用于 Discord 集成)");
  }

  if (!envConfig.telegram) {
    warnings.push("TELEGRAM_BOT_TOKEN (可选，用于 Telegram 集成)");
  }

  if (!envConfig.twitter) {
    warnings.push("Twitter API 凭据 (可选，用于 Twitter 集成)");
  }

  // 验证端口范围
  if (envConfig.server.port < 1 || envConfig.server.port > 65535) {
    warnings.push(`PORT 值无效: ${envConfig.server.port}，应使用 1-65535 之间的值`);
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 打印环境变量配置摘要（隐藏敏感信息）
 */
export function printEnvConfigSummary(config?: EnvConfig): void {
  const envConfig = config || loadEnvConfig();
  const validation = validateEnvConfig(envConfig);

  console.log("\n📋 环境变量配置摘要");
  console.log("=" .repeat(50));
  console.log(`✅ Solana RPC: ${envConfig.solana.rpcUrl}`);
  console.log(
    `✅ Solana 私钥: ${envConfig.solana.privateKey ? "已配置" : "未配置"}`
  );
  console.log(
    `✅ ElizaOS 模型: ${envConfig.eliza.modelProvider} / ${envConfig.eliza.model}`
  );
  console.log(
    `✅ 服务器: ${envConfig.server.host}:${envConfig.server.port} (${envConfig.server.nodeEnv})`
  );
  console.log(
    `✅ Discord: ${envConfig.discord ? "已配置" : "未配置"}`
  );
  console.log(
    `✅ Telegram: ${envConfig.telegram ? "已配置" : "未配置"}`
  );
  console.log(
    `✅ Twitter: ${envConfig.twitter ? "已配置" : "未配置"}`
  );

  if (validation.warnings.length > 0) {
    console.log("\n⚠️  警告:");
    validation.warnings.forEach((warning) => {
      console.log(`   - ${warning}`);
    });
  }

  if (validation.missing.length > 0) {
    console.log("\n❌ 缺失的必需环境变量:");
    validation.missing.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
  }

  console.log("=" .repeat(50) + "\n");
}

/**
 * 获取环境变量配置（单例模式）
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvConfig();
  }
  return cachedConfig;
}

/**
 * 重置缓存的配置（用于测试或重新加载）
 */
export function resetEnvConfig(): void {
  cachedConfig = null;
}
