import React from 'react';
import {
  Home,
  User,
  ClipboardCheck,
  FileText,
  Award,
  Briefcase,
  BookOpen,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IndiaMapGraphic } from '../common/IndiaMapGraphic';
import type { AppView } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    userRole,
    setUserRole,
    setIsJobModalOpen,
    setIsLearningModalOpen,
    setIsHelpModalOpen
  } = useApp();

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const isItemActive = (key: string) => {
    if (key === 'dashboard') return currentView === 'dashboard';
    if (key === 'profile') return currentView === 'profile';
    if (key === 'experience') return currentView === 'experience' || currentView === 'experience-detail';
    if (key === 'ai-assistant') return currentView === 'ai-assistant';
    if (key === 'skill-assessment') return currentView === 'assessment';
    if (key === 'my-assessments') return currentView === 'declaration' || currentView === 'evidence';
    if (key === 'certification') return currentView === 'results';
    return false;
  };

  const navItemStyle = (active: boolean): React.CSSProperties => {
    if (active) {
      return {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#FFFFFF',
        background: 'linear-gradient(180deg, #1b62cc 0%, #0d429a 100%)',
        border: '1px solid rgba(160, 210, 255, 0.35)',
        boxShadow: '0 4px 18px rgba(24, 100, 235, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.55)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '9px 16px',
      borderRadius: '12px',
      fontSize: '13.5px',
      fontWeight: 500,
      color: '#9cb3cf',
      background: 'transparent',
      border: '1px solid transparent',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.16s ease'
    };
  };

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: '260px',
        position: 'fixed',
        left: '12px',
        top: '12px',
        bottom: '12px',
        zIndex: 50,
        background: 'linear-gradient(180deg, #091326 0%, #0d1e3d 40%, #071224 100%)',
        borderRadius: '26px',
        border: '1px solid rgba(80, 160, 255, 0.18)',
        boxShadow: '0 12px 40px rgba(5, 15, 36, 0.45), 0 0 20px rgba(0, 160, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px 16px 14px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div
        onClick={() => navigateTo('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          padding: '4px 6px 18px 6px',
          cursor: 'pointer'
        }}
      >
        {/* Glowing Rocket / Swirl Logo Emblem */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(13, 66, 154, 0.3) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.35)',
            boxShadow: '0 0 14px rgba(0, 212, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rocketGlow" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="60%" stopColor="#0088ff" />
                <stop offset="100%" stopColor="#0044ff" />
              </linearGradient>
            </defs>
            <path
              d="M16 3C16 3 24 6 25 15C25 19 23 23 20 25L17 22L19 19L16 17L13 19L15 22L12 25C9 23 7 19 7 15C8 6 16 3 16 3Z"
              fill="url(#rocketGlow)"
            />
            <circle cx="16" cy="12" r="3" fill="#ffffff" />
            <path d="M16 25L16 29M12 27L10 29M20 27L22 29" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <div
            style={{
              fontSize: '18.5px',
              fontWeight: 800,
              fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            SkillRPL AI
          </div>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              color: '#8fa5c5',
              letterSpacing: '0.01em',
              marginTop: '1px'
            }}
          >
            Recognizing Skills, Empowering India
          </div>
        </div>
      </div>

      {/* Navigation List - Matching Photo Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginTop: '4px' }}>
        {/* 1. Dashboard (Active royal blue glossy pill) */}
        <button
          onClick={() => navigateTo('dashboard')}
          style={navItemStyle(isItemActive('dashboard'))}
          className="sidebar-btn"
        >
          <Home size={18} color={isItemActive('dashboard') ? '#FFFFFF' : '#9cb3cf'} />
          <span>Dashboard</span>
        </button>

        {/* 2. My Profile */}
        <button
          onClick={() => navigateTo('profile')}
          style={navItemStyle(isItemActive('profile'))}
          className="sidebar-btn"
        >
          <User size={18} color={isItemActive('profile') ? '#FFFFFF' : '#9cb3cf'} />
          <span>My Profile</span>
        </button>

        {/* 2.1 My Experience */}
        <button
          onClick={() => navigateTo('experience')}
          style={navItemStyle(isItemActive('experience'))}
          className="sidebar-btn"
        >
          <Briefcase size={18} color={isItemActive('experience') ? '#FFFFFF' : '#9cb3cf'} />
          <span>My Experience</span>
        </button>

        {/* 2.2 RPL AI Assistant */}
        <button
          onClick={() => navigateTo('ai-assistant')}
          style={navItemStyle(isItemActive('ai-assistant'))}
          className="sidebar-btn"
        >
          <Sparkles size={18} color={isItemActive('ai-assistant') ? '#FFFFFF' : '#38bdf8'} />
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>AI Assistant</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: isItemActive('ai-assistant') ? '#FFFFFF' : '#25A7A0',
                background: isItemActive('ai-assistant') ? 'rgba(255, 255, 255, 0.2)' : 'rgba(37, 167, 160, 0.18)',
                border: isItemActive('ai-assistant') ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(37, 167, 160, 0.35)',
                padding: '1px 6px',
                borderRadius: '6px'
              }}
            >
              RPL AI
            </span>
          </span>
        </button>

        {/* 3. Skill Assessment */}
        <button
          onClick={() => navigateTo('assessment')}
          style={navItemStyle(isItemActive('skill-assessment'))}
          className="sidebar-btn"
        >
          <ClipboardCheck size={18} color={isItemActive('skill-assessment') ? '#FFFFFF' : '#9cb3cf'} />
          <span>Skill Assessment</span>
        </button>

        {/* 4. My Assessments */}
        <button
          onClick={() => navigateTo('declaration')}
          style={navItemStyle(isItemActive('my-assessments'))}
          className="sidebar-btn"
        >
          <FileText size={18} color={isItemActive('my-assessments') ? '#FFFFFF' : '#9cb3cf'} />
          <span>My Assessments</span>
        </button>

        {/* 5. Certification */}
        <button
          onClick={() => navigateTo('results')}
          style={navItemStyle(isItemActive('certification'))}
          className="sidebar-btn"
        >
          <Award size={18} color={isItemActive('certification') ? '#FFFFFF' : '#9cb3cf'} />
          <span>Certification</span>
        </button>

        {/* 6. Job Opportunities */}
        <button
          onClick={() => setIsJobModalOpen(true)}
          style={navItemStyle(false)}
          className="sidebar-btn"
        >
          <Briefcase size={18} color="#9cb3cf" />
          <span>Job Opportunities</span>
        </button>

        {/* 7. Learning Resources */}
        <button
          onClick={() => setIsLearningModalOpen(true)}
          style={navItemStyle(false)}
          className="sidebar-btn"
        >
          <BookOpen size={18} color="#9cb3cf" />
          <span>Learning Resources</span>
        </button>

        {/* 8. Analytics */}
        <button
          onClick={() => navigateTo('results')}
          style={navItemStyle(false)}
          className="sidebar-btn"
        >
          <BarChart3 size={18} color="#9cb3cf" />
          <span>Analytics</span>
        </button>

        {/* 9. Help & Support */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          style={navItemStyle(false)}
          className="sidebar-btn"
        >
          <HelpCircle size={18} color="#9cb3cf" />
          <span>Help & Support</span>
        </button>

        {/* Present Options: Assessor Portal & Settings Switch (Preserved Cleanly) */}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => {
              const nextRole = userRole === 'worker' ? 'assessor' : 'worker';
              setUserRole(nextRole);
              navigateTo(nextRole === 'worker' ? 'dashboard' : 'assessor-dashboard');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              width: '100%',
              cursor: 'pointer',
              marginBottom: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={15} />
              <span>{userRole === 'worker' ? 'Assessor View' : 'Worker View'}</span>
            </div>
            <ChevronRight size={13} />
          </button>

          <button
            onClick={() => navigateTo('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#8fa5c5',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <Settings size={15} color="#8fa5c5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: India Map with Skilled India Stronger India and Tricolor */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <IndiaMapGraphic width={150} height={170} />
      </div>

      <style>{`
        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #FFFFFF !important;
        }
      `}</style>
    </aside>
  );
};
