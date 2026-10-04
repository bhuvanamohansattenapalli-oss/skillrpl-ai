import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  FileText,
  Upload,
  Info,
  X
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const ExperienceDetailPage: React.FC = () => {
  const {
    experiences,
    selectedExperienceId,
    setCurrentView,
    deleteExperience,
    setEditingExperience,
    setIsAddExperienceModalOpen,
    addSkillToExperience,
    removeSkillFromExperience,
    evidenceList,
    addEvidence,
    showToast
  } = useApp();

  const experience = experiences.find((e) => e.id === selectedExperienceId) || experiences[0];

  // State for adding a self-declared skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // State for mock add evidence
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<'photo' | 'document' | 'video'>('photo');

  if (!experience) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Experience Not Found</h2>
        <GlassButton variant="primary" onClick={() => setCurrentView('experience')}>
          Back to My Experience
        </GlassButton>
      </div>
    );
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      showToast('Please enter a skill name.', 'error');
      return;
    }
    addSkillToExperience(experience.id, {
      name: newSkillName.trim(),
      level: newSkillLevel,
      isSelfDeclared: true
    });
    setNewSkillName('');
    setIsAddingSkill(false);
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) {
      showToast('Please enter an evidence title.', 'error');
      return;
    }
    addEvidence({
      title: evidenceTitle.trim(),
      type: evidenceType,
      fileName: `${evidenceTitle.trim().toLowerCase().replace(/\s+/g, '_')}.${evidenceType === 'photo' ? 'jpg' : evidenceType === 'document' ? 'pdf' : 'mp4'}`,
      fileSize: '2.4 MB',
      category: experience.occupation,
      description: `Supporting practical proof for work at ${experience.organization}`
    });
    setEvidenceTitle('');
    setIsAddingEvidence(false);
  };

  const handleEdit = () => {
    setEditingExperience(experience);
    setIsAddExperienceModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove experience as "${experience.occupation}"?`)) {
      deleteExperience(experience.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Back Button & Top Action Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <button
          onClick={() => setCurrentView('experience')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(18, 59, 93, 0.15)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: 'var(--color-primary-navy)',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Experience</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GlassButton variant="secondary" icon={<Edit3 size={15} />} onClick={handleEdit}>
            Edit Experience
          </GlassButton>
          <GlassButton variant="ghost" icon={<Trash2 size={15} color="#ef4444" />} onClick={handleDelete} style={{ color: '#ef4444' }}>
            Delete
          </GlassButton>
        </div>
      </div>

      {/* Main Experience Hero Banner */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)',
          border: '1px solid rgba(77, 163, 217, 0.3)',
          boxShadow: '0 8px 32px rgba(18, 59, 93, 0.08), inset 0 1px 0 #FFFFFF'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                {experience.occupation}
              </h1>
              {experience.isCurrent && <GlassBadge variant="teal">Current Workplace</GlassBadge>}
              {experience.isDemo && <GlassBadge variant="navy">Demo Data</GlassBadge>}
            </div>

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a62d6', marginTop: '6px' }}>
              {experience.organization}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginTop: '10px',
                fontSize: '13.5px',
                color: '#64748b'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} color="#1a62d6" />
                {experience.location || 'Pune, Maharashtra'}
              </span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="#1a62d6" />
                {experience.startDate} – {experience.endDate}
              </span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="#1a62d6" />
                ~{experience.yearsOfExperience} Years Duration
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: '16px',
              background: 'rgba(26, 98, 214, 0.08)',
              border: '1.5px solid rgba(26, 98, 214, 0.25)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#1a62d6', letterSpacing: '0.06em' }}>
              Work Type
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              {experience.workType || 'Full-time'}
            </div>
          </div>
        </div>

        {/* Short Description */}
        {experience.description && (
          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(18, 59, 93, 0.1)',
              fontSize: '14.5px',
              color: '#334155',
              lineHeight: 1.6
            }}
          >
            {experience.description}
          </div>
        )}
      </GlassCard>

      {/* Grid: Details & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Responsibilities & Work Environment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Responsibilities Section */}
          <GlassCard variant="elevated" style={{ padding: '24px', borderRadius: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Main Responsibilities & Daily Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {experience.responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(18, 59, 93, 0.08)'
                  }}
                >
                  <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                    {resp}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 2. Tools & Equipment Section */}
          <GlassCard variant="elevated" style={{ padding: '24px', borderRadius: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tools, Machinery & Equipment Operated
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {experience.toolsUsed.map((tool, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 13px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.8) 100%)',
                    border: '1px solid rgba(77, 163, 217, 0.35)',
                    boxShadow: '0 2px 6px rgba(18, 59, 93, 0.05)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f2744'
                  }}
                >
                  <Wrench size={13} color="#1a62d6" />
                  <span>{tool}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 3. Work Environment Details */}
          <GlassCard variant="elevated" style={{ padding: '24px', borderRadius: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workplace Environment & Operating Context
            </h3>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(18, 59, 93, 0.1)'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5' }}>
                Primary Environment
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f2744', marginTop: '2px' }}>
                {experience.workEnvironment || 'Industrial Workshop'}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Standard industrial safety gears including electrical-insulating rubber gloves, hard hat, steel-toe boots, and lockout/tagout procedures are applied.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Skills Section (Section 7) & Evidence Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 7: Skills Gained From This Experience */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.85) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Skills Gained from this Experience
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Competencies acquired through practical hands-on work
                </div>
              </div>

              <button
                onClick={() => setIsAddingSkill(!isAddingSkill)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'rgba(26, 98, 214, 0.1)',
                  border: '1px solid rgba(26, 98, 214, 0.25)',
                  color: '#1a62d6',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Subtle "Self-declared" notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                marginBottom: '14px'
              }}
            >
              <Info size={14} color="#d97706" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                Skills listed below are currently <strong>Self-declared</strong>. They will be validated during Step 4 Practical Assessment.
              </span>
            </div>

            {/* Add Skill Form Toggle */}
            {isAddingSkill && (
              <form
                onSubmit={handleAddSkill}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(26, 98, 214, 0.3)',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <input
                  type="text"
                  placeholder="e.g. Electrical Installation, Safety Procedures"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(18, 59, 93, 0.2)',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(18, 59, 93, 0.2)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="Beginner">Beginner Level</option>
                    <option value="Intermediate">Intermediate Level</option>
                    <option value="Advanced">Advanced Level</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(18, 59, 93, 0.15)',
                        background: 'transparent',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#1a62d6',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Skill Chips List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(experience.skillsGained || []).map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(18, 59, 93, 0.1)',
                    boxShadow: '0 2px 6px rgba(18, 59, 93, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: skill.level === 'Advanced' ? '#059669' : skill.level === 'Intermediate' ? '#1a62d6' : '#94a3b8'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {skill.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          Level: {skill.level}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#d97706', background: 'rgba(245, 158, 11, 0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          Self-declared
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeSkillFromExperience(experience.id, skill.id)}
                    title="Remove skill"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Section: Evidence Section */}
          <GlassCard variant="elevated" style={{ padding: '24px', borderRadius: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Portfolio Evidence
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Workplace photos, service logs, or employer letters
                </div>
              </div>

              <GlassButton
                variant="secondary"
                icon={<Upload size={14} />}
                onClick={() => setIsAddingEvidence(!isAddingEvidence)}
              >
                Add Evidence
              </GlassButton>
            </div>

            {/* Quick Add Evidence Form */}
            {isAddingEvidence && (
              <form
                onSubmit={handleAddEvidence}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(26, 98, 214, 0.3)',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <input
                  type="text"
                  placeholder="e.g. Electrical Panel Wiring Photo or Service Log"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(18, 59, 93, 0.2)',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value as any)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(18, 59, 93, 0.2)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  >
                    <option value="photo">Photo / Image</option>
                    <option value="document">PDF Document / Letter</option>
                    <option value="video">Practical Video Clip</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddingEvidence(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(18, 59, 93, 0.15)',
                        background: 'transparent',
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#1a62d6',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Upload Mock Evidence
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of Existing Evidence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evidenceList.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(18, 59, 93, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#1a62d6" />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8fa5c5' }}>
                        {item.type.toUpperCase()} · {item.fileSize} · {item.uploadedAt}
                      </div>
                    </div>
                  </div>

                  <GlassBadge variant={item.status === 'Verified' ? 'teal' : 'navy'}>
                    {item.status}
                  </GlassBadge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
