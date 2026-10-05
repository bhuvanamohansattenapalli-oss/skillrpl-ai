import {
  saveLocalDraft,
  getLocalDraft,
  isDeviceOnline,
  type LocalRPLDraft
} from '../offline/draft-storage.js';
import type {
  RPLApplicationFormData,
  RPLApplicationStatus,
  RPLApplicationListItem
} from '../../types/index.js';

export interface SaveApplicationPayload {
  id?: string;
  currentStep: number;
  status: RPLApplicationStatus;
  tradeTitle?: string;
  formData: RPLApplicationFormData;
  experiences?: any[];
  skills?: any[];
}

export interface AnalyzeSkillsPayload {
  applicationId: string;
  occupation: string;
  yearsExperience: number;
  experience?: string;
  tasks: string[];
  tools: string[];
  skills: string[];
  additionalExperience?: string;
}

/**
 * Fetches all RPL applications for the logged-in worker.
 * Combines server records with any locally stored unsynced drafts.
 */
export async function fetchWorkerApplications(token?: string): Promise<{
  success: boolean;
  applications: RPLApplicationListItem[];
  isOffline?: boolean;
}> {
  // If device is offline, read from local drafts
  if (!isDeviceOnline() || !token) {
    const localDraft = getLocalDraft();
    const localApps: RPLApplicationListItem[] = [];
    if (localDraft) {
      localApps.push({
        id: localDraft.id,
        applicationNumber: localDraft.applicationNumber || 'DRAFT-LOCAL',
        tradeTitle: localDraft.tradeTitle || localDraft.formData?.trade || 'General Technical Trade',
        status: localDraft.status || 'DRAFT',
        currentStep: localDraft.currentStep || 1,
        progressPercentage: Math.min(65, Math.round(((localDraft.currentStep || 1) / 7) * 100)),
        createdAt: new Date(localDraft.localUpdatedAt).toISOString(),
        updatedAt: new Date(localDraft.localUpdatedAt).toISOString()
      });
    }
    return { success: true, applications: localApps, isOffline: true };
  }

  try {
    const res = await fetch('/api/worker/applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return { success: true, applications: data.applications || [] };
  } catch (err) {
    console.warn('[WorkerAPI] Failed to fetch server applications, checking local cache:', err);
    const localDraft = getLocalDraft();
    const localApps: RPLApplicationListItem[] = [];
    if (localDraft) {
      localApps.push({
        id: localDraft.id,
        applicationNumber: localDraft.applicationNumber || 'DRAFT-LOCAL',
        tradeTitle: localDraft.tradeTitle || localDraft.formData?.trade || 'General Technical Trade',
        status: localDraft.status || 'DRAFT',
        currentStep: localDraft.currentStep || 1,
        progressPercentage: Math.min(65, Math.round(((localDraft.currentStep || 1) / 7) * 100)),
        createdAt: new Date(localDraft.localUpdatedAt).toISOString(),
        updatedAt: new Date(localDraft.localUpdatedAt).toISOString()
      });
    }
    return { success: true, applications: localApps, isOffline: true };
  }
}

/**
 * Fetches a single RPL application by ID.
 * Returns server application, or falls back to local storage if offline.
 */
export async function fetchWorkerApplication(id: string, token?: string): Promise<{
  success: boolean;
  application?: any;
  error?: string;
  isOffline?: boolean;
}> {
  // If offline or no token, attempt local draft
  if (!isDeviceOnline() || !token) {
    const localDraft = getLocalDraft(id);
    if (localDraft) {
      return {
        success: true,
        isOffline: true,
        application: {
          id: localDraft.id,
          applicationNumber: localDraft.applicationNumber || 'DRAFT-LOCAL',
          status: localDraft.status,
          currentStep: localDraft.currentStep,
          tradeTitle: localDraft.tradeTitle,
          formData: localDraft.formData,
          experiences: localDraft.formData.experiences || [],
          skills: localDraft.formData.skills || [],
          aiAnalyses: localDraft.formData.aiAnalysisSnapshot ? [localDraft.formData.aiAnalysisSnapshot] : []
        }
      };
    }
  }

  try {
    const res = await fetch(`/api/worker/application?id=${encodeURIComponent(id)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return { success: true, application: data.application };
  } catch (err: any) {
    // Fallback to local draft
    const localDraft = getLocalDraft(id);
    if (localDraft) {
      return {
        success: true,
        isOffline: true,
        application: {
          id: localDraft.id,
          status: localDraft.status,
          currentStep: localDraft.currentStep,
          tradeTitle: localDraft.tradeTitle,
          formData: localDraft.formData,
          experiences: localDraft.formData.experiences || [],
          skills: localDraft.formData.skills || []
        }
      };
    }
    return { success: false, error: err.message || 'Failed to load application' };
  }
}

/**
 * Saves or updates an application draft.
 * Always saves to LocalStorage first (for offline resilience),
 * and syncs to Supabase server if online.
 */
export async function saveWorkerApplication(
  payload: SaveApplicationPayload,
  token?: string
): Promise<{
  success: boolean;
  application?: any;
  error?: string;
  savedLocallyOnly?: boolean;
}> {
  const currentTimestamp = Date.now();

  // 1. Always save to local storage immediately
  const localDraftPayload: LocalRPLDraft = {
    id: payload.id || 'local-draft',
    tradeTitle: payload.tradeTitle || payload.formData?.trade || 'General Technical Trade',
    currentStep: payload.currentStep,
    status: payload.status,
    formData: payload.formData,
    localUpdatedAt: currentTimestamp,
    isSynced: false
  };
  saveLocalDraft(localDraftPayload);

  // 2. If offline or no token, inform caller that it is safely stored locally
  if (!isDeviceOnline() || !token) {
    return {
      success: true,
      savedLocallyOnly: true,
      application: {
        id: payload.id || 'local-draft',
        status: payload.status,
        currentStep: payload.currentStep,
        tradeTitle: payload.tradeTitle,
        formData: payload.formData,
        experiences: payload.experiences || payload.formData.experiences || [],
        skills: payload.skills || payload.formData.skills || []
      }
    };
  }

  // 3. Sync to Supabase via server API
  try {
    const res = await fetch('/api/worker/application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...payload,
        experiences: payload.experiences || payload.formData?.experiences || [],
        skills: payload.skills || payload.formData?.skills || []
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    const serverApp = data.application;

    // Update local draft with official server ID & timestamp
    saveLocalDraft({
      ...localDraftPayload,
      id: serverApp.id,
      applicationNumber: serverApp.applicationNumber,
      serverUpdatedAt: serverApp.updatedAt,
      isSynced: true
    });

    return { success: true, application: serverApp };
  } catch (err: any) {
    console.warn('[WorkerAPI Save] Network/server error; saved in local offline draft:', err);
    return {
      success: true,
      savedLocallyOnly: true,
      application: {
        id: payload.id || 'local-draft',
        status: payload.status,
        currentStep: payload.currentStep,
        formData: payload.formData
      },
      error: 'Saved locally. Changes will sync when network connects.'
    };
  }
}

/**
 * Submits an application for assessor evaluation.
 */
export async function submitWorkerApplication(id: string, token: string): Promise<{
  success: boolean;
  application?: any;
  error?: string;
}> {
  if (!isDeviceOnline()) {
    return {
      success: false,
      error: 'Submitting an RPL application requires an internet connection.'
    };
  }

  try {
    const res = await fetch('/api/worker/application/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, application: data.application };
  } catch (err: any) {
    return { success: false, error: err.message || 'Submission failed' };
  }
}

/**
 * Triggers AI skill analysis using Gemini 3.6 Flash.
 * Enforces offline protection: Gemini cannot run offline.
 */
export async function analyzeWorkerSkillsWithAI(payload: AnalyzeSkillsPayload, token: string): Promise<{
  success: boolean;
  data?: any;
  recordId?: string;
  error?: string;
}> {
  if (!isDeviceOnline()) {
    return {
      success: false,
      error: 'AI analysis requires an internet connection.'
    };
  }

  try {
    const res = await fetch('/api/worker/application/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `AI Analysis error (${res.status})`);
    }

    const data = await res.json();
    return { success: true, data: data.data, recordId: data.recordId };
  } catch (err: any) {
    return { success: false, error: err.message || 'AI analysis failed' };
  }
}
