import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassProgress } from '../common/GlassProgress';
import { useApp } from '../../context/AppContext';

export const ResultPage: React.FC = () => {
  const { candidate, skillResults, showToast, setCurrentView } = useApp();

  const getCompetencyBadge = (level: string) => {
    switch (level) {
      case 'Strong':
        return <GlassBadge variant="success" icon={<CheckCircle2 size={12} />}>Strong</GlassBadge>;
      case 'Competent':
        return <GlassBadge variant="sky" icon={<CheckCircle2 size={12} />}>Competent</GlassBadge>;
      case 'Needs Development':
      default:
        return <GlassBadge variant="warning" icon={<AlertTriangle size={12} />}>Needs Development</GlassBadge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} className="animate-fade-in">
      {/* Top Header Card */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #123B5D 0%, #25A7A0 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(18, 59, 93, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              flexShrink: 0
            }}
          >
            <Award size={32} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                Competency Assessment Report
              </h1>
              <GlassBadge variant="success">Assessor Approved</GlassBadge>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-primary-navy)', fontWeight: 600, marginTop: '2px' }}>
              Candidate: {candidate.name} · Trade: {candidate.trade} (NSQF Level {candidate.nsqfLevel})
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Application ID: {candidate.applicationId} · Authorized Sector Skill Council Assessment
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <GlassButton
            variant="primary"
            icon={<Award size={16} />}
            onClick={() => setCurrentView('certificate')}
          >
            View Official Certificate
          </GlassButton>
        </div>
      </GlassCard>

      {/* Evaluated Skill Cards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
            Trade Skill Competency Breakdown
          </h2>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Evaluated across 5 core industrial competencies
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {skillResults.map((item) => (
            <GlassCard
              key={item.id}
              variant="default"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)', lineHeight: 1.35 }}>
                    {item.skill}
                  </h3>
                  {getCompetencyBadge(item.competencyLevel)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  <span>Evidence: <strong>{item.evidenceCount} Artifacts</strong></span>
                  <span>•</span>
                  <span>Score: <strong>{item.assessmentScore}%</strong></span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '10px', lineHeight: 1.45 }}>
                  {item.assessorNotes}
                </p>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(18, 59, 93, 0.06)' }}>
                <GlassProgress
                  value={item.assessmentScore}
                  showPercentage={false}
                  height={6}
                  color={item.competencyLevel === 'Strong' ? 'success' : item.competencyLevel === 'Competent' ? 'sky' : 'primary'}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* SKILL GAP SECTION: Visual Comparison */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#123B5D" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                Skill Gap Analysis: Current vs Required Competency
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Comparison of candidate demonstrated scores against the National Occupational Standards (NOS) baseline for NSQF Level 5.
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#123B5D' }} />
              <span style={{ color: 'var(--color-primary-navy)' }}>Current Competency</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(77, 163, 217, 0.4)', border: '1px dashed #4DA3D9' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>Required NSQF Baseline</span>
            </div>
          </div>
        </div>

        {/* Skill Gap Comparison Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {skillResults.map((sr) => {
            const hasGap = sr.currentLevelVal < sr.requiredLevelVal;
            const gapDiff = sr.requiredLevelVal - sr.currentLevelVal;

            return (
              <div key={sr.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary-navy)' }}>{sr.skill}</span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-primary-navy)' }}>
                      Current: <strong>{sr.currentLevelVal}%</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Required: <strong>{sr.requiredLevelVal}%</strong>
                    </span>
                    {hasGap ? (
                      <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>
                        (-{gapDiff}% gap)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                        (Standard Met)
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual Overlaid Progress Bar */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '14px',
                    background: 'rgba(18, 59, 93, 0.06)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 2px rgba(11, 41, 66, 0.08)'
                  }}
                >
                  {/* Required Target Marker / Background Fill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${sr.requiredLevelVal}%`,
                      height: '100%',
                      background: 'rgba(77, 163, 217, 0.25)',
                      borderRight: '2px solid #4DA3D9',
                      zIndex: 1
                    }}
                  />

                  {/* Candidate Current Score */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${sr.currentLevelVal}%`,
                      height: '100%',
                      background: hasGap
                        ? 'linear-gradient(90deg, #123B5D 0%, #D97706 100%)'
                        : 'linear-gradient(90deg, #123B5D 0%, #059669 100%)',
                      borderRadius: '999px',
                      zIndex: 2,
                      boxShadow: '0 1px 3px rgba(18, 59, 93, 0.25)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Recommended Next Steps */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--color-accent-teal-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-teal)'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
              Recommended Next Steps
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
              Assessor pathway guidelines for candidate formal qualification
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Step 1: Bridge Module */}
          <div
            style={{
              padding: '18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(18, 59, 93, 0.08)',
              boxShadow: '0 2px 6px rgba(11, 41, 66, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <BookOpen size={16} color="#D97706" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning-text)', textTransform: 'uppercase' }}>
                  Bridge Training Recommended
                </span>
              </div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                Fault Diagnosis & Harmonics (8 Hours)
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                Short booster module to close the 13% gap in digital oscilloscope frequency analysis.
              </p>
            </div>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => showToast('Enrolled in 8-hour bridge workshop slot.', 'success')}
            >
              Enroll in Bridge Module
            </GlassButton>
          </div>

          {/* Step 2: Assessment Confirmation */}
          <div
            style={{
              padding: '18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(18, 59, 93, 0.08)',
              boxShadow: '0 2px 6px rgba(11, 41, 66, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Calendar size={16} color="#123B5D" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-navy)', textTransform: 'uppercase' }}>
                  Practical Verification
                </span>
              </div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                Sector Skill Council Review Slot
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                Lead assessor Dr. A. K. Sharma will conduct the final 30-minute viva interview on Oct 07, 2026.
              </p>
            </div>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => showToast('Slot verified for Oct 07, 2026.', 'info')}
            >
              Confirm Interview Slot
            </GlassButton>
          </div>

          {/* Step 3: Certificate Issuance */}
          <div
            style={{
              padding: '18px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(223, 242, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.35)',
              boxShadow: '0 2px 8px rgba(77, 163, 217, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={16} color="#059669" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                  National Credential
                </span>
              </div>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                NSQF Level 5 Qualification Award
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                Government QR-verified digital credential recognized by state electricity boards & heavy industries.
              </p>
            </div>
            <GlassButton
              size="sm"
              variant="teal"
              icon={<Award size={14} />}
              onClick={() => setCurrentView('certificate')}
            >
              View Official Certificate
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
