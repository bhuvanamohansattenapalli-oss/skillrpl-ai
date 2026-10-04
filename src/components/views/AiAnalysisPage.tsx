import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const AiAnalysisPage: React.FC = () => {
  const { setCurrentView, candidate, experiences, evidenceList } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Back button & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => setCurrentView('ai-assistant')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--color-primary-navy)',
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(18, 59, 93, 0.15)',
            padding: '6px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(11, 41, 66, 0.04)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to RPL AI Assistant</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlassBadge variant="teal" icon={<Sparkles size={12} />}>
            AI Feature Pipeline
          </GlassBadge>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(217, 119, 6, 0.12)', color: '#B45309' }}>
            UPCOMING PHASE PREVIEW
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px 24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.8) 100%)',
          border: '1px solid rgba(77, 163, 217, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              boxShadow: '0 4px 14px rgba(18, 59, 93, 0.25)'
            }}
          >
            <Cpu size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
              AI Skill Analysis & Mapping
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
              Automated synthesis connecting your work history, portfolio evidence, and NSQF Level 5 competencies.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(37, 167, 160, 0.08)',
            border: '1px solid rgba(37, 167, 160, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12.5px',
            color: 'var(--color-primary-navy)'
          }}
        >
          <ShieldCheck size={18} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Assessment Trust Notice: </strong>
            AI analysis provides supportive recommendations. Final competency and certification decisions are made exclusively through authorized assessor reviews.
          </span>
        </div>
      </GlassCard>

      {/* Synthesis Pipeline Preview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <GlassCard
          variant="default"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="var(--color-secondary-sky)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
              1. Candidate Input Synthesis
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(18, 59, 93, 0.06)', paddingBottom: '6px' }}>
              <span>Target Trade:</span>
              <strong style={{ color: 'var(--color-primary-navy)' }}>{candidate.trade}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(18, 59, 93, 0.06)', paddingBottom: '6px' }}>
              <span>Logged Experience:</span>
              <strong style={{ color: 'var(--color-primary-navy)' }}>{experiences.length} Work Records (8.5 yrs)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
              <span>Uploaded Artifacts:</span>
              <strong style={{ color: 'var(--color-accent-teal)' }}>{evidenceList.length} Evidence Items</strong>
            </div>
          </div>
        </GlassCard>

        <GlassCard
          variant="default"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--color-accent-teal)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
              2. NSQF Standard Alignment
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Once Gemini is connected, the engine will cross-reference your self-declaration ratings and evidence tags against qualification pack <strong>ELE/Q0105 (Industrial Electrician)</strong>.
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Safety & LOTO', '3-Phase Motor Wiring', 'Panel Assembly', 'Megger Testing'].map((item) => (
              <span key={item} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(77, 163, 217, 0.15)', color: 'var(--color-primary-navy)' }}>
                {item}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard
          variant="default"
          style={{
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck size={20} color="#D97706" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
              3. Assessor Portfolio Dossier
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Generates a concise dossier highlighting demonstrated competencies and areas requiring live practical observation during the on-site assessment.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <Clock size={14} />
            <span>Ready for Assessor Review integration</span>
          </div>
        </GlassCard>
      </div>

      {/* Navigation Call-to-actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        <GlassButton
          variant="primary"
          icon={<Sparkles size={16} />}
          onClick={() => setCurrentView('ai-assistant')}
        >
          Open RPL AI Assistant
        </GlassButton>

        <GlassButton
          variant="secondary"
          icon={<ExternalLink size={16} />}
          onClick={() => setCurrentView('evidence')}
        >
          View Evidence Repository
        </GlassButton>
      </div>
    </div>
  );
};
