import { z } from 'zod';

// ElizaOS Character Schema (基于标准 character.json)
export const CharacterStyleSchema = z.object({
  all: z.array(z.string()).optional(),
  chat: z.array(z.string()).optional(),
  post: z.array(z.string()).optional(),
});

export const CharacterSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.union([z.string(), z.array(z.string())]),
  lore: z.array(z.string()).optional(),
  knowledge: z.array(z.string()).optional(),
  messageExamples: z.array(z.array(z.object({
    user: z.string(),
    content: z.object({
      text: z.string(),
    }),
  }))).optional(),
  postExamples: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  adjectives: z.array(z.string()).optional(),
  style: CharacterStyleSchema.optional(),
  clients: z.array(z.string()).optional(),
  modelProvider: z.string().optional(),
  settings: z.object({
    model: z.string().optional(),
    voice: z.object({
      model: z.string().optional(),
    }).optional(),
  }).optional(),
});

export type Character = z.infer<typeof CharacterSchema>;

// Agent 数据库模型
export interface Agent {
  id: string;
  creatorId: string;
  name: string;
  characterJson: Character;
  status: 'inactive' | 'active' | 'error';
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}

// API 请求/响应类型
export const CreateAgentRequestSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().min(1),
  lore: z.array(z.string()).optional(),
  style: CharacterStyleSchema.optional(),
});

export type CreateAgentRequest = z.infer<typeof CreateAgentRequestSchema>;

export const ImportAgentRequestSchema = z.object({
  character: CharacterSchema,
});

export type ImportAgentRequest = z.infer<typeof ImportAgentRequestSchema>;

export interface AgentResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
}
