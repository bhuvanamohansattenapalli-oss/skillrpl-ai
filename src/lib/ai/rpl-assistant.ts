import { getGeminiClient, getGeminiModel } from './gemini';
import { RPL_SYSTEM_INSTRUCTION } from './prompts';
import type { ChatRequest, ChatSuccessResponse } from './types';

interface GeminiContentPart {
  text: string;
}

interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

/**
 * Generates an RPL assistant response using the Gemini API.
 * Formats multi-turn chat history and enforces RPL safety guidelines.
 */
export async function generateRplChatResponse(request: ChatRequest): Promise<ChatSuccessResponse> {
  const ai = getGeminiClient();
  const model = getGeminiModel();

  // Convert validated history items to Gemini contents format (limit to last 8 messages)
  const contents: GeminiContentMessage[] = [];
  const MAX_HISTORY_MESSAGES = 8;

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
    parts: [{ text: request.message.trim() }]
  });

  const primaryModel = model;
  const modelsToTry = [primaryModel, 'gemini-3.5-flash', 'gemini-flash-latest'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError: any = null;
  let replyText: string | undefined;

  for (const currentModel of modelsToTry) {
    const maxAttempts = currentModel === primaryModel ? 2 : 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config: {
            systemInstruction: RPL_SYSTEM_INSTRUCTION,
            temperature: 0.65,
            maxOutputTokens: 2048
          }
        });

        replyText = response.text?.trim();
        if (replyText) {
          break;
        }
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const isQuotaExceeded = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
        const isTransient = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand');

        if (isQuotaExceeded) {
          break;
        }

        if (isTransient && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000 + 200));
          continue;
        }

        break;
      }
    }

    if (replyText) {
      return {
        success: true,
        message: replyText
      };
    }
  }

  // Handle final error if all attempts exhausted
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
    error.message = `AI quota limit reached for model '${primaryModel}'. Please retry shortly. (${safeMsg.slice(0, 160)})`;
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

  if (errorStatus === 400 || errorMessage.includes('INVALID_ARGUMENT')) {
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    error.message = `Invalid request parameters for model '${primaryModel}': ${safeMsg.slice(0, 160)}`;
    throw error;
  }

  // Default safe error
  error.status = errorStatus;
  error.code = 'SERVER_ERROR';
  error.message = `AI service error (${errorStatus}) for model '${primaryModel}': ${safeMsg.slice(0, 160)}`;
  throw error;
}


