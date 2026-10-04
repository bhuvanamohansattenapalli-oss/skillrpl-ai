import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div
      role="tablist"
      className={`glass-tabs-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px',
        background: 'rgba(18, 59, 93, 0.06)',
        backdropFilter: 'blur(8px)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'inset 0 1px 2px rgba(11, 41, 66, 0.05)',
        gap: '4px',
        maxWidth: '100%',
        overflowX: 'auto'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
              background: isActive ? '#FFFFFF' : 'transparent',
              boxShadow: isActive
                ? '0 1px 3px rgba(11, 41, 66, 0.08), 0 3px 8px rgba(11, 41, 66, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)'
                : 'none',
              border: isActive ? '1px solid rgba(18, 59, 93, 0.08)' : '1px solid transparent',
              transition: 'all 0.16s ease',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: isActive ? 'var(--color-secondary-soft)' : 'rgba(18, 59, 93, 0.08)',
                  color: isActive ? 'var(--color-primary-navy)' : 'var(--color-text-muted)',
                  fontWeight: 700
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
