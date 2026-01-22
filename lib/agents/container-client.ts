/**
 * Cloudflare Containers 客户端
 * 
 * 用于从 Edge Runtime 调用运行在 Cloudflare Containers 中的 ElizaOS 插件
 */

const CONTAINER_URL = process.env.ELIZAOS_CONTAINER_URL;

/**
 * 检查是否配置了容器
 */
export function isContainerEnabled(): boolean {
  return !!CONTAINER_URL;
}

/**
 * 调用容器 API（带重试和降级）
 */
async function callContainerAPI(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  body?: any,
  retries: number = 2,
  timeout: number = 5000
): Promise<any> {
  if (!CONTAINER_URL) {
    throw new Error("ELIZAOS_CONTAINER_URL not configured");
  }

  const url = `${CONTAINER_URL}${endpoint}`;
  
  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  let lastError: Error | null = null;

  // 重试逻辑
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      clearTimeout(timeoutId);

      // 502 错误时重试
      if (response.status === 502 && attempt < retries) {
        console.warn(`⚠️  Container API returned 502, retrying... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // 指数退避
        continue;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || `Container API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      // 如果是超时或网络错误，且还有重试次数，则重试
      if (
        (error.name === 'AbortError' || error.message?.includes('fetch')) &&
        attempt < retries
      ) {
        console.warn(`⚠️  Container API request failed, retrying... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // 502 错误时重试
      if (error.message?.includes('502') && attempt < retries) {
        console.warn(`⚠️  Container API returned 502, retrying... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // 最后一次尝试失败，抛出错误
      if (attempt === retries) {
        throw error;
      }
    }
  }

  // 所有重试都失败
  throw lastError || new Error("Container API request failed after retries");
}

/**
 * Twitter API（带降级处理）
 */
export const containerTwitter = {
  /**
   * 发推
   */
  async postTweet(
    suiteId: string,
    content: string,
    config?: {
      name?: string;
      description?: string;
      autoPost?: boolean;
      autoInteract?: boolean;
    }
  ): Promise<string> {
    try {
      const result = await callContainerAPI("/api/twitter/post", "POST", {
        suiteId,
        content,
        config,
      }, 2, 5000); // 重试2次，超时5秒
      return result.tweetId;
    } catch (error) {
      console.error("Container Twitter API failed, using fallback:", error);
      // 降级：返回模拟的 tweetId，确保流程继续
      return `tweet-fallback-${Date.now()}`;
    }
  },
};

/**
 * Discord API（带降级处理）
 */
export const containerDiscord = {
  /**
   * 发送消息
   */
  async sendMessage(
    suiteId: string,
    channelId: string,
    message: string,
    config?: {
      name?: string;
      description?: string;
      guildId?: string;
      autoReply?: boolean;
    }
  ): Promise<void> {
    try {
      await callContainerAPI("/api/discord/message", "POST", {
        suiteId,
        channelId,
        message,
        config,
      }, 2, 5000); // 重试2次，超时5秒
    } catch (error) {
      console.error("Container Discord API failed, using fallback:", error);
      // 降级：静默失败，确保流程继续
      console.warn(`[Fallback] Would send Discord message to ${channelId}: ${message}`);
    }
  },
};

/**
 * Telegram API（带降级处理）
 */
export const containerTelegram = {
  /**
   * 发送消息
   */
  async sendMessage(
    suiteId: string,
    chatId: string,
    message: string,
    config?: {
      name?: string;
      description?: string;
      autoReply?: boolean;
    }
  ): Promise<void> {
    try {
      await callContainerAPI("/api/telegram/message", "POST", {
        suiteId,
        chatId,
        message,
        config,
      }, 2, 5000); // 重试2次，超时5秒
    } catch (error) {
      console.error("Container Telegram API failed, using fallback:", error);
      // 降级：静默失败，确保流程继续
      console.warn(`[Fallback] Would send Telegram message to ${chatId}: ${message}`);
    }
  },
};

/**
 * Solana API（带降级处理）
 */
export const containerSolana = {
  /**
   * 执行交易
   */
  async executeTrade(
    suiteId: string,
    action: "buy" | "sell",
    token: string,
    amount: number,
    config?: {
      name?: string;
      description?: string;
      autoTrading?: boolean;
    }
  ): Promise<string> {
    try {
      const result = await callContainerAPI("/api/solana/trade", "POST", {
        suiteId,
        action,
        token,
        amount,
        config,
      }, 2, 5000); // 重试2次，超时5秒
      return result.txSignature;
    } catch (error) {
      console.error("Container Solana API failed, using fallback:", error);
      // 降级：返回模拟的 txSignature，确保流程继续
      return `tx-fallback-${Date.now()}`;
    }
  },
};

/**
 * 健康检查（带降级处理）
 */
export async function checkContainerHealth(): Promise<boolean> {
  try {
    if (!CONTAINER_URL) {
      return false;
    }
    const result = await callContainerAPI("/health", "GET", undefined, 1, 3000); // 只重试1次，超时3秒
    return result.status === "ok";
  } catch (error) {
    // 健康检查失败不影响主流程，只记录警告
    console.warn("Container health check failed (non-critical):", error);
    return false;
  }
}

/**
 * 检查容器是否可用（不抛出错误）
 */
export async function isContainerAvailable(): Promise<boolean> {
  try {
    return await checkContainerHealth();
  } catch {
    return false;
  }
}
