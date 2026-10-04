import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: 'default' | 'elevated' | 'interactive' | 'accent' | 'flat';
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  style = {},
  variant = 'default',
  onClick,
  id
}) => {
  let variantStyles: CSSProperties = {};

  switch (variant) {
    case 'elevated':
      variantStyles = {
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 6px rgba(11, 41, 66, 0.02), 0 10px 24px rgba(11, 41, 66, 0.05), inset 0 1px 1px rgba(255, 255, 255, 1)'
      };
      break;
    case 'interactive':
      variantStyles = {
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 2px 5px rgba(11, 41, 66, 0.03), 0 8px 20px rgba(11, 41, 66, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        cursor: 'pointer'
      };
      break;
    case 'accent':
      variantStyles = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(223, 242, 255, 0.45) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(77, 163, 217, 0.3)',
        boxShadow: '0 4px 16px rgba(77, 163, 217, 0.1), inset 0 1px 1px rgba(255, 255, 255, 1)'
      };
      break;
    case 'flat':
      variantStyles = {
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(18, 59, 93, 0.07)',
        boxShadow: '0 1px 3px rgba(11, 41, 66, 0.02)'
      };
      break;
    case 'default':
    default:
      variantStyles = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.75)',
        boxShadow: '0 2px 4px rgba(11, 41, 66, 0.02), 0 8px 24px rgba(18, 59, 93, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
      };
      break;
  }

  return (
    <div
      id={id}
      onClick={onClick}
      className={`glass-card ${variant === 'interactive' ? 'glass-panel-interactive' : ''} ${className}`}
      style={{
        borderRadius: '20px',
        padding: '24px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...variantStyles,
        ...style
      }}
    >
      {children}
    </div>
  );
};
