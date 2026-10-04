import React from 'react';
import type { SelectHTMLAttributes } from 'react';

interface OptionItem {
  value: string;
  label: string;
}

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: OptionItem[];
  helperText?: string;
  error?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  options,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary-navy)'
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          className={`glass-input ${className}`}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            paddingRight: '36px',
            cursor: 'pointer'
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--color-primary-navy)',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--color-error)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
};
