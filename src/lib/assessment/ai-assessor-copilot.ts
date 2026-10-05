/**
 * AI Assessment Co-Pilot (Gemini 3.6 Flash Integration)
 *
 * Provides real-time assistive intelligence to the accredited human assessor:
 * 1. Summarizes assessor observation notes across evaluated tasks.
 * 2. Identifies missing observations (particularly mandatory notes for low scores 0 & 1).
 * 3. Verifies that all required criteria and competency areas were evaluated.
 * 4. Highlights inconsistent scoring patterns.
 * 5. Suggests relevant candidate evidence to review.
 * 6. Generates a structured assessment summary.
 *
 * CRITICAL SAFETY RULES:
 * - AI NEVER issues certification, passes, or fails a candidate.
 * - AI NEVER overrides or modifies assessor scores.
 * - Final decision strictly belongs to the human assessor.
 */

import { GoogleGenAI } from '@google/genai';
import { isGeminiConfigured, getGeminiModel } from '../ai/gemini.js';

export interface AssessorTaskEvaluation {
  taskId: string;
  taskTitle: string;
  competencyArea: string;
  criterionKey: string;
  criterionLabel: string;
  scoreAwarded: number;
  rubricLabel: string;
  observation?: string;
  isMandatory: boolean;
}

export interface CandidateEvidenceItem {
  id: string;
  title: string;
  type: string;
  isVerifiedByAssessor: boolean;
  description?: string;
}

export interface AIAssessmentAssistanceInput {
  workerName: string;
  qualificationTitle: string;
  qpCode: string;
  nsqfLevel: number;
  evaluations: AssessorTaskEvaluation[];
  totalExpectedCriteria: number;
  candidateEvidence?: CandidateEvidenceItem[];
  forceOffline?: boolean;
}

export interface InconsistencyFlag {
  taskId: string;
  severity: 'WARNING' | 'NOTICE';
  issue: string;
  recommendation: string;
}

export interface AIAssessmentAssistanceResult {
  success: boolean;
  model: string;
  timestamp: string;
  disclaimer: string;
  systemReferenceScore: number; // 0 to 100
  systemReferenceThreshold: number; // 70%
  systemReferenceOutcome: 'COMPETENT' | 'NOT_YET_COMPETENT';
  notesSummary: string;
  missingObservations: string[];
  unaddressedCriteriaCount: number;
  inconsistencies: InconsistencyFlag[];
  suggestedEvidenceToReview: Array<{
    evidenceId: string;
    title: string;
    reason: string;
  }>;
  executiveSummary: string;
  isOfflineFallback: boolean;
}

const SAFETY_DISCLAIMER =
  'AI-Assisted Review — Human Assessor Decision Required. This analysis is an automated diagnostic aid to support human assessment and does NOT constitute an official certification or pass/fail decision.';

/**
 * Deterministic rule-based evaluation validator (Runs locally / fallback)
 */
