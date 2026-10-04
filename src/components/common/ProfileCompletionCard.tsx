import React from 'react';
import { CheckCircle2, Circle, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassBadge } from './GlassBadge';
import { useApp } from '../../context/AppContext';

export const ProfileCompletionCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const { candidate, experiences, setCurrentView } = useApp();

  const hasBasicInfo = Boolean(candidate.name && candidate.location);
  const hasContactInfo = Boolean(candidate.phone && candidate.email);
  const hasSummary = Boolean(candidate.professionalSummary && candidate.professionalSummary.trim().length > 15);
  const hasExperience = experiences.length > 0;
  const hasSkills = experiences.some((exp) => (exp.skillsGained || []).length > 0);

  const checklistItems = [
    { label: 'Basic Information', completed: hasBasicInfo, hint: 'Name, DOB, Gender, Location' },
    { label: 'Contact Information', completed: hasContactInfo, hint: 'Phone, Email, Contact Preference' },
    { label: 'Professional Summary', completed: hasSummary, hint: 'Work background narrative' },
    { label: 'Work Experience', completed: hasExperience, hint: `${experiences.length} practical role(s) added` },
    { label: 'Skills', completed: hasSkills, hint: 'Self-declared trade competencies' }
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const calculatedPercentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <GlassCard
      variant="elevated"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.85) 100%)',
        border: '1px solid rgba(77, 163, 217, 0.3)',
        boxShadow: '0 8px 30px rgba(18, 59, 93, 0.08), inset 0 1px 0 #FFFFFF',
        borderRadius: '22px',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a62d6' }}>
            RPL Readiness Index
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '2px 0 0 0' }}>
            Profile Completion
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#1a62d6', fontFamily: "var(--font-display, 'Plus Jakarta Sans')" }}>
            {calculatedPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar with Gradient & Beveled Track */}
      <div
        style={{
          width: '100%',
          height: '10px',
          borderRadius: '9999px',
          background: 'rgba(18, 59, 93, 0.08)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          padding: '1.5px'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${calculatedPercentage}%`,
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, #1b62cc 0%, #00d2ff 100%)',
            boxShadow: '0 0 10px rgba(0, 210, 255, 0.5)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>

      {/* Progress Details List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {checklistItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              background: item.completed ? 'rgba(5, 150, 105, 0.06)' : 'rgba(18, 59, 93, 0.03)',
              border: item.completed ? '1px solid rgba(5, 150, 105, 0.15)' : '1px solid rgba(18, 59, 93, 0.06)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.completed ? (
                <CheckCircle2 size={17} color="#059669" style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={17} color="#94a3b8" style={{ flexShrink: 0 }} />
              )}
              <div>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: item.completed ? 700 : 500,
                    color: item.completed ? '#0f2744' : '#64748b'
                  }}
                >
                  {item.label}
                </span>
                <div style={{ fontSize: '11px', color: '#8fa5c5', marginTop: '1px' }}>
                  {item.hint}
                </div>
              </div>
            </div>

            <GlassBadge variant={item.completed ? 'teal' : 'navy'}>
              {item.completed ? 'Complete' : 'Pending'}
            </GlassBadge>
          </div>
        ))}
      </div>

      {/* Tip Banner */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '14px',
          background: 'rgba(26, 98, 214, 0.05)',
          border: '1px solid rgba(26, 98, 214, 0.15)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}
      >
        <Sparkles size={16} color="#1a62d6" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#4d6582', lineHeight: 1.45 }}>
          <strong style={{ color: '#0f2744' }}>RPL Assessment Tip:</strong> Reaching 100% completion unlocks direct candidate fast-tracking for government trade certification.
        </div>
      </div>

      {/* Quick Action Button if experience is pending */}
      {!hasExperience && (
        <button
          onClick={() => setCurrentView('experience')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1b62cc 0%, #0d429a 100%)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(27, 98, 204, 0.3)'
          }}
        >
          <span>Add Work Experience</span>
          <ArrowRight size={14} />
        </button>
      )}
    </GlassCard>
  );
};
