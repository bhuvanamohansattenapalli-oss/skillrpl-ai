import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  Flame,
  Award,
  Zap,
  BookOpen,
  Check,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassProgress } from '../common/GlassProgress';
import { useApp } from '../../context/AppContext';
import {
  startMCQAssessment,
  submitMCQAssessment,
  getWorkerMCQAttempts,
  getMCQAttempt,
  getActiveAttemptServer,
  saveSingleAnswer,
  type MCQQuestionClient,
  type MCQQuestionReview,
  type AssessmentAttemptResponse
} from '../../lib/api/mcq-assessment';
import {
  autosaveAnswers,
  loadAutosavedAnswers,
  getActiveAttempt,
  clearActiveAttempt,
  isOnline,
  saveActiveAttempt
} from '../../lib/assessment/offline-mcq';

const POPULAR_TRADES = [
  { name: 'Electrician', icon: Zap, desc: 'Safety, circuits, wiring, tools, testing & fault finding' },
  { name: 'Solar PV Technician', icon: Flame, desc: 'PV modules, inverters, DC wiring, grid-tie & safety' },
  { name: 'Plumber', icon: BookOpen, desc: 'Piping, drainage, traps, pressure testing & sanitary fittings' },
  { name: 'Construction Mason', icon: Award, desc: 'Brickwork, mortar ratios, curing, plastering & alignment' },
  { name: 'Automotive Technician', icon: Sparkles, desc: 'Engine diagnostics, OBD-II, brakes, suspension & electricals' }
];

