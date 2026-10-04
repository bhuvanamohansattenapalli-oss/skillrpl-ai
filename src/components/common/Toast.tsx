import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  let icon = <CheckCircle2 size={18} color="#059669" />;
  let borderColor = '#A7F3D0';
  let bgColor = 'rgba(255, 255, 255, 0.95)';

  if (toast.type === 'error') {
    icon = <AlertCircle size={18} color="#DC2626" />;
    borderColor = '#FECACA';
  } else if (toast.type === 'warning') {
    icon = <AlertCircle size={18} color="#D97706" />;
    borderColor = '#FDE68A';
  } else if (toast.type === 'info') {
    icon = <Info size={18} color="#123B5D" />;
    borderColor = '#DFF2FF';
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        background: bgColor,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '14px',
        boxShadow: '0 8px 24px rgba(11, 41, 66, 0.12), inset 0 1px 0 #FFFFFF',
        animation: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '400px'
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--color-primary-navy)', margin: 0 }}>
        {toast.text}
      </p>
      <button
        onClick={hideToast}
        aria-label="Dismiss notification"
        style={{
          marginLeft: 'auto',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
