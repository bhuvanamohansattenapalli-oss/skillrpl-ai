import React from 'react';
import type { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface GlassStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trendText?: string;
  trendPositive?: boolean;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trendText,
  trendPositive,
  accentColor = '#123B5D',
  onClick,
  className = ''
}) => {
  return (
    <GlassCard
      variant={onClick ? 'interactive' : 'default'}
      onClick={onClick}
      className={`stat-card ${className}`}
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '136px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {label}
          </span>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary-navy)',
              marginTop: '4px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            {value}
          </div>
        </div>

        {/* Tactile Icon Well */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(223, 242, 255, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 6px rgba(18, 59, 93, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0
          }}
        >
          {icon}
        </div>
      </div>

      {(subtext || trendText) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(18, 59, 93, 0.06)',
            fontSize: '12px'
          }}
        >
          {trendText && (
            <span
              style={{
                fontWeight: 600,
                color: trendPositive ? 'var(--color-success)' : 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              {trendText}
            </span>
          )}
          {subtext && <span style={{ color: 'var(--color-text-muted)' }}>{subtext}</span>}
        </div>
      )}
    </GlassCard>
  );
};
