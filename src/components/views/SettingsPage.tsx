import React, { useState } from 'react';
import {
  Globe,
  Bell,
  Eye,
  Save
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassSelect } from '../common/GlassSelect';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { candidate, setCandidate, showToast } = useApp();

  const [language, setLanguage] = useState(candidate.preferredLanguage);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  const handleSave = () => {
    setCandidate((prev) => ({ ...prev, preferredLanguage: language }));
    showToast('Platform preferences saved successfully.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
            Platform Settings & Accessibility
          </h1>
          <GlassBadge variant="navy">System Config</GlassBadge>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Manage regional language support, notification channels, and accessibility display options.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Language & Regional Support */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#123B5D" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              Regional Language Support
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
            SkillRPL AI provides multi-lingual voice guidance and vernacular question translation for informal technicians.
          </p>

          <GlassSelect
            label="Preferred Interface Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: 'English (English / हिन्दी)', label: 'English (English / हिन्दी)' },
              { value: 'हिन्दी (Hindi)', label: 'हिन्दी (Hindi)' },
              { value: 'मराठी (Marathi)', label: 'मराठी (Marathi)' },
              { value: 'தமிழ் (Tamil)', label: 'தமிழ் (Tamil)' },
              { value: 'తెలుగు (Telugu)', label: 'తెలుగు (Telugu)' },
              { value: 'বাংলা (Bengali)', label: 'বাংলা (Bengali)' },
              { value: 'ಕನ್ನಡ (Kannada)', label: 'ಕನ್ನಡ (Kannada)' }
            ]}
          />
        </GlassCard>

        {/* Notifications & SMS Alerts */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#25A7A0" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              Assessor Communication Alerts
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
            Receive direct status updates when an authorized assessor evaluates your portfolio or schedules a review.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-primary-navy)', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: 'var(--color-secondary-sky)' }}
              />
              <span>WhatsApp notifications on review decisions</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-primary-navy)', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: 'var(--color-secondary-sky)' }}
              />
              <span>SMS alerts for interview appointment schedules</span>
            </label>
          </div>
        </GlassCard>

        {/* Accessibility & Visual Comfort */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} color="#4DA3D9" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              Accessibility & Field Usability
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
            Optimized for on-site workshop environments and low-bandwidth mobile smartphones.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '10px', border: '1px solid rgba(18, 59, 93, 0.08)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                Liquid Glass & Tactile Skeuomorphic Theme
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Active by default · Low eye fatigue · High contrast labels
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <GlassButton variant="primary" icon={<Save size={16} />} onClick={handleSave}>
          Save Preferences
        </GlassButton>
      </div>
    </div>
  );
};
