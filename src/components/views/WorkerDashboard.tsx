import React, { useEffect, useState } from 'react';
import {
  FileText,
  FileCheck,
  Award,
  Briefcase,
  BookOpen,
  User,
  ArrowRight,
  Play,
  ChevronRight,
  ArrowUp,
  PlusCircle,
  Send,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { fetchWorkerApplications, submitWorkerApplication } from '../../lib/api/worker-application';
import { fetchWorkerCertificates, type CertificateData } from '../../lib/api/certificate';
import type { RPLApplicationListItem } from '../../types';
import heroImg from '../../assets/taj_mahal_hero.jpg';
import nightImg from '../../assets/taj_mahal_night.jpg';
import {
  ConstructionHelmetIcon,
  ElectricalChipIcon,
  AutomotiveGearIcon,
  PlumbingPipeIcon,
  ITDigitalLaptopIcon,
  HealthcareStethoscopeIcon
} from '../common/SkillCategoryIcons';
import { FloatingAmoebaGlass } from '../common/FloatingAmoebaGlass';

// Mini 4-bar ascending chart graphic
const MiniAscendingBars: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '14px' }}>
    <div style={{ width: '3px', height: '5px', borderRadius: '1.5px', background: color, opacity: 0.55 }} />
    <div style={{ width: '3px', height: '8px', borderRadius: '1.5px', background: color, opacity: 0.7 }} />
    <div style={{ width: '3px', height: '11px', borderRadius: '1.5px', background: color, opacity: 0.85 }} />
    <div style={{ width: '3px', height: '14px', borderRadius: '1.5px', background: color }} />
  </div>
);

