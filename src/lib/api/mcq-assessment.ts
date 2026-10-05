/**
 * Client API for 10-MCQ Topic-Based RPL Assessments (SIH26242 Phase 4)
 * Bridges frontend UI with server endpoints, handles authentication headers,
 * offline fallback, and background synchronization.
 */

import { getSupabaseClient } from '../supabase.js';
import {
  isOnline,
  createOfflineAttemptLocally,
  saveActiveAttempt,
  getActiveAttempt,
  clearActiveAttempt,
  queueOfflineSubmission,
  getPendingSubmissions,
  type OfflineAttemptData
} from '../assessment/offline-mcq.js';

export interface MCQQuestionClient {
  id: string;
  questionIndex: number;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

export interface MCQQuestionReview extends MCQQuestionClient {
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentAttemptResponse {
  id: string;
  topic: string;
  status: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  systemIndicator: string;
  categoryScores: Record<string, { correct: number; total: number }>;
  aiSummary: string;
  timeSpentSeconds: number;
  timerLimitSeconds?: number;
  startedAt: string;
  submittedAt?: string;
  assessorDecision?: string;
  assessorNotes?: string;
  assessorReviewedAt?: string;
  worker?: {
    id: string;
    name: string;
    email: string;
    trade?: string;
    phone?: string;
  };
}

export interface StartAssessmentResult {
  success: boolean;
  attemptId: string;
  topic: string;
  timerLimitSeconds: number;
  startedAt: string;
  totalQuestions: number;
  source: 'AI_GEMINI' | 'VERIFIED_BANK_FALLBACK' | 'VERIFIED_BANK_OFFLINE';
  questions: MCQQuestionClient[];
  isOffline?: boolean;
}

export interface SubmitAssessmentResult {
  success: boolean;
  message?: string;
  attemptId?: string;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  alreadySubmitted?: boolean;
  attempt: AssessmentAttemptResponse;
  questionReview: MCQQuestionReview[];
  isOfflineQueued?: boolean;
}

/**
 * Gets authentication headers with Supabase bearer token or demo user headers.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // 1. Check local session token
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('skillrpl_auth_token');
    if (localToken) {
      headers['Authorization'] = `Bearer ${localToken}`;
      return headers;
    }
  }

  // 2. Check Supabase token
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
        return headers;
      }
    }
  } catch {
    // Non-blocking
  }

  // 3. If no Bearer token, check for demo user session in localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedDemoUser = localStorage.getItem('skillrpl_demo_user');
      if (savedDemoUser) {
        const parsed = JSON.parse(savedDemoUser);
        if (parsed?.email) {
          headers['x-demo-user'] = parsed.email;
          headers['x-demo-role'] = parsed.role || 'WORKER';
          if (parsed.name) headers['x-demo-name'] = parsed.name;
          if (parsed.trade) headers['x-demo-trade'] = parsed.trade;
        }
      }
    } catch {
      // Non-blocking
    }
  }

  return headers;
}

/**
 * Immediately persists a single answered option and cumulative time spent to the backend database.
 */
export async function saveSingleAnswer(
  attemptId: string,
  questionId: string,
  selectedAnswer: number,
  timeSpentSeconds: number = 0
): Promise<boolean> {
  if (!attemptId || !questionId || selectedAnswer === undefined) return false;
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/assessment/answer', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        attemptId: attemptId.trim(),
        questionId: questionId.trim(),
        selectedAnswer,
        timeSpentSeconds
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('[MCQ API] Server single answer autosave failed:', err);
    return false;
  }
}

/**
 * Fetches the currently active IN_PROGRESS assessment attempt from the database.
 */
export async function getActiveAttemptServer(): Promise<{
  attempt: AssessmentAttemptResponse;
  questions: MCQQuestionClient[];
  answers: Record<string, number>;
  answeredCount: number;
} | null> {
  if (!isOnline()) return null;
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/assessment/attempt?active=true', { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.attempt && data.questions) {
      return {
        attempt: data.attempt,
        questions: data.questions,
        answers: data.answers || {},
        answeredCount: data.answeredCount || 0
      };
    }
    return null;
  } catch (err) {
    console.warn('[MCQ API] Failed to fetch active attempt from server:', err);
    return null;
  }
}


