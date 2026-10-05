/**
 * Offline Storage & Synchronization Helper for 10-MCQ Topic-Based RPL Assessments (SIH26242 Phase 4)
 * Allows workers to take tests completely offline, autosaves answers to localStorage,
 * and seamlessly synchronizes completed attempts when internet connectivity returns.
 */

import { selectQuestionsFromBank, type VerifiedMCQQuestion } from './mcq-question-bank';

export interface OfflineAttemptData {
  attemptId: string;
  topic: string;
  questions: Array<{
    id: string;
    questionIndex: number;
    question: string;
    options: string[];
    category: string;
    difficulty: string;
  }>;
  timerLimitSeconds: number;
  startedAt: string;
  answers: Record<string, number>;
  timeSpentSeconds: number;
  isOffline: boolean;
}

export interface QueuedOfflineSubmission {
  attemptId: string;
  topic: string;
  answers: Record<string, number>;
  timeSpentSeconds: number;
  completedAt: string;
  synced: boolean;
}

const STORAGE_KEYS = {
  ACTIVE_ATTEMPT: 'skillrpl_mcq_active_attempt',
  ANSWERS_PREFIX: 'skillrpl_mcq_answers_',
  PENDING_SUBMISSIONS: 'skillrpl_mcq_pending_sync',
  CACHED_PACKS_PREFIX: 'skillrpl_mcq_cached_pack_'
};

const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) || null;
    }
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  memoryStore.set(key, value);
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn('[Offline MCQ] LocalStorage write failed:', err);
    }
  }
}

function removeStorageItem(key: string): void {
  memoryStore.delete(key);
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Checks if the browser is currently online.
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return window.navigator.onLine;
}

/**
 * Saves current active assessment attempt state to localStorage or memory fallback.
 */
export function saveActiveAttempt(attempt: OfflineAttemptData): void {
  try {
    setStorageItem(STORAGE_KEYS.ACTIVE_ATTEMPT, JSON.stringify(attempt));
  } catch (err) {
    console.warn('[Offline MCQ] Failed to save active attempt:', err);
  }
}

/**
 * Retrieves the current active attempt from localStorage or memory fallback.
 */
export function getActiveAttempt(): OfflineAttemptData | null {
  try {
    const raw = getStorageItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears the active attempt state after final submission.
 */
export function clearActiveAttempt(): void {
  try {
    removeStorageItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
  } catch (err) {
    console.warn('[Offline MCQ] Failed to clear active attempt:', err);
  }
}

/**
 * Autosaves selected answers for an attempt to localStorage or memory fallback.
 */
export function autosaveAnswers(attemptId: string, answers: Record<string, number>, timeSpentSeconds: number): void {
  try {
    setStorageItem(
      `${STORAGE_KEYS.ANSWERS_PREFIX}${attemptId}`,
      JSON.stringify({ answers, timeSpentSeconds, updatedAt: new Date().toISOString() })
    );

    // Also update active attempt if matching
    const active = getActiveAttempt();
    if (active && active.attemptId === attemptId) {
      active.answers = answers;
      active.timeSpentSeconds = timeSpentSeconds;
      saveActiveAttempt(active);
    }
  } catch (err) {
    console.warn('[Offline MCQ] Autosave error:', err);
  }
}

/**
 * Loads autosaved answers for an attempt.
 */
export function loadAutosavedAnswers(attemptId: string): { answers: Record<string, number>; timeSpentSeconds: number } | null {
  try {
    const raw = getStorageItem(`${STORAGE_KEYS.ANSWERS_PREFIX}${attemptId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Queues a completed offline submission for sync when back online.
 */
export function queueOfflineSubmission(submission: QueuedOfflineSubmission): void {
  try {
    const existing: QueuedOfflineSubmission[] = JSON.parse(
      getStorageItem(STORAGE_KEYS.PENDING_SUBMISSIONS) || '[]'
    );
    existing.push(submission);
    setStorageItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(existing));
  } catch (err) {
    console.warn('[Offline MCQ] Failed to queue submission:', err);
  }
}

/**
 * Retrieves all pending offline submissions.
 */
export function getPendingSubmissions(): QueuedOfflineSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS) || '[]');
  } catch {
    return [];
  }
}

/**
 * Pre-caches verified question pack in localStorage for a topic.
 */
export function cacheTopicQuestionPack(topic: string, questions: VerifiedMCQQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = questions.map((q, idx) => ({
      id: `local_${idx}_${Date.now()}`,
      questionIndex: idx,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty
    }));
    localStorage.setItem(
      `${STORAGE_KEYS.CACHED_PACKS_PREFIX}${topic.toLowerCase()}`,
      JSON.stringify({ questions: sanitized, cachedAt: new Date().toISOString() })
    );
  } catch (err) {
    console.warn('[Offline MCQ] Failed to cache topic question pack:', err);
  }
}

/**
 * Creates an offline assessment attempt directly on client when network is completely down.
 */
export function createOfflineAttemptLocally(topic: string): OfflineAttemptData {
  // Use verified bank generator directly on client
  const bankQuestions = selectQuestionsFromBank(topic, 10, Date.now());
  const sanitizedQuestions = bankQuestions.map((q, idx) => ({
    id: `offline_q_${idx}_${Date.now()}`,
    questionIndex: idx,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty
  }));

  const attemptId = `offline_att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const attemptData: OfflineAttemptData = {
    attemptId,
    topic,
    questions: sanitizedQuestions,
    timerLimitSeconds: 600,
    startedAt: new Date().toISOString(),
    answers: {},
    timeSpentSeconds: 0,
    isOffline: true
  };

  saveActiveAttempt(attemptData);
  return attemptData;
}
