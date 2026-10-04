import { getGeminiClient, getGeminiModel } from './gemini.ts';
import { RPL_SYSTEM_INSTRUCTION } from './prompts.ts';
import type { ChatRequest, ChatSuccessResponse } from './types.ts';

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

  const error = new Error() as Error & { status?: number; code?: string };
  error.status = errorStatus;

  if (errorStatus === 429 || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota') || errorMessage.includes('429')) {
    error.status = 429;
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.message = 'AI request limit reached. Please wait a moment and try again.';
    throw error;
  }

  if (errorStatus === 401 || errorStatus === 403 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('UNAUTHENTICATED') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('invalid api key')) {
    error.status = errorStatus === 403 ? 403 : 401;
    error.code = 'AUTHENTICATION_FAILED';
    error.message = 'AI service authentication failed. Please check the server configuration.';
    throw error;
  }

  if (errorStatus === 404 || errorMessage.includes('is not found') || errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
    error.status = 404;
    error.code = 'MODEL_UNAVAILABLE';
    error.message = 'Configured AI model is currently unavailable.';
    throw error;
  }

  if (errorStatus === 503 || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
    error.status = 503;
    error.code = 'SERVICE_UNAVAILABLE';
    error.message = 'AI Assistant is temporarily unavailable. Please try again.';
    throw error;
  }

  if (errorStatus === 400 || errorMessage.includes('INVALID_ARGUMENT')) {
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    error.message = 'Invalid request parameters. Please try again.';
    throw error;
  }

  // Default safe error
  error.status = errorStatus;
  error.code = 'SERVER_ERROR';
  error.message = 'AI Assistant is temporarily unavailable. Please try again.';
  throw error;
}


