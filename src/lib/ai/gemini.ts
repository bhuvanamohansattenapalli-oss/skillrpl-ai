import { GoogleGenAI } from '@google/genai';

/**
 * Server-only Gemini service configuration and client initialization.
 * Uses official @google/genai SDK.
 *
 * NOTE: This module must only run in Node.js server environments.
 * The GEMINI_API_KEY is never sent to or bundled for the browser.
 */

let geminiClientInstance: GoogleGenAI | null = null;

/**
 * Checks whether the Gemini API key is configured in the server environment.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'YOUR_KEY_HERE');
}

/**
 * Gets the configured Gemini model name from environment variables.
 * Defaults to 'gemini-3.8-flash' if not explicitly configured.
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
}


/**
 * Returns a singleton instance of the GoogleGenAI client.
 * Throws a descriptive error if GEMINI_API_KEY is not configured.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    throw new Error(
      'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in .env.local.'
    );
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }

  return geminiClientInstance;
}
