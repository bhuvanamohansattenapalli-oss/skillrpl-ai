/**
 * AI Question Generator & Fallback Engine for 10-MCQ Topic-Based RPL Assessments
 * Uses Gemini 3.6 Flash when available with rigorous validation.
 * Seamlessly falls back to Verified Question Bank if Gemini is unavailable,
 * rate-limited (429), or offline.
 */

import { getGeminiClient, getGeminiModel, isGeminiConfigured } from '../ai/gemini';
import { selectQuestionsFromBank, type VerifiedMCQQuestion, findQuestionSetForTopic } from './mcq-question-bank';

export interface AssessmentGenerationResult {
  questions: VerifiedMCQQuestion[];
  source: 'AI_GEMINI' | 'VERIFIED_BANK_FALLBACK' | 'VERIFIED_BANK_OFFLINE';
  topic: string;
  generatedAt: string;
}

/**
 * Validates a single question against strict structural requirements.
 */
function isValidQuestion(q: unknown): q is VerifiedMCQQuestion {
  if (!q || typeof q !== 'object') return false;
  const candidate = q as Record<string, unknown>;

  if (typeof candidate.question !== 'string' || candidate.question.trim().length < 5) return false;
  if (!Array.isArray(candidate.options) || candidate.options.length !== 4) return false;
  if (!candidate.options.every(opt => typeof opt === 'string' && opt.trim().length > 0)) return false;

  const validAnswer = typeof candidate.correctAnswer === 'number' &&
    Number.isInteger(candidate.correctAnswer) &&
    candidate.correctAnswer >= 0 &&
    candidate.correctAnswer <= 3;
  if (!validAnswer) return false;

  if (typeof candidate.category !== 'string' || candidate.category.trim().length === 0) return false;
  return true;
}

/**
 * Generates exactly 10 topic-specific questions.
 * Tries Gemini 3.6 Flash first; safely falls back to verified question bank if any issue occurs.
 */
export async function generate10MCQQuestions(
  topic: string,
  verifiedCompetencies?: string[]
): Promise<AssessmentGenerationResult> {
  const sanitizedTopic = topic.trim() || 'General Technical';

  // 1. If Gemini is not configured, immediately use verified question bank
  if (!isGeminiConfigured()) {
    const bankQuestions = selectQuestionsFromBank(sanitizedTopic, 10, Date.now());
    return {
      questions: bankQuestions,
      source: 'VERIFIED_BANK_OFFLINE',
      topic: sanitizedTopic,
      generatedAt: new Date().toISOString()
    };
  }

  // 2. Attempt Gemini generation with structured JSON schema
  try {
    const aiClient = getGeminiClient();
    const model = getGeminiModel();
    const tradeSet = findQuestionSetForTopic(sanitizedTopic);
    const categoryList = tradeSet.categories.join(', ');

    const prompt = `You are a vocational technical assessment specialist for the National Skills Qualifications Framework (NSQF).
Generate EXACTLY 10 multiple-choice assessment questions for a candidate being assessed in the trade/topic: "${sanitizedTopic}".

Topic Competency Categories to cover: ${categoryList}.
${verifiedCompetencies && verifiedCompetencies.length > 0 ? `Candidate verified competencies: ${verifiedCompetencies.join(', ')}` : ''}

CRITICAL RULES:
1. Return EXACTLY 10 questions. Not 9, not 11.
2. Every question must have exactly 4 plausible options.
3. Exactly ONE option must be correct.
4. "correctAnswer" must be the 0-indexed integer (0, 1, 2, or 3) of the single correct option.
5. Difficulty must be "EASY", "MEDIUM", or "HARD".
6. Questions must be strictly technical, practical, and directly relevant to "${sanitizedTopic}" (safety, tools, wiring/circuits/techniques, testing, fault finding, standards).
7. Do NOT generate generic or trick questions.
8. Include a clear technical explanation for the correct answer.

Respond ONLY with valid JSON conforming to this structure:
{
  "questions": [
    {
      "question": "Clear technical question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "category": "Category Name",
      "difficulty": "MEDIUM",
      "explanation": "Technical justification of why this option is correct."
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text?.trim() || '';
    let parsed: { questions?: unknown[] };

    try {
      parsed = JSON.parse(responseText);
    } catch {
      // In case of markdown formatting wrapping JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemini response could not be parsed as JSON');
      }
    }

    if (Array.isArray(parsed?.questions) && parsed.questions.length === 10) {
      const validated: VerifiedMCQQuestion[] = [];
      let allValid = true;

      for (let i = 0; i < parsed.questions.length; i++) {
        const item = parsed.questions[i];
        if (isValidQuestion(item)) {
          const raw = item as unknown as Record<string, unknown>;
          validated.push({
            id: `ai_${i}_${Date.now()}`,
            question: String(raw.question).trim(),
            options: (raw.options as string[]).map(o => String(o).trim()) as [string, string, string, string],
            correctAnswer: Number(raw.correctAnswer),
            category: String(raw.category || 'General').trim(),
            difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(String(raw.difficulty).toUpperCase())
              ? String(raw.difficulty).toUpperCase()
              : 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
            explanation: String(raw.explanation || '').trim()
          });
        } else {
          allValid = false;
          break;
        }
      }

      if (allValid && validated.length === 10) {
        return {
          questions: validated,
          source: 'AI_GEMINI',
          topic: sanitizedTopic,
          generatedAt: new Date().toISOString()
        };
      }
    }

    console.warn('[AI Question Gen] Gemini returned invalid format or count !== 10. Using verified bank fallback.');
  } catch (error) {
    console.warn('[AI Question Gen] Gemini call failed or quota exceeded:', (error as Error).message);
  }

  // Fallback to verified question bank (guarantees exactly 10 questions)
  const fallbackQuestions = selectQuestionsFromBank(sanitizedTopic, 10, Date.now());
  return {
    questions: fallbackQuestions,
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
