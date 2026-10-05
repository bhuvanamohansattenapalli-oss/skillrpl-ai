/**
 * AI Question Generator & Fallback Engine for 10-MCQ Topic-Based RPL Assessments
 * Uses Gemini 3.6 Flash when available with rigorous validation.
 * Seamlessly falls back to Verified Question Bank if Gemini is unavailable,
 * rate-limited (429), or offline.
 */

import { getGeminiClient, getGeminiModel, isGeminiConfigured } from '../ai/gemini.js';
import { selectQuestionsFromBank, type VerifiedMCQQuestion } from './mcq-question-bank.js';

export interface AssessmentGenerationResult {
  questions: VerifiedMCQQuestion[];
  source: 'AI_GEMINI' | 'VERIFIED_BANK_FALLBACK' | 'VERIFIED_BANK_OFFLINE';
  topic: string;
  generatedAt: string;
}

/**
 * Generates exactly 10 topic-specific questions from the verified question bank.
 * Completely independent of Gemini API quotas and network latency.
 * Questions are dynamically shuffled and varied per attempt.
 */
export async function generate10MCQQuestions(
  topic: string,
  _verifiedCompetencies?: string[]
): Promise<AssessmentGenerationResult> {
  const sanitizedTopic = topic.trim() || 'Electrician';

  // Always use authoritative verified question bank directly
  const bankQuestions = selectQuestionsFromBank(sanitizedTopic, 10, Date.now());

  return {
    questions: bankQuestions,
    source: 'VERIFIED_BANK_FALLBACK',
    topic: sanitizedTopic,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates an AI-assisted performance summary after assessment submission.
 * Highlights demonstrated strengths and areas requiring further practical training.
 * Strictly adheres to non-certification disclaimer.
 */
export async function generateAIPerformanceSummary(params: {
  topic: string;
  score: number;
  total: number;
  percentage: number;
  categoryScores: Record<string, { correct: number; total: number }>;
  timeSpentSeconds?: number;
}): Promise<string> {
  const { topic, score, total, percentage, categoryScores } = params;

  const strongCategories: string[] = [];
  const weakCategories: string[] = [];

  for (const [cat, data] of Object.entries(categoryScores)) {
    const catPct = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    if (catPct >= 70) {
      strongCategories.push(cat);
    } else {
      weakCategories.push(cat);
    }
  }

  // If Gemini is available, generate contextual summary
  if (isGeminiConfigured()) {
    try {
      const aiClient = getGeminiClient();
      const model = getGeminiModel();

      const prompt = `You are an AI vocational assessment assistant.
Candidate took a 10-question MCQ screening assessment for topic: "${topic}".
Result:
- Score: ${score}/${total} (${percentage}%)
- Strong categories: ${strongCategories.length > 0 ? strongCategories.join(', ') : 'None'}
- Categories needing improvement: ${weakCategories.length > 0 ? weakCategories.join(', ') : 'None'}
- Detailed breakdown: ${JSON.stringify(categoryScores)}

Write a professional, concise 2-sentence performance summary for the human assessor.
CRITICAL MANDATES:
1. Do NOT certify or claim official certification.
2. Label or treat this purely as an AI-Assisted Performance Summary.
3. State areas of demonstrated knowledge and specific competency gaps where practical demonstration is recommended.
4. Keep under 60 words.`;

      const res = await aiClient.models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0.3 }
      });

      const summaryText = res.text?.trim();
      if (summaryText && summaryText.length > 20) {
        return summaryText;
      }
    } catch (e) {
      console.warn('[AI Performance Summary] Gemini unavailable, using rule-based summary:', (e as Error).message);
    }
  }

  // Deterministic rule-based summary fallback
  let summary = '';
  if (percentage >= 70) {
    summary = `Candidate demonstrated solid theoretical comprehension in ${topic}`;
    if (strongCategories.length > 0) {
      summary += `, particularly across ${strongCategories.slice(0, 2).join(' and ')}`;
    }
    if (weakCategories.length > 0) {
      summary += `. Further practical verification recommended in ${weakCategories.join(', ')}.`;
    } else {
      summary += `. Recommended for hands-on practical task verification by assessor.`;
    }
  } else if (percentage >= 50) {
    summary = `Candidate showed foundational knowledge in ${topic}`;
    if (strongCategories.length > 0) {
      summary += `, with acceptable results in ${strongCategories[0]}`;
    }
    if (weakCategories.length > 0) {
      summary += `, but demonstrated knowledge gaps in ${weakCategories.join(', ')}. Targeted skill enhancement and practical review advised.`;
    } else {
      summary += `. Practical skill demonstration recommended.`;
    }
  } else {
    summary = `Candidate scored ${score}/${total} (${percentage}%) indicating significant knowledge gaps in ${topic}`;
    if (weakCategories.length > 0) {
      summary += `, especially in ${weakCategories.join(' and ')}`;
    }
    summary += `. Refresher vocational training and structured reassessment recommended before practical evaluation.`;
  }

  return summary;
}
