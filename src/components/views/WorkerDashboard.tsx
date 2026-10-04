import React from 'react';
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
  ArrowUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
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
    showToast
  } = useApp();

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
              onClick={() => setCurrentView('results')}
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