export const AssessmentPage: React.FC = () => {
  const { showToast, setCurrentView } = useApp();

  // Screen modes: 'SELECT_TOPIC' | 'ACTIVE_TEST' | 'COMPLETED_RESULT'
  const [screenMode, setScreenMode] = useState<'SELECT_TOPIC' | 'ACTIVE_TEST' | 'COMPLETED_RESULT'>('SELECT_TOPIC');

  // Selected trade/topic
  const [selectedTopic, setSelectedTopic] = useState<string>('Electrician');
  const [customTopic, setCustomTopic] = useState<string>('');

  // Assessment state
  const [attemptId, setAttemptId] = useState<string>('');
  const [questions, setQuestions] = useState<MCQQuestionClient[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<string>('AI_GEMINI');

  // History & past attempts state
  const [pastAttempts, setPastAttempts] = useState<AssessmentAttemptResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Timer state (Default: 600s = 10 minutes)
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeSpentRef = useRef<number>(0);

  // Connectivity
  const [onlineStatus, setOnlineStatus] = useState<boolean>(true);

  // Result state after submission
  const [attemptResult, setAttemptResult] = useState<AssessmentAttemptResponse | null>(null);
  const [questionReview, setQuestionReview] = useState<MCQQuestionReview[]>([]);

  // Load database assessment history
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const attempts = await getWorkerMCQAttempts();
      setPastAttempts(attempts.filter((a) => a.status === 'COMPLETED' || a.status === 'UNDER_ASSESSMENT'));
    } catch (err) {
      console.warn('[AssessmentPage] Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Monitor network status
  useEffect(() => {
    setOnlineStatus(isOnline());
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Restore active IN_PROGRESS assessment from database server first, then local storage
  useEffect(() => {
    let isMounted = true;

    async function restoreActiveSession() {
      // Always fetch database history
      loadHistory();

      // 1. Try server-side authoritative active attempt query
      try {
        const activeServer = await getActiveAttemptServer();
        if (activeServer && activeServer.attempt.status === 'IN_PROGRESS' && isMounted) {
          const att = activeServer.attempt;
          const timeSpent = att.timeSpentSeconds || 0;
          const limit = att.timerLimitSeconds || 600;
          const remaining = Math.max(0, limit - timeSpent);

          if (remaining <= 0) {
            showToast('Your previous assessment attempt timer expired. Please start a new test.', 'warning');
            clearActiveAttempt();
            return;
          }

          setAttemptId(att.id);
          setSelectedTopic(att.topic);
          setQuestions(activeServer.questions);
          setAnswers(activeServer.answers);
          timeSpentRef.current = timeSpent;
          setTimeRemaining(remaining);

          // Find first unanswered question index
          const firstUnansweredIdx = activeServer.questions.findIndex(
            (q) => activeServer.answers[q.id] === undefined
          );
          setCurrentIndex(firstUnansweredIdx >= 0 ? firstUnansweredIdx : 0);

          // Sync active state to local recovery storage
          saveActiveAttempt({
            attemptId: att.id,
            topic: att.topic,
            questions: activeServer.questions,
            timerLimitSeconds: limit,
            startedAt: att.startedAt,
            answers: activeServer.answers,
            timeSpentSeconds: timeSpent,
            isOffline: false
          });

          setScreenMode('ACTIVE_TEST');
          showToast(`Resumed active assessment for ${att.topic}. Progress restored.`, 'info');
          return;
        }
      } catch (err) {
        console.warn('[AssessmentPage] Server active attempt check failed:', err);
      }

      // 2. Client offline recovery fallback
      let sessionAttemptId = '';
      let sessionTopic = '';
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionAttemptId = sessionStorage.getItem('skillrpl_assessment_attempt_id') || '';
        sessionTopic = sessionStorage.getItem('skillrpl_assessment_topic') || '';
      }

      const active = getActiveAttempt();
      const effectiveAttemptId = sessionAttemptId || active?.attemptId || '';

      if (active && active.questions?.length === 10 && isMounted) {
        const idToUse = effectiveAttemptId || active.attemptId;
        setAttemptId(idToUse);
        setSelectedTopic(sessionTopic || active.topic);
        setQuestions(active.questions);
        setAnswers(active.answers || {});
        const saved = loadAutosavedAnswers(idToUse);
        if (saved) {
          setAnswers(saved.answers || {});
          timeSpentRef.current = saved.timeSpentSeconds || 0;
          const remaining = Math.max(10, (active.timerLimitSeconds || 600) - (saved.timeSpentSeconds || 0));
          setTimeRemaining(remaining);
        }
        setScreenMode('ACTIVE_TEST');
      }
    }

    restoreActiveSession();
    return () => {
      isMounted = false;
    };
  }, [loadHistory, showToast]);

  // Timer countdown hook
  useEffect(() => {
    if (screenMode !== 'ACTIVE_TEST') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        timeSpentRef.current += 1;
        // Autosave every second spent
        const currentId = attemptId || (typeof window !== 'undefined' ? sessionStorage.getItem('skillrpl_assessment_attempt_id') : '') || '';
        if (currentId && timeSpentRef.current % 5 === 0) {
          autosaveAnswers(currentId, answers, timeSpentRef.current);
        }

        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screenMode, attemptId, answers]);

  // Format MM:SS for timer display
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Assessment handler
  const handleStartAssessment = async (topicToUse?: string) => {
    const finalTopic = (topicToUse || customTopic.trim() || selectedTopic).trim();
    if (!finalTopic) {
      showToast('Please select or specify a trade topic.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await startMCQAssessment(finalTopic);
      if (res.success && res.questions.length === 10) {
        setAttemptId(res.attemptId);
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            sessionStorage.setItem('skillrpl_assessment_attempt_id', res.attemptId);
            sessionStorage.setItem('skillrpl_assessment_topic', res.topic);
          } catch {
            // Non-blocking
          }
        }
        setSelectedTopic(res.topic);
        setQuestions(res.questions);
        setCurrentIndex(0);
        setAnswers({});
        setTimeRemaining(res.timerLimitSeconds || 600);
        timeSpentRef.current = 0;
        setSourceType(res.source);
        setScreenMode('ACTIVE_TEST');
        showToast(
          res.isOffline
            ? `Offline Assessment started for ${res.topic}. Answers will be saved locally.`
            : `10-Question Assessment loaded for ${res.topic}.`,
          'info'
        );
      } else {
        throw new Error('Failed to load exactly 10 questions.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error starting assessment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Answer selection handler - immediate persistence to server & local recovery storage
  const handleSelectOption = (optionIndex: number) => {
    if (!questions[currentIndex]) return;
    const currentQId = questions[currentIndex].id;
    const updated = {
      ...answers,
      [currentQId]: optionIndex
    };
    setAnswers(updated);
    const activeId = attemptId || (typeof window !== 'undefined' ? sessionStorage.getItem('skillrpl_assessment_attempt_id') : '') || '';
    if (activeId) {
      // 1. Immediate local recovery persistence
      autosaveAnswers(activeId, updated, timeSpentRef.current);
      // 2. Immediate server database persistence
      saveSingleAnswer(activeId, currentQId, optionIndex, timeSpentRef.current);
    }
  };

  // View full detailed attempt review from history
  const handleViewPastAttempt = async (pastId: string) => {
    setLoading(true);
    try {
      const detail = await getMCQAttempt(pastId);
      if (detail && detail.attempt) {
        setAttemptResult(detail.attempt);
        setQuestionReview(detail.questions || []);
        setScreenMode('COMPLETED_RESULT');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load past attempt details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submission handler
  const handleSubmitAssessment = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 10) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of 10 questions. Are you sure you want to submit? Unanswered questions will receive 0 marks.`
      );
      if (!confirmSubmit) return;
    }

    const currentAttemptId = (
      attemptId ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('skillrpl_assessment_attempt_id') : '') ||
      getActiveAttempt()?.attemptId ||
      ''
    ).trim();

    if (!currentAttemptId) {
      showToast('Assessment attempt ID was lost. Please restart the test.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitMCQAssessment(currentAttemptId, answers, timeSpentRef.current, selectedTopic);
      if (res.success) {
        setAttemptResult(res.attempt);
        setQuestionReview(res.questionReview || []);
        clearActiveAttempt();
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            sessionStorage.removeItem('skillrpl_assessment_attempt_id');
            sessionStorage.removeItem('skillrpl_assessment_topic');
          } catch {
            // Non-blocking
          }
        }
        setScreenMode('COMPLETED_RESULT');
        showToast('Assessment submitted successfully!', 'success');
      } else {
        throw new Error('Server submission error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit assessment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit when timer reaches zero
  const handleAutoSubmitOnTimeout = useCallback(async () => {
    showToast('Time is up! Automatically submitting your answers...', 'warning');
    const currentAttemptId = (
      attemptId ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('skillrpl_assessment_attempt_id') : '') ||
      getActiveAttempt()?.attemptId ||
      ''
    ).trim();

    if (!currentAttemptId) {
      showToast('Assessment attempt ID was lost during timeout.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitMCQAssessment(currentAttemptId, answers, timeSpentRef.current, selectedTopic);
      if (res.success) {
        setAttemptResult(res.attempt);
        setQuestionReview(res.questionReview || []);
        clearActiveAttempt();
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            sessionStorage.removeItem('skillrpl_assessment_attempt_id');
            sessionStorage.removeItem('skillrpl_assessment_topic');
          } catch {
            // Non-blocking
          }
        }
        setScreenMode('COMPLETED_RESULT');
      }
    } catch (err: any) {
      showToast('Error during auto-submission.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, answers, selectedTopic, showToast]);

  const currentQuestion = questions[currentIndex];
  const answeredTotal = Object.keys(answers).length;
  const progressPercent = Math.round((answeredTotal / 10) * 100);

  // =========================================================================
  // VIEW 1: TOPIC / TRADE SELECTION SCREEN
  // =========================================================================
  if (screenMode === 'SELECT_TOPIC') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
        {/* Top Header Banner */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-teal)',
                  letterSpacing: '0.06em'
                }}
              >
                SKILLRPL AI · VOCATIONAL COMPETENCY ASSESSMENT
              </span>
              <GlassBadge variant={onlineStatus ? 'teal' : 'warning'}>
                {onlineStatus ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wifi size={12} /> Online AI Engine
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <WifiOff size={12} /> Offline Mode
                  </span>
                )}
              </GlassBadge>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '6px' }}>
              10-Question RPL Knowledge Assessment
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px', maxWidth: '640px' }}>
              Select your primary trade or topic to begin an authoritative 10-MCQ competency screening test. Questions are
              dynamically aligned to National Skills Qualifications Framework (NSQF) criteria.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GlassButton variant="secondary" onClick={() => setCurrentView('dashboard')}>
              <ArrowLeft size={16} /> Back to Dashboard
            </GlassButton>
          </div>
        </GlassCard>

        {/* Trade Selection Grid */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)', marginBottom: '14px' }}>
            Select Your Trade / Topic:
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {POPULAR_TRADES.map((trade) => {
              const Icon = trade.icon;
              const isSelected = selectedTopic === trade.name && !customTopic;
              return (
                <GlassCard
                  key={trade.name}
                  variant={isSelected ? 'accent' : 'interactive'}
                  onClick={() => {
                    setSelectedTopic(trade.name);
                    setCustomTopic('');
                  }}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--color-accent-teal)' : '1px solid rgba(255, 255, 255, 0.85)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)'
                          : 'rgba(18, 59, 93, 0.08)',
                        color: isSelected ? '#FFFFFF' : 'var(--color-primary-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(13, 148, 136, 0.15)',
                          color: '#0D9488'
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                      {trade.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {trade.desc}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Custom Trade Input Card */}
        <GlassCard variant="elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-navy)', marginBottom: '8px' }}>
            Or Specify Any Other Trade / NSQF Qualification Pack:
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. CNC Machine Operator, Industrial Welder, Fitter..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(18, 59, 93, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                color: 'var(--color-primary-navy)',
                outline: 'none'
              }}
            />
          </div>
        </GlassCard>

        {/* Assessment Guidelines & Start Button Card */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.85) 100%)'
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
              Ready to start test for: &ldquo;{customTopic.trim() || selectedTopic}&rdquo;
            </h3>
            <ul
              style={{
                fontSize: '12.5px',
                color: 'var(--color-text-muted)',
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                paddingLeft: '18px'
              }}
            >
              <li>Exactly 10 questions with 4 options each</li>
              <li>10 minutes default countdown timer with automatic submission</li>
              <li>Server-side secure scoring with category breakdown</li>
              <li>Fully functional offline with local autosave & background sync</li>
            </ul>
          </div>

          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => handleStartAssessment()}
            disabled={loading}
            style={{ minWidth: '220px' }}
          >
            {loading ? (
              'Generating 10 Questions...'
            ) : (
              <>
                Start Assessment <ArrowRight size={18} />
              </>
            )}
          </GlassButton>
        </GlassCard>

        {/* My Assessment History Section (Database Persisted) */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                My Assessment History
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                All completed 10-MCQ competency tests stored in database records
              </p>
            </div>
            <GlassButton variant="secondary" size="sm" onClick={loadHistory} disabled={loadingHistory}>
              <RotateCcw size={14} className={loadingHistory ? 'animate-spin' : ''} />
              <span>Refresh History</span>
            </GlassButton>
          </div>

          {pastAttempts.length === 0 ? (
            <GlassCard variant="elevated" style={{ padding: '32px', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(18, 59, 93, 0.08)',
                  color: 'var(--color-primary-navy)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                No completed assessments yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', maxWidth: '480px', margin: '4px auto 0' }}>
                Select your trade above and start your first 10-question RPL knowledge screening test.
              </p>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {pastAttempts.map((att) => {
                const isStrong = att.systemIndicator === 'Strong Performance';
                const isNeedsImp = att.systemIndicator === 'Needs Improvement';
                const submittedDateStr = att.submittedAt
                  ? new Date(att.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : new Date(att.startedAt).toLocaleDateString();

                return (
                  <GlassCard
                    key={att.id}
                    variant="elevated"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      borderLeft: '4px solid var(--color-accent-teal)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: 'var(--color-accent-teal)'
                          }}
                        >
                          {att.topic}
                        </span>
                        <GlassBadge variant={att.status === 'COMPLETED' ? 'teal' : 'sky'}>
                          {att.status.replace(/_/g, ' ')}
                        </GlassBadge>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-primary-navy)' }}>
                          {att.score}/10
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent-teal)' }}>
                          ({att.percentage}%)
                        </span>
                      </div>

                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isStrong
                              ? 'rgba(13, 148, 136, 0.15)'
                              : isNeedsImp
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: isStrong ? '#0D9488' : isNeedsImp ? '#B45309' : '#DC2626'
                          }}
                        >
                          {att.systemIndicator}
                        </span>

                        {att.assessorDecision && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(18, 59, 93, 0.12)',
                              color: 'var(--color-primary-navy)'
                            }}
                          >
                            Assessor: {att.assessorDecision.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(18, 59, 93, 0.08)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      <div>
                        <span>{submittedDateStr}</span> • <span>{formatTimer(att.timeSpentSeconds || 0)}</span>
                      </div>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewPastAttempt(att.id)}
                      >
                        View Review <ChevronRight size={14} />
                      </GlassButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE 10-MCQ TEST SCREEN
  // =========================================================================
  if (screenMode === 'ACTIVE_TEST' && currentQuestion) {
    const isLastQuestion = currentIndex === questions.length - 1;
    const selectedAnswerForCurrent = answers[currentQuestion.id];
    const isTimerUrgent = timeRemaining <= 120; // under 2 minutes

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
        {/* Real-time Header Card */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-teal)',
                  letterSpacing: '0.06em'
                }}
              >
                SKILLRPL AI · {selectedTopic.toUpperCase()} ASSESSMENT
              </span>
              <GlassBadge variant={sourceType === 'AI_GEMINI' ? 'teal' : 'sky'}>
                {sourceType === 'AI_GEMINI' ? 'Gemini 3.6 Flash' : 'Verified Bank'}
              </GlassBadge>
              {!onlineStatus && (
                <GlassBadge variant="warning">
                  <WifiOff size={11} style={{ marginRight: '3px' }} /> Offline Test
                </GlassBadge>
              )}
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
              Question {currentIndex + 1} of 10
            </h1>
          </div>

          {/* Right Metrics: Timer & Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Countdown Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: isTimerUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(18, 59, 93, 0.06)',
                border: isTimerUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(18, 59, 93, 0.1)',
                color: isTimerUrgent ? '#DC2626' : 'var(--color-primary-navy)'
              }}
            >
              <Clock size={18} className={isTimerUrgent ? 'animate-pulse' : ''} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Time Remaining
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'monospace' }}>
                  {formatTimer(timeRemaining)}
                </div>
              </div>
            </div>

            {/* Overall Answered Metric */}
            <div style={{ width: '150px' }}>
              <GlassProgress value={progressPercent} label={`Answered: ${answeredTotal}/10`} color="teal" />
            </div>
          </div>
        </GlassCard>

        {/* Main Question Card */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Category & Difficulty Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(18, 59, 93, 0.1)',
                  color: 'var(--color-primary-navy)'
                }}
              >
                {currentQuestion.category}
              </span>
              <GlassBadge
                variant={
                  currentQuestion.difficulty === 'EASY'
                    ? 'teal'
                    : currentQuestion.difficulty === 'HARD'
                    ? 'warning'
                    : 'sky'
                }
              >
                {currentQuestion.difficulty}
              </GlassBadge>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              ● Answers autosaved locally
            </div>
          </div>

          {/* Question Text */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-primary-navy)',
              lineHeight: 1.45
            }}
          >
            {currentQuestion.question}
          </h2>

          {/* 4 Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((optionText, optIndex) => {
              const isSelected = selectedAnswerForCurrent === optIndex;
              const optionLabel = ['A', 'B', 'C', 'D'][optIndex];

              return (
                <div
                  key={optIndex}
                  onClick={() => handleSelectOption(optIndex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(20, 184, 166, 0.06) 100%)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: isSelected
                      ? '2px solid var(--color-accent-teal)'
                      : '1px solid rgba(18, 59, 93, 0.12)',
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(13, 148, 136, 0.12)'
                      : '0 1px 3px rgba(18, 59, 93, 0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Option Badge A, B, C, D */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected
                        ? 'var(--color-accent-teal)'
                        : 'rgba(18, 59, 93, 0.08)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-primary-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0
                    }}
                  >
                    {isSelected ? <Check size={16} /> : optionLabel}
                  </div>

                  {/* Option Content Text */}
                  <span
                    style={{
                      fontSize: '14.5px',
                      color: isSelected ? 'var(--color-primary-navy)' : '#334155',
                      fontWeight: isSelected ? 600 : 400,
                      lineHeight: 1.4
                    }}
                  >
                    {optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Jump Dot Navigation (1 to 10) */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid rgba(18, 59, 93, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: isCurrent
                        ? '2px solid var(--color-primary-navy)'
                        : '1px solid rgba(18, 59, 93, 0.15)',
                      background: isCurrent
                        ? 'rgba(18, 59, 93, 0.15)'
                        : isAnswered
                        ? 'rgba(13, 148, 136, 0.2)'
                        : 'rgba(255, 255, 255, 0.8)',
                      color: isAnswered ? '#0D9488' : 'var(--color-primary-navy)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons: Previous, Next, Submit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GlassButton
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeft size={16} /> Previous
              </GlassButton>

              {!isLastQuestion ? (
                <GlassButton
                  variant="primary"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Next <ArrowRight size={16} />
                </GlassButton>
              ) : (
                <GlassButton
                  variant="teal"
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)', color: '#FFFFFF' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'} <Send size={16} />
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COMPLETED RESULT & QUESTION REVIEW SCREEN
  // =========================================================================
  if (screenMode === 'COMPLETED_RESULT' && attemptResult) {
    const isStrong = attemptResult.systemIndicator === 'Strong Performance';
    const isNeedsImp = attemptResult.systemIndicator === 'Needs Improvement';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        {/* Results Header Card */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-teal)',
                  letterSpacing: '0.06em'
                }}
              >
                ASSESSMENT COMPLETED · {attemptResult.topic.toUpperCase()}
              </span>
              <GlassBadge variant="navy">10 Marks</GlassBadge>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
              Assessment Completed
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Submitted on {new Date(attemptResult.submittedAt || Date.now()).toLocaleTimeString()} · Time spent:{' '}
              {formatTimer(attemptResult.timeSpentSeconds || 0)}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setScreenMode('SELECT_TOPIC');
              }}
            >
              <RotateCcw size={16} /> Take Another Test
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setCurrentView('dashboard')}>
              Go to Dashboard <ChevronRight size={16} />
            </GlassButton>
          </div>
        </GlassCard>

        {/* Score & Indicator Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Card 1: Score & Percentage */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              AUTOMATIC SCORE
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: 'var(--color-primary-navy)' }}>
                {attemptResult.score}/10
              </span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent-teal)' }}>
                ({attemptResult.percentage}%)
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Correct: <strong style={{ color: '#0D9488' }}>{attemptResult.correctCount}</strong> | Incorrect:{' '}
              <strong style={{ color: '#DC2626' }}>{attemptResult.incorrectCount}</strong>
            </div>
          </GlassCard>

          {/* Card 2: System Assessment Indicator */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              SYSTEM ASSESSMENT INDICATOR
            </span>
            <div style={{ marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  display: 'inline-block',
                  background: isStrong
                    ? 'rgba(13, 148, 136, 0.15)'
                    : isNeedsImp
                    ? 'rgba(234, 179, 8, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: isStrong ? '#0D9488' : isNeedsImp ? '#B45309' : '#DC2626'
                }}
              >
                {attemptResult.systemIndicator}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                marginTop: '10px',
                lineHeight: 1.4
              }}
            >
              *System indicator only; NOT an official certification result. Final qualification decision is made by the human assessor.
            </div>
          </GlassCard>

          {/* Card 3: AI-Assisted Performance Summary */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.8) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={16} color="var(--color-accent-teal)" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-accent-teal)' }}>
                AI-ASSISTED PERFORMANCE SUMMARY
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-primary-navy)', lineHeight: 1.5 }}>
              {attemptResult.aiSummary}
            </p>
          </GlassCard>
        </div>

        {/* Category Performance Breakdown */}
        {attemptResult.categoryScores && Object.keys(attemptResult.categoryScores).length > 0 && (
          <GlassCard variant="elevated" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', marginBottom: '16px' }}>
              Competency Category Performance
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {Object.entries(attemptResult.categoryScores).map(([category, stats]) => {
                const catPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div
                    key={category}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(18, 59, 93, 0.04)',
                      border: '1px solid rgba(18, 59, 93, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                        {category}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-accent-teal)' }}>
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <GlassProgress value={catPct} color={catPct >= 70 ? 'teal' : 'sky'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Detailed Question Review Section */}
        {questionReview.length > 0 && (
          <GlassCard variant="elevated" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', marginBottom: '16px' }}>
              Question-by-Question Review
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questionReview.map((item, idx) => {
                const isCorrect = item.isCorrect;
                return (
                  <div
                    key={item.id || item.questionIndex || idx}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: isCorrect ? 'rgba(13, 148, 136, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                      border: isCorrect
                        ? '1px solid rgba(13, 148, 136, 0.2)'
                        : '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCorrect ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0D9488', fontWeight: 800 }}>
                            <CheckCircle2 size={18} /> Question {idx + 1} · Correct
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 800 }}>
                            <XCircle size={18} /> Question {idx + 1} · Incorrect
                          </span>
                        )}
                        <GlassBadge variant="navy">{item.category}</GlassBadge>
                      </div>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-primary-navy)', marginTop: '8px' }}>
                      {item.question}
                    </p>

                    {/* Options list */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '12px' }}>
                      {item.options.map((opt, oIdx) => {
                        const isSelectedByCandidate = item.selectedAnswer === oIdx;
                        const isActualCorrect = item.correctAnswer === oIdx;

                        let bg = 'rgba(255, 255, 255, 0.7)';
                        let border = '1px solid rgba(18, 59, 93, 0.1)';
                        let textColor = '#334155';

                        if (isActualCorrect) {
                          bg = 'rgba(13, 148, 136, 0.15)';
                          border = '1.5px solid #0D9488';
                          textColor = '#0F766E';
                        } else if (isSelectedByCandidate && !isActualCorrect) {
                          bg = 'rgba(239, 68, 68, 0.15)';
                          border = '1.5px solid #DC2626';
                          textColor = '#B91C1C';
                        }

                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: bg,
                              border,
                              color: textColor,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>
                              <strong>{['A', 'B', 'C', 'D'][oIdx]}.</strong> {opt}
                            </span>
                            {isActualCorrect && (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0D9488' }}>
                                ✓ Correct Answer
                              </span>
                            )}
                            {isSelectedByCandidate && !isActualCorrect && (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '12.5px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.45,
                          borderLeft: '3px solid var(--color-accent-teal)'
                        }}
                      >
                        <strong>Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>
    );
  }

  return null;
};
