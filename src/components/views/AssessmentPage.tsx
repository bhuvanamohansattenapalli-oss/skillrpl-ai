import React from 'react';
import {
  Shield,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  Save
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassProgress } from '../common/GlassProgress';
import { useApp } from '../../context/AppContext';

export const AssessmentPage: React.FC = () => {
  const {
    assessmentTask,
    toggleAssessmentCriterion,
    showToast,
    setIsUploadEvidenceModalOpen,
    setCurrentView
  } = useApp();

  const completedCount = assessmentTask.criteria.filter((c) => c.checked).length;
  const totalCriteria = assessmentTask.criteria.length;
  const percentComplete = Math.round((completedCount / totalCriteria) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Top Header Card */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-teal)', letterSpacing: '0.05em' }}>
              PRACTICAL DEMONSTRATION WORKBOOK
            </span>
            <GlassBadge variant="navy">Task {assessmentTask.taskNumber} of {assessmentTask.totalTasks}</GlassBadge>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
            Trade: {assessmentTask.trade} (Demo Trade)
          </h1>
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {assessmentTask.tradeCode} · Authorized NSQF Standard Checklist
          </div>
        </div>

        {/* Progress Metric */}
        <div style={{ width: '220px' }}>
          <GlassProgress
            value={percentComplete}
            label={`Task Checklist: ${completedCount}/${totalCriteria}`}
            color="teal"
          />
        </div>
      </GlassCard>

      {/* Large Practical Task Card: TASK 03 */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Task Title & Badge */}
        <div style={{ borderBottom: '1px solid rgba(18, 59, 93, 0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(18, 59, 93, 0.2)'
              }}
            >
              TASK 03
            </span>
            <GlassBadge variant="sky">Practical Demonstration</GlassBadge>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)', lineHeight: 1.35 }}>
            {assessmentTask.title}
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '10px', lineHeight: 1.55 }}>
            {assessmentTask.description}
          </p>
        </div>

        {/* Safety Guidelines */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}
        >
          <AlertTriangle size={20} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-warning-text)', margin: 0 }}>
              Mandatory Safety Guidelines (IS 732 Standards)
            </h4>
            <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '12.5px', color: '#78350F', lineHeight: 1.5 }}>
              {assessmentTask.safetyGuidelines.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Assessment Criteria Checklist */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              Assessment Criteria Checklist
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Check each step completed during task execution
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assessmentTask.criteria.map((crit) => (
              <label
                key={crit.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: crit.checked ? 'rgba(223, 242, 255, 0.55)' : 'rgba(255, 255, 255, 0.75)',
                  border: crit.checked ? '1px solid rgba(77, 163, 217, 0.4)' : '1px solid rgba(18, 59, 93, 0.08)',
                  boxShadow: crit.checked ? '0 2px 6px rgba(77, 163, 217, 0.12)' : '0 1px 2px rgba(11, 41, 66, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={crit.checked}
                  onChange={() => toggleAssessmentCriterion(crit.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '2px',
                    accentColor: 'var(--color-secondary-sky)',
                    cursor: 'pointer'
                  }}
                />
                <span
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--color-primary-navy)',
                    fontWeight: crit.checked ? 600 : 500,
                    lineHeight: 1.45
                  }}
                >
                  {crit.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Candidate Practical Notes */}
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(18, 59, 93, 0.08)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Candidate Execution Log & Readings
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {assessmentTask.candidateNotes}
          </p>
        </div>

        {/* PROMINENT ASSESSOR REVIEW NOTICE (Strictly No Artificial "AI Certified" Message) */}
        <div
          style={{
            padding: '18px 22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.9) 0%, rgba(223, 242, 255, 0.7) 100%)',
            border: '1.5px solid rgba(77, 163, 217, 0.4)',
            boxShadow: '0 4px 12px rgba(77, 163, 217, 0.12), inset 0 1px 0 #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid rgba(77, 163, 217, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-navy)',
              boxShadow: '0 2px 6px rgba(11, 41, 66, 0.04)',
              flexShrink: 0
            }}
          >
            <Shield size={22} color="#123B5D" />
          </div>

          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
              Official Assessment Review Notice
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0', lineHeight: 1.45 }}>
              Assessment evidence will be reviewed by an authorized assessor. Decisions on competency credits and NSQF qualification are governed by verified sector evaluators.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(18, 59, 93, 0.08)'
          }}
        >
          <GlassButton
            variant="secondary"
            icon={<UploadCloud size={16} />}
            onClick={() => setIsUploadEvidenceModalOpen(true)}
          >
            Attach Video Evidence for Task 03
          </GlassButton>

          <div style={{ display: 'flex', gap: '10px' }}>
            <GlassButton
              variant="secondary"
              icon={<Save size={16} />}
              onClick={() => showToast('Task 03 checklist progress saved.', 'info')}
            >
              Save Checklist
            </GlassButton>

            <GlassButton
              variant="primary"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              onClick={() => {
                showToast('Task 03 submitted for assessor review!', 'success');
                setCurrentView('results');
              }}
            >
              Submit & View Competency Report
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
