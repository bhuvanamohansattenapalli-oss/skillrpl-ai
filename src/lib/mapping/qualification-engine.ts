/**
 * NSQF Qualification Pack Mapping Engine
 * 
 * Hybrid Matching Architecture:
 * 1. Deterministic Matching: Exact trade matching, NOS keyword mapping, tool overlap, experience threshold.
 * 2. AI Semantic Matching: Gemini 3.6 Flash semantic similarity between experience text and NOS units.
 * 
 * Safety & Regulatory Principles:
 * - AI recommendations are purely supportive recommendations for human assessor review.
 * - AI NEVER certifies a worker, never states "You are certified" or "You passed".
 * - AI is STRICTLY RESTRICTED to qualifications present in the verified dataset.
 * - Complete offline fallback: deterministic matching operates locally when disconnected.
 */

import {
  VERIFIED_QUALIFICATIONS,
  type VerifiedQualification
} from '../../data/qualification-catalog.ts';
import { isGeminiConfigured, getGeminiModel, getGeminiClient } from '../ai/gemini.ts';

export interface WorkerMappingInput {
  occupation: string;
  yearsExperience: number;
  skills: string[];
  tasks: string[];
  tools: string[];
  responsibilities?: string[];
  experienceDescription?: string;
  additionalExperience?: string;
}

export interface CandidateMatchResult {
  qualification: VerifiedQualification;
  qpCode: string;
  title: string;
  nsqfLevel: number;
  sector: string;
  awardingBody: string;
  source: string;
  systemMatchScore: number;     // 0 - 100 percentage (System Match Score)
  matchRank: number;            // 1 = Best Match, 2 = Alternative Match, 3 = Possible Match
  rankLabel: 'Best Match' | 'Alternative Match' | 'Possible Match';
  confidenceLabel: 'High' | 'Medium' | 'Low';
  whyMatches: {
    matchedSkills: string[];
    matchedTasks: string[];
    matchedTools: string[];
    experienceRelevance: string;
  };
  potentialGaps: string[];
  evidenceRequired: string[];
  methodology: 'HYBRID' | 'DETERMINISTIC' | 'LOCAL_OFFLINE';
  assessorDisclaimer: string;
}

export interface QualificationMappingResponse {
  success: boolean;
  candidates: CandidateMatchResult[];
  extractedSkillsSummary: string[];
  totalCandidatesEvaluated: number;
  methodology: 'HYBRID' | 'DETERMINISTIC' | 'LOCAL_OFFLINE';
  notice: string;
  offlineMode: boolean;
  error?: string;
}

const ASSESSOR_DISCLAIMER_TEXT =
  'This is an AI-assisted recommendation for assessor review. The human assessor remains responsible for the official assessment decision.';

/**
 * Deterministic Matching Engine
 * Compares worker profile against verified qualification standards.
 */