function runDeterministicAssessorAudit(
  input: AIAssessmentAssistanceInput
): Omit<AIAssessmentAssistanceResult, 'notesSummary' | 'executiveSummary'> {
  const { evaluations, totalExpectedCriteria, candidateEvidence = [] } = input;

  const missingObservations: string[] = [];
  const inconsistencies: InconsistencyFlag[] = [];

  let totalScore = 0;
  evaluations.forEach((ev) => {
    totalScore += ev.scoreAwarded;

    // Check mandatory observations for scores 0 and 1
    if ((ev.scoreAwarded === 0 || ev.scoreAwarded === 1) && (!ev.observation || ev.observation.trim().length < 8)) {
      missingObservations.push(
        `Task "${ev.taskTitle}" (${ev.criterionLabel}): Scored ${ev.scoreAwarded} (${ev.rubricLabel}) requires an explanatory observation note.`
      );
    }
  });

  const assessedCount = evaluations.length;
  const unaddressedCriteriaCount = Math.max(0, totalExpectedCriteria - assessedCount);
  const avgScore = assessedCount > 0 ? totalScore / assessedCount : 0;
  const systemReferenceScore = Math.round((avgScore / 4) * 100);

  // Group by task to detect inconsistent scores within same task
  const taskMap = new Map<string, AssessorTaskEvaluation[]>();
  evaluations.forEach((ev) => {
    if (!taskMap.has(ev.taskId)) taskMap.set(ev.taskId, []);
    taskMap.get(ev.taskId)!.push(ev);
  });

  taskMap.forEach((taskEvals, taskId) => {
    const safetyCrit = taskEvals.find((e) => e.criterionKey === 'safety_isolation');
    const techCrit = taskEvals.find((e) => e.criterionKey === 'technical_execution');
    const toolsCrit = taskEvals.find((e) => e.criterionKey === 'tools_ppe');

    // Pattern 1: High technical score with failing safety isolation
    if (techCrit && safetyCrit && techCrit.scoreAwarded >= 3 && safetyCrit.scoreAwarded <= 1) {
      inconsistencies.push({
        taskId,
        severity: 'WARNING',
        issue: `Discrepancy in "${techCrit.taskTitle}": Technical execution scored high (${techCrit.scoreAwarded}) while safety isolation scored low (${safetyCrit.scoreAwarded}).`,
        recommendation: 'Verify whether task was completed under live voltage or if safety protocols were omitted before awarding full execution competency.'
      });
    }

    // Pattern 2: High tool competency with failing tool selection
    if (toolsCrit && techCrit && toolsCrit.scoreAwarded <= 1 && techCrit.scoreAwarded >= 3) {
      inconsistencies.push({
        taskId,
        severity: 'NOTICE',
        issue: `In "${toolsCrit.taskTitle}": Tool selection/PPE scored ${toolsCrit.scoreAwarded} but technical execution scored ${techCrit.scoreAwarded}.`,
        recommendation: 'Check if candidate improvised with incorrect tools or required assistance selecting rated instruments.'
      });
    }
  });

  // Suggest unverified portfolio evidence
  const unverified = candidateEvidence.filter((e) => !e.isVerifiedByAssessor);
  const suggestedEvidenceToReview = unverified.slice(0, 3).map((e) => ({
    evidenceId: e.id,
    title: e.title,
    reason: `Candidate provided ${e.type} evidence that has not yet been marked as reviewed by the assessor.`
  }));

  const systemReferenceOutcome =
    systemReferenceScore >= 70 && unaddressedCriteriaCount === 0 && missingObservations.length === 0
      ? 'COMPETENT'
      : 'NOT_YET_COMPETENT';

  return {
    success: true,
    model: 'deterministic-rule-engine',
    timestamp: new Date().toISOString(),
    disclaimer: SAFETY_DISCLAIMER,
    systemReferenceScore,
    systemReferenceThreshold: 70,
    systemReferenceOutcome,
    missingObservations,
    unaddressedCriteriaCount,
    inconsistencies,
    suggestedEvidenceToReview,
    isOfflineFallback: true
  };
}

/**
 * Runs AI Assessment Assistance (Gemini 3.6 Flash) with deterministic fallback
 */
