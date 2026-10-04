import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Shield,
  Sliders,
  Check
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassInput } from '../common/GlassInput';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';

export const SelfDeclarationPage: React.FC = () => {
  const { selfDeclaration, updateSelfDeclaration, candidate, experiences, showToast, setCurrentView } = useApp();

  const [currentStep, setCurrentStep] = useState(3); // Start on 03 Skills as default active or allow navigating

  const steps = [
    { num: '01', title: 'Profile' },
    { num: '02', title: 'Experience' },
    { num: '03', title: 'Skills' },
    { num: '04', title: 'Practical Work' },
    { num: '05', title: 'Evidence' },
    { num: '06', title: 'Review' }
  ];

  const allAvailableTools = [
    'Digital Multimeter (AC/DC True RMS)',
    'Insulation Resistance Tester (Megger)',
    'Earth Pit Resistance Tester',
    'Hydraulic Cable Lug Crimper',
    'Lockout / Tagout (LOTO) Kit',
    'Phase Sequence Indicator',
    'Torque Wrench for Busbars',
    'Infrared Thermometer / Camera',
    'Soldering & De-soldering Station',
    'Wire Strippers & Conduit Bender',
    'High-Voltage Safety Discharge Rod',
    'Oscilloscope & Power Analyzer'
  ];

  const practicalTaskOptions = [
    'Assemble and wire 3-phase distribution boards with MCB, RCCB, and SPD',
    'Connect and configure Star-Delta starters with thermal overload relays',
    'Perform earth resistance testing and install copper earth electrodes',
    'Read and execute single-line electrical schematics (SLD)',
    'Calibrate DC combiner box and string inverters for solar installations',
    'Diagnose motor winding insulation faults using high-voltage Megger',
    'Replace and balance 3-phase busbars inside industrial motor control centers'
  ];

  const toggleTool = (tool: string) => {
    const exists = selfDeclaration.selectedTools.includes(tool);
    const updated = exists
      ? selfDeclaration.selectedTools.filter((t) => t !== tool)
      : [...selfDeclaration.selectedTools, tool];
    updateSelfDeclaration({ selectedTools: updated });
  };

  const toggleTask = (task: string) => {
    const exists = selfDeclaration.practicalTasks.includes(task);
    const updated = exists
      ? selfDeclaration.practicalTasks.filter((t) => t !== task)
      : [...selfDeclaration.practicalTasks, task];
    updateSelfDeclaration({ practicalTasks: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
            Self Declaration
          </h1>
          <GlassBadge variant="navy">Mandatory RPL Step</GlassBadge>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Tell us what you have learned through your work and experience.
        </p>
      </div>

      {/* Step Navigation Bar */}
      <GlassCard
        style={{
          padding: '14px 20px',
          borderRadius: '18px',
          overflowX: 'auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '580px',
            gap: '8px'
          }}
        >
          {steps.map((st, idx) => {
            const stepIndex = idx + 1;
            const isCompleted = stepIndex < currentStep;
            const isActive = stepIndex === currentStep;

            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(stepIndex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'var(--color-secondary-soft)'
                    : isCompleted
                    ? 'rgba(255, 255, 255, 0.7)'
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
                    width: '26px',
                    height: '26px',
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
                  {isCompleted ? <Check size={14} /> : st.num}
                </div>
                <span
                  style={{
                    fontSize: '13px',
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

      {/* Main Glass Surface for Question Content */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          minHeight: '440px'
        }}
      >
        {/* Step 1: Profile Verification */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 01 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Candidate & Trade Verification
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Confirm your verified demographic and trade qualification details before proceeding with technical declaration.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <GlassInput label="Candidate Name" value={candidate.name} disabled />
              <GlassInput label="National Trade" value={candidate.trade} disabled />
              <GlassInput label="Trade Code" value={candidate.tradeCode} disabled />
              <GlassInput label="Target NSQF Level" value={`Level ${candidate.nsqfLevel}`} disabled />
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(223, 242, 255, 0.5)',
                border: '1px solid rgba(77, 163, 217, 0.25)',
                fontSize: '13px',
                color: 'var(--color-primary-navy)'
              }}
            >
              ✓ Your Aadhaar biometric identity and phone number have been securely linked to application <strong>{candidate.applicationId}</strong>.
            </div>
          </div>
        )}

        {/* Step 2: Experience Review */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 02 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Practical Experience Breakdown
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Verify that your documented industrial experience meets the minimum 3-year requirement for NSQF Level 5 RPL.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(18, 59, 93, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                      {exp.occupation}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {exp.organization} · {exp.startDate} - {exp.endDate} ({exp.yearsOfExperience} yrs)
                    </div>
                  </div>
                  <GlassBadge variant="success">Documented</GlassBadge>
                </div>
              ))}
            </div>

            <GlassInput
              label="What type of work do you regularly perform? *"
              placeholder="e.g. 415V 3-phase motor power distribution, fault tracing on CNC control cabinets, and substation transformer earthing..."
              multiline
              rows={3}
              value={selfDeclaration.regularWorkType}
              onChange={(e) => updateSelfDeclaration({ regularWorkType: e.target.value })}
            />
          </div>
        )}

        {/* Step 3: Skills & Tools Handled */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 03 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Tools & Equipment Handled Confidently
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Click to select each piece of workshop and industrial equipment you can operate without supervision:
              </p>
            </div>

            {/* Selectable Chips Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {allAvailableTools.map((tool) => {
                const isSelected = selfDeclaration.selectedTools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      borderRadius: '999px',
                      background: isSelected ? 'var(--color-secondary-soft)' : 'rgba(255, 255, 255, 0.8)',
                      border: isSelected ? '1.5px solid var(--color-secondary-sky)' : '1px solid rgba(18, 59, 93, 0.12)',
                      boxShadow: isSelected
                        ? '0 2px 6px rgba(77, 163, 217, 0.2), inset 0 1px 0 #FFFFFF'
                        : '0 1px 2px rgba(11, 41, 66, 0.03)',
                      color: isSelected ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--color-secondary-sky)' : 'rgba(18, 59, 93, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                    </div>
                    <span>{tool}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
              Selected: <strong>{selfDeclaration.selectedTools.length}</strong> equipment tools verified for candidate practical demonstration.
            </div>
          </div>
        )}

        {/* Step 4: Practical Tasks & Proficiency Sliders */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 04 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Independent Practical Execution
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Select practical tasks you can execute safely from start to finish without assistance.
              </p>
            </div>

            {/* Checkbox Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {practicalTaskOptions.map((task) => {
                const isChecked = selfDeclaration.practicalTasks.includes(task);
                return (
                  <label
                    key={task}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(223, 242, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                      border: isChecked ? '1px solid rgba(77, 163, 217, 0.35)' : '1px solid rgba(18, 59, 93, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTask(task)}
                      style={{ marginTop: '2px', width: '17px', height: '17px', accentColor: 'var(--color-secondary-sky)' }}
                    />
                    <span style={{ fontSize: '13.5px', color: 'var(--color-primary-navy)', fontWeight: isChecked ? 600 : 500 }}>
                      {task}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Proficiency Sliders */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#123B5D" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Self-Confidence Ratings (1% - 100%)
                </h3>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary-navy)' }}>Safety & LOTO Compliance Confidence</span>
                  <span style={{ color: 'var(--color-accent-teal)' }}>{selfDeclaration.safetyComplianceRating}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={selfDeclaration.safetyComplianceRating}
                  onChange={(e) => updateSelfDeclaration({ safetyComplianceRating: parseInt(e.target.value) })}
                  style={{ width: '100%', marginTop: '6px', accentColor: 'var(--color-accent-teal)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary-navy)' }}>Blueprint & Schematics Reading</span>
                  <span style={{ color: 'var(--color-secondary-sky)' }}>{selfDeclaration.blueprintReadingRating}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={selfDeclaration.blueprintReadingRating}
                  onChange={(e) => updateSelfDeclaration({ blueprintReadingRating: parseInt(e.target.value) })}
                  style={{ width: '100%', marginTop: '6px', accentColor: 'var(--color-secondary-sky)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Evidence & Difficult Task Scenario */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 05 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Complex Task Scenario & Evidence Mapping
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Assessors use this scenario to evaluate your practical analytical thinking and emergency safety response.
              </p>
            </div>

            <GlassInput
              label="Describe a difficult practical task or machine breakdown you have handled *"
              placeholder="Detail the issue, your safety precautions, diagnostic steps, tools used, and the outcome..."
              multiline
              rows={5}
              value={selfDeclaration.difficultTaskScenario}
              onChange={(e) => updateSelfDeclaration({ difficultTaskScenario: e.target.value })}
            />

            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Linked Evidence Items
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  6 Portfolio items attached for assessor verification
                </div>
              </div>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentView('evidence')}
              >
                Review Evidence
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 6: Review & Sign-Off */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
                STEP 06 OF 06
              </span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                Review Self-Declaration & Final Sign-Off
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Your self-declaration will be formally transferred to the Sector Skill Council authorized assessor queue.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px'
              }}
            >
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', border: '1px solid rgba(18, 59, 93, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOOLS DECLARED</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                  {selfDeclaration.selectedTools.length} Handled Confidently
                </div>
              </div>

              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', border: '1px solid rgba(18, 59, 93, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>PRACTICAL TASKS</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                  {selfDeclaration.practicalTasks.length} Independent Tasks
                </div>
              </div>

              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', border: '1px solid rgba(18, 59, 93, 0.08)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>SAFETY CONFIDENCE</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  {selfDeclaration.safetyComplianceRating}% Rating
                </div>
              </div>
            </div>

            {/* Official Assessor Disclaimer (Prominently Required) */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(240, 248, 255, 0.8)',
                border: '1px solid rgba(77, 163, 217, 0.35)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <Shield size={20} color="#123B5D" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: 0 }}>
                  Assessor Oversight & Integrity Guarantee
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  This self-declaration is an evidentiary prerequisite for the authorized assessor review. Final qualification awards are determined exclusively by physical or live video practical demonstration reviewed by an authorized assessor.
                </p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-primary-navy)',
                fontWeight: 600
              }}
            >
              <input
                type="checkbox"
                checked={selfDeclaration.declarationAgreed}
                onChange={(e) => updateSelfDeclaration({ declarationAgreed: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-secondary-sky)' }}
              />
              <span>I certify that all workplace declarations, tools operated, and case studies are authentic and accurate.</span>
            </label>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '20px',
            borderTop: '1px solid rgba(18, 59, 93, 0.08)'
          }}
        >
          <GlassButton
            variant="secondary"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            icon={<ChevronLeft size={16} />}
          >
            Previous Step
          </GlassButton>

          <div style={{ display: 'flex', gap: '10px' }}>
            <GlassButton
              variant="secondary"
              onClick={() => showToast('Declaration draft saved.', 'info')}
              icon={<Save size={16} />}
            >
              Save Draft
            </GlassButton>

            {currentStep < 6 ? (
              <GlassButton
                variant="primary"
                onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Next Step
              </GlassButton>
            ) : (
              <GlassButton
                variant="teal"
                onClick={() => {
                  showToast('Self-declaration submitted to assessor queue!', 'success');
                  setCurrentView('evidence');
                }}
                icon={<CheckCircle2 size={16} />}
                iconPosition="right"
              >
                Submit Declaration
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
