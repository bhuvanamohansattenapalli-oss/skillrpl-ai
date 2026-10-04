import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  FolderOpen,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AppView } from '../../types';

export const MobileNavigation: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={20} /> },
    { id: 'declaration', label: 'Declaration', icon: <FileCheck size={20} /> },
    { id: 'evidence', label: 'Evidence', icon: <FolderOpen size={20} /> },
    { id: 'results', label: 'Results', icon: <Award size={20} /> }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(18, 59, 93, 0.1)',
        boxShadow: '0 -2px 12px rgba(11, 41, 66, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 45,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 12px',
              borderRadius: '8px',
              color: isActive ? 'var(--color-primary-navy)' : 'var(--color-text-muted)',
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {item.icon}
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary-navy)' : 'var(--color-text-muted)'
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '0px',
                  width: '24px',
                  height: '3px',
                  borderRadius: '999px',
                  background: 'var(--color-secondary-sky)'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
