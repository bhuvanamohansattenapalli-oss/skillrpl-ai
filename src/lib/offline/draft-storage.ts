import { useEffect, useState } from 'react';
import type { RPLApplicationFormData, RPLApplicationStatus } from '../../types';

export interface LocalRPLDraft {
  id: string; // application id or 'local-draft'
  applicationNumber?: string;
  tradeTitle: string;
  currentStep: number;
  status: RPLApplicationStatus;
  formData: RPLApplicationFormData;
  localUpdatedAt: number; // Unix timestamp in ms
  serverUpdatedAt?: string;
  isSynced: boolean;
}

const STORAGE_KEY_PREFIX = 'skillrpl_rpl_draft_';
const LATEST_DRAFT_KEY = 'skillrpl_latest_draft_id';

/**
 * Checks if the current browser environment is online.
 */
export function isDeviceOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * React hook to listen to browser online/offline network status changes.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

/**
 * Saves an RPL Application draft to local storage.
 */
export function saveLocalDraft(draft: LocalRPLDraft): void {
  try {
    const draftId = draft.id || 'local-draft';
    const payload: LocalRPLDraft = {
      ...draft,
      id: draftId,
      localUpdatedAt: Date.now()
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftId}`, JSON.stringify(payload));
    localStorage.setItem(LATEST_DRAFT_KEY, draftId);
  } catch (err) {
    console.warn('[OfflineStorage] Failed to save draft locally:', err);
  }
}

/**
 * Retrieves a local RPL Application draft by ID.
 */
export function getLocalDraft(draftId?: string): LocalRPLDraft | null {
  try {
    const targetId = draftId || localStorage.getItem(LATEST_DRAFT_KEY) || 'local-draft';
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${targetId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocalRPLDraft;
  } catch (err) {
    console.warn('[OfflineStorage] Failed to read draft locally:', err);
    return null;
  }
}

/**
 * Lists all local RPL drafts saved in browser storage.
 */
export function listLocalDrafts(): LocalRPLDraft[] {
  try {
    const drafts: LocalRPLDraft[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            drafts.push(JSON.parse(raw));
          } catch {
            // ignore malformed keys
          }
        }
      }
    }
    return drafts.sort((a, b) => b.localUpdatedAt - a.localUpdatedAt);
  } catch (err) {
    console.warn('[OfflineStorage] Failed to list drafts:', err);
    return [];
  }
}

/**
 * Clears a specific local RPL draft from browser storage.
 */
export function clearLocalDraft(draftId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${draftId}`);
    if (localStorage.getItem(LATEST_DRAFT_KEY) === draftId) {
      localStorage.removeItem(LATEST_DRAFT_KEY);
    }
  } catch (err) {
    console.warn('[OfflineStorage] Failed to clear draft locally:', err);
  }
}

/**
 * Safe sync check to prevent overwriting newer server data.
 * Returns true if local copy is newer than server version.
 */
export function shouldSyncLocalToServer(localUpdatedAt: number, serverUpdatedAt?: string): boolean {
  if (!serverUpdatedAt) return true;
  const serverTime = new Date(serverUpdatedAt).getTime();
  return localUpdatedAt > serverTime;
}
