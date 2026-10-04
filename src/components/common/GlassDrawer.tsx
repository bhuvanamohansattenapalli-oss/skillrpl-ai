import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'right' | 'left';
  width?: string;
}

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = '380px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 998,
        display: 'flex',
        justifyContent: side === 'right' ? 'flex-end' : 'flex-start',
        background: 'rgba(11, 41, 66, 0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: width,
          height: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: side === 'right' ? '1px solid rgba(255, 255, 255, 0.9)' : undefined,
          borderRight: side === 'left' ? '1px solid rgba(255, 255, 255, 0.9)' : undefined,
          boxShadow: '0 0 40px rgba(11, 41, 66, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(18, 59, 93, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(18, 59, 93, 0.06)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
