import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  WifiOff,
  Send,
  Info,
  Layers
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus, getLocalDraft } from '../../lib/offline/draft-storage';
import {
  fetchWorkerApplication,
  saveWorkerApplication,
  analyzeWorkerSkillsWithAI,
  submitWorkerApplication
} from '../../lib/api/worker-application';
import { requestQualificationMapping } from '../../lib/api/qualification-mapping';
import { QualificationMatchCard } from '../common/QualificationMatchCard';
import type { CandidateMatchResult } from '../../lib/mapping/qualification-engine';
import type {
  RPLApplicationFormData,
  WorkerExperienceEntry,
  SelfDeclaredSkillEntry,
  RPLApplicationStatus
} from '../../types';

export const SelfDeclarationPage: React.FC = () => {
  const {
    activeApplicationId,
    setActiveApplicationId,
    candidate,
    showToast,
    setCurrentView
  } = useApp();
  const { session, profile } = useAuth();
  const isOnline = useOnlineStatus();

  // Stepper state (1: Profile, 2: Self Declaration, 3: Experience, 4: Skills & Tasks, 5: AI Analysis, 6: Evidence, 7: Submit)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [applicationId, setApplicationId] = useState<string | null>(activeApplicationId);
  const [applicationNumber, setApplicationNumber] = useState<string>('DRAFT');
  const [appStatus, setAppStatus] = useState<RPLApplicationStatus>('DRAFT');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Multi-step form state
  const [formData, setFormData] = useState<RPLApplicationFormData>({
    name: profile?.name || candidate?.name || 'Worker Candidate',
    location: profile?.location || candidate?.location || 'New Delhi, India',
    trade: profile?.trade || candidate?.trade || 'Electrical Installation & Maintenance',
    yearsOfExperience: candidate?.yearsOfExperience || 4,
    phone: profile?.phone || candidate?.phone || '+91 98765 43210',
    email: profile?.email || candidate?.email || 'candidate@example.com',
    preferredLanguage: candidate?.preferredLanguage || 'English / Hindi',

    workplaceType: 'Workshop & Industrial Field',
    employmentType: 'Both',
    workEnvironments: ['Workshop', 'Construction site', 'Field installations'],
    safetyPracticeAgreement: true,

    experiences: [
      {
        company: 'City Metro Electrical Services',
        role: 'Senior Electrician & Panel Technician',
        startDate: '2021',
        endDate: 'Present',
        isCurrent: true,
        responsibilities: 'Installing distribution boards, cable routing, conduit fitting, troubleshooting motor starters.',
        tasksPerformed: 'Main switchgear termination, 3-phase load balancing, megger insulation resistance testing.',
        toolsUsed: 'Digital Multimeter, Megger 1000V tester, Hydraulic crimping tool, Conduit bender.'
      }
    ],

    skills: [
      {
        taskName: 'Install and terminate domestic & light industrial electrical wiring',
        experienceText: 'Performed independently for 4+ years across residential and commercial buildings.',
        toolsUsed: 'Digital multimeter, wire stripper, test pen, torque screwdriver.',
        confidenceLevel: 'Advanced',
        statusLabel: 'Self-declared — pending assessment'
      },
      {
        taskName: 'Assemble 3-phase motor control panels with Star-Delta starters',
        experienceText: 'Regularly wired starters, thermal overload relays, and contactors.',
        toolsUsed: 'Crimper, ferrule printer, continuity tester, multimeter.',
        confidenceLevel: 'Intermediate',
        statusLabel: 'Self-declared — pending assessment'
      }
    ],

    evidenceNote: 'Candidate will provide photo/video logs of panel termination and employer verification certificate during assessor inspection.'
  });

  const steps = [
    { num: 1, title: 'Profile' },
    { num: 2, title: 'Self Declaration' },
    { num: 3, title: 'Experience' },
    { num: 4, title: 'Skills & Tasks' },
    { num: 5, title: 'AI Analysis' },
    { num: 6, title: 'Evidence' },
    { num: 7, title: 'Submit' }
  ];

  // Load application data (from server or local draft)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. If activeApplicationId is provided, try loading from server
      if (activeApplicationId && session?.access_token) {
        try {
          const res = await fetchWorkerApplication(activeApplicationId, session.access_token);
          if (res.success && res.application && isMounted) {
            const app = res.application;
            setApplicationId(app.id);
            setApplicationNumber(app.applicationNumber || 'DRAFT');
            setAppStatus(app.status || 'DRAFT');
            if (app.currentStep) setCurrentStep(app.currentStep);
            if (app.formData) {
              setFormData((prev) => ({
                ...prev,
                ...app.formData,
                experiences: app.experiences?.length ? app.experiences : app.formData.experiences || prev.experiences,
                skills: app.skills?.length ? app.skills : app.formData.skills || prev.skills
              }));
            }
            return;
          }
        } catch (err) {
          console.warn('[SelfDeclarationPage] Server load failed, checking local draft:', err);
        }
      }

      // 2. Otherwise load local draft if available
      const local = getLocalDraft(activeApplicationId || undefined);
      if (local && isMounted) {
        setApplicationId(local.id === 'local-draft' ? null : local.id);
        setApplicationNumber(local.applicationNumber || 'DRAFT-LOCAL');
        setAppStatus(local.status || 'DRAFT');
        if (local.currentStep) setCurrentStep(local.currentStep);
        if (local.formData) {
          setFormData((prev) => ({ ...prev, ...local.formData }));
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [activeApplicationId, session?.access_token]);

  // Helper to save current draft
  const saveDraft = async (stepToSave = currentStep, newStatus?: RPLApplicationStatus): Promise<boolean> => {
    setIsSaving(true);
    try {
      const statusToUse = newStatus || appStatus;
      const res = await saveWorkerApplication(
        {
          id: applicationId || undefined,
          currentStep: stepToSave,
          status: statusToUse,
          tradeTitle: formData.trade,
          formData,
          experiences: formData.experiences,
          skills: formData.skills
        },
        session?.access_token
      );

      if (res.success && res.application) {
        if (res.application.id && res.application.id !== 'local-draft') {
          setApplicationId(res.application.id);
          setActiveApplicationId(res.application.id);
          if (res.application.applicationNumber) {
            setApplicationNumber(res.application.applicationNumber);
          }
        }
        if (newStatus) setAppStatus(newStatus);
        if (res.savedLocallyOnly) {
          showToast('Draft saved to local offline storage.', 'info');
        } else {
          showToast('Application draft saved to database.', 'success');
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[SelfDeclarationPage] Save error:', err);
      showToast('Saved locally in browser draft.', 'info');
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  // Step validation
  const validateForStep = (targetStep: number): boolean => {
    const errors: string[] = [];

    if (targetStep > 1) {
      if (!formData.name?.trim()) errors.push('Candidate name is required.');
      if (!formData.trade?.trim()) errors.push('Current occupation/trade is required.');
      if (Number(formData.yearsOfExperience) <= 0) errors.push('Years of experience must be greater than 0.');
    }

    if (targetStep > 2) {
      if (!formData.workplaceType?.trim()) errors.push('Workplace setting is required.');
      if (!formData.safetyPracticeAgreement) errors.push('Safety practice confirmation is required.');
    }

    if (targetStep > 3) {
      if (!formData.experiences || formData.experiences.length === 0) {
        errors.push('At least one practical experience entry is required.');
      } else {
        const hasValidExp = formData.experiences.some((e) => e.company?.trim() && e.role?.trim());
        if (!hasValidExp) {
          errors.push('Please enter company/workplace name and role for your experience.');
        }
      }
    }

    if (targetStep > 4) {
      if (!formData.skills || formData.skills.length === 0) {
        errors.push('At least one self-declared practical task/skill is required.');
      } else {
        const hasValidSkill = formData.skills.some((s) => s.taskName?.trim());
        if (!hasValidSkill) {
          errors.push('Please provide a task description for your self-declared skill.');
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = async () => {
    const nextStep = currentStep + 1;
    if (!validateForStep(nextStep)) {
      showToast('Please complete required fields before continuing.', 'warning');
      return;
    }

    // Auto-update status when reaching steps
    let nextStatus = appStatus;
    if (currentStep === 4 && appStatus === 'DRAFT') {
      nextStatus = 'SELF_DECLARATION_COMPLETED';
    }

    await saveDraft(nextStep, nextStatus);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = async () => {
    const prevStep = Math.max(1, currentStep - 1);
    await saveDraft(prevStep);
    setCurrentStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Experience entry modifiers
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          company: '',
          role: '',
          startDate: '2022',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: '',
          tasksPerformed: '',
          toolsUsed: ''
        }
      ]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    if (formData.experiences.length <= 1) {
      showToast('At least one experience entry is required.', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceChange = (index: number, field: keyof WorkerExperienceEntry, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  // Skill entry modifiers
  const handleAddSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          taskName: '',
          experienceText: '',
          toolsUsed: '',
          confidenceLevel: 'Intermediate',
          statusLabel: 'Self-declared — pending assessment'
        }
      ]
    }));
  };

  const handleRemoveSkill = (index: number) => {
    if (formData.skills.length <= 1) {
      showToast('At least one self-declared skill is required.', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSkillChange = (index: number, field: keyof SelfDeclaredSkillEntry, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  };

  // AI Analysis Execution using existing Gemini 3.6 Flash
  const handleAnalyzeSkills = async () => {
    if (!isOnline) {
      showToast('AI analysis requires an internet connection.', 'warning');
      return;
    }

    // Required minimum information validation before AI analysis
    const errors: string[] = [];
    if (!formData.trade?.trim()) errors.push('Trade / occupation is required.');
    if (!formData.experiences || formData.experiences.length === 0 || !formData.experiences[0]?.responsibilities?.trim()) {
      errors.push('Detailed work experience responsibilities are required.');
    }
    if (!formData.skills || formData.skills.length === 0 || !formData.skills[0]?.taskName?.trim()) {
      errors.push('At least one practical task is required.');
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast('Please provide required minimum information before AI analysis.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setValidationErrors([]);

    // Save draft first to ensure application ID exists
    await saveDraft(currentStep, appStatus);

    try {
      const tasksList = formData.skills.map((s) => s.taskName).filter(Boolean);
      const toolsList = formData.skills.flatMap((s) => (s.toolsUsed ? s.toolsUsed.split(',').map((t) => t.trim()) : []));
      const skillsList = formData.skills.map((s) => `${s.taskName} (${s.confidenceLevel})`);
      const combinedExp = formData.experiences
        .map((e) => `${e.role} at ${e.company} (${e.startDate}-${e.endDate}): ${e.responsibilities}. Tasks: ${e.tasksPerformed}. Tools: ${e.toolsUsed}`)
        .join('\n\n');

      const res = await analyzeWorkerSkillsWithAI(
        {
          applicationId: applicationId || 'local-draft',
          occupation: formData.trade,
          yearsExperience: Number(formData.yearsOfExperience) || 3,
          experience: combinedExp,
          tasks: tasksList,
          tools: toolsList,
          skills: skillsList
        },
        session?.access_token || ''
      );

      if (res.success && res.data) {
        const analysis = res.data;
        const aiSnapshot = {
          summary: `Potential skill match analysis for ${analysis.potentialOccupation || formData.trade}`,
          strengths: (analysis.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
          recommendations: analysis.assessmentAreas || [],
          potentialSkillMatches: (analysis.skills || []).map((s: any) =>
            typeof s === 'string' ? s : `${s.name} (${s.confidence || 'MEDIUM'} confidence - ${s.reason || ''})`
          ),
          suggestedCompetencyAreas: analysis.assessmentAreas || [],
          suggestedEvidence: analysis.suggestedEvidence || [],
          areasRequiringVerification: analysis.verificationRequired || [],
          createdAt: new Date().toISOString()
        };

        setFormData((prev) => ({
          ...prev,
          aiAnalysisId: res.recordId,
          aiAnalysisSnapshot: aiSnapshot
        }));

        setAppStatus('ASSESSMENT_READY');
        showToast('Gemini 3.6 Flash skill diagnostic completed!', 'success');

        // Automatically run NSQF Qualification Pack Matching
        try {
          const mappingRes = await requestQualificationMapping(
            applicationId || 'local-draft',
            {
              occupation: formData.trade,
              yearsExperience: Number(formData.yearsOfExperience) || 3,
              skills: skillsList,
              tasks: tasksList,
              tools: toolsList,
              experienceDescription: combinedExp
            },
            session?.access_token
          );

          if (mappingRes.success && mappingRes.candidates.length > 0) {
            setCandidateMatches(mappingRes.candidates);
            setFormData((prev) => ({
              ...prev,
              selectedQpCode: prev.selectedQpCode || mappingRes.candidates[0].qpCode,
              qualificationMappings: mappingRes.candidates
            }));
            showToast('NSQF Qualification Pack candidates mapped!', 'success');
          }
        } catch (mapErr) {
          console.warn('[SelfDeclarationPage] Qualification mapping notice:', mapErr);
        }
      } else {
        showToast(res.error || 'AI analysis unavailable. Please retry.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'AI skill analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Final Application
  const handleSubmitFinal = async () => {
    if (!isOnline) {
      showToast('Submitting your RPL application requires an internet connection.', 'warning');
      return;
    }

    if (!session?.access_token) {
      showToast('Please sign in to submit your RPL application.', 'warning');
      setCurrentView('login');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Ensure latest changes are saved first
      await saveDraft(7, 'ASSESSMENT_READY');

      if (!applicationId) {
        showToast('Application ID missing. Please save draft first.', 'error');
        return;
      }

      // 2. Submit to server
      const res = await submitWorkerApplication(applicationId, session.access_token);
      if (res.success) {
        setAppStatus('SUBMITTED');
        showToast('RPL Application submitted successfully to Accredited Assessor!', 'success');
        setCurrentView('dashboard');
      } else {
        showToast(res.error || 'Submission failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header with App Number & Offline Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
              Worker RPL Application
            </h1>
            <GlassBadge variant={appStatus === 'SUBMITTED' ? 'teal' : 'navy'}>
              {appStatus.replace(/_/g, ' ')}
            </GlassBadge>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Application ID: <strong style={{ fontFamily: 'monospace' }}>{applicationNumber}</strong> • Complete your self-declaration for assessor verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!isOnline && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                color: '#92400e',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <WifiOff size={14} />
              <span>Offline Mode (Local Draft Active)</span>
            </div>
          )}

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => saveDraft(currentStep)}
            disabled={isSaving}
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </GlassButton>
        </div>
      </div>

      {/* Validation Banner if errors */}
      {validationErrors.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Please resolve the following required fields:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 7-Step Navigation Stepper */}
      <GlassCard
        style={{
          padding: '12px 18px',
          borderRadius: '18px',
          overflowX: 'auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '720px',
            gap: '8px'
          }}
        >
          {steps.map((st) => {
            const isCompleted = st.num < currentStep;
            const isActive = st.num === currentStep;

            return (
              <button
                key={st.num}
                onClick={async () => {
                  if (validateForStep(st.num)) {
                    await saveDraft(st.num);
                    setCurrentStep(st.num);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'var(--color-secondary-soft)'
                    : isCompleted
                    ? 'rgba(255, 255, 255, 0.75)'
                    : 'transparent',
                  border: isActive
                    ? '1.5px solid var(--color-secondary-sky)'
                    : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 6px rgba(77, 163, 217, 0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCompleted ? '#059669' : isActive ? '#123B5D' : 'rgba(18, 59, 93, 0.1)',
                    color: isCompleted || isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {isCompleted ? <Check size={13} /> : st.num}
                </div>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)'
                  }}
                >
                  {st.title}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Main Form Content Surface */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          minHeight: '460px'
        }}
      >
        {/* STEP 1: Personal & Work Information */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 01 OF 07 • PROFILE & WORK INFORMATION
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Candidate & Trade Details
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Provide your primary occupation and general profile information.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <GlassInput
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                required
              />

              <GlassInput
                label="Current Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Jaipur, Rajasthan"
                required
              />

              <GlassInput
                label="Current Occupation / Trade"
                value={formData.trade}
                onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                placeholder="e.g. Electrician, Welder, Mason, Plumber"
                required
              />

              <GlassInput
                label="Total Years of Experience"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseFloat(e.target.value) || 0 })}
                required
              />

              <GlassInput
                label="Contact Phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />

              <GlassInput
                label="Preferred Language"
                value={formData.preferredLanguage || 'English / Hindi'}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Self Declaration */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 02 OF 07 • SELF DECLARATION
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Work Setting & Occupational Environment
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Describe your typical workplace environment and employment nature.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <GlassInput
                label="Type of Workplace"
                value={formData.workplaceType}
                onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                placeholder="e.g. Workshop, Construction site, Industrial plant, Residential"
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                  Employment Nature
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="glass-input"
                  style={{ height: '42px', padding: '0 12px' }}
                >
                  <option value="Employment">Formal / Informal Wage Employment</option>
                  <option value="Self-employed">Independent / Self-employed Contractor</option>
                  <option value="Both">Both (Contract & Self-employed)</option>
                  <option value="Contract">Daily Wage / Contract Worker</option>
                </select>
              </div>
            </div>

            {/* Work Environments Experienced */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                Work Environments Experienced (Select all that apply)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Workshop', 'Construction site', 'Factory floor', 'Field installations', 'Commercial offices', 'Residential premises', 'High-altitude / Outdoors'].map((env) => {
                  const selected = formData.workEnvironments.includes(env);
                  return (
                    <button
                      key={env}
                      type="button"
                      onClick={() => {
                        const updated = selected
                          ? formData.workEnvironments.filter((e) => e !== env)
                          : [...formData.workEnvironments, env];
                        setFormData({ ...formData, workEnvironments: updated });
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        border: selected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: selected ? 'rgba(2, 132, 199, 0.12)' : '#ffffff',
                        color: selected ? '#0284c7' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {selected && '✓ '} {env}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety Compliance Statement */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(240, 249, 255, 0.8)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="checkbox"
                id="safety-agree"
                checked={formData.safetyPracticeAgreement}
                onChange={(e) => setFormData({ ...formData, safetyPracticeAgreement: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="safety-agree" style={{ fontSize: '13px', color: '#0f2744', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Occupational Safety & Ethical Practice Agreement:</strong> I confirm that I regularly adhere to occupational health, personal protective equipment (PPE), and workshop safety procedures.
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Experience Details (Multiple Entries) */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                  STEP 03 OF 07 • EXPERIENCE DETAILS
                </span>
                <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  Workplace Experience History
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Add multiple workplaces or contract periods. Fake company details are NOT required.
                </p>
              </div>

              <GlassButton variant="secondary" size="sm" onClick={handleAddExperience}>
                <Plus size={14} />
                <span>+ Add another experience</span>
              </GlassButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {formData.experiences.map((exp, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    background: '#ffffff',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </span>
                      <strong style={{ fontSize: '14.5px', color: '#0f2744' }}>
                        {exp.role || 'Experience Entry'} {exp.company ? `@ ${exp.company}` : ''}
                      </strong>
                    </div>

                    {formData.experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12.5px',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <GlassInput
                      label="Company / Workplace Setting"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      placeholder="e.g. Sunrise Technical Works, Independent Contractor"
                      required
                    />

                    <GlassInput
                      label="Role / Designation"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                      placeholder="e.g. Senior Electrician, Maintenance Specialist"
                      required
                    />

                    <GlassInput
                      label="Start Date / Year"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      placeholder="e.g. 2020"
                    />

                    <GlassInput
                      label="End Date (or 'Present')"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      placeholder="e.g. Present"
                    />
                  </div>

                  <GlassInput
                    label="Main Responsibilities"
                    value={exp.responsibilities}
                    onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                    placeholder="Describe your everyday work scope and duties..."
                    multiline
                    rows={2}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <GlassInput
                      label="Tasks Performed"
                      value={exp.tasksPerformed}
                      onChange={(e) => handleExperienceChange(index, 'tasksPerformed', e.target.value)}
                      placeholder="Specific jobs completed (e.g. wiring, fitting, troubleshooting)..."
                      multiline
                      rows={2}
                    />

                    <GlassInput
                      label="Tools & Equipment Used"
                      value={exp.toolsUsed}
                      onChange={(e) => handleExperienceChange(index, 'toolsUsed', e.target.value)}
                      placeholder="e.g. Multimeter, Crimper, Conduit bender, Megger..."
                      multiline
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Skills & Practical Tasks */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                  STEP 04 OF 07 • PRACTICAL SKILLS & TASKS
                </span>
                <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  Practical Tasks & Confidence Level
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Describe tasks you can perform independently.
                </p>
              </div>

              <GlassButton variant="secondary" size="sm" onClick={handleAddSkill}>
                <Plus size={14} />
                <span>+ Add another skill/task</span>
              </GlassButton>
            </div>

            {/* Crucial Ethical Boundary Banner */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(254, 243, 199, 0.65)',
                border: '1px solid #f59e0b',
                color: '#92400e',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>IMPORTANT NOTICE:</strong> These are <em>SELF-DECLARED</em> skills. They are NOT certified competencies until evaluated and validated by an authorized RPL Assessor during practical observation.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    background: '#ffffff',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: '#7c3aed',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        Self-declared — pending assessment
                      </span>
                    </div>

                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12.5px',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <GlassInput
                    label="Practical Task You Can Perform"
                    value={skill.taskName}
                    onChange={(e) => handleSkillChange(index, 'taskName', e.target.value)}
                    placeholder="e.g. Install domestic electrical wiring, Wire Star-Delta motor starters..."
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <GlassInput
                      label="Experience / Duration with this Task"
                      value={skill.experienceText}
                      onChange={(e) => handleSkillChange(index, 'experienceText', e.target.value)}
                      placeholder="e.g. Performed independently for 4 years on residential sites"
                    />

                    <GlassInput
                      label="Tools & Equipment Used for Task"
                      value={skill.toolsUsed}
                      onChange={(e) => handleSkillChange(index, 'toolsUsed', e.target.value)}
                      placeholder="e.g. Multimeter, wire stripper, tester, conduit bender"
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                        Confidence Level
                      </label>
                      <select
                        value={skill.confidenceLevel}
                        onChange={(e) => handleSkillChange(index, 'confidenceLevel', e.target.value)}
                        className="glass-input"
                        style={{ height: '42px', padding: '0 12px' }}
                      >
                        <option value="Beginner">Beginner (Basic familiarity with supervision)</option>
                        <option value="Intermediate">Intermediate (Independent execution of routine tasks)</option>
                        <option value="Advanced">Advanced (Independent mastery & fault troubleshooting)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: AI Analysis (Gemini 3.6 Flash) */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 05 OF 07 • AI SKILL DIAGNOSTIC
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                AI-Assisted Skill Mapping
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Analyze your declared experience using Gemini 3.6 Flash to identify potential skill areas and preparation requirements.
              </p>
            </div>

            {/* Offline Notification */}
            {!isOnline && (
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  color: '#92400e',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <WifiOff size={18} />
                <span>AI analysis requires an internet connection. Your entered form data remains safely stored on your device.</span>
              </div>
            )}

            {/* Ethical Boundary Disclaimer */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(240, 249, 255, 0.8)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                color: '#0369a1',
                fontSize: '12.5px',
                lineHeight: 1.5
              }}
            >
              <strong>Assessment Boundary Notice:</strong> The AI Skill Analysis identifies <em>potential skill matches</em> and <em>suggested competency areas</em>. It does NOT certify you or award an official NSQF level. All competencies require authorized assessor verification.
            </div>

            {/* Action Button */}
            <div>
              <button
                type="button"
                onClick={handleAnalyzeSkills}
                disabled={isAnalyzing || !isOnline}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: isOnline
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isAnalyzing || !isOnline ? 'not-allowed' : 'pointer',
                  boxShadow: isOnline ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none'
                }}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? 'Analyzing with Gemini 3.6 Flash...' : 'Analyze My Skills'}</span>
              </button>
            </div>

            {/* AI Results Display */}
            {formData.aiAnalysisSnapshot ? (
              <div
                style={{
                  padding: '22px',
                  borderRadius: '18px',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                    {formData.aiAnalysisSnapshot.summary || 'AI Skill Analysis Result'}
                  </h3>
                  <GlassBadge variant="teal">AI Diagnostic Match</GlassBadge>
                </div>

                {/* Potential Skill Matches */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Potential Skill Matches
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.aiAnalysisSnapshot.potentialSkillMatches?.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #bae6fd',
                          fontSize: '12.5px',
                          color: '#0369a1',
                          fontWeight: 600
                        }}
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Competency Areas */}
                {formData.aiAnalysisSnapshot.suggestedCompetencyAreas?.length ? (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f2744', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Suggested Competency Areas
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
                      {formData.aiAnalysisSnapshot.suggestedCompetencyAreas.map((area, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{area}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Suggested Evidence to Provide */}
                {formData.aiAnalysisSnapshot.suggestedEvidence?.length ? (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f2744', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Suggested Evidence for Assessor Review
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
                      {formData.aiAnalysisSnapshot.suggestedEvidence.map((ev, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Areas Requiring Verification */}
                {formData.aiAnalysisSnapshot.areasRequiringVerification?.length ? (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      fontSize: '12.5px',
                      color: '#92400e'
                    }}
                  >
                    <strong>Requires Assessor Practical Verification:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                      {formData.aiAnalysisSnapshot.areasRequiringVerification.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* STEP 5B: NSQF Qualification Pack Candidate Matches */}
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(2, 132, 199, 0.2)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                        Candidate NSQF Qualification Packs ({candidateMatches.length || (formData.qualificationMappings?.length || 0)})
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Recommended based on verified NCVET / NQR standards
                      </span>
                    </div>

                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentView('qualification-match')}
                    >
                      <Layers size={13} />
                      <span>Open Full NSQF Mapping View</span>
                    </GlassButton>
                  </div>

                  {(candidateMatches.length > 0 ? candidateMatches : (formData.qualificationMappings as CandidateMatchResult[]) || []).map((cand) => (
                    <div key={cand.qpCode} style={{ marginBottom: '14px' }}>
                      <QualificationMatchCard
                        match={cand}
                        isSelected={formData.selectedQpCode === cand.qpCode}
                        onSelect={() => {
                          setFormData((prev) => ({ ...prev, selectedQpCode: cand.qpCode }));
                          showToast(`Selected ${cand.title} (${cand.qpCode}) for RPL assessment.`, 'info');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b'
                }}
              >
                Click <strong>"Analyze My Skills"</strong> above to extract competencies and generate candidate qualification pack matches.
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Evidence (Marked "Next Step") */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                  STEP 06 OF 07 • EVIDENCE PORTFOLIO
                </span>
                <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  Evidence Portfolio Preparation
                </h2>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(2, 132, 199, 0.3)'
                }}
              >
                Next Step in RPL
              </span>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              In the next stage of your RPL journey, you will provide physical or digital evidence corroborating your declared skills.
            </p>

            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f2744', margin: 0 }}>
                Recommended Evidence Items to Gather:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                <li>Clear photos of wiring, panel installations, and finished equipment you built or serviced.</li>
                <li>Short video demonstrations showing proper tool usage and safety protocol adherence.</li>
                <li>Letters of recommendation, service vouchers, or statements from previous employers or clients.</li>
                <li>Any prior course certificates, licenses, or apprenticeship training cards.</li>
              </ul>
            </div>

            <GlassInput
              label="Notes regarding evidence you plan to provide (Optional)"
              value={formData.evidenceNote || ''}
              onChange={(e) => setFormData({ ...formData, evidenceNote: e.target.value })}
              placeholder="e.g. I will show panel board photos and provide contact of 2 building contractors..."
              multiline
              rows={3}
            />
          </div>
        )}

        {/* STEP 7: Submit Application */}
        {currentStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 07 OF 07 • REVIEW & SUBMIT
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Final Application Review
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Review your declared details before submitting to an accredited assessor.
              </p>
            </div>

            {/* Summary Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div><strong>Candidate:</strong> {formData.name}</div>
                <div><strong>Trade:</strong> {formData.trade}</div>
                <div><strong>Experience:</strong> {formData.yearsOfExperience} years</div>
                <div><strong>Workplaces Added:</strong> {formData.experiences.length} entries</div>
                <div><strong>Declared Skills:</strong> {formData.skills.length} practical tasks</div>
                <div><strong>AI Analysis:</strong> {formData.aiAnalysisSnapshot ? 'Completed' : 'Skipped'}</div>
              </div>
            </div>

            {/* Declaration Agreement */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(236, 253, 245, 0.8)',
                border: '1px solid #10b981',
                fontSize: '13px',
                color: '#065f46'
              }}
            >
              ✓ <strong>Worker Declaration:</strong> I certify that the statements provided in this application are an accurate representation of my practical trade experience and skills. I understand that an accredited assessor will conduct a standardized practical evaluation.
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={isSubmitting || !isOnline}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: isOnline
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isSubmitting || !isOnline ? 'not-allowed' : 'pointer',
                  boxShadow: isOnline ? '0 4px 16px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Submitting to Assessor...' : 'Submit RPL Application'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons (Bottom) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
          {currentStep > 1 ? (
            <GlassButton variant="secondary" onClick={handlePrevStep} disabled={isSaving}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </GlassButton>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <GlassButton variant="ghost" onClick={() => saveDraft(currentStep)} disabled={isSaving}>
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </GlassButton>

            {currentStep < 7 ? (
              <GlassButton variant="primary" onClick={handleNextStep} disabled={isSaving}>
                <span>Save & Continue</span>
                <ChevronRight size={16} />
              </GlassButton>
            ) : null}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
