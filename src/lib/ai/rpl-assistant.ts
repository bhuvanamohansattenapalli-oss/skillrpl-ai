import { getGeminiClient, getGeminiModel } from './gemini.js';
import { RPL_SYSTEM_INSTRUCTION } from './prompts.js';
import type { ChatRequest, ChatSuccessResponse } from './types.js';

interface GeminiContentPart {
  text: string;
}

interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

const STATIC_RPL_KNOWLEDGE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['what is rpl', 'define rpl', 'rpl meaning', 'rpl explanation', 'about rpl'],
    answer:
      'Recognition of Prior Learning (RPL) is a key component of the National Skills Qualifications Framework (NSQF) under the Ministry of Skill Development and Entrepreneurship (MSDE). It assesses, evaluates, and certifies existing skills, work experience, and informal learning of candidate workers without requiring formal classroom training.'
  },
  {
    keywords: ['what is nsqf', 'define nsqf', 'nsqf level', 'nsqf meaning', 'qualification framework'],
    answer:
      'The National Skills Qualifications Framework (NSQF) is a competency-based framework that organizes qualifications according to levels of knowledge, skills, and aptitude (Levels 1 to 10) recognized nationally across industries in India.'
  },
  {
    keywords: ['evidence', 'what evidence', 'documents required', 'upload evidence', 'proof of work'],
    answer:
      'Recommended RPL evidence includes: 1) Photos or video clips of you executing trade tasks, 2) Employer work certificates or experience letters, 3) Photos of completed panels, installations, or job sites, and 4) Self-declared skill checklist details.'
  },
  {
    keywords: ['how does assessment work', 'assessment process', 'how assessment works', 'steps in assessment'],
    answer:
      'The SkillRPL Assessment workflow consists of 4 simple steps: 1) Self-Declaration of trade experience and skills, 2) 10-Question MCQ Knowledge Assessment, 3) Practical task & evidence submission, and 4) Final verification by an Accredited Assessor.'
  },
  {
    keywords: ['can ai replace', 'ai replace assessor', 'replace human assessor', 'is ai the assessor', 'ai assessor'],
    answer:
      'No. SkillRPL AI provides diagnostic scoring, question generation, and mapping assistance. All official RPL qualification decisions and certifications are made exclusively by accredited human assessors.'
  }
];

