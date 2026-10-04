import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Copy,
  Check,
  RotateCcw,
  Plus,
  X,
  FileCheck,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Layers
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';
import type { SkillAnalysisResult, SkillAnalysisInput } from '../../lib/ai/skill-analysis';

// Default prompt test case data for rapid 1-click verification
const SAMPLE_ELECTRICIAN_DATA: SkillAnalysisInput = {
  occupation: 'Electrician',
  yearsExperience: 5,
  experience:
    'I have worked as an electrician for five years. I install household wiring, switches and sockets. I use a multimeter and electrical testers. I identify basic electrical faults and perform routine repairs.',
  tasks: [
    'Wiring installation',
    'Installing switches',
    'Testing circuits',
    'Fault identification',
    'Repairs'
  ],
  tools: [
    'Multimeter',
    'Electrical tester',
    'Hand tools'
  ],
  skills: [
    'Household wiring',
    'Circuit testing',
    'Fault detection'
  ],
  additionalExperience: 'Regular maintenance for residential units and safety compliance testing.'
};

export const AiAnalysisPage: React.FC = () => {
  const { setCurrentView } = useApp();

  // Form State
  const [occupation, setOccupation] = useState('Electrician');
  const [yearsExperience, setYearsExperience] = useState<number>(5);
  const [experience, setExperience] = useState(
    'I have worked as an electrician for five years. I install household wiring, switches and sockets. I use a multimeter and electrical testers. I identify basic electrical faults and perform routine repairs.'
  );
  const [tasks, setTasks] = useState<string[]>([
    'Wiring installation',
    'Installing switches',
    'Testing circuits',
    'Fault identification',
    'Repairs'
  ]);
  const [taskInput, setTaskInput] = useState('');

  const [tools, setTools] = useState<string[]>([
    'Multimeter',
    'Electrical tester',
    'Hand tools'
  ]);
  const [toolInput, setToolInput] = useState('');

  const [skills, setSkills] = useState<string[]>([
    'Household wiring',
    'Circuit testing',
    'Fault detection'
  ]);
  const [skillInput, setSkillInput] = useState('');

  const [additionalExperience, setAdditionalExperience] = useState('');

  // Execution & UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkillAnalysisResult | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tag Helpers
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (taskInput.trim() && !tasks.includes(taskInput.trim())) {
      setTasks([...tasks, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const handleRemoveTask = (item: string) => {
    setTasks(tasks.filter((t) => t !== item));
  };

  const handleAddTool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (toolInput.trim() && !tools.includes(toolInput.trim())) {
      setTools([...tools, toolInput.trim()]);
      setToolInput('');
    }
  };

  const handleRemoveTool = (item: string) => {
    setTools(tools.filter((t) => t !== item));
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (item: string) => {
    setSkills(skills.filter((s) => s !== item));
  };

  const loadSampleData = () => {
    setOccupation(SAMPLE_ELECTRICIAN_DATA.occupation);
    setYearsExperience(SAMPLE_ELECTRICIAN_DATA.yearsExperience);
    setExperience(SAMPLE_ELECTRICIAN_DATA.experience);
    setTasks([...SAMPLE_ELECTRICIAN_DATA.tasks]);
    setTools([...SAMPLE_ELECTRICIAN_DATA.tools]);
    setSkills([...SAMPLE_ELECTRICIAN_DATA.skills]);
    setAdditionalExperience(SAMPLE_ELECTRICIAN_DATA.additionalExperience || '');
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!occupation.trim()) {
      setError('Please provide your Occupation / Trade.');
      return;
    }
    if (!experience.trim()) {
      setError('Please describe your Work Experience.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/skill-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: occupation.trim(),
          yearsExperience: Number(yearsExperience) || 0,
          experience: experience.trim(),
          tasks,
          tools,
          skills,
          additionalExperience: additionalExperience.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete AI Skill Analysis.');
      }

      setResult(data.data);
      if (data.recordId) {
        setSavedRecordId(data.recordId);
      }
    } catch (err: any) {
      setError(err?.message || 'AI Skill Analysis is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnalysisSummary = () => {
    if (!result) return;
    const summaryText = `AI Skill Analysis Result
Potential Occupation: ${result.potentialOccupation}

Potential Skills:
${result.skills.map((s) => `- ${s.name} (${s.confidence} confidence): ${s.reason}`).join('\n')}

Demonstrated Tasks:
${result.tasks.map((t) => `- ${t}`).join('\n')}

Tools & Equipment:
${result.tools.map((t) => `- ${t}`).join('\n')}

Assessment Areas:
${result.assessmentAreas.map((a) => `- ${a}`).join('\n')}

Suggested Evidence:
${result.suggestedEvidence.map((e) => `- ${e}`).join('\n')}

Potential Qualification / Skill Mapping:
${result.potentialQualificationMappings.map((m) => `- ${m}`).join('\n')}

Requires Assessor Verification:
${result.verificationRequired.map((v) => `- ${v}`).join('\n')}

Notice: AI-generated analysis is supportive and does not constitute an official competency or certification decision.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Top Navigation & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => setCurrentView('ai-assistant')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--color-primary-navy)',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(18, 59, 93, 0.15)',
            padding: '7px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(11, 41, 66, 0.04)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to RPL AI Assistant</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlassBadge variant="sky" icon={<Cpu size={13} />}>
            Gemini 3.6 Flash Engine
          </GlassBadge>
          <GlassBadge variant="teal" icon={<ShieldCheck size={13} />}>
            RPL Assessor Co-Pilot
          </GlassBadge>
        </div>
      </div>

      {/* Header Glass Card */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '28px 24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.88) 100%)',
          border: '1px solid rgba(77, 163, 217, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                boxShadow: '0 4px 16px rgba(18, 59, 93, 0.25)',
                flexShrink: 0
              }}
            >
              <Cpu size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0, letterSpacing: '-0.02em' }}>
                AI Skill Analysis
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Deep RPL assessment synthesis analyzing declared trade experience, tasks, tools, and evidence pathways.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSampleData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--color-primary-navy)',
              background: 'rgba(77, 163, 217, 0.15)',
              border: '1px solid rgba(77, 163, 217, 0.35)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Pre-fill with Electrician 5-year test scenario"
          >
            <Sparkles size={14} color="#0284c7" />
            <span>Load Electrician Sample</span>
          </button>
        </div>

        {/* Assessor Trust Notice */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(37, 167, 160, 0.08)',
            border: '1px solid rgba(37, 167, 160, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12.5px',
            color: 'var(--color-primary-navy)'
          }}
        >
          <ShieldCheck size={18} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Assessment Trust Notice: </strong>
            AI-generated analysis is supportive and does not constitute an official competency or certification decision. Formal certification requires authorized assessor review and practical observation.
          </span>
        </div>
      </GlassCard>

      {/* Main Grid: Input Form & Results */}
      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr' : '1fr', gap: '24px' }}>
        {/* INPUT SECTIONS */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.9) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(18, 59, 93, 0.08)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={20} color="var(--color-primary-navy)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                Candidate Experience Declaration
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Complete the sections below for diagnostic AI mapping
            </span>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* 1. Occupation / Trade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                Occupation / Trade *
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Electrician, Plumber, Welder"
                className="glass-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* 2. Years of Experience */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                Years of Experience *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 5"
                className="glass-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* 3. Work Experience Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Work Experience *
            </label>
            <textarea
              rows={4}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Describe your day-to-day work, installations, routine maintenance, troubleshooting, and projects..."
              className="glass-input"
              style={{ width: '100%', resize: 'vertical', minHeight: '90px' }}
            />
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
              Provide clear narrative context of your hands-on tasks and responsibilities.
            </span>
          </div>

          {/* 4. Tasks Performed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Tasks Performed
            </label>
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a specific task (e.g. Wiring installation) and press Enter"
                className="glass-input"
                style={{ flex: 1 }}
              />
              <GlassButton type="button" variant="secondary" size="sm" onClick={handleAddTask} icon={<Plus size={14} />}>
                Add Task
              </GlassButton>
            </form>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '32px' }}>
              {tasks.map((task) => (
                <span
                  key={task}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(77, 163, 217, 0.15)',
                    border: '1px solid rgba(77, 163, 217, 0.3)',
                    color: 'var(--color-primary-navy)'
                  }}
                >
                  <span>{task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(18, 59, 93, 0.6)' }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 5. Tools & Equipment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Tools & Equipment
            </label>
            <form onSubmit={handleAddTool} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                placeholder="Add a tool (e.g. Multimeter, Wire strippers) and press Enter"
                className="glass-input"
                style={{ flex: 1 }}
              />
              <GlassButton type="button" variant="secondary" size="sm" onClick={handleAddTool} icon={<Plus size={14} />}>
                Add Tool
              </GlassButton>
            </form>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '32px' }}>
              {tools.map((tool) => (
                <span
                  key={tool}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(37, 167, 160, 0.12)',
                    border: '1px solid rgba(37, 167, 160, 0.28)',
                    color: 'var(--color-primary-navy)'
                  }}
                >
                  <Wrench size={12} color="var(--color-accent-teal)" />
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(18, 59, 93, 0.6)' }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Self-Declared Skills
            </label>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g. Household wiring) and press Enter"
                className="glass-input"
                style={{ flex: 1 }}
              />
              <GlassButton type="button" variant="secondary" size="sm" onClick={handleAddSkill} icon={<Plus size={14} />}>
                Add Skill
              </GlassButton>
            </form>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '32px' }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(24, 100, 235, 0.1)',
                    border: '1px solid rgba(24, 100, 235, 0.25)',
                    color: 'var(--color-primary-navy)'
                  }}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(18, 59, 93, 0.6)' }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 7. Additional Experience */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-navy)' }}>
              Additional Experience (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalExperience}
              onChange={(e) => setAdditionalExperience(e.target.value)}
              placeholder="Any apprenticeships, safety training, workshops, or client contexts..."
              className="glass-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#b91c1c',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
            <GlassButton
              type="button"
              variant="primary"
              size="lg"
              disabled={isLoading}
              onClick={handleAnalyze}
              icon={<Sparkles size={18} />}
              style={{ minWidth: '220px' }}
            >
              {isLoading ? 'Analyzing Skills with Gemini...' : 'Analyze My Skills'}
            </GlassButton>
          </div>
        </GlassCard>

        {/* RESULTS SECTION */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
            {/* Result Header & Actions */}
            <GlassCard
              variant="elevated"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.92) 100%)',
                border: '1px solid rgba(77, 163, 217, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1b62cc 0%, #0d429a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                      AI Skill Analysis Result
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Diagnostic synthesis completed • Database Record ID: {savedRecordId || 'Synced'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    onClick={copyAnalysisSummary}
                  >
                    {copied ? 'Copied' : 'Copy Summary'}
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={<RotateCcw size={14} />}
                    onClick={() => {
                      setResult(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Re-Analyze
                  </GlassButton>
                </div>
              </div>

              {/* Potential Occupation Banner */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(18, 59, 93, 0.05) 0%, rgba(77, 163, 217, 0.12) 100%)',
                  border: '1px solid rgba(77, 163, 217, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Potential Occupation Identified
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                    {result.potentialOccupation}
                  </div>
                </div>
                <GlassBadge variant="sky" icon={<CompassIcon />}>
                  Diagnostic Alignment
                </GlassBadge>
              </div>

              {/* Mandatory Assessor Disclaimer */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: '#92400e'
                }}
              >
                <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Advisory Disclaimer: </strong>
                  AI-generated analysis is supportive and does not constitute an official competency or certification decision.
                </span>
              </div>
            </GlassCard>

            {/* Potential Skills Cards */}
            <GlassCard
              variant="default"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.9) 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="var(--color-accent-teal)" />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Potential Skills
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.skills.map((skill, index) => {
                  const badgeColor =
                    skill.confidence === 'HIGH'
                      ? { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#065f46' }
                      : skill.confidence === 'MEDIUM'
                      ? { bg: 'rgba(2, 132, 199, 0.12)', border: 'rgba(2, 132, 199, 0.3)', text: '#0369a1' }
                      : { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)', text: '#475569' };

                  return (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.75)',
                        border: '1px solid rgba(18, 59, 93, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                          {skill.name}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: badgeColor.bg,
                            border: `1px solid ${badgeColor.border}`,
                            color: badgeColor.text
                          }}
                        >
                          {skill.confidence} CONFIDENCE
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        <strong>Why AI identified it: </strong>
                        {skill.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Assessment Areas & Suggested Evidence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Assessment Areas */}
              <GlassCard
                variant="default"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={20} color="var(--color-secondary-sky)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                    Potential Assessment Areas
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.assessmentAreas.map((area, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--color-primary-navy)',
                        lineHeight: 1.45
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--color-secondary-sky)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Suggested Evidence */}
              <GlassCard
                variant="default"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCheck size={20} color="var(--color-accent-teal)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                    Suggested Evidence Portfolio
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.suggestedEvidence.map((ev, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--color-primary-navy)',
                        lineHeight: 1.45
                      }}
                    >
                      <Lightbulb size={16} color="var(--color-accent-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Tasks & Tools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Tasks Demonstrated */}
              <GlassCard
                variant="default"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Tasks Demonstrated
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.tasks.map((task, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary-sky)' }} />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Tools Mentioned */}
              <GlassCard
                variant="default"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Tools & Equipment Mentioned
                </h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {result.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(37, 167, 160, 0.1)',
                        border: '1px solid rgba(37, 167, 160, 0.25)',
                        color: 'var(--color-primary-navy)'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Potential Qualification Mappings */}
            <GlassCard
              variant="default"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={20} color="#0284c7" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Potential Qualification / Skill Mapping
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.potentialQualificationMappings.map((mapItem, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(2, 132, 199, 0.06)',
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                      fontSize: '13px',
                      color: 'var(--color-primary-navy)',
                      lineHeight: 1.45
                    }}
                  >
                    {mapItem}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Requires Assessor Verification (Mandatory section) */}
            <GlassCard
              variant="elevated"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="#D97706" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#92400E', margin: 0 }}>
                  Requires Assessor Verification
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
                The following critical safety procedures, technical proficiencies, or equipment calibrations cannot be confirmed solely through self-declaration and require live practical observation or oral probing by an authorized human assessor:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.verificationRequired.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#92400E',
                      lineHeight: 1.45
                    }}
                  >
                    <span style={{ color: '#D97706', fontWeight: 700, fontSize: '14px' }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', flexWrap: 'wrap', paddingTop: '8px' }}>
              <GlassButton
                variant="primary"
                icon={<ExternalLink size={16} />}
                onClick={() => setCurrentView('evidence')}
              >
                Upload Supporting Evidence
              </GlassButton>
              <GlassButton
                variant="secondary"
                icon={<ArrowLeft size={16} />}
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Edit Inputs & Run Again
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Subtle icon component for alignment
const CompassIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
