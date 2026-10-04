import React from 'react';
import {
  Briefcase,
  Plus,
  Building,
  Calendar,
  Trash2,
  Edit3,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const WorkExperiencePage: React.FC = () => {
  const {
    experiences,
    setIsAddExperienceModalOpen,
    setEditingExperience,
    deleteExperience,
    openExperienceDetail,
    setCurrentView
  } = useApp();

  const totalYears = experiences.reduce((acc, curr) => acc + (curr.yearsOfExperience || 0), 0);
  const totalRoles = experiences.length;
  
  // Extract unique industries / work environments
  const uniqueEnvironments = Array.from(new Set(experiences.map((e) => e.workEnvironment || 'Industrial'))).length;
  
  // Total skills identified across all experiences
  const totalSkillsIdentified = experiences.reduce((acc, curr) => acc + (curr.skillsGained ? curr.skillsGained.length : 0), 0);

  const handleEdit = (e: React.MouseEvent, exp: typeof experiences[0]) => {
    e.stopPropagation();
    setEditingExperience(exp);
    setIsAddExperienceModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, exp: typeof experiences[0]) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove experience as "${exp.occupation}"?`)) {
      deleteExperience(exp.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
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
            My Experience
          </h1>
          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--color-text-secondary)',
              marginTop: '4px',
              marginBottom: 0
            }}
          >
            Tell us about the work you have learned through practical experience.
          </p>
        </div>

        <GlassButton
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingExperience(null);
            setIsAddExperienceModalOpen(true);
          }}
        >
          + Add Experience
        </GlassButton>
      </div>

      {/* Experience Summary Section (4 Metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Metric 1: Total Experience */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '20px 22px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(26, 98, 214, 0.15) 0%, rgba(26, 98, 214, 0.05) 100%)',
              border: '1.5px solid rgba(26, 98, 214, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a62d6',
              flexShrink: 0
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5', letterSpacing: '0.05em' }}>
              Total Experience
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              ~{totalYears.toFixed(1)} Years
            </div>
          </div>
        </GlassCard>

        {/* Metric 2: Number of Roles */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '20px 22px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1.5px solid rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5', letterSpacing: '0.05em' }}>
              Number of Roles
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              {totalRoles} {totalRoles === 1 ? 'Role' : 'Roles'}
            </div>
          </div>
        </GlassCard>

        {/* Metric 3: Industries */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '20px 22px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
              border: '1.5px solid rgba(168, 85, 247, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
              flexShrink: 0
            }}
          >
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5', letterSpacing: '0.05em' }}>
              Industries / Sectors
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              {uniqueEnvironments} Sectors
            </div>
          </div>
        </GlassCard>

        {/* Metric 4: Skills Identified */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '20px 22px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              flexShrink: 0
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#8fa5c5', letterSpacing: '0.05em' }}>
              Skills Identified
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              {totalSkillsIdentified} Skills
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Section 8: RPL Context Panel */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '20px 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(238, 246, 255, 0.95) 0%, rgba(225, 239, 255, 0.85) 100%)',
          border: '1.5px solid rgba(26, 98, 214, 0.3)',
          boxShadow: '0 4px 20px rgba(26, 98, 214, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '780px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#1a62d6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              marginTop: '2px',
              boxShadow: '0 4px 10px rgba(26, 98, 214, 0.35)'
            }}
          >
            <Info size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
              Why does your experience matter?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.55, marginTop: '4px', marginBottom: 0 }}>
              Your practical experience helps build your RPL profile. In the next step, you will describe the tasks you can perform and provide evidence of your skills.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('declaration')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a62d6 0%, #0d429a 100%)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26, 98, 214, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>Step 3: Self Declaration</span>
          <ArrowRight size={14} />
        </button>
      </GlassCard>

      {/* Experience Cards Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
            Documented Work History
          </h2>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Click any card to view detailed responsibilities, skills, and evidence
          </span>
        </div>

        {experiences.length === 0 ? (
          <GlassCard variant="elevated" style={{ padding: '40px', textAlign: 'center', borderRadius: '22px' }}>
            <Briefcase size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
              No Work Experience Added Yet
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '8px auto 18px auto' }}>
              Document your practical roles, on-site tools operated, and trade tasks to build your RPL portfolio.
            </p>
            <GlassButton
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingExperience(null);
                setIsAddExperienceModalOpen(true);
              }}
            >
              + Add Experience
            </GlassButton>
          </GlassCard>
        ) : (
          experiences.map((exp) => (
            <GlassCard
              key={exp.id}
              variant="elevated"
              onClick={() => openExperienceDetail(exp.id)}
              style={{
                padding: '24px 26px',
                borderRadius: '22px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid rgba(77, 163, 217, 0.28)'
              }}
              className="experience-card-hover"
            >
              {/* Card Top Row: Role, Workplace, Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                      {exp.occupation}
                    </h3>
                    {exp.isCurrent && <GlassBadge variant="teal">Current</GlassBadge>}
                    {exp.isDemo && <GlassBadge variant="navy">Demo Data</GlassBadge>}
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a62d6', marginTop: '3px' }}>
                    {exp.organization}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#1a62d6" />
                      {exp.location || 'Pune, Maharashtra'}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#1a62d6" />
                      {exp.startDate} – {exp.endDate}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#1a62d6" />
                      {exp.yearsOfExperience} Years Experience
                    </span>
                  </div>
                </div>

                {/* Card Top-Right Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleEdit(e, exp)}
                    title="Edit Experience"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(18, 59, 93, 0.15)',
                      color: 'var(--color-primary-navy)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, exp)}
                    title="Delete Experience"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: 'rgba(254, 242, 242, 0.8)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#dc2626',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Short Description */}
              {exp.description && (
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  "{exp.description}"
                </p>
              )}

              {/* Tools & Equipment Chips */}
              {exp.toolsUsed && exp.toolsUsed.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#8fa5c5', marginRight: '4px' }}>
                    Tools:
                  </span>
                  {exp.toolsUsed.map((tool, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-primary-navy)',
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(77, 163, 217, 0.3)',
                        borderRadius: '8px',
                        padding: '3px 8px'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Card Footer: View Details CTA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(18, 59, 93, 0.08)',
                  marginTop: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Environment: <strong style={{ color: '#0f2744' }}>{exp.workEnvironment || 'Workshop'}</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Skills: <strong style={{ color: '#0f2744' }}>{(exp.skillsGained || []).length} self-declared</strong>
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#1a62d6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
