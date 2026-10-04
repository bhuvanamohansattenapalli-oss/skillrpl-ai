import React from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  helperText,
  error,
  multiline = false,
  rows = 3,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary-navy)',
            letterSpacing: '0.01em'
          }}
        >
          {label}
        </label>
      )}

      {multiline ? (
        <textarea
          id={inputId}
          rows={rows}
          className={`glass-input ${error ? 'border-error' : ''} ${className}`}
          style={{
            resize: 'vertical',
            minHeight: '80px',
            borderColor: error ? 'var(--color-error)' : undefined
          }}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={`glass-input ${error ? 'border-error' : ''} ${className}`}
          style={{
            borderColor: error ? 'var(--color-error)' : undefined
          }}
          {...props}
        />
      )}

      {error ? (
        <span style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