export function getDeterministicRplFallback(prompt: string): string | null {
  const lower = (prompt || '').toLowerCase().trim();
  for (const item of STATIC_RPL_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  return null;
}

/**
 * Generates an RPL assistant response using the Gemini API.
 * Formats multi-turn chat history and enforces RPL safety guidelines.
 */
export async function generateRplChatResponse(request: ChatRequest): Promise<ChatSuccessResponse> {
  const userPrompt = request.message.trim();

  const ai = getGeminiClient();
  const model = getGeminiModel();

  // Convert validated history items to Gemini contents format (limit to last 6 messages)
  const contents: GeminiContentMessage[] = [];
  const MAX_HISTORY_MESSAGES = 6;

  if (request.history && request.history.length > 0) {
    const recentHistory = request.history.slice(-MAX_HISTORY_MESSAGES);
    let lastContent = '';
    let lastRole: 'user' | 'model' | null = null;

    for (const item of recentHistory) {
      const trimmedText = item.content.trim();
      if (!trimmedText) continue;

      const role: 'user' | 'model' = item.role === 'user' ? 'user' : 'model';

      // Deduplicate identical repeated messages
      if (lastRole === role && lastContent === trimmedText) {
        continue;
      }

      contents.push({
        role,
        parts: [{ text: trimmedText }]
      });

      lastRole = role;
      lastContent = trimmedText;
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  const primaryModel = model;
  const TIMEOUT_MS = 18000;
  let lastError: any = null;
  let replyText: string | undefined;

  // Maximum 1 retry ONLY for 503 SERVICE_UNAVAILABLE
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const geminiStartTime = Date.now();
      const generatePromise = ai.models.generateContent({
        model: primaryModel,
        contents,
        config: {
          systemInstruction: RPL_SYSTEM_INSTRUCTION,
          temperature: 0.5,
          maxOutputTokens: 600
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          const timeoutErr = new Error('AI request timed out. Please ask a shorter question or try again.') as Error & {
            status?: number;
            code?: string;
          };
          timeoutErr.status = 504;
          timeoutErr.code = 'TIMEOUT';
          reject(timeoutErr);
        }, TIMEOUT_MS);
        if (typeof timer.unref === 'function') timer.unref();
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const geminiMs = Date.now() - geminiStartTime;
      replyText = response.text?.trim();

      console.log(
        `[AI_TIMING] model=${primaryModel} | attempt=${attempt} | geminiMs=${geminiMs}ms | outputLength=${replyText?.length || 0}`
      );

      if (replyText) {
        return {
          success: true,
          message: replyText
        };
      }
    } catch (error: any) {
      lastError = error;
      const errMsg = error?.message || String(error);
      const is503 = error?.status === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand');

      // Retry ONLY once for 503 SERVICE_UNAVAILABLE
      if (is503 && attempt < maxAttempts) {
        console.warn('[AI Assistant] 503 Service Unavailable encountered. Retrying once after 1000ms backoff...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Do NOT retry 429 quota errors or other status codes
      break;
    }
  }

  // Check deterministic static fallback first if Gemini unavailable/rate-limited
  const staticFallback = getDeterministicRplFallback(userPrompt);
  if (staticFallback) {
    return {
      success: true,
      message: `${staticFallback}\n\n*(Note: Knowledge base response served while Gemini service is unavailable.)*`
    };
  }

  // Handle final error formatting
  const errorMessage = lastError?.message || String(lastError);
  const errorStatus = lastError?.status || lastError?.statusCode || 500;

  // Extract clean error message avoiding token or key exposure
  let safeMsg = 'Unknown Gemini API error';
  try {
    const jsonStart = errorMessage.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(errorMessage.slice(jsonStart));
      safeMsg = parsed?.error?.message || errorMessage;
    } else {
      safeMsg = errorMessage;
    }
  } catch {
    safeMsg = errorMessage;
  }
  safeMsg = safeMsg.replace(/key=[^&\s"']+/gi, 'key=[REDACTED]').replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]');

  const error = new Error() as Error & { status?: number; code?: string; model?: string };
  error.status = errorStatus;
  error.model = primaryModel;

  if (errorStatus === 429 || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota') || errorMessage.includes('429')) {
    error.status = 429;
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.message = 'AI is temporarily unavailable because the AI service quota has been reached. Your assessment data is safe. Please try again later.';
    throw error;
  }

  if (errorStatus === 401 || errorStatus === 403 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('UNAUTHENTICATED') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('invalid api key')) {
    error.status = errorStatus === 403 ? 403 : 401;
    error.code = 'AUTHENTICATION_FAILED';
    error.message = `AI authentication failed for model '${primaryModel}'. Please verify server GEMINI_API_KEY.`;
    throw error;
  }

  if (errorStatus === 404 || errorMessage.includes('is not found') || errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
    error.status = 404;
    error.code = 'MODEL_NOT_FOUND';
    error.message = `Configured model '${primaryModel}' was not found: ${safeMsg.slice(0, 160)}`;
    throw error;
  }

  if (errorStatus === 503 || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
    error.status = 503;
    error.code = 'SERVICE_UNAVAILABLE';
    error.message = `AI service for model '${primaryModel}' is temporarily unavailable due to high demand. Please try again in a moment.`;
    throw error;
  }

  // Default safe error
  error.status = errorStatus;
  error.code = 'SERVER_ERROR';
  error.message = `AI is temporarily unavailable (${errorStatus}). Your assessment data is safe. Please try again later.`;
  throw error;
}



