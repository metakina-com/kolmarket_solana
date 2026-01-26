/**
 * 轻量级 AI Agent 系统
 * 使用 Vercel AI SDK 替代 ElizaOS + LangChain
 * 包体积: ~200KB vs ~15MB
 */

import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getKOLPersona, getDefaultSystemPrompt } from './kol-personas';

// ============ 类型定义 ============

export interface AgentConfig {
  provider: 'openai' | 'cloudflare' | 'auto';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentContext {
  kolHandle?: string;
  useRAG?: boolean;
  ragContext?: string[];
  conversationHistory?: AgentMessage[];
}

export interface AgentResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  finishReason?: string;
}

// ============ Provider 配置 ============

const DEFAULT_CONFIG: AgentConfig = {
  provider: 'auto',
  temperature: 0.7,
  maxTokens: 500,
};

/**
 * 创建 OpenAI 兼容的 provider
 * 支持 OpenAI API 或兼容 API (如 Groq, Together, etc.)
 */
function createProvider(config: AgentConfig) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    return null;
  }

  return createOpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  });
}

// ============ 简化工具 (不使用 tool helper) ============

async function getTokenPrice(symbol: string): Promise<{ symbol: string; price: number; currency: string }> {
  const mockPrices: Record<string, number> = {
    SOL: 150,
    BTC: 95000,
    ETH: 3500,
    KMT: 0.05,
  };
  const price = mockPrices[symbol.toUpperCase()] || 0;
  return { symbol: symbol.toUpperCase(), price, currency: 'USD' };
}

// ============ 核心 Agent 函数 ============

/**
 * 构建系统提示词
 */
function buildSystemPrompt(context: AgentContext): string {
  let systemPrompt: string;

  if (context.kolHandle) {
    const persona = getKOLPersona(context.kolHandle);
    systemPrompt = persona?.systemPrompt || getDefaultSystemPrompt(context.kolHandle);
  } else {
    systemPrompt = getDefaultSystemPrompt();
  }

  // 添加 RAG 上下文
  if (context.useRAG && context.ragContext && context.ragContext.length > 0) {
    const contextText = context.ragContext
      .map((c, idx) => `[${idx + 1}] ${c}`)
      .join('\n\n');
    systemPrompt += `\n\n## Reference Knowledge:\n${contextText}\n\nUse this knowledge to inform your responses when relevant.`;
  }

  return systemPrompt;
}

/**
 * 使用 Vercel AI SDK 生成响应
 */
export async function generateAgentResponse(
  prompt: string,
  context: AgentContext = {},
  config: AgentConfig = DEFAULT_CONFIG
): Promise<AgentResponse> {
  const provider = createProvider(config);
  const systemPrompt = buildSystemPrompt(context);

  // 构建消息
  const messages: AgentMessage[] = [];
  
  if (context.conversationHistory) {
    messages.push(...context.conversationHistory);
  }
  
  messages.push({ role: 'user', content: prompt });

  // 如果有 OpenAI provider，使用它
  if (provider) {
    try {
      const model = config.model || 'gpt-4o-mini';
      const result = await generateText({
        model: provider(model),
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      });

      return {
        text: result.text,
        usage: result.usage ? {
          promptTokens: (result.usage as any).promptTokens ?? 0,
          completionTokens: (result.usage as any).completionTokens ?? 0,
        } : undefined,
        finishReason: result.finishReason,
      };
    } catch (error) {
      console.warn('OpenAI generation failed, will try fallback:', error);
    }
  }

  // Fallback: 返回 demo 响应
  return generateFallbackResponse(prompt, context);
}

/**
 * 流式生成响应 (用于实时 UI)
 */
export async function streamAgentResponse(
  prompt: string,
  context: AgentContext = {},
  config: AgentConfig = DEFAULT_CONFIG
) {
  const provider = createProvider(config);
  const systemPrompt = buildSystemPrompt(context);

  if (!provider) {
    throw new Error('No AI provider configured. Set OPENAI_API_KEY.');
  }

  const model = config.model || 'gpt-4o-mini';
  
  return streamText({
    model: provider(model),
    system: systemPrompt,
    messages: [{ role: 'user' as const, content: prompt }],
    temperature: config.temperature,
    maxOutputTokens: config.maxTokens,
  });
}

/**
 * 带工具调用的 Agent (简化版，工具结果内联到响应)
 */
export async function generateAgentResponseWithTools(
  prompt: string,
  context: AgentContext = {},
  config: AgentConfig = DEFAULT_CONFIG
): Promise<AgentResponse> {
  // 检测是否需要调用工具
  const promptLower = prompt.toLowerCase();
  let toolContext = '';

  if (promptLower.includes('price') && (promptLower.includes('sol') || promptLower.includes('btc') || promptLower.includes('eth') || promptLower.includes('kmt'))) {
    const symbols = ['SOL', 'BTC', 'ETH', 'KMT'].filter(s => promptLower.includes(s.toLowerCase()));
    const prices = await Promise.all(symbols.map(s => getTokenPrice(s)));
    toolContext = `\n\nCurrent prices: ${prices.map(p => `${p.symbol}: $${p.price}`).join(', ')}`;
  }

  // 添加工具上下文到 prompt
  const enhancedPrompt = toolContext ? `${prompt}${toolContext}` : prompt;
  
  return generateAgentResponse(enhancedPrompt, context, config);
}

/**
 * 降级响应 (当没有 AI provider 时)
 */
function generateFallbackResponse(
  prompt: string,
  context: AgentContext
): AgentResponse {
  const kolHandle = context.kolHandle;
  const persona = kolHandle ? getKOLPersona(kolHandle) : null;
  const kolName = persona?.name || 'AI Assistant';

  const promptLower = prompt.toLowerCase();
  let text: string;

  if (promptLower.includes('gm') || promptLower.includes('hello') || promptLower.includes('hi')) {
    text = `GM! 👋 I'm ${kolName}'s digital twin. AI service is currently in demo mode. What's your alpha today?`;
  } else if (promptLower.includes('price') || promptLower.includes('token')) {
    text = `🚀 ${kolName} here! Token prices are looking bullish. For real-time data, connect your API keys. WAGMI!`;
  } else {
    text = `🚀 ${kolName} here! I'm in demo mode right now. You asked: "${prompt.slice(0, 50)}..." Configure OPENAI_API_KEY for full functionality!`;
  }

  return { text, finishReason: 'demo' };
}

// ============ 工具函数 ============

/**
 * 检查 AI 服务是否可用
 */
export function isAIServiceAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * 获取可用的模型列表
 */
export function getAvailableModels(): string[] {
  if (process.env.OPENAI_API_KEY) {
    return ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
  return ['demo'];
}
