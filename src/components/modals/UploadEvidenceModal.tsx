import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Video,
  FileText,
  Award,
  Image as ImageIcon,
  Check,
  Plus,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassInput } from '../common/GlassInput';
import { GlassButton } from '../common/GlassButton';
import { useApp } from '../../context/AppContext';
import type { EvidenceType, EvidenceStatus } from '../../types';

const EVIDENCE_TYPE_OPTIONS: { id: EvidenceType; label: string; icon: React.ReactNode }[] = [
  { id: 'Work Photo', label: 'Work Photo', icon: <ImageIcon size={16} /> },
  { id: 'Work Video', label: 'Work Video', icon: <Video size={16} /> },
  { id: 'Certificate', label: 'Certificate', icon: <Award size={16} /> },
  { id: 'Training Record', label: 'Training Record', icon: <FileText size={16} /> },
  { id: 'Work Document', label: 'Work Document', icon: <FileText size={16} /> },
  { id: 'Portfolio / Work Sample', label: 'Portfolio / Work Sample', icon: <Award size={16} /> },
  { id: 'Other', label: 'Other', icon: <FileText size={16} /> }
];

const PREDEFINED_SKILLS = [
  'Electrical Installation',
  'Safety Procedures & LOTO',
  'Equipment Handling',
  'Fault Diagnosis',
  'Circuit Troubleshooting',
  'Panel Wiring & Installation',
  '3-Phase Industrial Wiring',
  'MCCB & Switchgear Commissioning',
  'Conduit Bending & Surface Routing',
  'Overload Relay Calibration'
];

