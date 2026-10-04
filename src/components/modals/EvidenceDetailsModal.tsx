import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  UserCheck,
  FileText,
  Video,
  Image as ImageIcon,
  Award,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Clock,
  Sparkles,
  ShieldCheck,
  Edit3,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { useApp } from '../../context/AppContext';
import type { EvidenceType, EvidenceStatus } from '../../types';

export const EvidenceDetailsModal: React.FC = () => {
  const {
    selectedEvidence,
    isEvidenceDetailsModalOpen,
    setIsEvidenceDetailsModalOpen,
    setEditingEvidence,
    setIsUploadEvidenceModalOpen,
    showToast
  } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(38);

  if (!selectedEvidence) return null;

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'Reviewed':
        return (
          <GlassBadge variant="success" icon={<CheckCircle2 size={12} />}>
            Reviewed
          </GlassBadge>
        );
      case 'Pending Review':
        return (
          <GlassBadge variant="warning" icon={<Clock size={12} />}>
            Pending Review
          </GlassBadge>
        );
      case 'Uploaded':
      default:
        return (
          <GlassBadge variant="navy" icon={<Clock size={12} />}>
            Uploaded
          </GlassBadge>
        );
    }
  };

  const getEvidenceIcon = (type: EvidenceType) => {
    const t = type.toLowerCase();
    if (t.includes('video')) return <Video size={18} color="#123B5D" />;
    if (t.includes('photo')) return <ImageIcon size={18} color="#25A7A0" />;
    if (t.includes('cert')) return <Award size={18} color="#D97706" />;
    return <FileText size={18} color="#4DA3D9" />;
  };

  const isVideo = selectedEvidence.type.toLowerCase().includes('video');
  const isPhoto = selectedEvidence.type.toLowerCase().includes('photo');
  const isDocument = !isVideo && !isPhoto;

  const handleEdit = () => {
    setEditingEvidence(selectedEvidence);
    setIsEvidenceDetailsModalOpen(false);
    setIsUploadEvidenceModalOpen(true);
  };

  return (
    <GlassModal
      isOpen={isEvidenceDetailsModalOpen}
      onClose={() => setIsEvidenceDetailsModalOpen(false)}
      title="Evidence Details"
      subtitle="Examine uploaded practical proof and associated declared skills"
      maxWidth="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '14px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(18, 59, 93, 0.08)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #DFF2FF 100%)',
                border: '1px solid rgba(77, 163, 217, 0.3)',
                boxShadow: '0 4px 10px rgba(11, 41, 66, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getEvidenceIcon(selectedEvidence.type)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                  {selectedEvidence.title}
                </h2>
                {selectedEvidence.isDemo && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(77, 163, 217, 0.15)',
                      color: 'var(--color-primary-navy)',
                      border: '1px solid rgba(77, 163, 217, 0.3)'
                    }}
                  >
                    DEMO DATA
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                  {selectedEvidence.type}
                </span>
                <span>•</span>
                <span>{selectedEvidence.fileName}</span>
                <span>•</span>
                <span>{selectedEvidence.fileSize}</span>
                <span>•</span>
                <span>Uploaded {selectedEvidence.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getStatusBadge(selectedEvidence.status)}
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={handleEdit}
            >
              Edit
            </GlassButton>
          </div>
        </div>

        {/* Media Preview Section */}
        {isVideo && (
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0B2942',
              border: '1px solid rgba(77, 163, 217, 0.3)',
              boxShadow: '0 8px 24px rgba(11, 41, 66, 0.18)'
            }}
          >
            {/* Mock Video Screen */}
            <div
              style={{
                position: 'relative',
                height: '280px',
                background: 'linear-gradient(135deg, #091D30 0%, #123B5D 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              {/* Grid / Circuit lines backdrop */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.15,
                  backgroundImage: 'radial-gradient(#4DA3D9 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              <div
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'transform 0.15s ease'
                }}
              >
                {isPlaying ? (
                  <Pause size={30} color="#123B5D" />
                ) : (
                  <Play size={30} color="#123B5D" style={{ marginLeft: '4px' }} />
                )}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '16px',
                  background: 'rgba(11, 41, 66, 0.75)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPlaying ? '#10B981' : '#F59E0B' }} />
                <span>{isPlaying ? 'Playing Local Video Clip' : 'Paused Preview'}</span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '16px',
                  background: 'rgba(11, 41, 66, 0.75)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Duration: {selectedEvidence.duration || '2:45'}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                }}
              >
                {selectedEvidence.title}
              </div>
            </div>

            {/* Video Controls Bar */}
            <div
              style={{
                padding: '12px 18px',
                background: 'rgba(11, 41, 66, 0.95)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setVideoProgress(Math.round((clickX / rect.width) * 100));
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: `${videoProgress}%`,
                    height: '100%',
                    borderRadius: '3px',
                    background: 'var(--color-secondary-sky)'
                  }}
                />
              </div>

              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                01:14 / {selectedEvidence.duration || '02:45'}
              </span>

              <button
                onClick={() => showToast('Audio volume adjusted.', 'info')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={18} />
              </button>

              <button
                onClick={() => showToast('Full screen preview mode.', 'info')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Video AI Disclaimer Placeholder */}
        {isVideo && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.9) 0%, rgba(223, 242, 255, 0.45) 100%)',
              border: '1px dashed rgba(77, 163, 217, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Sparkles size={20} color="#123B5D" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                AI-Assisted Video Analysis Placeholder
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                AI-assisted evidence analysis will be available in a later phase. No automated analysis has been executed on this video.
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Section */}
        {isPhoto && (
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #F0F7FD 0%, #E3F2FD 100%)',
              border: '1px solid rgba(77, 163, 217, 0.25)',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '100%',
                maxHeight: '260px',
                height: '240px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <ImageIcon size={44} color="#4DA3D9" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 700 }}>
                {selectedEvidence.fileName}
              </div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '4px' }}>
                High-Resolution Practical Work Inspection Photo
              </div>
              <span
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '6px'
                }}
              >
                Standardized ISO Inspection Capture · {selectedEvidence.fileSize}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => showToast(`Full resolution view of "${selectedEvidence.fileName}" opened.`, 'info')}
              >
                Open Full Resolution
              </GlassButton>
            </div>
          </div>
        )}

        {/* Document / Certificate Section */}
        {isDocument && (
          <div
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FAFF 100%)',
              border: '1px solid rgba(77, 163, 217, 0.25)',
              padding: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #EBF5FF 0%, #D8ECFE 100%)',
                  border: '1px solid rgba(77, 163, 217, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {selectedEvidence.type.toLowerCase().includes('cert') ? (
                  <Award size={26} color="#D97706" />
                ) : (
                  <FileText size={26} color="#123B5D" />
                )}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  {selectedEvidence.fileName}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Document Type: <strong>{selectedEvidence.type}</strong> · Size: {selectedEvidence.fileSize}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Verified digital timestamp: {selectedEvidence.uploadedAt}
                </div>
              </div>
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={<ExternalLink size={14} />}
              onClick={() => showToast(`Mock PDF "${selectedEvidence.fileName}" opened for preview.`, 'info')}
            >
              View Document
            </GlassButton>
          </div>
        )}

        {/* Worker Description */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)', marginBottom: '8px' }}>
            Worker Description
          </h4>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(18, 59, 93, 0.08)',
              fontSize: '13.5px',
              lineHeight: 1.6,
              color: 'var(--color-primary-navy)'
            }}
          >
            {selectedEvidence.description}
          </div>
        </div>

        {/* Work Context Grid: Date, Location, Role */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(240, 248, 255, 0.5)',
              border: '1px solid rgba(77, 163, 217, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <Calendar size={14} color="#123B5D" />
              <span>Date of Work</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
              {selectedEvidence.dateOfWork || 'Not specified'}
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(240, 248, 255, 0.5)',
              border: '1px solid rgba(77, 163, 217, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <MapPin size={14} color="#123B5D" />
              <span>Work Location</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
              {selectedEvidence.location || 'On-site installation'}
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(240, 248, 255, 0.5)',
              border: '1px solid rgba(77, 163, 217, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <UserCheck size={14} color="#123B5D" />
              <span>Role in Work</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
              {selectedEvidence.roleInWork || 'Direct practical execution'}
            </div>
          </div>
        </div>

        {/* Linked Skills Section */}
        <div>
          {(() => {
            const skills = selectedEvidence.linkedSkills || [];
            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                    Linked Practical Skills
                  </h4>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-sky)' }}>
                    Linked to {skills.length} skill{skills.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No skills linked yet</span>
                  ) : (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(223, 242, 255, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                          border: '1px solid rgba(77, 163, 217, 0.35)',
                          color: 'var(--color-primary-navy)',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          boxShadow: '0 1px 3px rgba(11, 41, 66, 0.04)'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-teal)' }} />
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </>
            );
          })()}
        </div>

        {/* Trust & Safety Assessment Note */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.9) 100%)',
            border: '1px solid rgba(18, 59, 93, 0.12)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <ShieldCheck size={20} color="#123B5D" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-primary-navy)' }}>Assessment Notice: </strong>
            Evidence will be reviewed by an authorized assessor as part of the assessment process.
            Final competency decisions are made through the authorized assessment process.
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
          <GlassButton
            variant="secondary"
            onClick={() => setIsEvidenceDetailsModalOpen(false)}
          >
            Close
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
