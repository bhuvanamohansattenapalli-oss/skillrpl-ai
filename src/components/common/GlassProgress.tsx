import React from 'react';

interface GlassProgressProps {
  value: number; // 0 - 100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'sky' | 'teal' | 'success';
  height?: number;
  className?: string;
}

export const GlassProgress: React.FC<GlassProgressProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  height = 8,
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  let gradient = 'linear-gradient(90deg, #123B5D 0%, #4DA3D9 100%)';
  if (color === 'sky') gradient = 'linear-gradient(90deg, #4DA3D9 0%, #6FC1F0 100%)';
  if (color === 'teal') gradient = 'linear-gradient(90deg, #25A7A0 0%, #36D1C9 100%)';
  if (color === 'success') gradient = 'linear-gradient(90deg, #059669 0%, #10B981 100%)';

  return (
    <div className={className} style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '12.5px',
            fontWeight: 600
          }}
        >
          {label && <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>}
          {showPercentage && (
            <span style={{ color: 'var(--color-primary-navy)', fontFamily: 'var(--font-display)' }}>
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'rgba(18, 59, 93, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(11, 41, 66, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            background: gradient,
            borderRadius: '999px',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 1px 3px rgba(18, 59, 93, 0.25)',
            position: 'relative'
          }}
        >
          {/* Subtle glossy sheen highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: '999px'
            }}
          />
        </div>
      </div>
    </div>
  );
};
