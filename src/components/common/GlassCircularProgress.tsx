import React from 'react';

interface GlassCircularProgressProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const GlassCircularProgress: React.FC<GlassCircularProgressProps> = ({
  value,
  size = 140,
  strokeWidth = 10,
  label = 'Profile Completion',
  sublabel = 'Assessment Ready'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Subtle glass disc backdrop */}
        <div
          style={{
            position: 'absolute',
            width: `${size - strokeWidth * 2 - 4}px`,
            height: `${size - strokeWidth * 2 - 4}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(223, 242, 255, 0.45))',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 1.5px 3px rgba(11, 41, 66, 0.06), 0 2px 8px rgba(77, 163, 217, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.9)'
          }}
        />

        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="liquidProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#123B5D" />
              <stop offset="50%" stopColor="#25A7A0" />
              <stop offset="100%" stopColor="#4DA3D9" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4DA3D9" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(18, 59, 93, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#liquidProgressGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#softGlow)"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary-navy)',
              lineHeight: 1
            }}
          >
            {clampedValue}%
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '3px'
            }}
          >
            Completed
          </span>
        </div>
      </div>

      {label && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
