import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  Building2, 
  Award, 
  Clock, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUpWithEmail, error, clearError } = useAuth();
  const { setCurrentView, showToast } = useApp();

  const [role, setRole] = useState<'WORKER' | 'ASSESSOR'>('WORKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Worker-specific fields
  const [trade, setTrade] = useState('Industrial Welding');
  const [yearsExperience, setYearsExperience] = useState('5');
  const [bio, setBio] = useState('');

  // Assessor-specific fields
  const [organization, setOrganization] = useState('');
  const [specialization, setSpecialization] = useState('Welding & Metal Fabrication');
  const [assessorRegNumber, setAssessorRegNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!name || !email || !password) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        role,
        name: name.trim(),
        phone: phone.trim() || undefined,
        trade: role === 'WORKER' ? trade : undefined,
        yearsExperience: role === 'WORKER' ? parseInt(yearsExperience, 10) || 0 : undefined,
        bio: role === 'WORKER' ? bio.trim() || undefined : undefined,
        organization: role === 'ASSESSOR' ? organization.trim() || undefined : undefined,
        specialization: role === 'ASSESSOR' ? specialization.trim() || undefined : undefined,
        assessorRegNumber: role === 'ASSESSOR' ? assessorRegNumber.trim() || undefined : undefined
      };

      const result = await signUpWithEmail(email, password, profileData);
      
      if (result.success) {
        showToast('Account registered successfully with Supabase!', 'success');
        if (role === 'ASSESSOR') {
          setCurrentView('assessor-dashboard');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        setLocalError(result.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 16px' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)',
            marginBottom: '14px'
          }}
        >
          <ShieldCheck size={32} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
          Create your SkillRPL Account
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Join the National Recognition of Prior Learning Ecosystem
        </p>
      </div>

      {/* Main Glass Form Card */}
      <div 
        className="glass-card" 
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          padding: '32px'
        }}
      >
        {(error || localError) && (
          <div 
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{localError || error}</span>
          </div>
        )}

        {/* ROLE SELECTION TABS */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
            Select Your Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setRole('WORKER')}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: role === 'WORKER' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: role === 'WORKER' ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: role === 'WORKER' ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none'
              }}
            >
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: role === 'WORKER' ? '#0284c7' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Briefcase size={20} color={role === 'WORKER' ? '#ffffff' : '#64748b'} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: role === 'WORKER' ? '#0369a1' : '#1e293b' }}>
                  I am a Worker
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Candidate seeking RPL certification
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('ASSESSOR')}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: role === 'ASSESSOR' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                background: role === 'ASSESSOR' ? '#fff7ed' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: role === 'ASSESSOR' ? '0 4px 12px rgba(234, 88, 12, 0.15)' : 'none'
              }}
            >
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: role === 'ASSESSOR' ? '#ea580c' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={20} color={role === 'ASSESSOR' ? '#ffffff' : '#64748b'} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: role === 'ASSESSOR' ? '#c2410c' : '#1e293b' }}>
                  I am an Assessor
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Evaluator reviewing evidence
                </div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'WORKER' ? 'e.g. Ramesh Chandra' : 'e.g. Dr. Sunita Patil'}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Email & Phone grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Create Password (min 6 characters) *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* ROLE-SPECIFIC FIELDS */}
          {role === 'WORKER' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Primary Occupation / Trade
                  </label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Industrial Welding & Metal Fabrication">Industrial Welding & Metal Fabrication</option>
                    <option value="Automotive Repair & Engine Diagnostics">Automotive Repair & Engine Diagnostics</option>
                    <option value="Industrial Electrical & Wiring">Industrial Electrical & Wiring</option>
                    <option value="Carpentry & Precision Woodwork">Carpentry & Precision Woodwork</option>
                    <option value="Plumbing & Hydraulic Systems">Plumbing & Hydraulic Systems</option>
                    <option value="Masonry & Reinforced Concrete">Masonry & Reinforced Concrete</option>
                    <option value="Other Technical Trade">Other Technical Trade</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Years of Experience
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder="e.g. 6"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Brief Experience Summary
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summary of hands-on skills, key tools used, workshop background..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Affiliated Organization / Institution
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Capital Goods Sector Skill Council (CGSSC)"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Trade Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Welding & Metallurgy"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assessor ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={assessorRegNumber}
                    onChange={(e) => setAssessorRegNumber(e.target.value)}
                    placeholder="e.g. ASSESS-2024-01"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: role === 'WORKER' 
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: role === 'WORKER' 
                ? '0 4px 12px rgba(2, 132, 199, 0.3)' 
                : '0 4px 12px rgba(234, 88, 12, 0.3)',
              marginTop: '10px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register as {role === 'WORKER' ? 'Worker' : 'Assessor'}</span>
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Sign In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
