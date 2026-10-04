import React from 'react';
import { CheckCheck, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { GlassDrawer } from '../common/GlassDrawer';
import { GlassButton } from '../common/GlassButton';
import { useApp } from '../../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsDrawerOpen,
    setIsNotificationsDrawerOpen,
    notifications,
    markAllNotificationsRead
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} color="#059669" />;
      case 'review':
        return <Shield size={16} color="#123B5D" />;
      case 'warning':
        return <AlertTriangle size={16} color="#D97706" />;
      default:
        return <Info size={16} color="#4DA3D9" />;
    }
  };

  return (
    <GlassDrawer
      isOpen={isNotificationsDrawerOpen}
      onClose={() => setIsNotificationsDrawerOpen(false)}
      title="Notification Center"
      width="390px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Recent RPL Activity & Updates
          </span>
          <button
            onClick={markAllNotificationsRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-primary-navy)',
              cursor: 'pointer'
            }}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: item.read ? 'rgba(255, 255, 255, 0.65)' : 'rgba(223, 242, 255, 0.45)',
                border: item.read ? '1px solid rgba(18, 59, 93, 0.06)' : '1px solid rgba(77, 163, 217, 0.3)',
                boxShadow: item.read ? '0 1px 2px rgba(11, 41, 66, 0.02)' : '0 2px 6px rgba(77, 163, 217, 0.1)',
                display: 'flex',
                gap: '12px',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(11, 41, 66, 0.05)',
                  flexShrink: 0
                }}
              >
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#DC2626',
                        display: 'inline-block'
                      }}
                    />
                  )}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {item.message}
                </p>

                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(18, 59, 93, 0.08)' }}>
          <GlassButton
            variant="secondary"
            style={{ width: '100%' }}
            onClick={() => setIsNotificationsDrawerOpen(false)}
          >
            Close Center
          </GlassButton>
        </div>
      </div>
    </GlassDrawer>
  );
};
