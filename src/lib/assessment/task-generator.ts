/**
 * Dynamic Practical Task Generator
 * Generates calibrated, auditable practical task sets for RPL candidate assessments.
 *
 * Requirements Met:
 * 1. Does NOT show identical fixed questions every time (task variation across variants A, B, etc.).
 * 2. 100% strictly preserves mandatory NOS competency coverage for fairness and auditability.
 * 3. Deterministic given an assessment ID / seed so the exact task set is reproducible.
 * 4. Produces complete task snapshot stored in the database for compliance.
 */

import {
  groupTasksByCompetency,
  type PracticalTaskDefinition,
  type ObservableCriterion
} from './task-bank';

export interface GeneratedAssessmentCriterion extends ObservableCriterion {
  id: string; // unique ID: e.g. "TASK-CON-Q0603-N0607-A__tools_ppe"
  taskId: string;
  criterionKey: string;
  scoreAwarded?: number;
  rubricLevel?: string;
  observation?: string;
  evaluatedAt?: string;
}

export interface GeneratedAssessmentTask extends Omit<PracticalTaskDefinition, 'criteria'> {
  taskNumber: number;
  totalTasks: number;
  criteria: GeneratedAssessmentCriterion[];
}

export interface GeneratedAssessmentPlan {
  qpCode: string;
  seed: string;
  generatedAt: string;
  totalTasks: number;
  totalCriteriaCount: number;
  mandatoryCriteriaCount: number;
  competencyUnitsCovered: Array<{
    nosUnitCode: string;
    nosUnitTitle: string;
    competencyArea: string;
    selectedVariant: string;
    taskId: string;
  }>;
  tasks: GeneratedAssessmentTask[];
  taskSetHash: string;
  isCoverageComplete: boolean;
}

/**
 * Simple deterministic pseudo-random hash generator based on string seed
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates or selects a fair, varied practical task set for an assessment
 */
export function generateAssessmentPlan(
  qpCode: string,
  options: {
    assessmentId?: string;
    seed?: string;
    variantPreference?: 'ROTATE' | 'A' | 'B';
  } = {}
): GeneratedAssessmentPlan {
  const normQp = qpCode.trim().toUpperCase();
  const grouped = groupTasksByCompetency(normQp);
  const competencyUnitCodes = Object.keys(grouped);

  // If no tasks found for this exact QP, fall back to default Electrician QP (CON/Q0603)
  let effectiveGrouped = grouped;
  let effectiveQp = normQp;
  if (competencyUnitCodes.length === 0) {
    effectiveGrouped = groupTasksByCompetency('CON/Q0603');
    effectiveQp = 'CON/Q0603';
  }

  const seedString = options.seed || options.assessmentId || `session-${Date.now()}`;
  const seedNum = hashSeed(seedString);

  const selectedTasks: GeneratedAssessmentTask[] = [];
  const competencyUnitsCovered: GeneratedAssessmentPlan['competencyUnitsCovered'] = [];

  const effectiveUnits = Object.keys(effectiveGrouped);
  const totalTasks = effectiveUnits.length;

  effectiveUnits.forEach((nosCode, idx) => {
    const variants = effectiveGrouped[nosCode];
    let selected: PracticalTaskDefinition;

    if (options.variantPreference === 'A') {
      selected = variants[0];
    } else if (options.variantPreference === 'B' && variants.length > 1) {
      selected = variants[1];
    } else {
      // Dynamic deterministic variation based on seed and task index
      const variantIdx = (seedNum + idx) % variants.length;
      selected = variants[variantIdx];
    }

    const taskNumber = idx + 1;
    const taskCriteria: GeneratedAssessmentCriterion[] = selected.criteria.map((crit) => ({
      ...crit,
      id: `${selected.taskId}__${crit.key}`,
      taskId: selected.taskId,
      criterionKey: crit.key
    }));

    selectedTasks.push({
      ...selected,
      taskNumber,
      totalTasks,
      criteria: taskCriteria
    });

    competencyUnitsCovered.push({
      nosUnitCode: selected.nosUnitCode,
      nosUnitTitle: selected.nosUnitTitle,
      competencyArea: selected.competencyArea,
      selectedVariant: selected.variantKey,
      taskId: selected.taskId
    });
  });

  const allCriteria = selectedTasks.flatMap((t) => t.criteria);
  const mandatoryCount = allCriteria.filter((c) => c.isMandatory).length;

  // Task set hash for audit trail verification
  const taskSetHash = selectedTasks.map((t) => `${t.taskId}:${t.variantKey}`).join('|');

  return {
    qpCode: effectiveQp,
    seed: seedString,
    generatedAt: new Date().toISOString(),
    totalTasks: selectedTasks.length,
    totalCriteriaCount: allCriteria.length,
    mandatoryCriteriaCount: mandatoryCount,
    competencyUnitsCovered,
    tasks: selectedTasks,
    taskSetHash,
    isCoverageComplete: competencyUnitsCovered.length >= effectiveUnits.length
  };
}

/**
 * Verifies that a generated assessment plan completely covers all required NOS competency areas
 */
export function verifyAssessmentPlanIntegrity(
  qpCode: string,
  plan: GeneratedAssessmentPlan
): { isValid: boolean; coveredNos: string[]; missingNos: string[] } {
  const normQp = qpCode.trim().toUpperCase();
  const grouped = groupTasksByCompetency(normQp.length ? normQp : 'CON/Q0603');
  const requiredNos = Object.keys(grouped);
  const coveredNos = plan.competencyUnitsCovered.map((c) => c.nosUnitCode);
  const missingNos = requiredNos.filter((code) => !coveredNos.includes(code));
  return {
    isValid: missingNos.length === 0 && plan.tasks.length === requiredNos.length,
    coveredNos,
    missingNos
  };
}