/**
 * Starts a new 10-MCQ assessment for a selected topic.
 * If offline or server is unreachable, smoothly creates an offline attempt using the verified question bank.
 */
export async function startMCQAssessment(
  topic: string,
  options?: { workerProfileId?: string; rplApplicationId?: string }
): Promise<StartAssessmentResult> {
  const sanitizedTopic = topic.trim() || 'Electrician';

  // If network is offline, start offline attempt immediately
  if (!isOnline()) {
    const offlineData = createOfflineAttemptLocally(sanitizedTopic);
    return {
      success: true,
      attemptId: offlineData.attemptId,
      topic: offlineData.topic,
      timerLimitSeconds: offlineData.timerLimitSeconds,
      startedAt: offlineData.startedAt,
      totalQuestions: 10,
      source: 'VERIFIED_BANK_OFFLINE',
      questions: offlineData.questions,
      isOffline: true
    };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/assessment/start', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        topic: sanitizedTopic,
        workerProfileId: options?.workerProfileId,
        rplApplicationId: options?.rplApplicationId
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.questions?.length === 10 && data.attemptId) {
      // Save active attempt for offline resilience during the test
      const offlineAttempt: OfflineAttemptData = {
        attemptId: data.attemptId,
        topic: data.topic,
        questions: data.questions,
        timerLimitSeconds: data.timerLimitSeconds || 600,
        startedAt: data.startedAt,
        answers: {},
        timeSpentSeconds: 0,
        isOffline: false
      };
      saveActiveAttempt(offlineAttempt);

      // Persist attemptId in sessionStorage to survive component remounts & page reloads
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          sessionStorage.setItem('skillrpl_assessment_attempt_id', data.attemptId);
          sessionStorage.setItem('skillrpl_assessment_topic', data.topic);
        } catch (e) {
          console.warn('[MCQ API] Failed to write to sessionStorage:', e);
        }
      }

      return data as StartAssessmentResult;
    }

    throw new Error('Server returned invalid question count');
  } catch (error) {
    console.warn('[MCQ API] Server start failed, falling back to local question bank:', (error as Error).message);
    const offlineData = createOfflineAttemptLocally(sanitizedTopic);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('skillrpl_assessment_attempt_id', offlineData.attemptId);
        sessionStorage.setItem('skillrpl_assessment_topic', offlineData.topic);
      } catch {
        // Non-blocking
      }
    }
    return {
      success: true,
      attemptId: offlineData.attemptId,
      topic: offlineData.topic,
      timerLimitSeconds: offlineData.timerLimitSeconds,
      startedAt: offlineData.startedAt,
      totalQuestions: 10,
      source: 'VERIFIED_BANK_OFFLINE',
      questions: offlineData.questions,
      isOffline: true
    };
  }
}

/**
 * Submits the completed 10-MCQ assessment.
 * The server computes the score, percentage, category breakdowns, and AI performance summary.
 * If offline, queues the submission in localStorage and returns local temporary evaluation.
 */
