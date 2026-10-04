/**
 * Standardized Assessor Scoring Rubric (NSQF / NCVET Aligned)
 * 5-Level Competency Scale (0 to 4)
 * Provides objective behavioural anchors and validation rules for practical RPL assessments.
 */

export type RubricScore = 0 | 1 | 2 | 3 | 4;

export interface RubricLevelInfo {
  score: RubricScore;
  label: string;
  shortDescription: string;
  detailedCriteria: string;
  requiresObservation: boolean;
  color: string;
  badgeVariant: 'error' | 'warning' | 'sky' | 'teal' | 'success';
}

export const STANDARDIZED_RUBRIC: Record<RubricScore, RubricLevelInfo> = {
  0: {
    score: 0,
    label: 'Not Demonstrated',
    shortDescription: 'Candidate fails to perform the task or demonstrates unsafe behaviour.',
    detailedCriteria:
      'The candidate does not attempt the required task, demonstrates complete lack of understanding of tools or processes, or violates fundamental safety protocols (e.g. working on live circuits without isolation/PPE).',
    requiresObservation: true,
    color: '#DC2626',
    badgeVariant: 'error'
  },
  1: {
    score: 1,
    label: 'Needs Significant Support',
    shortDescription: 'Candidate requires continuous prompting and repeated manual assistance.',
    detailedCriteria:
      'The candidate attempts the task but requires continuous step-by-step guidance, makes critical technical errors requiring assessor intervention, or cannot complete the task within standard occupational parameters without assistance.',
    requiresObservation: true,
    color: '#D97706',
    badgeVariant: 'warning'
  },
  2: {
    score: 2,
    label: 'Partially Demonstrated',
    shortDescription: 'Candidate performs core steps with minor errors or hesitations.',
    detailedCriteria:
      'The candidate demonstrates the foundational procedure correctly with acceptable safety adherence, but shows minor inaccuracies, requires occasional verbal clarification, or works at a slower pace than industrial norms.',
    requiresObservation: false,
    color: '#0284C7',
    badgeVariant: 'sky'
  },
  3: {
    score: 3,
    label: 'Competent',
    shortDescription: 'Candidate independently demonstrates task to industry standards.',
    detailedCriteria:
      'The candidate independently, accurately, and safely completes the task in accordance with defined NSQF/NOS standard operating procedures. Selects correct tools, follows LOTO safety, executes proper terminations, and verifies results.',
    requiresObservation: false,
    color: '#0D9488',
    badgeVariant: 'teal'
  },
  4: {
    score: 4,
    label: 'Strongly Demonstrated',
    shortDescription: 'Candidate shows mastery, speed, and advanced diagnostic ability.',
    detailedCriteria:
      'The candidate demonstrates exemplary skill execution with zero supervision, proactive hazard mitigation, optimal tool efficiency, rapid fault isolation, and clean workmanship exceeding baseline occupational requirements.',
    requiresObservation: false,
    color: '#16A34A',
    badgeVariant: 'success'
  }
};

/**
 * Validates a criterion score submission
 * Low scores (0 and 1) strictly mandate an observation note
 */
export function validateCriterionScore(
  score: number,
  observation?: string
): { valid: boolean; error?: string } {
  if (score < 0 || score > 4 || !Number.isInteger(score)) {
    return {
      valid: false,
      error: 'Score must be an integer between 0 and 4 according to the standardized rubric.'
    };
  }

  const rubric = STANDARDIZED_RUBRIC[score as RubricScore];
  if (rubric.requiresObservation) {
    if (!observation || observation.trim().length < 8) {
      return {
        valid: false,
        error: `An observation note is required when assigning Score ${score} (${rubric.label}). Please document the specific deficiency or assistance required.`
      };
    }
  }

  return { valid: true };
}

/**
 * Returns rubric information for a given score
 */
export function getRubricLevelInfo(score: number): RubricLevelInfo {
  const rounded = Math.min(4, Math.max(0, Math.round(score))) as RubricScore;
  return STANDARDIZED_RUBRIC[rounded];
}

export interface AssessmentMetrics {
  totalCriteria: number;
  assessedCriteriaCount: number;
  completionPercentage: number;
  averageScore: number; // 0.0 to 4.0
  currentAssessmentScore: number; // 0 to 100 percentage
  competentCriteriaCount: number; // score >= 3
  isAllMandatoryAssessed: boolean;
  systemReferenceThreshold: number; // 70% standard reference
  systemReferenceOutcome: 'COMPETENT' | 'NOT_YET_COMPETENT';
  referenceNotice: string;
}

/**
 * Calculates real-time assessment progress and system reference score
 */
export function calculateAssessmentMetrics(
  scores: Array<{ scoreAwarded: number; isMandatory?: boolean }>,
  totalCriteriaCount: number
): AssessmentMetrics {
  const assessedCount = scores.length;
  const completionPercentage =
    totalCriteriaCount > 0 ? Math.round((assessedCount / totalCriteriaCount) * 100) : 0;

  if (assessedCount === 0) {
    return {
      totalCriteria: totalCriteriaCount,
      assessedCriteriaCount: 0,
      completionPercentage: 0,
      averageScore: 0,
      currentAssessmentScore: 0,
      competentCriteriaCount: 0,
      isAllMandatoryAssessed: false,
      systemReferenceThreshold: 70,
      systemReferenceOutcome: 'NOT_YET_COMPETENT',
      referenceNotice:
        'System reference threshold: 70% average score with all mandatory safety criteria evaluated. Human assessor decision required.'
    };
  }

  const totalScore = scores.reduce((acc, curr) => acc + curr.scoreAwarded, 0);
  const averageScore = Number((totalScore / assessedCount).toFixed(2));
  // 4.0 scale mapped to 100%
  const currentAssessmentScore = Math.round((averageScore / 4) * 100);

  const competentCount = scores.filter((s) => s.scoreAwarded >= 3).length;
  const isAllMandatoryAssessed = assessedCount >= totalCriteriaCount;

  // System reference threshold: >= 70% (>= 2.8 average) and no score of 0 on mandatory safety
  const hasZeroOnMandatory = scores.some((s) => s.isMandatory && s.scoreAwarded === 0);
  const systemReferenceOutcome =
    currentAssessmentScore >= 70 && !hasZeroOnMandatory && isAllMandatoryAssessed
      ? 'COMPETENT'
      : 'NOT_YET_COMPETENT';

  return {
    totalCriteria: totalCriteriaCount,
    assessedCriteriaCount: assessedCount,
    completionPercentage,
    averageScore,
    currentAssessmentScore,
    competentCriteriaCount: competentCount,
    isAllMandatoryAssessed,
    systemReferenceThreshold: 70,
    systemReferenceOutcome,
    referenceNotice:
      'System reference threshold: 70% average score with all mandatory criteria evaluated. Human assessor decision required.'
  };
}
