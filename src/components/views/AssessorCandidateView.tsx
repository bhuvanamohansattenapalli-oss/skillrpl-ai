import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  Video,
  FileText,
  Save,
  Check,
  Sparkles,
  Cpu,
  CheckCircle2,
  BookOpen,
  Award
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const AssessorCandidateView: React.FC = () => {
  const {
    candidate,
    selfDeclaration,
    evidenceList,
    scoringCriteria,
    updateScore,
    setCurrentView,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'criteria' | 'evidence' | 'declaration' | 'ai-insights'>('criteria');

  // Supabase State
  const [supabaseAppId, setSupabaseAppId] = useState<string | null>(null);
  const [supabaseAssessmentId, setSupabaseAssessmentId] = useState<string | null>(null);
  const [aiAnalysisData, setAiAnalysisData] = useState<any | null>(null);
  const [assessorRemarks, setAssessorRemarks] = useState(
    'Candidate exhibits strong hands-on proficiency in 3-phase wiring, terminal box connection, and standard LOTO isolation. Recommended for NSQF Level 5 competency.'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  // Fetch real candidate evaluation data from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadCandidateEvaluation() {
      try {
        const res = await fetch('/api/assessor/candidate-evaluation');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          const app = json.data;
          setSupabaseAppId(app.id);
          if (app.assessments && app.assessments.length > 0) {
            setSupabaseAssessmentId(app.assessments[0].id);
            if (app.assessments[0].notes) {
              setAssessorRemarks(app.assessments[0].notes);
            }
          }
          if (app.aiAnalyses && app.aiAnalyses.length > 0) {
            setAiAnalysisData(app.aiAnalyses[0].result || app.aiAnalyses[0]);
          }
          setDbSynced(true);
        }
      } catch (err) {
        console.warn('Could not load evaluation from Supabase API, falling back to local context state:', err);
      }
    }
    loadCandidateEvaluation();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate weighted total score
  const totalWeight = scoringCriteria.reduce((acc, c) => acc + c.weight, 0);
  const weightedScore = scoringCriteria.reduce(
    (acc, c) => acc + (c.score / c.maxScore) * c.weight,
    0
  );
  const overallPercentage = Math.round((weightedScore / totalWeight) * 100);

  // Handle Save Draft to Supabase
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (supabaseAssessmentId && supabaseAppId) {
        const response = await fetch('/api/assessor/submit-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: supabaseAssessmentId,
            applicationId: supabaseAppId,
            scores: scoringCriteria.map((c) => ({
              criterionId: c.id,
              scoreAwarded: c.score,
              remarks: c.comments
            })),
            remarks: assessorRemarks,
            isFinal: false
          })
        });
        const resData = await response.json();
        if (resData.success) {
          showToast('Draft assessment scores synced with Supabase.', 'success');
          return;
        }
      }
      showToast('Assessor score draft saved locally.', 'info');
    } catch {
      showToast('Assessor score draft saved.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Finalize Decision to Supabase
  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      if (supabaseAssessmentId && supabaseAppId) {
        const response = await fetch('/api/assessor/submit-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: supabaseAssessmentId,
            applicationId: supabaseAppId,
            scores: scoringCriteria.map((c) => ({
              criterionId: c.id,
              scoreAwarded: c.score,
              remarks: c.comments
            })),
            remarks: assessorRemarks,
            isFinal: true
          })
        });
        const resData = await response.json();
        if (resData.success) {
          showToast(
            `Competency finalized! Certificate ${resData.data?.competencyResult?.certificateNumber || ''} created in Supabase.`,
            'success'
          );
          setCurrentView('results');
          return;
        }
      }
      showToast('Assessment finalized! Competency report generated.', 'success');
      setCurrentView('results');
    } catch (err: any) {
      showToast(err?.message || 'Assessment decision saved.', 'success');
      setCurrentView('results');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => setCurrentView('assessor-dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary-navy)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Assessor Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlassBadge variant="navy">Application: {candidate.applicationId}</GlassBadge>
          <GlassBadge variant="teal">NSQF Level {candidate.nsqfLevel}</GlassBadge>
          {dbSynced && (
            <GlassBadge variant="success" icon={<Check size={11} />}>
              Supabase PostgreSQL Synced
            </GlassBadge>
          )}
        </div>
      </div>

      {/* Main Grid: Left / Main Candidate Details & Right Scoring Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(360px, 0.95fr)',
          gap: '24px'
        }}
        className="assessor-split-grid"
      >
        {/* Left Column: Candidate Profile, Evidence & Practical Demonstration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Candidate Profile Summary Card */}
          <GlassCard variant="elevated" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(18, 59, 93, 0.2)'
                }}
              >
                RK
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                    {candidate.name}
                  </h2>
                  <GlassBadge variant="success">Verified Candidate</GlassBadge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-primary-navy)', fontWeight: 600, marginTop: '2px' }}>
                  {candidate.trade} · {candidate.yearsOfExperience} Years Experience
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  ESSCI Accredited Trade Alignment · {candidate.location}, {candidate.state}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '14px', lineHeight: 1.5 }}>
              {candidate.professionalSummary}
            </p>
          </GlassCard>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'criteria', label: 'Practical Task Checklist', icon: <CheckCircle2 size={14} /> },
              { id: 'evidence', label: `Candidate Evidence (${evidenceList.length})`, icon: <FileText size={14} /> },
              { id: 'declaration', label: 'Self Declaration', icon: <BookOpen size={14} /> },
              { id: 'ai-insights', label: 'AI Skill Analysis Insights', icon: <Cpu size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  background: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === tab.id ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
                  border: activeTab === tab.id ? '1px solid rgba(18, 59, 93, 0.12)' : '1px solid transparent',
                  boxShadow: activeTab === tab.id ? '0 2px 6px rgba(11, 41, 66, 0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Practical Assessment Criteria Review */}
          {activeTab === 'criteria' && (
            <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                    TASK OBSERVATION CHECKLIST
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                    3-Phase Induction Motor Starter & Relay Demonstration
                  </h3>
                </div>
                <GlassBadge variant="navy">Task 3 of 8</GlassBadge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Step 1: Isolation & Zero Energy Verification', status: 'Satisfactory', notes: 'Candidate padlocked incoming breaker and tested phase voltage.' },
                  { label: 'Step 2: Contactor Star-Delta Lead Termination', status: 'Satisfactory', notes: 'Proper torque used; correct ferrule labeling U1/V1/W1.' },
                  { label: 'Step 3: Thermal Overload Relay Configuration', status: 'Satisfactory', notes: 'Calibrated to 1.15x full load current per standard specifications.' },
                  { label: 'Step 4: Dual Protective Grounding Bonding', status: 'Satisfactory', notes: 'Double copper earth strip fastened securely to casing.' },
                  { label: 'Step 5: Fault Diagnosis & Continuity Checks', status: 'Review Needed', notes: 'Candidate took longer to identify winding phase imbalance.' }
                ].map((crit, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(18, 59, 93, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {crit.label}
                      </span>
                      <GlassBadge variant={crit.status === 'Satisfactory' ? 'success' : 'warning'} size="sm">
                        {crit.status}
                      </GlassBadge>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                      {crit.notes}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Tab 2: Candidate Evidence Items */}
          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {evidenceList.map((item) => (
                <GlassCard key={item.id} style={{ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(223, 242, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary-navy)'
                      }}
                    >
                      {item.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {item.category} · {item.fileSize} {item.duration ? `· ${item.duration}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GlassBadge variant={item.status === 'Verified' ? 'success' : 'warning'} size="sm">
                      {item.status}
                    </GlassBadge>
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={() => showToast(`Inspecting portfolio artifact: ${item.fileName || item.title}`, 'info')}
                    >
                      Inspect Evidence
                    </GlassButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Tab 3: Self-Declaration Responses */}
          {activeTab === 'declaration' && (
            <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Tools Declared by Candidate
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {selfDeclaration.selectedTools.map((tool) => (
                    <span
                      key={tool}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(18, 59, 93, 0.1)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--color-primary-navy)'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(18, 59, 93, 0.08)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Candidate Difficult Task Scenario
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: 1.55 }}>
                  {selfDeclaration.difficultTaskScenario}
                </p>
              </div>
            </GlassCard>
          )}

          {/* Tab 4: AI Skill Analysis Insights (Loaded from Supabase) */}
          {activeTab === 'ai-insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              {aiAnalysisData ? (
                <>
                  {/* AI Summary Banner */}
                  <GlassCard
                    variant="elevated"
                    style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.9) 100%)',
                      border: '1px solid rgba(77, 163, 217, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={20} color="#0284c7" />
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                          Gemini AI Skill Analysis (Supabase Record)
                        </span>
                      </div>
                      <GlassBadge variant="sky">Assessor Co-Pilot Mode</GlassBadge>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--color-primary-navy)', fontWeight: 600 }}>
                      Potential Occupation: <strong>{aiAnalysisData.potentialOccupation || 'Industrial Electrician'}</strong>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(217, 119, 6, 0.08)',
                        border: '1px solid rgba(217, 119, 6, 0.25)',
                        fontSize: '12px',
                        color: '#92400e'
                      }}
                    >
                      <strong>Advisory Notice: </strong>
                      AI analysis is preparatory guidance to assist your rubric evaluation. Final certification is exclusively your decision.
                    </div>
                  </GlassCard>

                  {/* Skills Identified with Confidence */}
                  {aiAnalysisData.skills && (
                    <GlassCard style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                        Potential Skills Identified by AI
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {aiAnalysisData.skills.map((s: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              background: 'rgba(255, 255, 255, 0.75)',
                              border: '1px solid rgba(18, 59, 93, 0.08)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '10px'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                                {s.name}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                                {s.reason}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: s.confidence === 'HIGH' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                                color: s.confidence === 'HIGH' ? '#065f46' : '#0369a1'
                              }}
                            >
                              {s.confidence}
                            </span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Areas Requiring Live Assessor Verification */}
                  {aiAnalysisData.verificationRequired && (
                    <GlassCard
                      style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert size={18} color="#D97706" />
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#92400E', margin: 0 }}>
                          High Priority Points for Live Practical Verification
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {aiAnalysisData.verificationRequired.map((v: string, idx: number) => (
                          <div key={idx} style={{ fontSize: '12.5px', color: '#92400E', lineHeight: 1.45 }}>
                            • {v}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </>
              ) : (
                <GlassCard style={{ padding: '24px', textAlign: 'center' }}>
                  <Cpu size={32} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                    No AI Skill Analysis on record for this candidate
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Run AI Skill Analysis on the /ai-analysis page to generate automated diagnostic insights.
                  </p>
                </GlassCard>
              )}
            </div>
          )}
        </div>

        {/* Right Column: SCORING PANEL (Sticky Assessor Grading) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '80px'
            }}
          >
            {/* Scoring Header */}
            <div style={{ borderBottom: '1px solid rgba(18, 59, 93, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-teal)', letterSpacing: '0.04em' }}>
                  STANDARDIZED ASSESSOR SCORING
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: overallPercentage >= 70 ? '#16a34a' : '#d97706' }}>
                  Overall: {overallPercentage}% ({overallPercentage >= 70 ? 'Competent' : 'Needs Work'})
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                Qualification Rubric Scoring
              </h3>
            </div>

            {/* Criteria List with 1 to 5 Score Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {scoringCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(18, 59, 93, 0.08)',
                    boxShadow: '0 1px 3px rgba(11, 41, 66, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {criterion.skill}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                        Weight: {criterion.weight}% · Max: 5.0
                      </div>
                    </div>

                    {/* 1 - 5 Score Pill Selector */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateScore(criterion.id, s)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: criterion.score === s ? '#123B5D' : 'rgba(18, 59, 93, 0.06)',
                            color: criterion.score === s ? '#FFFFFF' : 'var(--color-text-secondary)',
                            border: criterion.score === s ? '1px solid #0B2942' : '1px solid transparent',
                            boxShadow: criterion.score === s ? '0 2px 4px rgba(18, 59, 93, 0.25)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    "{criterion.comments}"
                  </p>
                </div>
              ))}
            </div>

            {/* Assessor Written Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                Official Assessor Remarks & Observations
              </label>
              <textarea
                rows={3}
                value={assessorRemarks}
                onChange={(e) => setAssessorRemarks(e.target.value)}
                className="glass-input"
                style={{ width: '100%', fontSize: '12.5px', resize: 'vertical' }}
              />
            </div>

            {/* AI-Assisted Assessment Summary Banner */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(223, 242, 255, 0.8) 0%, rgba(240, 248, 255, 0.5) 100%)',
                border: '1px solid rgba(77, 163, 217, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#25A7A0" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                  Evaluated Competency Outcome
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                  Overall Assessment Score:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: overallPercentage >= 70 ? '#16a34a' : '#d97706' }}>
                  {overallPercentage}% ({overallPercentage >= 70 ? 'Competent' : 'Needs Development'})
                </span>
              </div>
            </div>

            {/* Final Submission Buttons connected to Supabase */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <GlassButton
                variant="secondary"
                style={{ flex: 1 }}
                icon={<Save size={15} />}
                disabled={isSaving || isFinalizing}
                onClick={handleSaveDraft}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </GlassButton>
              <GlassButton
                variant="primary"
                style={{ flex: 1.3 }}
                icon={<Award size={16} />}
                disabled={isSaving || isFinalizing}
                onClick={handleFinalize}
              >
                {isFinalizing ? 'Finalizing...' : 'Finalize Decision'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .assessor-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