export async function submitMCQAssessment(
  attemptId: string,
  answers: Record<string, number>,
  timeSpentSeconds: number = 0,
  topic?: string
): Promise<SubmitAssessmentResult> {
  // Resolve stable attemptId from argument, sessionStorage, or active attempt
  let stableAttemptId = (attemptId || '').trim();
  if (!stableAttemptId && typeof window !== 'undefined' && window.sessionStorage) {
    stableAttemptId = (sessionStorage.getItem('skillrpl_assessment_attempt_id') || '').trim();
  }
  if (!stableAttemptId) {
    const active = getActiveAttempt();
    if (active?.attemptId) {
      stableAttemptId = active.attemptId.trim();
    }
  }

  if (!stableAttemptId) {
    throw new Error('Assessment attempt not found. Please start a new assessment.');
  }

  let activeTopic = (topic || '').trim();
  if (!activeTopic && typeof window !== 'undefined' && window.sessionStorage) {
    activeTopic = (sessionStorage.getItem('skillrpl_assessment_topic') || '').trim();
  }
  if (!activeTopic) {
    activeTopic = getActiveAttempt()?.topic || 'Electrician';
  }

  if (!isOnline()) {
    // Queue offline submission
    queueOfflineSubmission({
      attemptId: stableAttemptId,
      topic: activeTopic,
      answers,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      synced: false
    });

    clearActiveAttempt();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem('skillrpl_assessment_attempt_id');
        sessionStorage.removeItem('skillrpl_assessment_topic');
      } catch {
        // Non-blocking
      }
    }

    return {
      success: true,
      message: 'Assessment completed offline. Answers saved locally and will sync when internet reconnects.',
      isOfflineQueued: true,
      attemptId: stableAttemptId,
      score: 0,
      totalQuestions: 10,
      percentage: 0,
      attempt: {
        id: stableAttemptId,
        topic: activeTopic,
        status: 'COMPLETED_OFFLINE',
        score: 0,
        totalQuestions: 10,
        percentage: 0,
        correctCount: 0,
        incorrectCount: 0,
        systemIndicator: 'Pending Sync',
        categoryScores: {},
        aiSummary: 'Answers recorded offline on local device. Scores will be calculated once reconnected.',
        timeSpentSeconds,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      },
      questionReview: []
    };
  }

  const headers = await getAuthHeaders();
  const res = await fetch('/api/assessment/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      attemptId: stableAttemptId,
      answers,
      timeSpentSeconds,
      topic: activeTopic
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 400) {
      throw new Error(err.error || 'Invalid submission. Please check your answers.');
    }
    if (res.status === 401) {
      throw new Error(err.error || 'Please sign in to submit your assessment.');
    }
    if (res.status === 403) {
      throw new Error(err.error || 'You are not authorized to submit this assessment.');
    }
    if (res.status === 404) {
      throw new Error(err.error || 'Assessment attempt not found.');
    }
    if (res.status === 409) {
      throw new Error(err.error || 'This assessment attempt was already submitted.');
    }
    throw new Error(err.error || `Server error (${res.status}) while submitting assessment.`);
  }

  const data = await res.json();
  clearActiveAttempt();
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      sessionStorage.removeItem('skillrpl_assessment_attempt_id');
      sessionStorage.removeItem('skillrpl_assessment_topic');
    } catch {
      // Non-blocking
    }
  }
  return data as SubmitAssessmentResult;
}

/**
 * Fetches full assessment attempt with question review.
 */
export async function getMCQAttempt(attemptId: string): Promise<{
  attempt: AssessmentAttemptResponse;
  questions: MCQQuestionReview[];
}> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/assessment/attempt?id=${encodeURIComponent(attemptId)}`, {
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  return {
    attempt: data.attempt,
    questions: data.questions
  };
}

/**
 * Lists past attempts for a worker profile.
 */
export async function getWorkerMCQAttempts(workerProfileId?: string): Promise<AssessmentAttemptResponse[]> {
  const headers = await getAuthHeaders();
  const url = workerProfileId
    ? `/api/assessment/worker-attempts?workerProfileId=${encodeURIComponent(workerProfileId)}`
    : '/api/assessment/worker-attempts';

  const res = await fetch(url, { headers });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.attempts || [];
}

/**
 * Records an assessor's decision on a candidate's MCQ assessment attempt.
 */
export async function recordAssessorMCQAction(
  attemptId: string,
  decision: 'ACCEPT_FURTHER_ASSESSMENT' | 'REQUEST_REASSESSMENT' | 'MARK_PRACTICAL_VERIFICATION',
  notes?: string
): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/assessor/assessment-attempt/action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      attemptId,
      decision,
      notes
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return true;
}

/**
 * Assessor query to retrieve candidate attempts list.
 */
export async function fetchAssessorMCQAssessments(): Promise<any[]> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/assessor/mcq-assessments', { headers });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.data || [];
}

/**
 * Synchronizes all pending offline attempts when connection is restored.
 */
export async function syncPendingOfflineAttempts(): Promise<number> {
  if (!isOnline()) return 0;
  const pending = getPendingSubmissions();
  if (pending.length === 0) return 0;

  let syncedCount = 0;
  for (const item of pending) {
    try {
      await submitMCQAssessment(item.attemptId, item.answers, item.timeSpentSeconds);
      syncedCount += 1;
    } catch (e) {
      console.warn('[Offline Sync] Failed to sync item:', item.attemptId, e);
    }
  }

  if (syncedCount > 0) {
    // Clear synced items from storage
    try {
      localStorage.removeItem('skillrpl_mcq_pending_sync');
    } catch {
      // non-blocking
    }
  }

  return syncedCount;
}
