import React, { useState, useEffect } from 'react';
import { GlassModal } from '../common/GlassModal';
import { GlassInput } from '../common/GlassInput';
import { GlassButton } from '../common/GlassButton';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { WorkType, WorkEnvironment } from '../../types';

export const AddExperienceModal: React.FC = () => {
  const {
    isAddExperienceModalOpen,
    setIsAddExperienceModalOpen,
    addExperience,
    editExperience,
    editingExperience,
    setEditingExperience,
    showToast
  } = useApp();

  const [occupation, setOccupation] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [responsibilities, setResponsibilities] = useState('');
  const [tools, setTools] = useState('');
  const [workType, setWorkType] = useState<WorkType>('Full-time');
  const [workEnvironment, setWorkEnvironment] = useState<WorkEnvironment>('Workshop');
  const [description, setDescription] = useState('');

  // Auto-calculated years of experience
  const [calculatedYears, setCalculatedYears] = useState<number>(3.0);

  // Sync when editingExperience changes or modal opens
  useEffect(() => {
    if (editingExperience) {
      setOccupation(editingExperience.occupation);
      setOrganization(editingExperience.organization);
      setLocation(editingExperience.location || 'Pune, Maharashtra');
      setStartDate(editingExperience.startDate);
      setEndDate(editingExperience.endDate);
      setIsCurrent(editingExperience.isCurrent);
      setResponsibilities(editingExperience.responsibilities.join('\n'));
      setTools(editingExperience.toolsUsed.join(', '));
      setWorkType(editingExperience.workType || 'Full-time');
      setWorkEnvironment((editingExperience.workEnvironment as WorkEnvironment) || 'Workshop');
      setDescription(editingExperience.description || '');
      setCalculatedYears(editingExperience.yearsOfExperience || 3.0);
    } else {
      setOccupation('');
      setOrganization('');
      setLocation('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setResponsibilities('');
      setTools('');
      setWorkType('Full-time');
      setWorkEnvironment('Workshop');
      setDescription('');
      setCalculatedYears(1.0);
    }
  }, [editingExperience, isAddExperienceModalOpen]);

  // Compute years whenever start, end, or isCurrent changes
  useEffect(() => {
    const parseYear = (val: string): number => {
      const match = val.match(/\b(19\d\d|20\d\d)\b/);
      return match ? parseInt(match[1], 10) : NaN;
    };

    const startYear = parseYear(startDate);
    const endYear = isCurrent ? new Date().getFullYear() : parseYear(endDate);

    if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear) {
      const diff = Math.max(0.5, endYear - startYear);
      setCalculatedYears(Number(diff.toFixed(1)));
    }
  }, [startDate, endDate, isCurrent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!occupation.trim()) {
      showToast('Please enter an occupation or trade role.', 'error');
      return;
    }
    if (!organization.trim()) {
      showToast('Please enter the organization or workplace name.', 'error');
      return;
    }
    if (!location.trim()) {
      showToast('Please enter the workplace location.', 'error');
      return;
    }
    if (!startDate.trim()) {
      showToast('Please enter a start date.', 'error');
      return;
    }

    const respArray = responsibilities
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const toolsArray = tools
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingExperience) {
      editExperience(editingExperience.id, {
        occupation: occupation.trim(),
        organization: organization.trim(),
        location: location.trim(),
        startDate: startDate.trim(),
        endDate: isCurrent ? 'Present' : endDate.trim() || 'Present',
        isCurrent,
        yearsOfExperience: calculatedYears,
        description: description.trim() || `Practical work performed at ${organization.trim()}`,
        responsibilities: respArray.length > 0 ? respArray : ['Performed on-site trade tasks and maintenance operations'],
        toolsUsed: toolsArray.length > 0 ? toolsArray : ['Hand Tools', 'Standard Safety Gear'],
        workType,
        workEnvironment
      });
      setEditingExperience(null);
    } else {
      addExperience({
        occupation: occupation.trim(),
        organization: organization.trim(),
        location: location.trim(),
        startDate: startDate.trim(),
        endDate: isCurrent ? 'Present' : endDate.trim() || 'Present',
        isCurrent,
        yearsOfExperience: calculatedYears,
        description: description.trim() || `Practical work performed at ${organization.trim()}`,
        responsibilities: respArray.length > 0 ? respArray : ['Performed on-site trade tasks and maintenance operations'],
        toolsUsed: toolsArray.length > 0 ? toolsArray : ['Hand Tools', 'Standard Safety Gear'],
        workType,
        workEnvironment,
        skillsGained: [
          { id: `sk-new-${Date.now()}-1`, name: `${occupation.trim()} Fundamentals`, level: 'Intermediate', isSelfDeclared: true },
          { id: `sk-new-${Date.now()}-2`, name: 'Workplace Safety & Equipment Operation', level: 'Intermediate', isSelfDeclared: true }
        ],
        evidenceIds: [],
        isDemo: false
      });
    }

    setIsAddExperienceModalOpen(false);
  };

  const handleClose = () => {
    setIsAddExperienceModalOpen(false);
    setEditingExperience(null);
  };

  return (
    <GlassModal
      isOpen={isAddExperienceModalOpen}
      onClose={handleClose}
      title={editingExperience ? 'Edit Work Experience' : 'Add Practical Work Experience'}
      subtitle="Document your vocational background, equipment operated, and on-site responsibilities"
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Row 1: Occupation & Organization */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <GlassInput
            label="Occupation / Trade Role *"
            placeholder="e.g. Electrician, Welder, Solar Tech"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            required
          />

          <GlassInput
            label="Organization / Workplace *"
            placeholder="e.g. Demo Electrical Services"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>

        {/* Row 2: Location & Work Type */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <GlassInput
            label="Workplace Location *"
            placeholder="e.g. Bhosari Industrial Area, Pune"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          {/* Type of Work Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Type of Work *
            </label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value as WorkType)}
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
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Apprenticeship">Apprenticeship</option>
              <option value="Informal work">Informal work</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 3: Start Date, End Date, Currently Work Here */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' }}>
          <GlassInput
            label="Start Date *"
            placeholder="e.g. 2019 or Jan 2019"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <GlassInput
            label="End Date"
            placeholder={isCurrent ? 'Present' : 'e.g. 2024 or Dec 2024'}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isCurrent}
          />

          {/* Calculated Years Display */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(26, 98, 214, 0.08)',
              border: '1px solid rgba(26, 98, 214, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Clock size={16} color="#1a62d6" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8fa5c5', textTransform: 'uppercase' }}>
                Calculated Experience
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1a62d6' }}>
                ~{calculatedYears} Years
              </div>
            </div>
          </div>
        </div>

        {/* Currently work here checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13.5px',
            color: 'var(--color-primary-navy)',
            fontWeight: 600,
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#1a62d6' }}
          />
          <span>I currently work here</span>
        </label>

        {/* Work Environment Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
            Work Environment *
          </label>
          <select
            value={workEnvironment}
            onChange={(e) => setWorkEnvironment(e.target.value as WorkEnvironment)}
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
            <option value="Workshop">Workshop</option>
            <option value="Construction site">Construction site</option>
            <option value="Factory">Factory</option>
            <option value="Farm">Farm</option>
            <option value="Office">Office</option>
            <option value="Field">Field</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Short Description */}
        <GlassInput
          label="Short Description"
          placeholder="e.g. Performed residential electrical installation, maintenance and basic fault diagnosis."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
        />

        {/* Main Responsibilities */}
        <GlassInput
          label="Main Responsibilities (One per line)"
          placeholder="e.g. Assembled and mounted power control panels&#10;Tested insulation resistance and earth loops&#10;Followed site electrical safety precautions"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          multiline
          rows={3}
        />

        {/* Tools & Equipment */}
        <GlassInput
          label="Tools & Equipment (Comma-separated)"
          placeholder="e.g. Multimeter, Wire Stripper, Tester, Drill, Megger"
          value={tools}
          onChange={(e) => setTools(e.target.value)}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <GlassButton type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<CheckCircle2 size={16} />}
          >
            {editingExperience ? 'Update Experience' : 'Save Experience'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