export const UploadEvidenceModal: React.FC = () => {
  const {
    isUploadEvidenceModalOpen,
    setIsUploadEvidenceModalOpen,
    addEvidence,
    editEvidence,
    editingEvidence,
    setEditingEvidence,
    experiences,
    showToast
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('Work Photo');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('3.8 MB');
  const [duration, setDuration] = useState<string>('');
  const [description, setDescription] = useState('');
  const [dateOfWork, setDateOfWork] = useState('');
  const [location, setLocation] = useState('');
  const [roleInWork, setRoleInWork] = useState('');
  const [status, setStatus] = useState<EvidenceStatus>('Uploaded');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isSimulatingCapture, setIsSimulatingCapture] = useState<'photo' | 'video' | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Merge declared skills from experiences
  const allAvailableSkills = Array.from(
    new Set([
      ...PREDEFINED_SKILLS,
      ...experiences.flatMap((e) => (e.skillsGained || []).map((s) => s.name))
    ])
  );

  // Initialize form when opening in Add vs Edit mode
  useEffect(() => {
    if (editingEvidence) {
      setTitle(editingEvidence.title);
      setType(editingEvidence.type);
      setFileName(editingEvidence.fileName);
      setFileSize(editingEvidence.fileSize);
      setDuration(editingEvidence.duration || '');
      setDescription(editingEvidence.description);
      setDateOfWork(editingEvidence.dateOfWork || '');
      setLocation(editingEvidence.location || '');
      setRoleInWork(editingEvidence.roleInWork || '');
      setStatus(editingEvidence.status);
      setSelectedSkills(editingEvidence.linkedSkills || []);
    } else {
      setTitle('');
      setType('Work Photo');
      setFileName('');
      setFileSize('4.2 MB');
      setDuration('');
      setDescription('');
      setDateOfWork(new Date().toISOString().split('T')[0]);
      setLocation('On-site Workshop');
      setRoleInWork('I personally performed the wiring and testing.');
      setStatus('Uploaded');
      setSelectedSkills(['Electrical Installation', 'Safety Procedures & LOTO']);
    }
    setErrors({});
    setIsSimulatingCapture(null);
  }, [editingEvidence, isUploadEvidenceModalOpen]);

  const handleClose = () => {
    setIsUploadEvidenceModalOpen(false);
    setEditingEvidence(null);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      
      // Auto-adjust type based on mime
      if (file.type.startsWith('video/')) {
        setType('Work Video');
        setDuration('2:15');
      } else if (file.type.startsWith('image/')) {
        setType('Work Photo');
      } else if (file.type.includes('pdf')) {
        setType('Work Document');
      }

      if (!title) {
        const generatedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1));
      }
      showToast(`Selected file "${file.name}" ready for attachment.`, 'info');
    }
  };

  const handleSimulatePhoto = () => {
    setIsSimulatingCapture('photo');
    setTimeout(() => {
      setFileName(`work_photo_${Date.now().toString().slice(-4)}.jpg`);
      setFileSize('3.4 MB');
      setType('Work Photo');
      setIsSimulatingCapture(null);
      showToast('Camera capture simulated: Photo attached.', 'success');
    }, 900);
  };

  const handleSimulateVideo = () => {
    setIsSimulatingCapture('video');
    setTimeout(() => {
      setFileName(`practical_recording_${Date.now().toString().slice(-4)}.mp4`);
      setFileSize('28.4 MB');
      setType('Work Video');
      setDuration('1:45');
      setIsSimulatingCapture(null);
      showToast('Video recorder simulated: Clip attached.', 'success');
    }, 1100);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkillInput('');
      showToast(`Linked skill "${trimmed}".`, 'info');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Evidence title is required.';
    if (!type) newErrors.type = 'Evidence type is required.';
    if (!fileName && !editingEvidence) {
      newErrors.file = 'File is required. Click Upload File or use Camera/Video.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please describe what this evidence shows and what you personally did.';
    }
    if (selectedSkills.length === 0) {
      newErrors.skills = 'Link at least one practical skill to this evidence.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingEvidence) {
      editEvidence(editingEvidence.id, {
        title: title.trim(),
        type,
        fileName: fileName || editingEvidence.fileName,
        fileSize: fileSize || editingEvidence.fileSize,
        duration: type.toLowerCase().includes('video') ? (duration || '2:30') : undefined,
        description: description.trim(),
        dateOfWork: dateOfWork.trim(),
        location: location.trim(),
        roleInWork: roleInWork.trim(),
        status,
        linkedSkills: selectedSkills
      });
    } else {
      addEvidence({
        title: title.trim(),
        type,
        fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${type.toLowerCase().includes('video') ? 'mp4' : 'jpg'}`,
        fileSize,
        duration: type.toLowerCase().includes('video') ? (duration || '2:15') : undefined,
        description: description.trim(),
        dateOfWork: dateOfWork.trim(),
        location: location.trim(),
        roleInWork: roleInWork.trim(),
        status: 'Uploaded',
        linkedSkills: selectedSkills,
        isDemo: true
      });
    }

    handleClose();
  };

  return (
    <GlassModal
      isOpen={isUploadEvidenceModalOpen}
      onClose={handleClose}
      title={editingEvidence ? 'Edit Evidence' : 'Add Evidence'}
      subtitle="Upload photos, videos, documents or certificates that demonstrate your experience."
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Upload / Capture Action Area */}
        <div
          style={{
            padding: '24px 20px',
            borderRadius: '16px',
            border: '2px dashed rgba(77, 163, 217, 0.45)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 248, 255, 0.6) 100%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(77, 163, 217, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-navy)'
            }}
          >
            <UploadCloud size={26} color="#123B5D" />
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              {fileName ? fileName : 'Upload Evidence File'}
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Supported types: Images, Videos, PDF, Documents
            </p>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Maximum file size: Demo limit
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
            <GlassButton
              type="button"
              variant="primary"
              size="sm"
              icon={<UploadCloud size={15} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File
            </GlassButton>

            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<Camera size={15} />}
              onClick={handleSimulatePhoto}
              disabled={isSimulatingCapture !== null}
            >
              {isSimulatingCapture === 'photo' ? 'Accessing Camera...' : 'Take Photo'}
            </GlassButton>

            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<Video size={15} />}
              onClick={handleSimulateVideo}
              disabled={isSimulatingCapture !== null}
            >
              {isSimulatingCapture === 'video' ? 'Initializing Recorder...' : 'Record Video'}
            </GlassButton>
          </div>

          {errors.file && (
            <div style={{ fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={14} />
              <span>{errors.file}</span>
            </div>
          )}
        </div>

        {/* What type of evidence is this? */}
        <div>
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)', display: 'block', marginBottom: '8px' }}>
            What type of evidence is this? <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
            {EVIDENCE_TYPE_OPTIONS.map((opt) => {
              const isSelected = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--color-secondary-soft)' : 'rgba(255, 255, 255, 0.75)',
                    border: isSelected ? '1.5px solid var(--color-secondary-sky)' : '1px solid rgba(18, 59, 93, 0.1)',
                    color: isSelected ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(77, 163, 217, 0.18)' : 'none'
                  }}
                >
                  <span style={{ color: isSelected ? 'var(--color-primary-navy)' : 'var(--color-text-muted)' }}>
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {errors.type && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.type}</div>
          )}
        </div>

        {/* Evidence Title */}
        <GlassInput
          label="Evidence Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Residential electrical panel installation"
          error={errors.title}
        />

        {/* Link Evidence to Skills (EXTREMELY IMPORTANT) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
              Link Evidence to Skills <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-secondary-sky)',
                background: 'rgba(77, 163, 217, 0.12)',
                padding: '3px 10px',
                borderRadius: '12px'
              }}
            >
              Linked to {selectedSkills.length} skill{selectedSkills.length === 1 ? '' : 's'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            Associate this evidence item with one or more previously declared practical skills or tasks.
          </p>

          {/* Selectable Skill Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {allAvailableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--color-primary-navy)' : 'rgba(255, 255, 255, 0.8)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-primary-navy)',
                    border: isSelected ? '1px solid var(--color-primary-navy)' : '1px solid rgba(18, 59, 93, 0.15)',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 6px rgba(18, 59, 93, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={13} color="#FFFFFF" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>

          {/* Add custom skill input */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={handleAddCustomSkill}
              placeholder="Add another skill/task..."
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(18, 59, 93, 0.15)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleAddCustomSkill}
            >
              Add
            </GlassButton>
          </div>

          {errors.skills && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px' }}>{errors.skills}</div>
          )}
        </div>

        {/* Evidence Description */}
        <div>
          <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)', display: 'block', marginBottom: '6px' }}>
            Description <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what this evidence shows and what you personally did."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: errors.description ? '1.5px solid #DC2626' : '1px solid rgba(18, 59, 93, 0.18)',
              background: 'rgba(255, 255, 255, 0.85)',
              fontSize: '13px',
              lineHeight: 1.5,
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          {errors.description && (
            <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.description}</div>
          )}
        </div>

        {/* Work Metadata Row: Date, Location, Role */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <GlassInput
            label="Date of Work (Optional)"
            type="date"
            value={dateOfWork}
            onChange={(e) => setDateOfWork(e.target.value)}
          />

          <GlassInput
            label="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Substation Bay 4, Pune"
          />

          <GlassInput
            label="Role in the Work (Optional)"
            value={roleInWork}
            onChange={(e) => setRoleInWork(e.target.value)}
            placeholder="e.g., I personally performed the wiring and testing."
          />
        </div>

        {/* Status Selection (When Editing) */}
        {editingEvidence && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)', display: 'block', marginBottom: '6px' }}>
              Evidence Status
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['Uploaded', 'Pending Review', 'Reviewed'] as EvidenceStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: status === st ? 700 : 500,
                    background: status === st ? 'var(--color-primary-navy)' : 'rgba(255, 255, 255, 0.8)',
                    color: status === st ? '#FFFFFF' : 'var(--color-primary-navy)',
                    border: '1px solid rgba(18, 59, 93, 0.15)',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trust & Safety Notice */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8) 0%, rgba(223, 242, 255, 0.4) 100%)',
            border: '1px solid rgba(77, 163, 217, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <ShieldCheck size={18} color="#123B5D" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Evidence is submitted for authorized assessor review. Final competency decisions are made through the authorized assessment process.
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
          <GlassButton
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </GlassButton>

          <GlassButton
            type="submit"
            variant="primary"
          >
            {editingEvidence ? 'Save Changes' : 'Add Evidence'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
