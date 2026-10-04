import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
  Info
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassBadge } from './GlassBadge';
import { GlassButton } from './GlassButton';
import type { CandidateMatchResult } from '../../lib/mapping/qualification-engine';

interface QualificationMatchCardProps {
  match: CandidateMatchResult;
  isSelected?: boolean;
  onSelect?: () => void;
  isAssessorMode?: boolean;
  onAssessorAccept?: () => void;
  onAssessorReject?: () => void;
  onAssessorModify?: () => void;
  onAssessorFlag?: () => void;
  status?: string;
}

export const QualificationMatchCard: React.FC<QualificationMatchCardProps> = ({
  match,
  isSelected,
  onSelect,
  isAssessorMode,
  onAssessorAccept,
  onAssessorReject,
  onAssessorModify,
  onAssessorFlag,
  status
}) => {
  const [showUnits, setShowUnits] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 65) return '#0284c7';
    return '#d97706';
  };

  const scoreColor = getScoreColor(match.systemMatchScore);

  return (
    <GlassCard
      style={{
        borderRadius: '20px',
        border: isSelected
          ? '2px solid var(--color-secondary-sky)'
          : '1px solid rgba(18, 59, 93, 0.15)',
        boxShadow: isSelected
          ? '0 12px 32px rgba(2, 132, 199, 0.15)'
          : '0 4px 18px rgba(11, 41, 66, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        background: isSelected
          ? 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)'
          : 'rgba(255, 255, 255, 0.85)'
      }}
    >
      {/* Top Banner: Rank & Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '16px 20px',
          background: isSelected
            ? 'rgba(2, 132, 199, 0.08)'
            : 'rgba(18, 59, 93, 0.03)',
          borderBottom: '1px solid rgba(18, 59, 93, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-primary-navy)',
              letterSpacing: '-0.01em'
            }}
          >
            {match.matchRank}. {match.rankLabel} — {match.systemMatchScore}%
          </span>
          <GlassBadge variant={match.confidenceLabel === 'High' ? 'teal' : 'sky'}>
            {match.confidenceLabel} Match
          </GlassBadge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Official Qualification Data Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#065f46'
            }}
            title="Sourced from National Qualifications Register (NQR)"
          >
            <ShieldCheck size={12} />
            <span>Official NCVET/NQR Data</span>
          </span>

          {/* AI Suggested Match Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1'
            }}
          >
            <Sparkles size={12} />
            <span>AI Suggested Match</span>
          </span>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Qualification Core Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {match.sector} • {match.awardingBody}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '0 0 6px 0' }}>
              {match.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '680px' }}>
              {match.qualification.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#ffffff',
                background: 'var(--color-primary-navy)',
                padding: '4px 10px',
                borderRadius: '8px'
              }}
            >
              NSQF Level {match.nsqfLevel}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '6px'
              }}
            >
              QP: {match.qpCode}
            </span>
          </div>
        </div>

        {/* System Match Score Meter */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(18, 59, 93, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              System Match Score
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: scoreColor }}>
              {match.systemMatchScore}%
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${match.systemMatchScore}%`,
                height: '100%',
                background: `linear-gradient(90deg, #38bdf8 0%, ${scoreColor} 100%)`,
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
            <Info size={13} style={{ flexShrink: 0 }} />
            <span>This is an AI-assisted recommendation for assessor review.</span>
          </div>
        </div>

        {/* Why this matches vs Potential Gaps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Matched Competencies */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '12.5px' }}>
              <CheckCircle2 size={15} />
              <span>MATCHED COMPETENCIES</span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#14532d', lineHeight: 1.5 }}>
              {match.whyMatches.matchedSkills.map((sk, i) => (
                <li key={i}>{sk}</li>
              ))}
              {match.whyMatches.matchedTools.length > 0 && (
                <li>Core Tools: {match.whyMatches.matchedTools.slice(0, 3).join(', ')}</li>
              )}
              {match.whyMatches.experienceRelevance && (
                <li>{match.whyMatches.experienceRelevance}</li>
              )}
            </ul>
          </div>

          {/* Potential Gaps & Evidence Required */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#fffbeb',
              border: '1px solid #fef08a',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#854d0e', fontWeight: 700, fontSize: '12.5px' }}>
              <AlertTriangle size={15} />
              <span>POTENTIAL GAPS & EVIDENCE REQUIRED</span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#713f12', lineHeight: 1.5 }}>
              {match.potentialGaps.map((gap, i) => (
                <li key={i}>⚠ {gap}</li>
              ))}
              {match.evidenceRequired.slice(0, 2).map((ev, i) => (
                <li key={i}>📋 {ev}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Collapsible NOS Units Accordion */}
        <div style={{ borderTop: '1px solid rgba(18, 59, 93, 0.08)', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={() => setShowUnits(!showUnits)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-navy)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <Layers size={14} />
            <span>
              {showUnits ? 'Hide' : 'View'} Official National Occupational Standards (NOS) ({match.qualification.units.length} Units)
            </span>
            {showUnits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showUnits && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {match.qualification.units.map((unit) => (
                <div
                  key={unit.code}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <strong style={{ color: 'var(--color-primary-navy)' }}>
                      {unit.code}: {unit.title}
                    </strong>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: unit.isMandatory ? '#059669' : '#64748b' }}>
                      {unit.isMandatory ? 'Mandatory NOS' : 'Elective'}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                    {unit.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(18, 59, 93, 0.08)', paddingTop: '14px' }}>
          <a
            href={match.qualification.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--color-secondary-sky)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <span>Verify on NQR Portal</span>
            <ExternalLink size={12} />
          </a>

          {/* Assessor Review Mode Controls */}
          {isAssessorMode ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {status && (
                <GlassBadge variant={status === 'ACCEPTED' ? 'teal' : status === 'REJECTED' ? 'error' : 'navy'}>
                  Status: {status}
                </GlassBadge>
              )}
              {onAssessorAccept && (
                <GlassButton variant="primary" size="sm" onClick={onAssessorAccept}>
                  <Check size={14} />
                  <span>Accept Mapping</span>
                </GlassButton>
              )}
              {onAssessorModify && (
                <GlassButton variant="secondary" size="sm" onClick={onAssessorModify}>
                  <span>Change Qualification</span>
                </GlassButton>
              )}
              {onAssessorReject && (
                <GlassButton variant="danger" size="sm" onClick={onAssessorReject}>
                  <span>Reject</span>
                </GlassButton>
              )}
              {onAssessorFlag && (
                <GlassButton variant="secondary" size="sm" onClick={onAssessorFlag}>
                  <span>Flag</span>
                </GlassButton>
              )}
            </div>
          ) : (
            /* Candidate Worker Mode Controls */
            onSelect && (
              <GlassButton
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={onSelect}
              >
                {isSelected ? (
                  <>
                    <Check size={14} />
                    <span>Selected for RPL Assessment</span>
                  </>
                ) : (
                  <span>Select This Qualification Pack</span>
                )}
              </GlassButton>
            )
          )}
        </div>
      </div>
    </GlassCard>
  );
};
