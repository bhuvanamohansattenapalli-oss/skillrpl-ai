import React from 'react';
import { X, PlayCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LearningResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningResourcesModal: React.FC<LearningResourcesModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();

  if (!isOpen) return null;

  const resources = [
    {
      id: 'r1',
      title: 'Indian Electricity Rules & Safety Protocols 2024',
      provider: 'Central Electricity Authority (CEA)',
      duration: '45 mins • 4 Modules',
      badge: 'Core Safety'
    },
    {
      id: 'r2',
      title: 'Schematic Blueprint & Wiring Diagram Interpretation',
      provider: 'National Skill Development Corporation (NSDC)',
      duration: '1 hr 15 mins • Practical Video',
      badge: 'Technical'
    },
    {
      id: 'r3',
      title: 'Multimeter & Megger Insulation Tester Masterclass',
      provider: 'Skill India Digital Hub',
      duration: '30 mins • Interactive Lab',
      badge: 'Tools'
    },
    {
      id: 'r4',
      title: 'Industrial Troubleshooting & Preventive Maintenance',
      provider: 'Electronics Sector Skills Council',
      duration: '50 mins • Case Studies',
      badge: 'Advanced'
    }
  ];

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
          maxHeight: '90vh',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 24px 60px rgba(7, 25, 55, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Skill Upgrade & RPL Refresher
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2744', marginTop: '2px' }}>
              Learning Resources & Assessment Guides
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

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {resources.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f2744' }}>{item.title}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(5, 150, 105, 0.1)',
                      color: '#059669'
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  {item.provider} • {item.duration}
                </div>
              </div>

              <button
                onClick={() => {
                  showToast(`Opened resource: ${item.title}`, 'info');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: '#059669',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span>Study</span>
                <PlayCircle size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