export function performDeterministicMatch(
  input: WorkerMappingInput,
  catalog: VerifiedQualification[] = VERIFIED_QUALIFICATIONS
): CandidateMatchResult[] {
  const normOcc = (input.occupation || '').trim().toLowerCase();
  const workerTools = (input.tools || []).map((t) => t.trim().toLowerCase()).filter(Boolean);
  const workerTasks = (input.tasks || []).map((t) => t.trim().toLowerCase()).filter(Boolean);
  const workerSkills = (input.skills || []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  const workerResp = (input.responsibilities || []).map((r) => r.trim().toLowerCase()).filter(Boolean);
  const combinedText = [
    input.occupation,
    input.experienceDescription,
    input.additionalExperience,
    ...workerTasks,
    ...workerSkills,
    ...workerResp
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const results: { qualification: VerifiedQualification; score: number; details: any }[] = [];

  for (const qp of catalog) {
    let tradeTitleScore = 0;
    // Check if worker trade matches alias or qualification title
    const qpTitleLower = qp.title.toLowerCase();
    if (normOcc && (qpTitleLower.includes(normOcc) || normOcc.includes(qpTitleLower))) {
      tradeTitleScore = 30;
    } else if (qp.tradeAliases.some((alias) => normOcc.includes(alias) || alias.includes(normOcc))) {
      tradeTitleScore = 25;
    } else if (qp.tradeAliases.some((alias) => combinedText.includes(alias))) {
      tradeTitleScore = 15;
    }

    // Tool Matching
    const matchedTools: string[] = [];
    for (const tool of qp.coreTools) {
      const toolLower = tool.toLowerCase();
      const hasTool = workerTools.some((wt) => wt.includes(toolLower) || toolLower.includes(wt)) ||
        combinedText.includes(toolLower);
      if (hasTool) {
        matchedTools.push(tool);
      }
    }
    const toolScore = qp.coreTools.length > 0
      ? Math.min(20, Math.round((matchedTools.length / Math.min(qp.coreTools.length, 5)) * 20))
      : 10;

    // Unit / Task Matching
    const matchedTasks: string[] = [];
    const matchedSkills: string[] = [];
    const potentialGaps: string[] = [];

    for (const unit of qp.units) {
      let unitMatches = false;
      // Check unit keywords
      for (const kw of unit.keywords) {
        const kwLower = kw.toLowerCase();
        const hasKeyword = combinedText.includes(kwLower);
        if (hasKeyword && !matchedSkills.includes(unit.title)) {
          matchedSkills.push(unit.title);
          unitMatches = true;
          break;
        }
      }

      // Check unit practical tasks
      for (const task of unit.tasks) {
        const taskLower = task.toLowerCase();
        const taskMatched = workerTasks.some((wt) => {
          const words = wt.split(/\s+/).filter((w) => w.length > 3);
          return words.some((w) => taskLower.includes(w));
        });
        if (taskMatched) {
          if (!matchedTasks.includes(task)) matchedTasks.push(task);
          unitMatches = true;
        }
      }

      if (!unitMatches && unit.isMandatory) {
        potentialGaps.push(`${unit.title} (${unit.code})`);
      }
    }

    const unitScore = qp.units.length > 0
      ? Math.min(30, Math.round((matchedSkills.length / qp.units.length) * 30))
      : 15;

    // Experience Threshold Score
    let expScore = 0;
    let experienceRelevance = '';
    const years = Number(input.yearsExperience) || 0;
    if (years >= qp.minimumExperienceYears) {
      expScore = 20;
      experienceRelevance = `${years} years experience satisfies official NSQF Level ${qp.nsqfLevel} guideline (${qp.minimumExperienceYears} years minimum).`;
    } else if (years > 0) {
      expScore = Math.round((years / qp.minimumExperienceYears) * 20);
      experienceRelevance = `${years} years experience provides partial coverage towards ${qp.minimumExperienceYears} years guideline.`;
    } else {
      expScore = 5;
      experienceRelevance = 'Experience not formally documented; practical demonstration required.';
    }

    const rawDeterministicScore = tradeTitleScore + toolScore + unitScore + expScore;
    const finalScore = Math.min(96, Math.max(0, rawDeterministicScore));

    // Standard Evidence Requirements for this QP
    const evidenceRequired: string[] = [
      `Practical demonstration of ${qp.units[0]?.title || 'core tasks'} under assessor observation`,
      `Photographic or video evidence of electrical installation/maintenance on site`,
      `Employer or contractor verification of at least ${qp.minimumExperienceYears} years relevant work`
    ];

    results.push({
      qualification: qp,
      score: finalScore,
      details: {
        matchedSkills,
        matchedTasks,
        matchedTools,
        experienceRelevance,
        potentialGaps: potentialGaps.slice(0, 3),
        evidenceRequired
      }
    });
  }

  // Sort descending by match score
  results.sort((a, b) => b.score - a.score);

  // Filter out any candidates with score < 25 (non-matching)
  const validCandidates = results.filter((r) => r.score >= 25).slice(0, 3);

  return validCandidates.map((c, index) => {
    const rank = index + 1;
    const rankLabel: 'Best Match' | 'Alternative Match' | 'Possible Match' =
      rank === 1 ? 'Best Match' : rank === 2 ? 'Alternative Match' : 'Possible Match';
    const confidenceLabel: 'High' | 'Medium' | 'Low' =
      c.score >= 80 ? 'High' : c.score >= 60 ? 'Medium' : 'Low';

    return {
      qualification: c.qualification,
      qpCode: c.qualification.qpCode,
      title: c.qualification.title,
      nsqfLevel: c.qualification.nsqfLevel,
      sector: c.qualification.sector,
      awardingBody: c.qualification.awardingBody,
      source: c.qualification.source,
      systemMatchScore: c.score,
      matchRank: rank,
      rankLabel,
      confidenceLabel,
      whyMatches: {
        matchedSkills: c.details.matchedSkills,
        matchedTasks: c.details.matchedTasks,
        matchedTools: c.details.matchedTools,
        experienceRelevance: c.details.experienceRelevance
      },
      potentialGaps: c.details.potentialGaps,
      evidenceRequired: c.details.evidenceRequired,
      methodology: 'DETERMINISTIC',
      assessorDisclaimer: ASSESSOR_DISCLAIMER_TEXT
    };
  });
}

/**
 * AI-Assisted Semantic Matching using Gemini 3.6 Flash
 * Strictly restricted to verified qualification catalog.
 */
async function performAiSemanticEvaluation(
  input: WorkerMappingInput,
  deterministicCandidates: CandidateMatchResult[]
): Promise<Map<string, { semanticScore: number; rationale: string; gaps: string[] }>> {
  const scoreMap = new Map<string, { semanticScore: number; rationale: string; gaps: string[] }>();

  if (!isGeminiConfigured()) {
    return scoreMap;
  }

  try {
    const ai = getGeminiClient();
    const model = getGeminiModel();

    // Prepare catalog context for prompt — ONLY verified qualifications
    const verifiedCatalogSummary = deterministicCandidates.map((c) => ({
      qpCode: c.qualification.qpCode,
      title: c.qualification.title,
      nsqfLevel: c.qualification.nsqfLevel,
      sector: c.qualification.sector,
      description: c.qualification.description,
      units: c.qualification.units.map((u) => ({
        code: u.code,
        title: u.title,
        description: u.description
      }))
    }));

    const prompt = `You are the NSQF Qualification Pack Recommendation Engine for the SkillRPL portal (India National Skills Qualifications Framework).

STRICT REGULATORY & ETHICAL CONSTRAINTS:
1. You may ONLY evaluate and recommend from the VERIFIED QUALIFICATIONS listed below.
2. DO NOT invent, hallucinate, or fabricate any QP codes, NOS codes, or qualification titles.
3. You are providing AI-assisted recommendations for an accredited human assessor.
4. You must NEVER say "You are certified", "You passed", or "You are officially NSQF Level X".
5. Evaluate semantic alignment between the Worker Profile and each verified qualification.

VERIFIED QUALIFICATIONS AVAILABLE:
${JSON.stringify(verifiedCatalogSummary, null, 2)}

WORKER PROFILE:
Occupation: ${input.occupation}
Years of Experience: ${input.yearsExperience}
Declared Skills: ${JSON.stringify(input.skills)}
Declared Tasks: ${JSON.stringify(input.tasks)}
Tools & Equipment: ${JSON.stringify(input.tools)}
Experience Narrative: ${input.experienceDescription || 'Not specified'}
Additional Experience: ${input.additionalExperience || 'None'}

RESPONSE FORMAT:
Respond with a JSON object strictly matching this schema:
{
  "evaluations": [
    {
      "qpCode": "EXACT_QP_CODE_FROM_LIST",
      "semanticSimilarityScore": 85, // integer 0-100
      "rationale": "Clear reason why worker experience aligns with this qualification pack",
      "potentialGaps": ["List of missing competencies or unmentioned standards"],
      "suggestedEvidence": ["Specific evidence assessor should verify"]
    }
  ]
}

Only return valid JSON. Do not include markdown codeblocks or preamble.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    const responseText = response.text?.trim() || '';
    let parsed: any;
    try {
      const cleaned = responseText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if formatting was non-clean
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        parsed = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
      }
    }

    if (parsed && Array.isArray(parsed.evaluations)) {
      for (const ev of parsed.evaluations) {
        if (ev.qpCode && typeof ev.semanticSimilarityScore === 'number') {
          scoreMap.set(ev.qpCode.toUpperCase(), {
            semanticScore: Math.min(100, Math.max(0, Math.round(ev.semanticSimilarityScore))),
            rationale: ev.rationale || '',
            gaps: Array.isArray(ev.potentialGaps) ? ev.potentialGaps : []
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[AI Semantic Mapping Warning] AI evaluation skipped, using deterministic matching:', err?.message || err);
  }

  return scoreMap;
}

/**
 * Main Hybrid Qualification Mapping Engine
 * Seamlessly blends deterministic rules and Gemini 3.6 Flash semantic analysis.
 * Fully supports offline execution.
 */
export async function performHybridQualificationMapping(
  input: WorkerMappingInput,
  options?: { forceOffline?: boolean }
): Promise<QualificationMappingResponse> {
  // Validate minimum inputs
  if (!input.occupation?.trim() && (!input.skills || input.skills.length === 0) && (!input.tasks || input.tasks.length === 0)) {
    return {
      success: false,
      candidates: [],
      extractedSkillsSummary: [],
      totalCandidatesEvaluated: 0,
      methodology: 'DETERMINISTIC',
      notice: 'Insufficient worker data to perform qualification matching. Please provide your occupation or skills.',
      offlineMode: Boolean(options?.forceOffline),
      error: 'Missing required worker information (occupation, skills, or tasks).'
    };
  }

  // 1. Run Deterministic Matching
  const deterministicCandidates = performDeterministicMatch(input);

  // If no candidates found deterministically (e.g. non-existent trade like "Astronaut"), return clear response
  if (deterministicCandidates.length === 0) {
    return {
      success: true,
      candidates: [],
      extractedSkillsSummary: [...(input.skills || []), ...(input.tasks || [])],
      totalCandidatesEvaluated: VERIFIED_QUALIFICATIONS.length,
      methodology: options?.forceOffline ? 'LOCAL_OFFLINE' : 'DETERMINISTIC',
      notice: 'No suitable qualification match found in the current verified trade catalog. Please verify your declared trade and skills.',
      offlineMode: Boolean(options?.forceOffline)
    };
  }

  // 2. If Offline forced or offline browser environment
  if (options?.forceOffline) {
    return {
      success: true,
      candidates: deterministicCandidates.map((c) => ({
        ...c,
        methodology: 'LOCAL_OFFLINE'
      })),
      extractedSkillsSummary: [...(input.skills || []), ...(input.tasks || [])],
      totalCandidatesEvaluated: VERIFIED_QUALIFICATIONS.length,
      methodology: 'LOCAL_OFFLINE',
      notice: 'AI semantic analysis will be available when connectivity is restored. Matching based on verified offline catalog.',
      offlineMode: true
    };
  }

  // 3. Perform AI Semantic Evaluation if online & Gemini configured
  const aiScoreMap = await performAiSemanticEvaluation(input, deterministicCandidates);

  const hybridCandidates: CandidateMatchResult[] = deterministicCandidates.map((c) => {
    const aiData = aiScoreMap.get(c.qpCode.toUpperCase());
    if (aiData) {
      // Hybrid blend: 50% Deterministic + 50% AI Semantic
      const blendedScore = Math.min(96, Math.max(25, Math.round(c.systemMatchScore * 0.5 + aiData.semanticScore * 0.5)));
      return {
        ...c,
        systemMatchScore: blendedScore,
        methodology: 'HYBRID',
        potentialGaps: Array.from(new Set([...c.potentialGaps, ...aiData.gaps])).slice(0, 4),
        whyMatches: {
          ...c.whyMatches,
          experienceRelevance: aiData.rationale || c.whyMatches.experienceRelevance
        }
      };
    }
    return c;
  });

  // Re-sort and re-rank
  hybridCandidates.sort((a, b) => b.systemMatchScore - a.systemMatchScore);
  hybridCandidates.forEach((c, i) => {
    c.matchRank = i + 1;
    c.rankLabel = i === 0 ? 'Best Match' : i === 1 ? 'Alternative Match' : 'Possible Match';
    c.confidenceLabel = c.systemMatchScore >= 80 ? 'High' : c.systemMatchScore >= 60 ? 'Medium' : 'Low';
  });

  const isHybrid = aiScoreMap.size > 0;

  return {
    success: true,
    candidates: hybridCandidates,
    extractedSkillsSummary: [...(input.skills || []), ...(input.tasks || [])],
    totalCandidatesEvaluated: VERIFIED_QUALIFICATIONS.length,
    methodology: isHybrid ? 'HYBRID' : 'DETERMINISTIC',
    notice: isHybrid
      ? 'Hybrid AI semantic and deterministic matching completed. Recommended for assessor review.'
      : 'Deterministic rule-based matching completed. AI semantic analysis will enrich results when online.',
    offlineMode: false
  };
}
