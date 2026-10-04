import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Video,
  FileText,
  Save,
  Check,
  Sparkles
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

  const [activeTab, setActiveTab] = useState<'evidence' | 'declaration' | 'criteria'>('criteria');

  // Calculate weighted total score
  const totalWeight = scoringCriteria.reduce((acc, c) => acc + c.weight, 0);
  const weightedScore = scoringCriteria.reduce(
    (acc, c) => acc + (c.score / c.maxScore) * c.weight,
    0
  );
  const overallPercentage = Math.round((weightedScore / totalWeight) * 100);

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
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Assessor Dashboard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlassBadge variant="navy">Application: {candidate.applicationId}</GlassBadge>
          <GlassBadge variant="teal">NSQF Level {candidate.nsqfLevel}</GlassBadge>
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
                <div style={{ fontSize: '13.5px', color: 'var(--color-primary-navy)', fontWeight: 600, marginTop: '2px' }}>
                  {candidate.trade} ({candidate.yearsOfExperience} Years Experience)
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {candidate.location}, {candidate.state} · Aadhaar: {candidate.aadhaarMasked}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '14px', lineHeight: 1.5 }}>
              {candidate.professionalSummary}
            </p>
          </GlassCard>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'criteria', label: 'Practical Assessment Task 03' },
              { id: 'evidence', label: `Candidate Evidence (${evidenceList.length})` },
              { id: 'declaration', label: 'Self Declaration Responses' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
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
                {tab.label}
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
                      onClick={() => showToast(`Playing video evidence: ${item.fileName}`, 'info')}
                    >
                      Inspect Video
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
                  ASSESSOR SCORING PANEL
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Overall: {overallPercentage}%
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                Competency Assessment
              </h3>
            </div>

            {/* Criteria List with 1 to 5 Score Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {scoringCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(18, 59, 93, 0.08)',
                    boxShadow: '0 1px 3px rgba(11, 41, 66, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                    "{criterion.comments}"
                  </p>
                </div>
              ))}
            </div>

            {/* AI-Assisted Assessment Summary (STRICTLY NOT labeled "AI Certification") */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(223, 242, 255, 0.8) 0%, rgba(240, 248, 255, 0.5) 100%)',
                border: '1px solid rgba(77, 163, 217, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#25A7A0" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary-navy)', letterSpacing: '0.02em' }}>
                  AI-Assisted Assessment Summary
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                  Evaluated Competency Index:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                  {overallPercentage}% (Competent)
                </span>
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Candidate exhibits mastery in 3-phase wiring and safety protocols. Bridge module recommended in diagnostic oscilloscope harmonics before supervisory promotion.
              </p>
            </div>

            {/* Prominent Authorized Assessor Note */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(18, 59, 93, 0.05)',
                border: '1px solid rgba(18, 59, 93, 0.1)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}
            >
              <Shield size={16} color="#123B5D" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '11.5px', color: 'var(--color-primary-navy)', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                Final assessment decision remains with the authorized assessor.
              </p>
            </div>

            {/* Final Submission Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <GlassButton
                variant="secondary"
                style={{ flex: 1 }}
                icon={<Save size={15} />}
                onClick={() => showToast('Assessor score draft saved.', 'info')}
              >
                Save Draft
              </GlassButton>
              <GlassButton
                variant="primary"
                style={{ flex: 1.3 }}
                icon={<Check size={16} />}
                onClick={() => {
                  showToast('Assessment finalized! Competency report generated.', 'success');
                  setCurrentView('results');
                }}
              >
                Finalize Decision
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
