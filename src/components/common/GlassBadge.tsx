import React from 'react';
import type { ReactNode } from 'react';

interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'navy' | 'sky' | 'teal' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'navy',
  icon,
  size = 'md',
  className = ''
}) => {
  const sizeStyles: React.CSSProperties = size === 'sm' ? {
    padding: '3px 8px',
    fontSize: '11px',
    gap: '4px'
  } : {
    padding: '4px 10px',
    fontSize: '12px',
    gap: '5px'
  };

  return (
    <span className={`badge badge-${variant} ${className}`} style={{ ...sizeStyles }}>
      {icon && <span style={{ display: 'inline-flex', fontSize: '12px' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