export async function performAIAssessmentAssistance(
  input: AIAssessmentAssistanceInput
): Promise<AIAssessmentAssistanceResult> {
  const deterministicAudit = runDeterministicAssessorAudit(input);

  // If forceOffline or Gemini not configured, return clean rule-based audit immediately
  if (input.forceOffline || !isGeminiConfigured()) {
    const observations = input.evaluations
      .filter((e) => e.observation && e.observation.trim().length > 0)
      .map((e) => `• [${e.taskTitle}] ${e.observation}`)
      .join('\n');

    return {
      ...deterministicAudit,
      notesSummary:
        observations.length > 0
          ? `Assessor Observations Recorded:\n${observations}`
          : 'No specific written observation notes recorded yet.',
      executiveSummary: `Evaluation in progress for candidate ${input.workerName} (${input.qualificationTitle}). Evaluated ${input.evaluations.length} of ${input.totalExpectedCriteria} criteria. Current calculated score is ${deterministicAudit.systemReferenceScore}%. Final competency decision remains with the accredited assessor.`
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    const notesRecorded = input.evaluations
      .filter((e) => e.observation && e.observation.trim().length > 0)
      .map((e) => `- Task: ${e.taskTitle} | Criterion: ${e.criterionLabel} | Score: ${e.scoreAwarded} (${e.rubricLabel}) | Observation: "${e.observation}"`)
      .join('\n');

    const prompt = `You are an expert AI Assessment Assistant for the National Skills Qualification Framework (NSQF) RPL assessment system.
Your role is to assist the accredited human assessor by synthesizing their observation notes, identifying potential gaps, checking evidence, and detecting scoring anomalies.

CRITICAL INSTRUCTIONS:
- You DO NOT certify, pass, or fail the candidate.
- You DO NOT override or change assessor scores.
- You provide professional, objective observations to assist the human assessor.

Candidate: ${input.workerName}
Target Qualification: ${input.qualificationTitle} (${input.qpCode}, NSQF Level ${input.nsqfLevel})
Total Criteria Required: ${input.totalExpectedCriteria}
Criteria Evaluated So Far: ${input.evaluations.length}
Calculated Reference Score: ${deterministicAudit.systemReferenceScore}%

Assessor Observations Recorded:
${notesRecorded || 'None recorded'}

Rule Engine Audit Findings:
- Missing observation notes: ${deterministicAudit.missingObservations.length}
- Unaddressed criteria: ${deterministicAudit.unaddressedCriteriaCount}
- Potential scoring inconsistencies: ${deterministicAudit.inconsistencies.length}

Respond strictly in valid JSON matching this schema:
{
  "notesSummary": "Professional 2-3 sentence synthesis of the assessor's notes highlighting candidate performance patterns.",
  "additionalInconsistencyObservations": ["Any subtle inconsistency or observation missed by rule engine, or empty array"],
  "evidenceRecommendations": ["Specific recommendation on what candidate evidence should be verified"],
  "executiveSummary": "Concise summary for the assessor's pre-finalization review. Must remind assessor that final decision is their sole professional responsibility."
}`;

    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return {
      success: true,
      model: getGeminiModel(),
      timestamp: new Date().toISOString(),
      disclaimer: SAFETY_DISCLAIMER,
      systemReferenceScore: deterministicAudit.systemReferenceScore,
      systemReferenceThreshold: deterministicAudit.systemReferenceThreshold,
      systemReferenceOutcome: deterministicAudit.systemReferenceOutcome,
      notesSummary: parsed.notesSummary || 'Observation notes summarized by AI Assistant.',
      missingObservations: deterministicAudit.missingObservations,
      unaddressedCriteriaCount: deterministicAudit.unaddressedCriteriaCount,
      inconsistencies: deterministicAudit.inconsistencies,
      suggestedEvidenceToReview: deterministicAudit.suggestedEvidenceToReview,
      executiveSummary: parsed.executiveSummary || 'Executive assessment summary generated for assessor review.',
      isOfflineFallback: false
    };
  } catch (err: any) {
    console.warn('[AI Assessor Co-Pilot] Graceful fallback to deterministic audit:', err.message || err);
    const observations = input.evaluations
      .filter((e) => e.observation && e.observation.trim().length > 0)
      .map((e) => `• [${e.taskTitle}] ${e.observation}`)
      .join('\n');

    return {
      ...deterministicAudit,
      notesSummary:
        observations.length > 0
          ? `Assessor Observations Recorded:\n${observations}`
          : 'No specific written observation notes recorded yet.',
      executiveSummary: `Evaluation summary for ${input.workerName} (${input.qualificationTitle}). Evaluated ${input.evaluations.length} of ${input.totalExpectedCriteria} criteria. Current calculated score is ${deterministicAudit.systemReferenceScore}%. Final competency decision remains exclusively with the accredited assessor.`
    };
  }
}
