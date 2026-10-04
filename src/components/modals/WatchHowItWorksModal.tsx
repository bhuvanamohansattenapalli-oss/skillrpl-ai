import React from 'react';
import { X, Play, CheckCircle2, Award, Briefcase, UserCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WatchHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchHowItWorksModal: React.FC<WatchHowItWorksModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentView } = useApp();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(8, 20, 40, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 24px 60px rgba(7, 25, 55, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(18, 59, 93, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FD 100%)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e64db', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SkillRPL AI Walkthrough
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2744', marginTop: '2px' }}>
              How Recognition of Prior Learning Works
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(18, 59, 93, 0.06)',
              color: '#486581',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video / Interactive Player Banner */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              height: '240px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #091a32 0%, #102e56 50%, #0b2242 100%)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 24px rgba(11, 41, 66, 0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: 'absolute',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, transparent 70%)',
                filter: 'blur(30px)'
              }}
            />

            {/* Play Button */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e6beb 0%, #0d4ab8 100%)',
                boxShadow: '0 0 25px rgba(30, 107, 235, 0.7), inset 0 1px 1px #ffffff',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <Play size={26} color="#ffffff" fill="#ffffff" style={{ marginLeft: '4px' }} />
            </div>

            <div style={{ fontWeight: 700, fontSize: '16px' }}>Interactive RPL Guide (2 mins)</div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
              From informal work experience to government-recognized NSQF certification
            </div>
          </div>

          {/* 4 Steps Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <UserCheck size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f2744' }}>1. Build Profile</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Enter your work history, tools used, and key practical tasks from your daily craft.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f2744' }}>2. AI Assessment</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Demonstrate skills through scenario-based evaluations and photo/video evidence.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={18} color="#7c3aed" />
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f2744' }}>3. Get Certified</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Certified assessors review your portfolio and award recognized NSQF credentials.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Briefcase size={18} color="#ea580c" />
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f2744' }}>4. Career Growth</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Access verified employer opportunities, wage premiums, and government skill credit.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(18, 59, 93, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            background: '#F8FAFC'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '999px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13.5px',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              setCurrentView('assessment');
            }}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: 'linear-gradient(180deg, #1e64db 0%, #0d4ab8 100%)',
              boxShadow: '0 4px 14px rgba(18, 90, 215, 0.4)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>Start Assessment</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
