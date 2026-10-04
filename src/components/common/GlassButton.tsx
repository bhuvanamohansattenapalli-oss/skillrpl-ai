import React from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'teal' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  style = {},
  ...props
}) => {
  let sizeStyles: React.CSSProperties = {};
  switch (size) {
    case 'sm':
      sizeStyles = {
        padding: '6px 12px',
        fontSize: '12.5px',
        borderRadius: '8px',
        gap: '6px'
      };
      break;
    case 'lg':
      sizeStyles = {
        padding: '12px 24px',
        fontSize: '15px',
        borderRadius: '12px',
        gap: '10px'
      };
      break;
    case 'md':
    default:
      sizeStyles = {
        padding: '9px 18px',
        fontSize: '13.5px',
        borderRadius: '10px',
        gap: '8px'
      };
      break;
  }

  let variantClass = 'btn-primary';
  if (variant === 'secondary') variantClass = 'btn-secondary';
  if (variant === 'teal') variantClass = 'btn-teal';
  if (variant === 'ghost') {
    variantClass = '';
  }
  if (variant === 'danger') {
    variantClass = '';
  }

  const ghostStyles: React.CSSProperties = variant === 'ghost' ? {
    background: 'transparent',
    color: 'var(--color-primary-navy)',
    border: '1px solid transparent',
    boxShadow: 'none'
  } : {};

  const dangerStyles: React.CSSProperties = variant === 'danger' ? {
    background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)',
    color: '#FFFFFF',
    border: '1px solid rgba(185, 28, 28, 0.4)',
    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
  } : {};

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        ...sizeStyles,
        ...ghostStyles,
        ...dangerStyles,
        ...style
      }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  );
};
