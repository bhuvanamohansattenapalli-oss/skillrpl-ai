import React from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileBadge,
  Edit3,
  CheckCircle2,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { ProfileCompletionCard } from '../common/ProfileCompletionCard';
import { useApp } from '../../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { candidate, experiences, setIsEditProfileModalOpen, setCurrentView } = useApp();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--color-primary-navy)',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          My Profile
        </h1>
        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
            marginBottom: 0
          }}
        >
          Build your profile to help us understand your experience and skills.
        </p>
      </div>

      {/* Main Grid: 2 Columns on Desktop, 1 Column on Mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Profile Header Card + Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Profile Header Card */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.85) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.3)',
              boxShadow: '0 8px 32px rgba(18, 59, 93, 0.08), inset 0 1px 0 #FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Profile Avatar */}
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 8px 24px rgba(18, 59, 93, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '30px',
                  fontWeight: 800,
                  fontFamily: "var(--font-display, 'Plus Jakarta Sans')",
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                {getInitials(candidate.name)}
                <span
                  title="Aadhaar Verified"
                  style={{
                    position: 'absolute',
                    bottom: '-3px',
                    right: '-3px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#059669',
                    border: '2.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <CheckCircle2 size={14} strokeWidth={3} />
                </span>
              </div>

              {/* Identity & Trade Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: 'var(--color-primary-navy)',
                      margin: 0
                    }}
                  >
                    {candidate.name}
                  </h2>
                  <GlassBadge variant="teal">Aadhaar Verified</GlassBadge>
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    color: '#1a62d6',
                    fontWeight: 700,
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileBadge size={15} />
                  <span>{candidate.trade}</span>
                  <span style={{ color: '#8fa5c5', fontWeight: 500 }}>· NSQF Level {candidate.nsqfLevel}</span>
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={13} color="#64748b" />
                  <span>{candidate.location}, {candidate.state}</span>
                  <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                  <span>App ID: {candidate.applicationId}</span>
                </div>
              </div>
            </div>

            {/* Right: Completion Badge & Edit Profile Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5', letterSpacing: '0.05em' }}>
                  Profile Completion
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1a62d6',
                    fontFamily: "var(--font-display, 'Plus Jakarta Sans')"
                  }}
                >
                  {candidate.profileCompletion || 78}%
                </span>
              </div>

              <GlassButton
                variant="primary"
                icon={<Edit3 size={15} />}
                onClick={() => setIsEditProfileModalOpen(true)}
              >
                Edit Profile
              </GlassButton>
            </div>
          </GlassCard>

          {/* Section: PERSONAL INFORMATION */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '26px',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--color-primary-navy)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Personal Information
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Official identity attributes registered with National Skill Development Corporation (NSDC).
                </p>
              </div>

              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1a62d6',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={13} />
                <span>Change</span>
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                paddingTop: '6px'
              }}
            >
              {/* Full Name */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Full Name
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px' }}>
                  {candidate.name}
                </div>
              </div>

              {/* Date of Birth */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Date of Birth
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#1a62d6" />
                  <span>{candidate.dateOfBirth || '14 August 1994'}</span>
                </div>
              </div>

              {/* Gender */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Gender
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#1a62d6" />
                  <span>{candidate.gender || 'Male'}</span>
                </div>
              </div>

              {/* Phone Number */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Phone Number
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#1a62d6" />
                  <span>{candidate.phone}</span>
                </div>
              </div>

              {/* Email */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Email Address
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#1a62d6" />
                  <span>{candidate.email}</span>
                </div>
              </div>

              {/* Location */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Location
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#1a62d6" />
                  <span>{candidate.location}, {candidate.state}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section: PROFESSIONAL SUMMARY */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '26px',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--color-primary-navy)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Professional Summary
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Briefly describe your professional experience and the type of work you have done.
                </p>
              </div>

              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1a62d6',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={13} />
                <span>Edit Summary</span>
              </button>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(18, 59, 93, 0.1)',
                fontSize: '14.5px',
                color: '#334155',
                lineHeight: 1.6,
                fontStyle: candidate.professionalSummary ? 'normal' : 'italic'
              }}
            >
              {candidate.professionalSummary || 'No professional summary provided yet. Click "Edit Summary" to describe your trade background, machine handling, and practical skills.'}
            </div>
          </GlassCard>

          {/* Section: PREFERRED CONTACT */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '26px',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--color-primary-navy)',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Preferred Contact
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                Primary communication channel for RPL assessment scheduling, verification alerts, and certificate issuance.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: candidate.preferredContact !== 'email' ? 'rgba(26, 98, 214, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                  border: candidate.preferredContact !== 'email' ? '1.5px solid #1a62d6' : '1px solid rgba(18, 59, 93, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: candidate.preferredContact !== 'email' ? '#1a62d6' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: candidate.preferredContact !== 'email' ? '#FFFFFF' : '#64748b'
                  }}
                >
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                    Phone ({candidate.phone})
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#8fa5c5' }}>
                    {candidate.preferredContact !== 'email' ? '★ Preferred Contact Channel' : 'Alternate Contact'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: candidate.preferredContact === 'email' ? 'rgba(26, 98, 214, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                  border: candidate.preferredContact === 'email' ? '1.5px solid #1a62d6' : '1px solid rgba(18, 59, 93, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: candidate.preferredContact === 'email' ? '#1a62d6' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: candidate.preferredContact === 'email' ? '#FFFFFF' : '#64748b'
                  }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                    Email ({candidate.email})
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#8fa5c5' }}>
                    {candidate.preferredContact === 'email' ? '★ Preferred Contact Channel' : 'Digital Notifications'}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Visual Profile Completion Component (Section 2) + RPL Next Step */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 2: Visual Profile Completion Component */}
          <ProfileCompletionCard />

          {/* Next Step: My Experience Card */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.85) 100%)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              boxShadow: '0 8px 30px rgba(5, 150, 105, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(5, 150, 105, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669' }}>
                  RPL Step 2 Workflow
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Work Experience History
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#4d6582', lineHeight: 1.5, margin: 0 }}>
              You currently have <strong style={{ color: '#0f2744' }}>{experiences.length} practical role(s)</strong> documented. Adding your complete work history unlocks self-declared skill mapping for assessor review.
            </p>

            <button
              onClick={() => setCurrentView('experience')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
            >
              <span>Manage My Experience</span>
              <ArrowRight size={15} />
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
