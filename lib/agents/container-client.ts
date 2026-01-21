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
 * 调用容器 API
 */
async function callContainerAPI(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  body?: any
): Promise<any> {
  if (!CONTAINER_URL) {
    throw new Error("ELIZAOS_CONTAINER_URL not configured");
  }

  const url = `${CONTAINER_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Container API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Twitter API
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
    const result = await callContainerAPI("/api/twitter/post", "POST", {
      suiteId,
      content,
      config,
    });
    return result.tweetId;
  },
};

/**
 * Discord API
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
    await callContainerAPI("/api/discord/message", "POST", {
      suiteId,
      channelId,
      message,
      config,
    });
  },
};

/**
 * Telegram API
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
    await callContainerAPI("/api/telegram/message", "POST", {
      suiteId,
      chatId,
      message,
      config,
    });
  },
};

/**
 * Solana API
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
    const result = await callContainerAPI("/api/solana/trade", "POST", {
      suiteId,
      action,
      token,
      amount,
      config,
    });
    return result.txSignature;
  },
};

/**
 * 健康检查
 */
export async function checkContainerHealth(): Promise<boolean> {
  try {
    if (!CONTAINER_URL) {
      return false;
    }
    const result = await callContainerAPI("/health", "GET");
    return result.status === "ok";
  } catch (error) {
    console.error("Container health check failed:", error);
    return false;
  }
}
