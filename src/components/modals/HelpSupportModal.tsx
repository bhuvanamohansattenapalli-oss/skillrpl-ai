import React from 'react';
import { X, PhoneCall, Mail } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
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
          maxWidth: '600px',
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
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e64db', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SkillRPL AI Candidate Support
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2744', marginTop: '2px' }}>
              Help & RPL Advisory Services
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

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e64db', marginBottom: '6px' }}>
                <PhoneCall size={18} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f2744' }}>National Helpline</span>
              </div>
              <p style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>1800-123-SKILL (Toll Free)</p>
              <p style={{ fontSize: '11.5px', color: '#64748b' }}>Mon - Sat, 9:00 AM - 6:00 PM IST</p>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '6px' }}>
                <Mail size={18} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f2744' }}>Email Support</span>
              </div>
              <p style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>support@skillrpl.gov.in</p>
              <p style={{ fontSize: '11.5px', color: '#64748b' }}>Response within 24 hours</p>
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', marginBottom: '6px' }}>
              Frequently Asked Questions (FAQ)
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#1e3a8a', lineHeight: 1.6 }}>
              <li><strong>What is RPL?</strong> Recognition of Prior Learning assesses skills gained on the job without formal degrees.</li>
              <li><strong>Is the certificate valid nationally?</strong> Yes, accredited under the National Skills Qualification Framework (NSQF).</li>
              <li><strong>How are practical tasks evaluated?</strong> Through our AI assessor paired with certified NSDC master assessors.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
