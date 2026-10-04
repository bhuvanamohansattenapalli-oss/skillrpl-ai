import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  User,
  Check
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { QualificationMatchCard } from '../common/QualificationMatchCard';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../lib/offline/draft-storage';
import {
  requestQualificationMapping,
  submitAssessorMappingReview
} from '../../lib/api/qualification-mapping';
import { getAllVerifiedQualifications } from '../../data/qualification-catalog';
import type { CandidateMatchResult } from '../../lib/mapping/qualification-engine';

export const QualificationMatchPage: React.FC = () => {
  const {
    activeApplicationId,
    candidate,
    showToast,
    setCurrentView
  } = useApp();
  const { session, role, profile } = useAuth();
  const isOnline = useOnlineStatus();

  // State
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<CandidateMatchResult[]>([]);
  const [selectedQpCode, setSelectedQpCode] = useState<string | null>(null);
  const [mappingNotice, setMappingNotice] = useState<string>('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [mappingStatus, setMappingStatus] = useState<string>('SUGGESTED');
  const [assessorNotes, setAssessorNotes] = useState<string>('');

  // Assessor Review Modal / Drawer State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'ACCEPT' | 'REJECT' | 'MODIFY' | 'FLAG'>('ACCEPT');
  const [chosenAlternativeQp, setChosenAlternativeQp] = useState<string>('CON/Q0603');
  const [reviewReason, setReviewReason] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Available qualifications for assessor dropdown
  const allVerifiedQps = getAllVerifiedQualifications();

  // Worker inputs
  const workerName = profile?.name || candidate?.name || 'Worker Candidate';
  const workerTrade = profile?.trade || candidate?.trade || 'Electrical Installation & Maintenance';
  const workerExperienceYears = candidate?.yearsOfExperience || 4;

  const defaultTasks = [
    'Install and terminate domestic & light industrial electrical wiring',
    'Assemble 3-phase motor control panels with Star-Delta starters',
    'Conduit pipe cutting, bending and surface/flush mounting',
    'Circuit continuity and insulation resistance testing with Megger'
  ];

  const defaultTools = [
    'Digital multimeter',
    'Insulation resistance tester (Megger)',
    'Hydraulic crimping tool',
    'Conduit pipe bender',
    'Wire strippers and combination pliers'
  ];

  const defaultSkills = [
    'Cable laying & conduit installation',
    'Distribution board & switchgear termination',
    'Electrical circuit testing & fault localization',
    'Electrical safety & PPE compliance'
  ];

  // Perform or load mapping
  const runMapping = async () => {
    setLoading(true);
    try {
      const result = await requestQualificationMapping(
        activeApplicationId || 'default-app-id',
        {
          occupation: workerTrade,
          yearsExperience: workerExperienceYears,
          skills: defaultSkills,
          tasks: defaultTasks,
          tools: defaultTools,
          experienceDescription: `${workerTrade} with ${workerExperienceYears} years hands-on experience in residential and commercial electrical installation, panel wiring, and fault diagnostics.`
        },
        session?.access_token
      );

      if (result.success && result.candidates.length > 0) {
        setCandidates(result.candidates);
        setExtractedSkills(result.extractedSkillsSummary || defaultSkills);
        setMappingNotice(result.notice);
        if (!selectedQpCode) {
          setSelectedQpCode(result.candidates[0].qpCode);
        }
        showToast(
          result.offlineMode
            ? 'Deterministic qualification matching completed (Offline mode)'
            : 'NSQF Qualification Pack mapping completed!',
          'success'
        );
      } else {
        setMappingNotice(result.notice || 'No matching qualification found.');
      }
    } catch (err: any) {
      showToast(err.message || 'Mapping evaluation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMapping();
  }, []);

  // Handle Assessor Decision Submission
  const handleSubmitReviewDecision = async () => {
    setIsSubmittingReview(true);
    try {
      const qpCodeToSet = reviewDecision === 'MODIFY' ? chosenAlternativeQp : (selectedQpCode || 'CON/Q0603');
      const res = await submitAssessorMappingReview({
        applicationId: activeApplicationId || 'default-app-id',
        selectedQualificationCode: qpCodeToSet,
        decision: reviewDecision,
        assessorNotes: assessorNotes || 'Accredited Assessor reviewed candidate profile against NCVET qualification pack requirements.',
        rejectionReason: reviewDecision === 'REJECT' || reviewDecision === 'FLAG' ? reviewReason : undefined,
        token: session?.access_token
      });

      if (res.success) {
        setMappingStatus(res.status || reviewDecision);
        showToast(`Assessor review decision recorded: ${res.status}`, 'success');
        setIsReviewModalOpen(false);
      } else {
        showToast(res.error || 'Failed to submit review', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Review submission error', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            onClick={() => setCurrentView(role === 'ASSESSOR' ? 'assessor-candidate' : 'declaration')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary-sky)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: '6px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to {role === 'ASSESSOR' ? 'Candidate Review' : 'Self-Declaration'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
              NSQF Qualification Pack Mapping
            </h1>
            <GlassBadge variant={mappingStatus === 'ACCEPTED' ? 'teal' : mappingStatus === 'REJECTED' ? 'error' : 'sky'}>
              Status: {mappingStatus}
            </GlassBadge>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Authoritative NCVET / NQR qualification pack alignment powered by hybrid deterministic and Gemini 3.6 Flash semantic matching.
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
              <span>Offline Mode Active</span>
            </div>
          )}

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={runMapping}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Re-evaluating...' : 'Re-Run Mapping'}</span>
          </GlassButton>

          {role === 'ASSESSOR' && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
            >
              <Award size={14} />
              <span>Review Mapping Decision</span>
            </GlassButton>
          )}
        </div>
      </div>

      {/* Offline Notice if offline */}
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
          <WifiOff size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Offline Catalog Mode:</strong> AI semantic analysis will be available when connectivity is restored. Deterministic matching based on cached NCVET verified qualifications is active.
          </div>
        </div>
      )}

      {/* Regulatory & Ethical Assessment Boundary Notice */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: '14px',
          background: 'rgba(240, 249, 255, 0.85)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          color: '#0369a1',
          fontSize: '13px',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
        <div>
          <strong>Regulatory Transparency & Certification Integrity:</strong>
          <span style={{ display: 'block', marginTop: '2px' }}>
            System match scores are AI-assisted recommendations designed to assist accredited assessors. 
            The AI <strong>does NOT</strong> grant official certification or formally award NSQF levels. Official RPL certification is awarded exclusively following formal practical assessment and evaluation by an accredited assessor.
          </span>
        </div>
      </div>

      {/* 1. Worker Profile Summary Card */}
      <GlassCard style={{ padding: '20px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #123B5D 0%, #0d429a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                {workerName}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Declared Trade: <strong>{workerTrade}</strong> • Experience: <strong>{workerExperienceYears} Years</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <GlassBadge variant="navy">{workerExperienceYears} Yrs Practical Experience</GlassBadge>
            <GlassBadge variant="teal">Self-Declaration Completed</GlassBadge>
          </div>
        </div>

        {/* 2. Skills Extracted Summary */}
        <div style={{ borderTop: '1px solid rgba(18, 59, 93, 0.08)', paddingTop: '14px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-secondary-sky)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '8px'
            }}
          >
            Identified Competencies & Practical Skills ({extractedSkills.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {extractedSkills.map((sk, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  fontSize: '12.5px',
                  color: '#0369a1',
                  fontWeight: 600
                }}
              >
                <Check size={13} />
                <span>{sk}</span>
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 3. Recommended Qualifications (Top Candidates) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-accent-teal)', textTransform: 'uppercase' }}>
              RECOMMENDED NSQF QUALIFICATION PACKS
            </span>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '2px 0 0 0' }}>
              Candidate Qualification Matches ({candidates.length})
            </h2>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
            Ranked by System Match Score
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '20px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <Sparkles size={32} className="animate-spin" style={{ color: '#0284c7', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2744', margin: '0 0 4px 0' }}>
              Evaluating Candidate Qualifications...
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Comparing declared experience against NCVET standards via hybrid deterministic & Gemini 3.6 Flash engine.
            </p>
          </div>
        ) : candidates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {candidates.map((cand) => (
              <QualificationMatchCard
                key={cand.qpCode}
                match={cand}
                isSelected={selectedQpCode === cand.qpCode}
                onSelect={() => {
                  setSelectedQpCode(cand.qpCode);
                  showToast(`Selected ${cand.title} (${cand.qpCode}) for RPL assessment.`, 'info');
                }}
                isAssessorMode={role === 'ASSESSOR'}
                onAssessorAccept={() => {
                  setSelectedQpCode(cand.qpCode);
                  setReviewDecision('ACCEPT');
                  setIsReviewModalOpen(true);
                }}
                onAssessorReject={() => {
                  setSelectedQpCode(cand.qpCode);
                  setReviewDecision('REJECT');
                  setIsReviewModalOpen(true);
                }}
                onAssessorModify={() => {
                  setSelectedQpCode(cand.qpCode);
                  setReviewDecision('MODIFY');
                  setIsReviewModalOpen(true);
                }}
                onAssessorFlag={() => {
                  setSelectedQpCode(cand.qpCode);
                  setReviewDecision('FLAG');
                  setIsReviewModalOpen(true);
                }}
                status={selectedQpCode === cand.qpCode ? mappingStatus : undefined}
              />
            ))}
          </div>
        ) : (
          <GlassCard style={{ padding: '36px', textAlign: 'center', borderRadius: '18px' }}>
            <AlertTriangle size={36} style={{ color: '#d97706', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-navy)', margin: '0 0 6px 0' }}>
              No Suitable Qualification Match Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto 16px auto' }}>
              {mappingNotice || 'The declared experience does not have sufficient overlap with our current verified trade catalog. Please update your occupation or skills.'}
            </p>
            <GlassButton variant="secondary" onClick={() => setCurrentView('declaration')}>
              Edit Self-Declaration
            </GlassButton>
          </GlassCard>
        )}
      </div>

      {/* 4. Bottom Action Bar (Worker Flow) */}
      {role !== 'ASSESSOR' && (
        <GlassCard
          style={{
            padding: '18px 24px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
              Current Selection:
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
              {selectedQpCode ? (
                candidates.find((c) => c.qpCode === selectedQpCode)?.title || selectedQpCode
              ) : (
                'Please select a candidate qualification pack above'
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <GlassButton
              variant="secondary"
              onClick={() => setCurrentView('declaration')}
            >
              Return to Application Form
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                showToast('Qualification Pack confirmed for RPL Evidence portfolio!', 'success');
                setCurrentView('evidence');
              }}
              disabled={!selectedQpCode}
            >
              Proceed to Evidence Portfolio
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Assessor Review Decision Modal */}
      {isReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 41, 66, 0.55)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '24px',
              background: '#ffffff',
              boxShadow: '0 24px 48px -12px rgba(11, 41, 66, 0.25)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                    Assessor Review: Qualification Mapping
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Candidate: {workerName}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f2744' }}>
                Review Decision
              </label>
              <select
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value as any)}
                className="glass-input"
                style={{ height: '42px', padding: '0 12px' }}
              >
                <option value="ACCEPT">Accept Suggested Qualification ({selectedQpCode || 'CON/Q0603'})</option>
                <option value="MODIFY">Choose Another Available Qualification</option>
                <option value="REJECT">Reject Suggestion (Insufficient Competency Coverage)</option>
                <option value="FLAG">Flag Incorrect Mapping (Discrepancy / Misclassification)</option>
              </select>
            </div>

            {/* Alternative QP dropdown if MODIFY */}
            {reviewDecision === 'MODIFY' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f2744' }}>
                  Select Alternative Verified Qualification Pack
                </label>
                <select
                  value={chosenAlternativeQp}
                  onChange={(e) => setChosenAlternativeQp(e.target.value)}
                  className="glass-input"
                  style={{ height: '42px', padding: '0 12px' }}
                >
                  {allVerifiedQps.map((qp) => (
                    <option key={qp.code} value={qp.code}>
                      {qp.title} ({qp.code} • NSQF Level {qp.nsqfLevel})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reason input for REJECT or FLAG */}
            {(reviewDecision === 'REJECT' || reviewDecision === 'FLAG') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>
                  Reason for {reviewDecision === 'REJECT' ? 'Rejection' : 'Flagging'} (Required)
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Specify why the suggested qualification pack is unsuitable or requires reassignment..."
                  rows={3}
                  className="glass-input"
                  style={{ padding: '10px 12px', resize: 'vertical' }}
                  required
                />
              </div>
            )}

            {/* General Assessor Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f2744' }}>
                Assessor Verification Remarks / Observations
              </label>
              <textarea
                value={assessorNotes}
                onChange={(e) => setAssessorNotes(e.target.value)}
                placeholder="Candidate demonstrated core domestic wiring competency; practical assessment of distribution panel required..."
                rows={3}
                className="glass-input"
                style={{ padding: '10px 12px', resize: 'vertical' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <GlassButton
                variant="secondary"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmittingReview}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleSubmitReviewDecision}
                disabled={isSubmittingReview || ((reviewDecision === 'REJECT' || reviewDecision === 'FLAG') && !reviewReason.trim())}
              >
                {isSubmittingReview ? 'Recording Decision...' : 'Confirm Decision'}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
