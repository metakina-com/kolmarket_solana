import { z } from 'zod';
import { CharacterSchema, type Character } from '../types/agent.js';
import { logger } from '../utils/logger.js';

/**
 * ElizaOS 完整 Character Schema
 * 支持所有标准 ElizaOS 字段
 */
const ElizaCharacterSchema = z.object({
  // 必填字段
  name: z.string().min(1).max(100),
  bio: z.union([z.string(), z.array(z.string())]),
  
  // 可选标识字段
  id: z.string().optional(),
  username: z.string().optional(),
  
  // 人设相关
  lore: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  adjectives: z.array(z.string()).optional(),
  knowledge: z.array(z.string()).optional(),
  
  // 风格配置
  style: z.object({
    all: z.array(z.string()).optional(),
    chat: z.array(z.string()).optional(),
    post: z.array(z.string()).optional(),
  }).optional(),
  
  // 示例对话
  messageExamples: z.array(z.array(z.object({
    user: z.string(),
    content: z.object({
      text: z.string(),
    }),
  }))).optional(),
  postExamples: z.array(z.string()).optional(),
  
  // 模型设置
  modelProvider: z.string().optional(),
  settings: z.object({
    model: z.string().optional(),
    voice: z.object({
      model: z.string().optional(),
    }).optional(),
    secrets: z.record(z.string()).optional(),
  }).optional(),
  
  // 客户端配置
  clients: z.array(z.string()).optional(),
  
  // 插件 (导入时忽略)
  plugins: z.array(z.string()).optional(),
});

export type ElizaCharacter = z.infer<typeof ElizaCharacterSchema>;

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedCharacter?: Character;
}

/**
 * ValidationService - JSON 校验与安全清洗
 * 
 * 对应需求 FR-02: 标准 JSON 导入
 */
export class ValidationService {
  /**
   * 校验并清洗 character.json (返回详细结果)
   */
  validateWithDetails(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. ElizaOS Schema 校验
    const parseResult = ElizaCharacterSchema.safeParse(input);
    
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`);
      }
      return { valid: false, errors, warnings };
    }

    const parsed = parseResult.data;

    // 2. 检查并记录警告
    if (parsed.plugins && parsed.plugins.length > 0) {
      warnings.push(`Plugins field will be ignored for security reasons (${parsed.plugins.length} plugins)`);
    }
    if (parsed.settings?.secrets) {
      warnings.push('Secrets field will be removed for security reasons');
    }
    if (parsed.id) {
      warnings.push('ID field will be ignored (platform generates new ID)');
    }

    // 3. 安全清洗
    const sanitized = this.sanitizeElizaCharacter(parsed);

    // 4. 转换为内部 Character 类型
    const character: Character = {
      name: sanitized.name,
      bio: sanitized.bio,
      lore: sanitized.lore,
      knowledge: sanitized.knowledge,
      messageExamples: sanitized.messageExamples,
      postExamples: sanitized.postExamples,
      topics: sanitized.topics,
      adjectives: sanitized.adjectives,
      style: sanitized.style,
      clients: sanitized.clients,
      modelProvider: sanitized.modelProvider,
      settings: sanitized.settings,
    };

    logger.debug(`ValidationService: validated character "${sanitized.name}" with ${warnings.length} warnings`);
    
    return {
      valid: true,
      errors,
      warnings,
      sanitizedCharacter: character,
    };
  }

  /**
   * 校验并清洗 character.json (简化版，抛出异常)
   */
  validateAndSanitize(input: unknown): Character {
    const result = this.validateWithDetails(input);
    
    if (!result.valid) {
      throw new Error(`Character validation failed: ${result.errors.join(', ')}`);
    }

    // 记录警告
    for (const warning of result.warnings) {
      logger.warn(`ValidationService: ${warning}`);
    }

    return result.sanitizedCharacter!;
  }

  /**
   * 安全清洗 ElizaOS Character
   */
  private sanitizeElizaCharacter(character: ElizaCharacter): ElizaCharacter {
    const sanitized = { ...character };

    // 移除危险字段
    delete sanitized.id;        // 由平台生成
    delete sanitized.plugins;   // 插件需单独审核
    
    if (sanitized.settings) {
      delete sanitized.settings.secrets;  // 不允许导入密钥
    }

    // 清洗文本内容 (防 XSS)
    sanitized.name = this.sanitizeText(sanitized.name);
    
    if (typeof sanitized.bio === 'string') {
      sanitized.bio = this.sanitizeText(sanitized.bio);
    } else if (Array.isArray(sanitized.bio)) {
      sanitized.bio = sanitized.bio.map(b => this.sanitizeText(b));
    }

    if (sanitized.lore) {
      sanitized.lore = sanitized.lore.map(l => this.sanitizeText(l));
    }

    if (sanitized.topics) {
      sanitized.topics = sanitized.topics.map(t => this.sanitizeText(t));
    }

    if (sanitized.adjectives) {
      sanitized.adjectives = sanitized.adjectives.map(a => this.sanitizeText(a));
    }

    return sanitized;
  }

  /**
   * 安全清洗 - 移除危险字段 (兼容旧接口)
   */
  private sanitize(character: Character): Character {
    const sanitized = { ...character };

    // 移除可能存在的危险字段 (即使 schema 没定义，原始输入可能包含)
    const dangerousFields = ['id', 'secrets', 'plugins', 'actions', 'evaluators'];
    for (const field of dangerousFields) {
      if (field in sanitized) {
        delete (sanitized as Record<string, unknown>)[field];
        logger.warn(`ValidationService: removed dangerous field "${field}"`);
      }
    }

    // 清洗文本内容 (防 XSS)
    sanitized.name = this.sanitizeText(sanitized.name);
    
    if (typeof sanitized.bio === 'string') {
      sanitized.bio = this.sanitizeText(sanitized.bio);
    } else if (Array.isArray(sanitized.bio)) {
      sanitized.bio = sanitized.bio.map(b => this.sanitizeText(b));
    }

    if (sanitized.lore) {
      sanitized.lore = sanitized.lore.map(l => this.sanitizeText(l));
    }

    return sanitized;
  }

  /**
   * 文本清洗 - 移除潜在危险内容
   */
  private sanitizeText(text: string): string {
    return text
      // 移除 HTML 标签
      .replace(/<[^>]*>/g, '')
      // 移除 script 相关
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      // 限制长度
      .slice(0, 10000)
      .trim();
  }

  /**
   * 校验 JSON 字符串
   */
  parseAndValidate(jsonString: string): Character {
    let parsed: unknown;
    
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    return this.validateAndSanitize(parsed);
  }
}

export const validationService = new ValidationService();