export const WorkerDashboard: React.FC = () => {
  const {
    setCurrentView,
    setIsWatchModalOpen,
    setIsJobModalOpen,
    setIsLearningModalOpen,
    showToast,
    setActiveApplicationId
  } = useApp();
  const { session } = useAuth();

  const [applications, setApplications] = useState<RPLApplicationListItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetchWorkerApplications(session?.access_token);
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.warn('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const list = await fetchWorkerCertificates();
      setCertificates(list);
    } catch (err) {
      console.warn('Failed to load worker certificates:', err);
    }
  };

  useEffect(() => {
    loadApplications();
    loadCertificates();
  }, [session?.access_token]);

  const handleSubmitApplication = async (appId: string) => {
    if (!session?.access_token) {
      showToast('Please sign in to submit your application.', 'warning');
      return;
    }
    setSubmittingId(appId);
    try {
      const res = await submitWorkerApplication(appId, session.access_token);
      if (res.success) {
        showToast('RPL Application submitted successfully to Accredited Assessor!', 'success');
        await loadApplications();
      } else {
        showToast(res.error || 'Failed to submit application', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
      {/* 1. Hero Panoramic Banner with Taj Mahal in Full & Rich Vibrant Colors */}
      <div
        className="hero-banner-card"
        style={{
          width: '100%',
          minHeight: '380px',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0b1a2d 0%, #152c4a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 12px 36px rgba(18, 59, 93, 0.12), inset 0 1px 1px #ffffff',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Full Rich & Vibrant Taj Mahal Panoramic Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 46%',
            /* Vibrant high-saturation color grading with crisp contrast */
            filter: 'saturate(1.25) contrast(1.1) brightness(1.02)',
            opacity: 0.95,
            zIndex: 0
          }}
        />

        {/* Subtle Specular Sheen across top glass */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 35%, rgba(0, 0, 0, 0.25) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Ambient Curved Wave Outline in Sky */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '65%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.45
          }}
          viewBox="0 0 700 380"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 40,0 C 190,45 330,120 490,90 C 590,72 650,22 700,4"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Hero Left Content with Frosted Glass Plate for Legibility */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            margin: '24px 28px',
            padding: '30px 36px',
            maxWidth: '540px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.82) 65%, rgba(240, 248, 255, 0.72) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 30px rgba(0, 20, 50, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Overline */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#5a738e'
            }}
          >
            RECOGNIZING SKILLS, EMPOWERING INDIA
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: '34px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f2744',
              fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            Turn Your
            <br />
            Experience into a
            <br />
            <span
              style={{
                color: '#1a62d6',
                textShadow: '0 2px 10px rgba(26, 98, 214, 0.15)'
              }}
            >
              Recognized Credential
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '14.5px',
              color: '#4d6582',
              lineHeight: 1.45,
              margin: 0,
              maxWidth: '480px'
            }}
          >
            AI-powered Recognition of Prior Learning for India’s workforce.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
            <button
              onClick={() => setCurrentView('assessment')}
              style={{
                padding: '11px 24px',
                borderRadius: '9999px',
                background: 'linear-gradient(180deg, #1b62cc 0%, #0d429a 100%)',
                boxShadow: '0 4px 18px rgba(24, 100, 235, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.55)',
                border: '1px solid rgba(180, 215, 255, 0.35)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              className="hero-primary-btn"
            >
              <span>Start Assessment</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setIsWatchModalOpen(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 10px rgba(18, 59, 93, 0.05), inset 0 1px 1px #ffffff',
                color: '#0f2744',
                fontWeight: 600,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
              className="hero-secondary-btn"
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(18, 59, 93, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Play size={10} color="#0f2744" fill="#0f2744" style={{ marginLeft: '1px' }} />
              </div>
              <span>Watch How It Works</span>
            </button>
          </div>
        </div>

        {/* 3D Indefinite & Unshaped Liquid Glass Amoeba Vessel */}
        <FloatingAmoebaGlass />
      </div>

      {/* 2. Top 4 Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}
        className="stats-row"
      >
        {/* Stat 1: 12,548 Individuals Registered */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 4px 18px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {/* Glowing Squircle Icon */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            <FileText size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f2744', lineHeight: 1.15 }}>
              12,548
            </div>
            <div style={{ fontSize: '12px', color: '#627d98', marginTop: '2px', fontWeight: 500 }}>
              Individuals Registered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} strokeWidth={3} /> 12%
              </span>
              <MiniAscendingBars color="#2563eb" />
            </div>
          </div>
        </div>

        {/* Stat 2: 8,732 Assessments Completed */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 4px 18px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
            padding: '18px 20px',
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
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            <FileCheck size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f2744', lineHeight: 1.15 }}>
              8,732
            </div>
            <div style={{ fontSize: '12px', color: '#627d98', marginTop: '2px', fontWeight: 500 }}>
              Assessments Completed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} strokeWidth={3} /> 18%
              </span>
              <MiniAscendingBars color="#059669" />
            </div>
          </div>
        </div>

        {/* Stat 3: 6,421 Certificates Issued */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 4px 18px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
            padding: '18px 20px',
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
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            <Award size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f2744', lineHeight: 1.15 }}>
              6,421
            </div>
            <div style={{ fontSize: '12px', color: '#627d98', marginTop: '2px', fontWeight: 500 }}>
              Certificates Issued
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} strokeWidth={3} /> 24%
              </span>
              <MiniAscendingBars color="#7c3aed" />
            </div>
          </div>
        </div>

        {/* Stat 4: 2,980 Job Matches Found */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 4px 18px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
            padding: '18px 20px',
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
              background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
              boxShadow: '0 6px 16px rgba(234, 88, 12, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            <Briefcase size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f2744', lineHeight: 1.15 }}>
              2,980
            </div>
            <div style={{ fontSize: '12px', color: '#627d98', marginTop: '2px', fontWeight: 500 }}>
              Job Matches Found
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUp size={12} strokeWidth={3} /> 16%
              </span>
              <MiniAscendingBars color="#ea580c" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Two Columns (70% Left / 30% Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2.4fr 1fr',
          gap: '20px'
        }}
        className="main-grid-layout"
      >
        {/* LEFT COLUMN: RPL Journey + Popular Skill Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Certificate & Assessment Completed Card */}
          {certificates.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(240, 253, 250, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
                border: '1.5px solid rgba(13, 148, 136, 0.35)',
                borderRadius: '22px',
                padding: '22px 26px',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                    flexShrink: 0
                  }}
                >
                  <Award size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                      Assessment Completed · Score: {certificates[0].score}/{certificates[0].totalScore} ({certificates[0].percentage}%)
                    </h4>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      Certificate Available
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0' }}>
                    Trade: <strong>{certificates[0].trade}</strong> · Approved by {certificates[0].assessorName || 'Accredited Assessor'} ({certificates[0].certificateNumber})
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setCurrentView('certificate')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                  }}
                >
                  <Award size={16} />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          )}

          {/* Card: My RPL Applications */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '22px',
              boxShadow: '0 4px 20px rgba(18, 59, 93, 0.05), inset 0 1px 1px #ffffff',
              padding: '24px 26px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                    My RPL Applications
                  </h3>
                  <span
                    style={{
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      border: '1px solid rgba(2, 132, 199, 0.2)'
                    }}
                  >
                    {applications.length} Active
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#627d98', margin: '4px 0 0 0' }}>
                  Manage your self-declarations, AI skill reviews, and assessor evaluations.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={loadApplications}
                  title="Refresh Applications"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid rgba(203, 213, 225, 0.6)',
                    background: '#f8fafc',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={loadingApps ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => {
                    setActiveApplicationId(null);
                    setCurrentView('declaration');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Start New Application</span>
                </button>
              </div>
            </div>

            {/* Application List / Empty State */}
            {loadingApps ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <span style={{ fontSize: '13px' }}>Loading your RPL applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'rgba(2, 132, 199, 0.1)',
                    color: '#0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  <FileText size={26} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2744', margin: '0 0 6px 0' }}>
                  No Active RPL Applications
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
                  You haven't created any Recognition of Prior Learning applications yet. Begin your self-declaration to map your informal experience.
                </p>
                <button
                  onClick={() => {
                    setActiveApplicationId(null);
                    setCurrentView('declaration');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Sparkles size={16} />
                  <span>Start your first RPL assessment</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.map((app) => {
                  let statusBadgeColor = '#64748b';
                  let statusBg = '#f1f5f9';
                  let statusText = 'Draft';

                  if (app.status === 'SELF_DECLARATION_COMPLETED') {
                    statusBadgeColor = '#0284c7';
                    statusBg = '#e0f2fe';
                    statusText = 'Self-Declaration Completed';
                  } else if (app.status === 'ASSESSMENT_READY') {
                    statusBadgeColor = '#7c3aed';
                    statusBg = '#f3e8ff';
                    statusText = 'Assessment Ready';
                  } else if (app.status === 'SUBMITTED') {
                    statusBadgeColor = '#b45309';
                    statusBg = '#fef3c7';
                    statusText = 'Submitted to Assessor';
                  } else if (app.status === 'UNDER_ASSESSMENT') {
                    statusBadgeColor = '#4338ca';
                    statusBg = '#e0e7ff';
                    statusText = 'Under Assessment';
                  } else if (app.status === 'COMPLETED') {
                    statusBadgeColor = '#047857';
                    statusBg = '#d1fae5';
                    statusText = 'Certified / Completed';
                  }

                  const isSubmissible =
                    app.status === 'DRAFT' ||
                    app.status === 'SELF_DECLARATION_COMPLETED' ||
                    app.status === 'ASSESSMENT_READY';

                  return (
                    <div
                      key={app.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '14px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        background: '#ffffff',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f2744' }}>
                              {app.tradeTitle}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 6px',
                                borderRadius: '6px'
                              }}
                            >
                              {app.applicationNumber}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                            <span>Created: {new Date(app.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Step {app.currentStep} of 7</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: statusBadgeColor,
                              background: statusBg,
                              padding: '4px 10px',
                              borderRadius: '999px',
                              border: `1px solid ${statusBadgeColor}33`
                            }}
                          >
                            {statusText}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          <span>Progress</span>
                          <span>{app.progressPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${app.progressPercentage}%`,
                              height: '100%',
                              borderRadius: '3px',
                              background: 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => {
                            setActiveApplicationId(app.id);
                            setCurrentView('declaration');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveApplicationId(app.id);
                            setCurrentView('declaration');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <span>Continue</span>
                          <ChevronRight size={14} />
                        </button>

                        {(app.status === 'COMPLETED' || app.status === 'UNDER_ASSESSMENT') && (
                          <button
                            onClick={() => {
                              setActiveApplicationId(app.id);
                              setCurrentView('results');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(124, 58, 237, 0.4)',
                              background: 'rgba(124, 58, 237, 0.08)',
                              color: '#7c3aed',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Award size={13} />
                            <span>{app.status === 'COMPLETED' ? 'View Certificate' : 'Assessment Status'}</span>
                          </button>
                        )}

                        {isSubmissible && (
                          <button
                            onClick={() => handleSubmitApplication(app.id)}
                            disabled={submittingId === app.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: submittingId === app.id ? 'not-allowed' : 'pointer',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            <Send size={13} />
                            <span>{submittingId === app.id ? 'Submitting...' : 'Submit'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Your RPL Journey */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '22px',
              boxShadow: '0 4px 20px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
              padding: '24px 26px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                  Your RPL Journey
                </h3>
                <p style={{ fontSize: '12.5px', color: '#627d98', margin: '4px 0 0 0' }}>
                  Follow these simple steps to get your recognized certificate.
                </p>
              </div>

              <button
                onClick={() => setCurrentView('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#1a62d6',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>View Details</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 4 Steps Flow with Connecting Arrows */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
                alignItems: 'center',
                gap: '8px'
              }}
              className="rpl-journey-steps"
            >
              {/* Step 1 */}
              <div
                onClick={() => setCurrentView('profile')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35), inset 0 1px 1px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  <User size={22} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  1. Create Profile
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px', lineHeight: 1.3 }}>
                  Tell us about your experience
                </div>
              </div>

              {/* Dotted Arrow 1 */}
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', padding: '0 4px', marginBottom: '24px' }}>
                <span style={{ letterSpacing: '2px', fontSize: '14px', color: '#60a5fa' }}>····</span>
                <ChevronRight size={15} color="#3b82f6" />
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setCurrentView('assessment')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                    boxShadow: '0 6px 18px rgba(5, 150, 105, 0.35), inset 0 1px 1px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  <FileText size={22} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  2. Skill Assessment
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px', lineHeight: 1.3 }}>
                  Showcase your skills through AI assessment
                </div>
              </div>

              {/* Dotted Arrow 2 */}
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', padding: '0 4px', marginBottom: '24px' }}>
                <span style={{ letterSpacing: '2px', fontSize: '14px', color: '#34d399' }}>····</span>
                <ChevronRight size={15} color="#10b981" />
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setCurrentView('results')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 18px rgba(124, 58, 237, 0.35), inset 0 1px 1px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  <Award size={22} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  3. Get Certified
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px', lineHeight: 1.3 }}>
                  Receive your recognized certificate
                </div>
              </div>

              {/* Dotted Arrow 3 */}
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', padding: '0 4px', marginBottom: '24px' }}>
                <span style={{ letterSpacing: '2px', fontSize: '14px', color: '#fbbf24' }}>····</span>
                <ChevronRight size={15} color="#f59e0b" />
              </div>

              {/* Step 4 */}
              <div
                onClick={() => setIsJobModalOpen(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                    boxShadow: '0 6px 18px rgba(234, 88, 12, 0.35), inset 0 1px 1px #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    marginBottom: '10px'
                  }}
                >
                  <Briefcase size={22} />
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  4. Explore Opportunities
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px', lineHeight: 1.3 }}>
                  Find jobs and training programs
                </div>
              </div>
            </div>
          </div>

          {/* Card: Popular Skill Categories */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '22px',
              boxShadow: '0 4px 20px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
              padding: '24px 26px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2744', margin: 0 }}>
                Popular Skill Categories
              </h3>
              <button
                onClick={() => showToast('Displaying all 38 NSQF Skill Sectors', 'info')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#1a62d6',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 6 Category Items in a Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '12px'
              }}
              className="categories-grid"
            >
              {/* Category 1: Construction */}
              <div
                onClick={() => showToast('Selected sector: Construction & Infrastructure', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <ConstructionHelmetIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  Construction
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  2.4K Assessments
                </div>
              </div>

              {/* Category 2: Electrical & Electronics */}
              <div
                onClick={() => showToast('Selected sector: Electrical & Electronics', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <ElectricalChipIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  Electrical & Electronics
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  1.8K Assessments
                </div>
              </div>

              {/* Category 3: Automotive */}
              <div
                onClick={() => showToast('Selected sector: Automotive & Mechanics', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <AutomotiveGearIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  Automotive
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  1.6K Assessments
                </div>
              </div>

              {/* Category 4: Plumbing */}
              <div
                onClick={() => showToast('Selected sector: Plumbing & Piping', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <PlumbingPipeIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  Plumbing
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  980 Assessments
                </div>
              </div>

              {/* Category 5: IT & Digital Services */}
              <div
                onClick={() => showToast('Selected sector: IT & Digital Services', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <ITDigitalLaptopIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  IT & Digital Services
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  2.1K Assessments
                </div>
              </div>

              {/* Category 6: Healthcare */}
              <div
                onClick={() => showToast('Selected sector: Healthcare & Allied Services', 'info')}
                style={{
                  background: 'rgba(245, 249, 255, 0.85)',
                  border: '1px solid rgba(220, 235, 252, 0.8)',
                  borderRadius: '16px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                className="category-pill-card"
              >
                <HealthcareStethoscopeIcon size={46} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f2744', marginTop: '10px' }}>
                  Healthcare
                </div>
                <div style={{ fontSize: '11px', color: '#627d98', marginTop: '3px' }}>
                  1.4K Assessments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions + Night Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card: Quick Actions */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              borderRadius: '22px',
              boxShadow: '0 4px 20px rgba(18, 59, 93, 0.04), inset 0 1px 1px #ffffff',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2744', margin: '0 0 4px 0' }}>
              Quick Actions
            </h3>

            {/* Action 1: Start New Assessment */}
            <div
              onClick={() => setCurrentView('assessment')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.16s ease'
              }}
              className="quick-action-item"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <FileCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  Start New Assessment
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px' }}>
                  Begin your skill evaluation
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Action 2: View My Certificates */}
            <div
              onClick={() => setCurrentView('certificate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.16s ease'
              }}
              className="quick-action-item"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <Award size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  View My Certificates
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px' }}>
                  Access your credentials
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Action 3: Browse Job Opportunities */}
            <div
              onClick={() => setIsJobModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.16s ease'
              }}
              className="quick-action-item"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <Briefcase size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  Browse Job Opportunities
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px' }}>
                  Find matching roles
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Action 4: Explore Learning Resources */}
            <div
              onClick={() => setIsLearningModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 12px',
                borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.16s ease'
              }}
              className="quick-action-item"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f2744' }}>
                  Explore Learning Resources
                </div>
                <div style={{ fontSize: '11.5px', color: '#627d98', marginTop: '2px' }}>
                  Improve your skills
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>

          {/* Night Banner Card: Empowering Every Skill */}
          <div
            style={{
              height: '140px',
              borderRadius: '22px',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: `url(${nightImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 60%',
              boxShadow: '0 8px 24px rgba(7, 20, 45, 0.25)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '18px 20px',
              cursor: 'pointer'
            }}
            onClick={() => setIsWatchModalOpen(true)}
          >
            {/* Dark Twilight Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(8, 20, 42, 0.85) 0%, rgba(8, 20, 42, 0.6) 50%, rgba(8, 20, 42, 0.88) 100%)'
              }}
            />

            <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.35 }}>
                Empowering Every Skill.
                <br />
                Building a Brighter Tomorrow.
              </div>

              {/* Tricolor Indicator Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginTop: '10px',
                  width: '56px'
                }}
              >
                <div style={{ flex: 1, height: '3px', borderRadius: '1.5px', background: '#FF9933' }} />
                <div style={{ width: '6px', height: '3px', borderRadius: '1.5px', background: '#FFFFFF' }} />
                <div style={{ flex: 1, height: '3px', borderRadius: '1.5px', background: '#138808' }} />
              </div>
            </div>

            {/* Circular Arrow Button */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(24, 100, 235, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
        }
        .hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.95) !important;
          transform: translateY(-1px);
        }
        .category-pill-card:hover {
          background: #FFFFFF !important;
          border-color: #38bdf8 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(56, 189, 248, 0.15) !important;
        }
        .quick-action-item:hover {
          background: #F8FAFC !important;
          border-color: rgba(56, 189, 248, 0.4) !important;
          transform: translateX(2px);
        }
        @media (max-width: 1050px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .main-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          .hero-floating-card {
            display: none !important;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .rpl-journey-steps {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .rpl-journey-steps > div:nth-child(even) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
