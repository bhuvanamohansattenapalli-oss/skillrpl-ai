/**
 * Qualification Mapping API Client
 * Interfaces with server endpoints:
 * - GET /api/qualifications
 * - POST /api/worker/application/map-qualification
 * - GET /api/worker/application/mappings
 * - POST /api/assessor/mapping-review
 * With automatic fallback to offline deterministic mapping when offline.
 */

import {
  type WorkerMappingInput,
  type QualificationMappingResponse
} from '../mapping/qualification-engine.ts';
import {
  runOfflineQualificationMapping,
  saveLocalMappingDraft,
  getLocalMappingDraft
} from '../offline/qualification-storage.ts';

export async function requestQualificationMapping(
  applicationId: string,
  input: WorkerMappingInput,
  token?: string
): Promise<QualificationMappingResponse> {
  // If browser is offline, immediately run offline deterministic mapping
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const offlineResult = runOfflineQualificationMapping(input);
    saveLocalMappingDraft(applicationId, offlineResult);
    return offlineResult;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/worker/application/map-qualification', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        applicationId,
        ...input
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to complete qualification mapping.');
    }

    // Cache latest mapping locally
    saveLocalMappingDraft(applicationId, data);
    return data;
  } catch (err: any) {
    console.warn('[Qualification Mapping Network Notice] Falling back to client-side engine:', err?.message || err);
    // Offline / fallback execution
    const fallbackResult = runOfflineQualificationMapping(input);
    saveLocalMappingDraft(applicationId, fallbackResult);
    return fallbackResult;
  }
}

export async function fetchApplicationMappings(applicationId: string, token?: string) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const local = getLocalMappingDraft(applicationId);
    return { success: true, mappings: local?.candidates || [], offlineMode: true };
  }

  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/worker/application/mappings?applicationId=${encodeURIComponent(applicationId)}`, {
      method: 'GET',
      headers
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    const local = getLocalMappingDraft(applicationId);
    return { success: true, mappings: local?.candidates || [], offlineMode: true };
  }
}

export async function submitAssessorMappingReview(params: {
  applicationId: string;
  mappingId?: string;
  selectedQualificationCode: string;
  decision: 'ACCEPT' | 'REJECT' | 'MODIFY' | 'FLAG';
  assessorNotes?: string;
  rejectionReason?: string;
  token?: string;
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (params.token) headers['Authorization'] = `Bearer ${params.token}`;

  const res = await fetch('/api/assessor/mapping-review', {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  return res.json();
}
