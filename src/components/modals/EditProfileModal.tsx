import React, { useState, useEffect } from 'react';
import { GlassModal } from '../common/GlassModal';
import { GlassInput } from '../common/GlassInput';
import { GlassButton } from '../common/GlassButton';
import { Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EditProfileModal: React.FC = () => {
  const { candidate, setCandidate, isEditProfileModalOpen, setIsEditProfileModalOpen, showToast } = useApp();

  const [name, setName] = useState(candidate.name);
  const [dateOfBirth, setDateOfBirth] = useState(candidate.dateOfBirth || '');
  const [gender, setGender] = useState(candidate.gender || 'Male');
  const [phone, setPhone] = useState(candidate.phone);
  const [email, setEmail] = useState(candidate.email);
  const [location, setLocation] = useState(candidate.location);
  const [state, setState] = useState(candidate.state);
  const [professionalSummary, setProfessionalSummary] = useState(candidate.professionalSummary);
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email'>(candidate.preferredContact || 'phone');

  // Reset form when modal opens or candidate changes
  useEffect(() => {
    if (isEditProfileModalOpen) {
      setName(candidate.name);
      setDateOfBirth(candidate.dateOfBirth || '14 August 1994');
      setGender(candidate.gender || 'Male');
      setPhone(candidate.phone);
      setEmail(candidate.email);
      setLocation(candidate.location);
      setState(candidate.state);
      setProfessionalSummary(candidate.professionalSummary);
      setPreferredContact(candidate.preferredContact || 'phone');
    }
  }, [isEditProfileModalOpen, candidate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    setCandidate((prev) => ({
      ...prev,
      name: name.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender,
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      state: state.trim(),
      professionalSummary: professionalSummary.trim(),
      preferredContact
    }));

    setIsEditProfileModalOpen(false);
    showToast('Profile updated successfully.', 'success');
  };

  return (
    <GlassModal
      isOpen={isEditProfileModalOpen}
      onClose={() => setIsEditProfileModalOpen(false)}
      title="Edit Worker Profile"
      subtitle="Update your personal details, summary, and communication preferences"
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section: Personal Information */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a62d6', marginBottom: '12px' }}>
            Personal Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <GlassInput
              label="Full Name *"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <GlassInput
              label="Date of Birth"
              placeholder="e.g. 14 August 1994"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            {/* Gender Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(18, 59, 93, 0.18)',
                  color: 'var(--color-primary-navy)',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <GlassInput
              label="Location (City / Area) *"
              placeholder="e.g. Pune Industrial Area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <GlassInput
              label="Phone Number *"
              placeholder="e.g. +91 98452 31920"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <GlassInput
              label="Email Address *"
              type="email"
              placeholder="e.g. rajesh.kumar@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section: Professional Summary */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a62d6', marginBottom: '8px' }}>
            Professional Summary
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 8px 0' }}>
            Briefly describe your professional experience and the type of work you have done.
          </p>
          <GlassInput
            label=""
            placeholder="Briefly describe your professional experience, industrial history, and key trades..."
            value={professionalSummary}
            onChange={(e) => setProfessionalSummary(e.target.value)}
            multiline
            rows={4}
          />
        </div>

        {/* Section: Preferred Contact */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a62d6', marginBottom: '10px' }}>
            Preferred Contact Method
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: preferredContact === 'phone' ? 'rgba(26, 98, 214, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                border: preferredContact === 'phone' ? '1.5px solid #1a62d6' : '1px solid rgba(18, 59, 93, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name="preferredContact"
                value="phone"
                checked={preferredContact === 'phone'}
                onChange={() => setPreferredContact('phone')}
                style={{ accentColor: '#1a62d6', width: '16px', height: '16px' }}
              />
              <Phone size={17} color={preferredContact === 'phone' ? '#1a62d6' : '#64748b'} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Phone Call / SMS
                </div>
                <div style={{ fontSize: '11px', color: '#8fa5c5' }}>Direct mobile contact</div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: preferredContact === 'email' ? 'rgba(26, 98, 214, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                border: preferredContact === 'email' ? '1.5px solid #1a62d6' : '1px solid rgba(18, 59, 93, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name="preferredContact"
                value="email"
                checked={preferredContact === 'email'}
                onChange={() => setPreferredContact('email')}
                style={{ accentColor: '#1a62d6', width: '16px', height: '16px' }}
              />
              <Mail size={17} color={preferredContact === 'email' ? '#1a62d6' : '#64748b'} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Email Message
                </div>
                <div style={{ fontSize: '11px', color: '#8fa5c5' }}>Digital correspondence</div>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => setIsEditProfileModalOpen(false)}
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<CheckCircle2 size={16} />}
          >
            Save Profile
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
