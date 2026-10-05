/**
 * Practical Assessment Client API
 * Bridges the Assessor UI with server endpoints and handles offline fallback seamlessly.
 */

import {
  isClientOnline,
  getLocalAssessment,
  saveAssessmentLocally,
  recordLocalCriterionScore,
  markAssessmentSynced
} from '../assessment/offline-assessment.js';
import { generateAssessmentPlan } from '../assessment/task-generator.js';
import { performAIAssessmentAssistance } from '../assessment/ai-assessor-copilot.js';

export interface ScoreSubmissionPayload {
  assessmentId: string;
  criterionId: string;
  taskId: string;
  taskTitle: string;
  competencyArea: string;
  criterionKey: string;
  criterionText: string;
  scoreAwarded: number;
  rubricLevel: string;
  observation?: string;
  isMandatory?: boolean;
}

export interface FinalizeAssessmentPayload {
  assessmentId: string;
  finalDecision: 'COMPETENT' | 'NOT_YET_COMPETENT' | 'REASSESSMENT_REQUIRED';
  assessorConfirmed: boolean;
  decisionReason?: string;
  assessorNotes?: string;
  assessorSignature?: string;
}

/**
 * Fetches assessment details with offline fallback
 */
export async function getAssessmentSession(assessmentId: string): Promise<any> {
  // If offline, check local cache first
  if (!isClientOnline()) {
    const local = getLocalAssessment(assessmentId);
    if (local) {
      return { success: true, data: local, source: 'LOCAL_OFFLINE' };
    }
  }

  try {
    const res = await fetch(`/api/assessor/assessment?id=${encodeURIComponent(assessmentId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Cache locally for offline availability
        saveAssessmentLocally({
          assessmentId: json.data.id,
          sessionNumber: json.data.sessionNumber || `SES-${json.data.id.slice(0, 8)}`,
          applicationId: json.data.rplApplicationId,
          candidateName: json.data.rplApplication?.workerProfile?.name || 'Candidate',
          tradeTitle: json.data.rplApplication?.tradeTitle || 'Technical Trade',
          qpCode: json.data.qualificationPack?.qpCode || json.data.qualificationPack?.code || 'CON/Q0603',
          nsqfLevel: json.data.qualificationPack?.nsqfLevel || 4,
          status: json.data.status,
          taskPlan: json.data.tasksSnapshot || generateAssessmentPlan(json.data.qualificationPack?.qpCode || 'CON/Q0603', { assessmentId }),
          scores: (json.data.scores || []).reduce((acc: any, s: any) => {
            acc[s.criterionId || s.criterionKey || s.id] = {
              criterionId: s.criterionId || s.criterionKey || s.id,
              taskId: s.taskId,
              criterionKey: s.criterionKey,
              scoreAwarded: s.scoreAwarded,
              rubricLevel: s.rubricLevel,
              observation: s.observation,
              isMandatory: s.isMandatory,
              evaluatedAt: s.evaluatedAt || s.createdAt
            };
            return acc;
          }, {}),
          evidenceReviewed: json.data.evidenceReviewed || {},
          assessorNotes: json.data.notes || '',
          localDraftVersion: json.data.localDraftVersion || 1,
          lastModifiedAt: new Date().toISOString(),
          isSynced: true,
          finalDecision: json.data.finalDecision,
          decisionReason: json.data.decisionReason,
          assessorConfirmed: json.data.assessorConfirmed
        });
        return { ...json, source: 'SERVER' };
      }
    }
  } catch (err) {
    console.warn('[Get Assessment Session] Network call failed, checking local cache:', err);
  }

  // Fallback to local
  const local = getLocalAssessment(assessmentId);
  if (local) {
    return { success: true, data: local, source: 'LOCAL_OFFLINE' };
  }

  throw new Error('Assessment session not found on server or local storage.');
}

/**
 * Submits a single criterion score with immediate local save and server sync
 */
export async function submitCriterionScore(payload: ScoreSubmissionPayload): Promise<any> {
  // Always update local cache immediately so assessor never loses state
  const localUpdate = recordLocalCriterionScore(payload.assessmentId, {
    criterionId: payload.criterionId,
    taskId: payload.taskId,
    criterionKey: payload.criterionKey,
    scoreAwarded: payload.scoreAwarded,
    rubricLevel: payload.rubricLevel,
    observation: payload.observation,
    isMandatory: payload.isMandatory ?? true,
    evaluatedAt: new Date().toISOString()
  });

  if (!isClientOnline()) {
    return {
      success: true,
      mode: 'OFFLINE_SAVED',
      message: 'Score recorded locally. Will sync when connectivity is restored.',
      metrics: localUpdate?.metrics
    };
  }

  try {
    const res = await fetch('/api/assessor/assessment/score-criterion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      markAssessmentSynced(payload.assessmentId);
      return { ...json, mode: 'ONLINE_SYNCED' };
    }
  } catch (err) {
    console.warn('[Submit Criterion Score] Server sync failed; saved locally:', err);
  }

  return {
    success: true,
    mode: 'OFFLINE_SAVED',
    message: 'Saved in offline cache.',
    metrics: localUpdate?.metrics
  };
}

/**
 * Runs AI Assessment Assistance (Gemini 3.6 Flash) with client offline guard
 */
export async function runAIAssessorAssistance(params: {
  assessmentId: string;
  workerName: string;
  qualificationTitle: string;
  qpCode: string;
  nsqfLevel: number;
  evaluations: any[];
  totalExpectedCriteria: number;
  candidateEvidence?: any[];
}): Promise<any> {
  if (!isClientOnline()) {
    // Strictly run offline rule-engine
    return performAIAssessmentAssistance({
      ...params,
      forceOffline: true
    });
  }

  try {
    const res = await fetch('/api/assessor/assessment/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[AI Assessor API] Server request failed, falling back locally:', err);
  }

  // Graceful fallback
  return performAIAssessmentAssistance({
    ...params,
    forceOffline: true
  });
}

/**
 * Finalizes assessment decision by accredited human assessor
 */
export async function finalizeAssessment(payload: FinalizeAssessmentPayload): Promise<any> {
  if (!payload.assessorConfirmed) {
    throw new Error('Assessor confirmation checkbox is mandatory before finalization.');
  }

  try {
    const res = await fetch('/api/assessor/assessment/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      markAssessmentSynced(payload.assessmentId);
      return json;
    }

    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to finalize assessment.');
  } catch (err: any) {
    // If offline, record pending finalization locally
    if (!isClientOnline()) {
      const session = getLocalAssessment(payload.assessmentId);
      if (session) {
        session.status = 'FINALIZED';
        session.finalDecision = payload.finalDecision;
        session.decisionReason = payload.decisionReason;
        session.assessorConfirmed = true;
        session.assessorNotes = payload.assessorNotes || session.assessorNotes;
        session.localDraftVersion += 1;
        session.isSynced = false;
        saveAssessmentLocally(session);
        return {
          success: true,
          mode: 'OFFLINE_FINALIZED',
          message: 'Final decision recorded locally. Will sync to Supabase when connected.'
        };
      }
    }
    throw err;
  }
}

/**
 * Fetches real database analytics for Assessor Analytics Dashboard
 */
export async function fetchAssessorAnalytics(): Promise<any> {
  const res = await fetch('/api/assessor/analytics');
  if (res.ok) {
    return await res.json();
  }
  throw new Error('Failed to fetch assessor analytics.');
}
