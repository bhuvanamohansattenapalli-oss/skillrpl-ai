/**
 * Offline Qualification Storage & Client-Side Mapping
 * Enables qualification search, browsing, and deterministic matching without internet connectivity.
 */
import {
  VERIFIED_QUALIFICATIONS,
  type VerifiedQualification
} from '../../data/qualification-catalog';
import {
  performDeterministicMatch,
  type WorkerMappingInput,
  type CandidateMatchResult,
  type QualificationMappingResponse
} from '../mapping/qualification-engine';

const QUALIFICATION_CACHE_KEY = 'skillrpl_nsqf_catalog_v1';
const MAPPING_DRAFT_KEY_PREFIX = 'skillrpl_mapping_draft_';

/**
 * Initializes and caches the verified qualifications catalog locally
 */
export function initializeOfflineQualificationCatalog(): VerifiedQualification[] {
  try {
    const cached = localStorage.getItem(QUALIFICATION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Save verified qualifications
    localStorage.setItem(QUALIFICATION_CACHE_KEY, JSON.stringify(VERIFIED_QUALIFICATIONS));
  } catch (err) {
    console.warn('[Offline Qualification Storage] LocalStorage not accessible, using in-memory catalog:', err);
  }
  return VERIFIED_QUALIFICATIONS;
}

/**
 * Searches offline qualification catalog by keyword, sector, or NSQF level
 */
export function searchOfflineQualifications(query: string): VerifiedQualification[] {
  const catalog = initializeOfflineQualificationCatalog();
  const q = query.trim().toLowerCase();
  if (!q) return catalog;

  return catalog.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.qpCode.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q) ||
      item.tradeAliases.some((alias) => alias.toLowerCase().includes(q)) ||
      item.units.some((u) => u.title.toLowerCase().includes(q) || u.keywords.some((kw) => kw.includes(q)))
    );
  });
}

/**
 * Runs client-side deterministic qualification mapping when offline
 */
export function runOfflineQualificationMapping(input: WorkerMappingInput): QualificationMappingResponse {
  const catalog = initializeOfflineQualificationCatalog();
  const candidates: CandidateMatchResult[] = performDeterministicMatch(input, catalog);

  return {
    success: true,
    candidates: candidates.map((c) => ({
      ...c,
      methodology: 'LOCAL_OFFLINE'
    })),
    extractedSkillsSummary: [...(input.skills || []), ...(input.tasks || [])],
    totalCandidatesEvaluated: catalog.length,
    methodology: 'LOCAL_OFFLINE',
    notice: 'AI semantic analysis will be available when connectivity is restored. Matching based on verified offline qualification catalog.',
    offlineMode: true
  };
}

/**
 * Save mapping draft locally for an application
 */
export function saveLocalMappingDraft(applicationId: string, mappingData: any) {
  try {
    localStorage.setItem(`${MAPPING_DRAFT_KEY_PREFIX}${applicationId}`, JSON.stringify({
      applicationId,
      mappingData,
      savedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.warn('[Save Local Mapping Draft Warning]', err);
  }
}

/**
 * Retrieve local mapping draft for an application
 */
export function getLocalMappingDraft(applicationId: string): any | null {
  try {
    const raw = localStorage.getItem(`${MAPPING_DRAFT_KEY_PREFIX}${applicationId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.mappingData || null;
    }
  } catch (err) {
    console.warn('[Get Local Mapping Draft Warning]', err);
  }
  return null;
}
