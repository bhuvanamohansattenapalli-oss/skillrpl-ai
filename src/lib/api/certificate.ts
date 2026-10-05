/**
 * Certificate Client API for SkillRPL AI
 * Manages certificate fetching, generation, verification, and print triggers.
 */

import { getSupabaseClient } from '../supabase.js';

export interface CertificateData {
  id: string;
  certificateNumber: string;
  workerProfileId: string;
  assessmentAttemptId?: string | null;
  assessmentId?: string | null;
  workerName: string;
  workerIdentifier?: string | null;
  trade: string;
  assessmentName: string;
  score: number;
  totalScore: number;
  percentage: number;
  nsqfLevel: number;
  qualificationPack?: string | null;
  assessorName?: string | null;
  assessorId?: string | null;
  assessorDesignation?: string | null;
  assessmentCompletedAt: string;
  issuedAt: string;
  status: 'ISSUED' | 'REVOKED';
  isDemo: boolean;
  verificationCode?: string | null;
  metadata?: any;
}

/**
 * Gets authentication headers with Supabase bearer token or demo user headers.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('skillrpl_auth_token');
    if (localToken) {
      headers['Authorization'] = `Bearer ${localToken}`;
      return headers;
    }
  }

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
 * Fetches certificate by attempt ID, certificate ID, or certificate number.
 */
export async function fetchCertificateDetails(params: {
  attemptId?: string;
  certNum?: string;
  id?: string;
}): Promise<CertificateData | null> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.attemptId) queryParams.set('attemptId', params.attemptId);
    if (params.certNum) queryParams.set('certNum', params.certNum);
    if (params.id) queryParams.set('id', params.id);

    const res = await fetch(`/api/certificate?${queryParams.toString()}`, {
      headers
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to load certificate: ${res.statusText}`);
    }

    const json = await res.json();
    return json.certificate || null;
  } catch (err) {
    console.error('[Fetch Certificate Error]', err);
    return null;
  }
}

/**
 * Fetches all certificates issued to the current worker.
 */
export async function fetchWorkerCertificates(workerProfileId?: string): Promise<CertificateData[]> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (workerProfileId) queryParams.set('workerProfileId', workerProfileId);

    const res = await fetch(`/api/certificate/worker?${queryParams.toString()}`, {
      headers
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json.certificates || [];
  } catch (err) {
    console.error('[Fetch Worker Certificates Error]', err);
    return [];
  }
}

/**
 * Generates/Issues a certificate for an approved assessment attempt.
 */
export async function generateCertificate(params: {
  attemptId: string;
  assessorId?: string;
  assessorName?: string;
  notes?: string;
}): Promise<{ success: boolean; certificate?: CertificateData; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/certificate/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to generate certificate.' };
    }

    return { success: true, certificate: json.certificate };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error generating certificate.' };
  }
}
