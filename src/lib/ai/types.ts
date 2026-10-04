import { z } from 'zod';

/**
 * Zod schema for validating single conversation history message
 */
export const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant', 'model', 'ai']),
  content: z.string().trim().min(1).max(4000)
});

export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;

/**
 * Zod schema for validating incoming POST /api/ai/chat requests
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  history: z
    .array(chatHistoryItemSchema)
    .max(50, 'History cannot exceed 50 messages')
    .optional()
    .default([])
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Standard API response formats
 */
export interface ChatSuccessResponse {
  success: true;
  message: string;
}

export interface ChatErrorResponse {
  success: false;
  error: string;
}

export type ChatApiResponse = ChatSuccessResponse | ChatErrorResponse;

export interface HealthResponse {
  status: 'ok';
  database?: 'connected' | 'disconnected' | 'not_configured';
  geminiConfigured: boolean;
  model?: string;
}

/**
 * Zod schema for validating POST /api/ai/skill-analysis requests
 */
export const skillAnalysisRequestSchema = z.object({
  occupation: z.string().trim().min(1, 'Occupation or trade is required'),
  yearsExperience: z.coerce.number().min(0, 'Years of experience must be 0 or more').max(60, 'Years of experience must be reasonable'),
  experience: z.string().trim().min(10, 'Please provide more details about your work experience (at least 10 characters)'),
  tasks: z.array(z.string().trim().min(1)).optional().default([]),
  tools: z.array(z.string().trim().min(1)).optional().default([]),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  additionalExperience: z.string().trim().optional(),
  workerProfileId: z.string().optional(),
  rplApplicationId: z.string().optional()
});

export type SkillAnalysisRequest = z.infer<typeof skillAnalysisRequestSchema>;

