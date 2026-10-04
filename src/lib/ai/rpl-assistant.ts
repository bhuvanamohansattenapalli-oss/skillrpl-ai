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

  // Convert history items to Gemini contents format
  const contents: GeminiContentMessage[] = [];

  if (request.history && request.history.length > 0) {
    for (const item of request.history) {
      const role: 'user' | 'model' =
        item.role === 'user' ? 'user' : 'model';
      
      contents.push({
        role,
        parts: [{ text: item.content }]
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: request.message }]
  });

  // Attempt generation with retry for transient 503 spikes
  let lastError: any = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: RPL_SYSTEM_INSTRUCTION,
          temperature: 0.65,
          maxOutputTokens: 2048
        }
      });

      const replyText = response.text?.trim();

      if (!replyText) {
        throw new Error('Empty response received from Gemini model.');
      }

      return {
        success: true,
        message: replyText
      };
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);

      // Only retry on transient 503 / high demand / unavailable spikes
      const isTransientSpike =
        errorMessage.includes('503') ||
        errorMessage.includes('UNAVAILABLE') ||
        errorMessage.includes('high demand');

      if (isTransientSpike && attempt < maxAttempts) {
        // Wait briefly before retrying (1.2s on attempt 1, 2s on attempt 2)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000 + 200));
        continue;
      }

      break;
    }
  }

  // Handle final error if all attempts exhausted
  const errorMessage = lastError?.message || String(lastError);

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid api key')) {
      throw new Error('Gemini API key is invalid or not authorized. Please check your GEMINI_API_KEY in .env.local.');
    }

    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
      throw new Error('AI Assistant is currently busy. Please wait a moment and try again.');
    }

    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand')) {
      throw new Error('AI Assistant is currently experiencing high demand. Please try again in a moment.');
    }

    if (errorMessage.includes('is not found') || errorMessage.includes('404')) {
      throw new Error(
        `Configured Gemini model "${model}" is not available for this API key. Please verify GEMINI_MODEL in .env.local.`
      );
    }

    // Default friendly message preventing raw API/stack leaks
    throw new Error('AI Assistant is temporarily unavailable. Please try again.');
}
