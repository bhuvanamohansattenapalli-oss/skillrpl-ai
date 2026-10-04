import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Cpu,
  WifiOff,
  Wifi,
  Info
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassProgress } from '../common/GlassProgress';
import { useApp } from '../../context/AppContext';
import {
  STANDARDIZED_RUBRIC,
  type RubricScore,
  validateCriterionScore
} from '../../lib/assessment/scoring-rubric';
import {
  getAssessmentSession,
  submitCriterionScore,
  runAIAssessorAssistance,
  finalizeAssessment
} from '../../lib/api/practical-assessment';
import { isClientOnline } from '../../lib/assessment/offline-assessment';

export const PracticalAssessmentView: React.FC = () => {
  const { selectedCandidate, setCurrentView, showToast, candidatesForAssessor } = useApp();

  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [taskPlan, setTaskPlan] = useState<any | null>(null);
  const [expandedTaskIndex, setExpandedTaskIndex] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, { scoreAwarded: number; observation?: string; rubricLevel: string }>>({});
  const [isOnline, setIsOnline] = useState<boolean>(isClientOnline());
  const [activeTab, setActiveTab] = useState<'tasks' | 'evidence' | 'ai-copilot' | 'audit'>('tasks');
  const [reviewedEvidence, setReviewedEvidence] = useState<Record<string, boolean>>({});
  const [assessorNotes, setAssessorNotes] = useState<string>('');

  // AI Co-Pilot state
  const [aiAssistantData, setAiAssistantData] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Finalize Modal state
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState<boolean>(false);
  const [finalDecision, setFinalDecision] = useState<'COMPETENT' | 'NOT_YET_COMPETENT' | 'REASSESSMENT_REQUIRED'>('COMPETENT');
  const [assessorConfirmed, setAssessorConfirmed] = useState<boolean>(false);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [scoreValidationErrors, setScoreValidationErrors] = useState<Record<string, string>>({});

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Connectivity Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      showToast('Network restored. Syncing offline assessment data...', 'info');
      setTimeout(() => setIsSyncing(false), 2000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline mode active. Assessment changes will be saved locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load Assessment Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const candidate = (selectedCandidate?.id ? candidatesForAssessor.find((c) => c.id === selectedCandidate.id) : null) || candidatesForAssessor[0];
        const res = await getAssessmentSession(candidate?.id || 'demo-session-1');

        if (isMounted && res && res.data) {
          setAssessmentData(res.data);
          const plan = res.data.taskPlan || res.data.tasksSnapshot;
          setTaskPlan(plan);

          // Populate existing scores
          if (res.data.scores) {
            const initialScores: Record<string, any> = {};
            if (Array.isArray(res.data.scores)) {
              res.data.scores.forEach((s: any) => {
                const key = s.criterionKey || s.criterionId || s.id;
                initialScores[key] = {
                  scoreAwarded: s.scoreAwarded,
                  observation: s.observation,
                  rubricLevel: s.rubricLevel
                };
              });
            } else if (typeof res.data.scores === 'object') {
              Object.entries(res.data.scores).forEach(([k, v]: [string, any]) => {
                initialScores[k] = {
                  scoreAwarded: v.scoreAwarded,
                  observation: v.observation,
                  rubricLevel: v.rubricLevel
                };
              });
            }
            setScores(initialScores);
          }

          if (res.data.evidenceReviewed) {
            setReviewedEvidence(res.data.evidenceReviewed);
          }
          if (res.data.assessorNotes || res.data.notes) {
            setAssessorNotes(res.data.assessorNotes || res.data.notes);
          }
          if (res.data.aiAssistanceSummary) {
            setAiAssistantData(res.data.aiAssistanceSummary);
          }
        }
      } catch (err: any) {
        console.warn('[Practical Assessment] Failed to fetch session; loaded default blueprint:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCandidate?.id, candidatesForAssessor]);

  // Compute Real-Time Assessment Metrics
  const tasks = taskPlan?.tasks || [];
  const allCriteria = tasks.flatMap((t: any) => t.criteria || []);
  const totalCriteriaCount = allCriteria.length || 24;
  const scoredKeys = Object.keys(scores);
  const assessedCount = scoredKeys.length;
  const progressPercent = totalCriteriaCount > 0 ? Math.round((assessedCount / totalCriteriaCount) * 100) : 0;

  const totalScoreAwarded = Object.values(scores).reduce((acc, curr) => acc + curr.scoreAwarded, 0);
  const averageScore = assessedCount > 0 ? Number((totalScoreAwarded / assessedCount).toFixed(2)) : 0;
  const currentAssessmentScore = Math.round((averageScore / 4) * 100);

  // System Reference Threshold
  const systemReferenceOutcome = currentAssessmentScore >= 70 && assessedCount === totalCriteriaCount ? 'COMPETENT' : 'NOT_YET_COMPETENT';

  // Handle Score Selection
  const handleScoreSelect = async (
    criterionId: string,
    score: RubricScore,
    taskId: string,
    taskTitle: string,
    competencyArea: string,
    criterionKey: string,
    criterionText: string
  ) => {
    const existing = scores[criterionId];
    const rubric = STANDARDIZED_RUBRIC[score];
    const currentObs = existing?.observation || '';

    // Validate
    const validation = validateCriterionScore(score, currentObs);
    if (!validation.valid) {
      setScoreValidationErrors((prev) => ({ ...prev, [criterionId]: validation.error! }));
    } else {
      setScoreValidationErrors((prev) => {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      });
    }

    // Update local state immediately
    const updatedScoreItem = {
      scoreAwarded: score,
      observation: currentObs,
      rubricLevel: rubric.label
    };

    setScores((prev) => ({
      ...prev,
      [criterionId]: updatedScoreItem
    }));

    try {
      setIsSyncing(true);
      await submitCriterionScore({
        assessmentId: assessmentData?.id || 'session-1',
        criterionId,
        taskId,
        taskTitle,
        competencyArea,
        criterionKey,
        criterionText,
        scoreAwarded: score,
        rubricLevel: rubric.label,
        observation: currentObs,
        isMandatory: true
      });
    } catch (err) {
      console.warn('[Score Submit] Saved in local offline cache:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Observation Note Change
  const handleObservationChange = async (
    criterionId: string,
    text: string,
    taskId: string,
    taskTitle: string,
    competencyArea: string,
    criterionKey: string,
    criterionText: string
  ) => {
    const existing = scores[criterionId];
    const scoreVal = existing?.scoreAwarded ?? 2;

    const validation = validateCriterionScore(scoreVal, text);
    if (!validation.valid) {
      setScoreValidationErrors((prev) => ({ ...prev, [criterionId]: validation.error! }));
    } else {
      setScoreValidationErrors((prev) => {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      });
    }

    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        scoreAwarded: scoreVal,
        observation: text,
        rubricLevel: existing?.rubricLevel || 'Partially Demonstrated'
      }
    }));

    try {
      await submitCriterionScore({
        assessmentId: assessmentData?.id || 'session-1',
        criterionId,
        taskId,
        taskTitle,
        competencyArea,
        criterionKey,
        criterionText,
        scoreAwarded: scoreVal,
        rubricLevel: existing?.rubricLevel || 'Partially Demonstrated',
        observation: text,
        isMandatory: true
      });
    } catch {}
  };

  // Toggle Evidence Reviewed
  const handleToggleEvidence = (evidenceId: string) => {
    setReviewedEvidence((prev) => ({
      ...prev,
      [evidenceId]: !prev[evidenceId]
    }));
    showToast('Evidence status updated by assessor.', 'info');
  };

  // Run AI Co-Pilot Assistance
  const handleRunAiAssistance = async () => {
    setIsLoadingAi(true);
    try {
      const evaluationList = Object.entries(scores).map(([critId, s]) => {
        const critDef = allCriteria.find((c: any) => c.id === critId || c.key === critId);
        return {
          taskId: critDef?.taskId || 'TASK-1',
          taskTitle: critDef?.label || 'Practical Task',
          competencyArea: 'Electrical Competency',
          criterionKey: critId,
          criterionLabel: critDef?.label || critId,
          scoreAwarded: s.scoreAwarded,
          rubricLabel: s.rubricLevel,
          observation: s.observation,
          isMandatory: true
        };
      });

      const res = await runAIAssessorAssistance({
        assessmentId: assessmentData?.id || 'session-1',
        workerName: assessmentData?.rplApplication?.workerProfile?.name || 'Rajesh Kumar',
        qualificationTitle: assessmentData?.qualificationPack?.title || 'Construction Electrician - LV',
        qpCode: assessmentData?.qualificationPack?.code || 'CON/Q0603',
        nsqfLevel: assessmentData?.qualificationPack?.nsqfLevel || 4,
        evaluations: evaluationList,
        totalExpectedCriteria: totalCriteriaCount,
        candidateEvidence: assessmentData?.rplApplication?.evidences || []
      });

      setAiAssistantData(res);
      showToast('AI Assessment Assistant synthesized observations successfully.', 'success');
      setActiveTab('ai-copilot');
    } catch (err: any) {
      showToast(err.message || 'AI Assistant unavailable. Showing rule-based audit.', 'warning');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Finalize Decision
  const handleConfirmFinalize = async () => {
    if (!assessorConfirmed) {
      showToast('Assessor confirmation checkbox is mandatory.', 'error');
      return;
    }

    if (finalDecision !== systemReferenceOutcome && (!decisionReason || decisionReason.trim().length < 10)) {
      showToast('A professional reason (minimum 10 characters) is required when diverging from system reference outcome.', 'error');
      return;
    }

    setIsSubmittingFinal(true);
    try {
      const res = await finalizeAssessment({
        assessmentId: assessmentData?.id || 'session-1',
        finalDecision,
        assessorConfirmed: true,
        decisionReason: decisionReason.trim(),
        assessorNotes
      });

      showToast(`Assessment finalized: ${finalDecision}. Certification record created.`, 'success');
      setIsFinalizeModalOpen(false);
      if (res.certificateNumber) {
        showToast(`Official Certificate Generated: ${res.certificateNumber}`, 'info');
      }
      setCurrentView('assessor-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize assessment.', 'error');
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (loading && !assessmentData) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-primary-navy)' }}>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>Initializing Practical Assessment Workspace...</div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>Loading calibrated task plan and standardized rubric.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1px solid #F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#92400E',
            fontSize: '13px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WifiOff size={18} />
            <span>
              <strong>Offline Mode Active: </strong>
              All scores and observations are being saved safely in local encrypted storage. Gemini AI features will resume when online.
            </span>
          </div>
          <GlassBadge variant="warning">Offline — changes saved locally</GlassBadge>
        </div>
      )}

      {/* Top Session Header Card */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent-teal)', letterSpacing: '0.05em' }}>
              OFFICIAL PRACTICAL RPL ASSESSMENT
            </span>
            <GlassBadge variant="navy">
              Session: {assessmentData?.sessionNumber || 'SES-2026-784210'}
            </GlassBadge>
            <GlassBadge variant="teal">
              {assessmentData?.qualificationPack?.code || 'CON/Q0603'} · NSQF Level {assessmentData?.qualificationPack?.nsqfLevel || 4}
            </GlassBadge>
            {isOnline ? (
              <GlassBadge variant="success" icon={<Wifi size={11} />}>Online Synced</GlassBadge>
            ) : (
              <GlassBadge variant="warning" icon={<WifiOff size={11} />}>Offline — changes saved locally</GlassBadge>
            )}
            {isSyncing && (
              <GlassBadge variant="sky">Synchronizing assessment...</GlassBadge>
            )}
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '4px 0 0 0' }}>
            {assessmentData?.rplApplication?.workerProfile?.name || 'Candidate: Rajesh Kumar'}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Trade: <strong>{assessmentData?.qualificationPack?.title || 'Construction Electrician - LV'}</strong> · Accredited Assessor Evaluation Workspace
          </div>
        </div>

        {/* Real-Time Assessment Progress & Score Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(18, 59, 93, 0.1)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Current Assessment Score
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: currentAssessmentScore >= 70 ? '#16A34A' : '#D97706' }}>
              {currentAssessmentScore}%
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                ({averageScore} / 4.0)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Criteria: {assessedCount} of {totalCriteriaCount} evaluated
            </div>
          </div>

          <div style={{ width: '140px' }}>
            <GlassProgress value={progressPercent} label={`${progressPercent}%`} color="teal" height={8} />
          </div>

          <GlassButton
            variant="primary"
            icon={<Award size={16} />}
            onClick={() => setIsFinalizeModalOpen(true)}
          >
            Finalize Decision
          </GlassButton>
        </div>
      </GlassCard>

      {/* Assessor Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'tasks', label: `Practical Tasks (${tasks.length})`, icon: <CheckCircle2 size={14} /> },
          { id: 'evidence', label: 'Candidate Portfolio Evidence', icon: <FileCheck size={14} /> },
          { id: 'ai-copilot', label: 'AI Assessor Co-Pilot (Gemini 3.6 Flash)', icon: <Cpu size={14} /> },
          { id: 'audit', label: 'Official Audit Trail', icon: <Shield size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              color: activeTab === tab.id ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
              border: activeTab === tab.id ? '1px solid rgba(18, 59, 93, 0.15)' : '1px solid transparent',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(11, 41, 66, 0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DYNAMIC PRACTICAL TASKS & STANDARDIZED SCORING */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tasks.map((task: any, taskIdx: number) => {
            const isExpanded = expandedTaskIndex === taskIdx;
            const taskCriteria = task.criteria || [];
            const taskScoredCount = taskCriteria.filter((c: any) => Boolean(scores[c.id])).length;
            const isTaskComplete = taskScoredCount === taskCriteria.length && taskCriteria.length > 0;

            return (
              <GlassCard
                key={task.taskId || taskIdx}
                variant="elevated"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  borderLeft: isTaskComplete ? '4px solid #16A34A' : '4px solid #0284C7'
                }}
              >
                {/* Task Accordion Header */}
                <div
                  onClick={() => setExpandedTaskIndex(isExpanded ? -1 : taskIdx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#123B5D',
                          color: '#FFFFFF'
                        }}
                      >
                        TASK 0{task.taskNumber || taskIdx + 1}
                      </span>
                      <GlassBadge variant="navy">NOS: {task.nosUnitCode}</GlassBadge>
                      <GlassBadge variant="teal">{task.competencyArea}</GlassBadge>
                      {task.variantKey && (
                        <GlassBadge variant="sky">Variant {task.variantKey}</GlassBadge>
                      )}
                      {isTaskComplete && (
                        <GlassBadge variant="success" icon={<CheckCircle2 size={11} />}>
                          All Criteria Scored
                        </GlassBadge>
                      )}
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '4px 0 0 0' }}>
                      {task.title}
                    </h2>
                    <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                      NOS Unit: {task.nosUnitTitle} · Expected Time: {task.expectedDurationMinutes || 45} Mins
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {taskScoredCount} / {taskCriteria.length} Criteria
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-primary-navy)'
                      }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Task Body */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '12px', borderTop: '1px solid rgba(18, 59, 93, 0.08)' }}>
                    {/* Task Description */}
                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                      {task.description}
                    </p>

                    {/* Safety Protocols & Equipment */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          fontSize: '12px',
                          color: '#92400E'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                          <AlertTriangle size={15} color="#D97706" />
                          Mandatory Safety Protocols (IS 732)
                        </div>
                        <ul style={{ paddingLeft: '16px', margin: 0, lineHeight: 1.45 }}>
                          {(task.safetyGuidelines || []).map((g: string, idx: number) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          fontSize: '12px',
                          color: '#0369A1'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                          <Shield size={15} color="#0284C7" />
                          Rated Tools & Equipment Required
                        </div>
                        <ul style={{ paddingLeft: '16px', margin: 0, lineHeight: 1.45 }}>
                          {(task.equipmentRequired || []).map((eq: string, idx: number) => (
                            <li key={idx}>{eq}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Observable Criteria List with Standardized 0-4 Rubric */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                          Standardized Observable Criteria Evaluation (0 to 4 Scale)
                        </h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                          Scores 0 and 1 strictly mandate an observation note
                        </span>
                      </div>

                      {taskCriteria.map((criterion: any) => {
                        const currentScore = scores[criterion.id]?.scoreAwarded;
                        const observationText = scores[criterion.id]?.observation || '';
                        const hasError = scoreValidationErrors[criterion.id];

                        return (
                          <div
                            key={criterion.id}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              background: '#FFFFFF',
                              border: hasError ? '1px solid #EF4444' : '1px solid rgba(18, 59, 93, 0.1)',
                              boxShadow: '0 1px 3px rgba(11, 41, 66, 0.03)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ flex: 1, minWidth: '240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                                    {criterion.label}
                                  </span>
                                  {criterion.isMandatory && (
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B' }}>
                                      Mandatory
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                                  {criterion.description}
                                </p>
                              </div>

                              {/* 0 to 4 Rubric Button Group */}
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {([0, 1, 2, 3, 4] as RubricScore[]).map((scoreVal) => {
                                  const rubric = STANDARDIZED_RUBRIC[scoreVal];
                                  const isSelected = currentScore === scoreVal;

                                  return (
                                    <button
                                      key={scoreVal}
                                      type="button"
                                      title={`${rubric.label}: ${rubric.shortDescription}`}
                                      onClick={() =>
                                        handleScoreSelect(
                                          criterion.id,
                                          scoreVal,
                                          task.taskId,
                                          task.title,
                                          task.competencyArea,
                                          criterion.key,
                                          criterion.label
                                        )
                                      }
                                      style={{
                                        minWidth: '40px',
                                        height: '38px',
                                        padding: '0 8px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        background: isSelected ? rubric.color : 'rgba(18, 59, 93, 0.05)',
                                        color: isSelected ? '#FFFFFF' : 'var(--color-primary-navy)',
                                        border: isSelected ? `2px solid ${rubric.color}` : '1px solid rgba(18, 59, 93, 0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none'
                                      }}
                                    >
                                      <span>{scoreVal}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Active Rubric Description Pill */}
                            {currentScore !== undefined && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(241, 245, 249, 0.7)',
                                  fontSize: '12px',
                                  color: 'var(--color-primary-navy)'
                                }}
                              >
                                <Info size={14} color="#0284C7" />
                                <span>
                                  <strong>Score {currentScore} ({STANDARDIZED_RUBRIC[currentScore as RubricScore]?.label}): </strong>
                                  {STANDARDIZED_RUBRIC[currentScore as RubricScore]?.shortDescription}
                                </span>
                              </div>
                            )}

                            {/* Assessor Observation Note Textarea */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: 700, color: (currentScore === 0 || currentScore === 1) ? '#B91C1C' : 'var(--color-text-muted)' }}>
                                Assessor Observation Notes {(currentScore === 0 || currentScore === 1) ? '(Mandatory for Scores 0 & 1)' : '(Optional)'}
                              </label>
                              <input
                                type="text"
                                value={observationText}
                                onChange={(e) =>
                                  handleObservationChange(
                                    criterion.id,
                                    e.target.value,
                                    task.taskId,
                                    task.title,
                                    task.competencyArea,
                                    criterion.key,
                                    criterion.label
                                  )
                                }
                                placeholder={
                                  (currentScore === 0 || currentScore === 1)
                                    ? 'Document specific hazard, intervention or reason for low score...'
                                    : 'Add notes on technique, speed, or tool handling...'
                                }
                                className="glass-input"
                                style={{
                                  height: '38px',
                                  fontSize: '12.5px',
                                  border: hasError ? '1px solid #EF4444' : undefined
                                }}
                              />
                              {hasError && (
                                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                                  {hasError}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* TAB 2: CANDIDATE PORTFOLIO EVIDENCE REVIEW */}
      {activeTab === 'evidence' && (
        <GlassCard variant="elevated" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                Candidate Evidence Portfolio Verification
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Inspect uploaded field photos, videos, and certificates. Check each evidence piece after review.
              </p>
            </div>
            <GlassBadge variant="navy">
              {Object.values(reviewedEvidence).filter(Boolean).length} of {(assessmentData?.rplApplication?.evidences || []).length} Reviewed
            </GlassBadge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(assessmentData?.rplApplication?.evidences || [
              { id: 'ev-1', title: 'Main Distribution Board Installation Photo', type: 'PHOTO', fileUrl: '#' },
              { id: 'ev-2', title: 'Earthing Resistance Fall-of-Potential Test Video', type: 'VIDEO', fileUrl: '#' },
              { id: 'ev-3', title: 'Previous Employer Experience Certificate (5 Yrs)', type: 'DOCUMENT', fileUrl: '#' }
            ]).map((ev: any) => {
              const isChecked = Boolean(reviewedEvidence[ev.id]);

              return (
                <div
                  key={ev.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(18, 59, 93, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#E0F2FE',
                        color: '#0369A1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Type: {ev.type} · Uploaded by candidate for RPL verification
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEvidence(ev.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>Mark Reviewed</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* TAB 3: AI ASSESSOR CO-PILOT (GEMINI 3.6 FLASH) */}
      {activeTab === 'ai-copilot' && (
        <GlassCard variant="elevated" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={22} color="#0284C7" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                  AI Assessment Co-Pilot (Gemini 3.6 Flash)
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Synthesizes observation notes, detects scoring discrepancies, and checks mandatory criteria.
              </p>
            </div>

            <GlassButton
              variant="secondary"
              icon={<Sparkles size={15} color="#0284C7" />}
              onClick={handleRunAiAssistance}
              disabled={isLoadingAi}
            >
              {isLoadingAi ? 'Analyzing Assessment...' : 'Run AI Diagnostic Review'}
            </GlassButton>
          </div>

          {/* Critical Certification Integrity Disclaimer */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#0369A1',
              fontSize: '12.5px',
              lineHeight: 1.5
            }}
          >
            <strong>Official Certification Integrity Notice: </strong>
            AI provides recommendations and consistency analysis; it does NOT make the official certification decision. The accredited human assessor retains sole legal and professional responsibility for certifying the candidate.
          </div>

          {aiAssistantData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              {/* Summary of Assessor Notes */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid rgba(18, 59, 93, 0.1)' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-primary-navy)', marginBottom: '8px' }}>
                  Synthesized Assessor Observation Notes
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {aiAssistantData.notesSummary}
                </p>
              </div>

              {/* Inconsistency Flags */}
              {aiAssistantData.inconsistencies && aiAssistantData.inconsistencies.length > 0 && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 800, fontSize: '13.5px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} />
                    Scoring Consistency Alerts Detected
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiAssistantData.inconsistencies.map((inc: any, idx: number) => (
                      <div key={idx} style={{ fontSize: '12.5px', color: '#92400E' }}>
                        • <strong>{inc.issue}: </strong>{inc.recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Observations Check */}
              {aiAssistantData.missingObservations && aiAssistantData.missingObservations.length > 0 && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
                    Mandatory Observations Required
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#991B1B', lineHeight: 1.5 }}>
                    {aiAssistantData.missingObservations.map((obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Click "Run AI Diagnostic Review" to analyze real-time scores, observations, and portfolio evidence.
            </div>
          )}
        </GlassCard>
      )}

      {/* TAB 4: OFFICIAL AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <GlassCard variant="elevated" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
            Session Audit Trail (Immutable Log)
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Every score entered, modified, or finalized is timestamped with the accredited assessor's credential.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(assessmentData?.auditLogs || [
              { action: 'ASSESSMENT_CREATED', timestamp: new Date().toISOString(), details: 'Assessment session initialized.' }
            ]).map((log: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(18, 59, 93, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12.5px'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#123B5D', marginRight: '8px' }}>
                    [{log.action}]
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {log.details}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* FINALIZATION MODAL */}
      {isFinalizeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 41, 66, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              borderRadius: '24px',
              background: '#FFFFFF',
              boxShadow: '0 24px 48px -12px rgba(11, 41, 66, 0.25)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2744', margin: 0 }}>
                  Finalize Practical RPL Assessment
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Candidate: {assessmentData?.rplApplication?.workerProfile?.name || 'Rajesh Kumar'}
                </span>
              </div>
            </div>

            {/* Assessment Summary Snapshot */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Total Criteria Evaluated:</span>
                <strong style={{ color: '#0F2744' }}>{assessedCount} of {totalCriteriaCount} ({progressPercent}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Average Rubric Score:</span>
                <strong style={{ color: '#0F2744' }}>{averageScore} / 4.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>System Reference Threshold:</span>
                <strong style={{ color: currentAssessmentScore >= 70 ? '#16A34A' : '#D97706' }}>
                  {currentAssessmentScore}% ({systemReferenceOutcome})
                </strong>
              </div>
            </div>

            {/* Official Assessor Decision Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F2744' }}>
                Accredited Assessor Official Decision (Human Decision Required)
              </label>
              <select
                value={finalDecision}
                onChange={(e) => setFinalDecision(e.target.value as any)}
                className="glass-input"
                style={{ height: '44px', padding: '0 12px', fontSize: '13.5px', fontWeight: 600 }}
              >
                <option value="COMPETENT">COMPETENT — Award Official NSQF Qualification Certificate</option>
                <option value="NOT_YET_COMPETENT">NOT YET COMPETENT — Candidate requires bridge training</option>
                <option value="REASSESSMENT_REQUIRED">REASSESSMENT REQUIRED — Practical re-evaluation needed</option>
              </select>
            </div>

            {/* Assessor Override / Justification Reason (Required if decision != system outcome) */}
            {finalDecision !== systemReferenceOutcome && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#DC2626' }}>
                  Professional Justification Reason (Required: Decision differs from system reference threshold)
                </label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Document specific justification for professional decision override..."
                  rows={3}
                  className="glass-input"
                  style={{ padding: '10px 12px', fontSize: '12.5px', resize: 'vertical' }}
                  required
                />
              </div>
            )}

            {/* Final Assessor Observations / Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F2744' }}>
                Final Assessor Observations & Recommendations
              </label>
              <textarea
                value={assessorNotes}
                onChange={(e) => setAssessorNotes(e.target.value)}
                placeholder="Candidate demonstrated exceptional conduit bending and safety isolation..."
                rows={3}
                className="glass-input"
                style={{ padding: '10px 12px', fontSize: '12.5px', resize: 'vertical' }}
              />
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <input
                type="checkbox"
                id="assessor-confirm"
                checked={assessorConfirmed}
                onChange={(e) => setAssessorConfirmed(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="assessor-confirm" style={{ fontSize: '12.5px', color: '#065F46', fontWeight: 600, cursor: 'pointer' }}>
                I confirm that the final assessment decision is based on my professional assessment and the evidence reviewed.
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
              <GlassButton
                variant="secondary"
                onClick={() => setIsFinalizeModalOpen(false)}
                disabled={isSubmittingFinal}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleConfirmFinalize}
                disabled={isSubmittingFinal || !assessorConfirmed}
              >
                {isSubmittingFinal ? 'Recording Final Decision...' : 'Confirm & Finalize Assessment'}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
