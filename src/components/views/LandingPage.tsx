import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Layers,
  Award,
  Clock,
  Compass,
  Wrench,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassProgress } from '../common/GlassProgress';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setUserRole } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', paddingBottom: '40px' }} className="animate-fade-in">
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '48px 0 20px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Decorative subtle ambient glows */}
        <div
          style={{
            position: 'absolute',
            top: '0%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(77, 163, 217, 0.16) 0%, rgba(223, 242, 255, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Small Badge */}
        <div style={{ zIndex: 1, marginBottom: '20px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(223, 242, 255, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(77, 163, 217, 0.35)',
              boxShadow: '0 2px 8px rgba(77, 163, 217, 0.12), inset 0 1px 0 #FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-primary-navy)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={14} color="#25A7A0" />
            AI-ASSISTED RECOGNITION OF PRIOR LEARNING
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary-navy)',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            maxWidth: '820px',
            zIndex: 1
          }}
        >
          Turn Your Experience Into Recognized Skills.
        </h1>

        {/* Supporting Text */}
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 18.5px)',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            marginTop: '18px',
            lineHeight: 1.55,
            zIndex: 1
          }}
        >
          SkillRPL AI helps workers document their experience, demonstrate practical competence, and prepare evidence for assessor-led Recognition of Prior Learning.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            marginTop: '32px',
            zIndex: 1
          }}
        >
          <GlassButton
            size="lg"
            variant="primary"
            onClick={() => setCurrentView('dashboard')}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Start Your RPL Journey
          </GlassButton>

          <GlassButton
            size="lg"
            variant="secondary"
            onClick={() => {
              const el = document.getElementById('how-it-works-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            icon={<Compass size={18} />}
          >
            Explore How It Works
          </GlassButton>
        </div>

        {/* Hero Visual: Large Floating Glass Dashboard Preview */}
        <div
          style={{
            width: '100%',
            maxWidth: '960px',
            marginTop: '48px',
            zIndex: 1,
            position: 'relative'
          }}
        >
          <GlassCard
            variant="elevated"
            className="animate-float"
            style={{
              padding: '28px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 248, 255, 0.85) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 16px 40px rgba(11, 41, 66, 0.08), 0 32px 70px -15px rgba(18, 59, 93, 0.15), inset 0 1px 1px #FFFFFF'
            }}
          >
            {/* Top Preview Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(18, 59, 93, 0.08)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #123B5D 0%, #4DA3D9 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    boxShadow: '0 3px 8px rgba(18, 59, 93, 0.2)'
                  }}
                >
                  RK
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                      Rajesh Kumar
                    </h3>
                    <GlassBadge variant="sky">Candidate</GlassBadge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Industrial Electrician & Solar PV Specialist · Pune Industrial Hub
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px 14px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid rgba(18, 59, 93, 0.1)',
                    boxShadow: '0 1px 3px rgba(11, 41, 66, 0.03)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    APPLICATION ID
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                    RPL-IND-2026-0842
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 14px',
                    background: 'var(--color-accent-teal-soft)',
                    borderRadius: '10px',
                    border: '1px solid var(--color-accent-teal-border)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: '#116864', fontWeight: 600 }}>
                    NSQF LEVEL
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#116864' }}>
                    Level 5 Certified Track
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Preview Metric Pillars */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginTop: '22px',
                textAlign: 'left'
              }}
            >
              {/* Experience */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)',
                  boxShadow: '0 2px 6px rgba(11, 41, 66, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary-sky)' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Experience</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  7.5 Years
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--color-success)', fontWeight: 600 }}>
                  Verified 3 Workshops
                </span>
              </div>

              {/* Skills Declared */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)',
                  boxShadow: '0 2px 6px rgba(11, 41, 66, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-teal)' }}>
                  <Wrench size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Skills Declared</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  14 Competencies
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                  Star-Delta, Megger, LOTO
                </span>
              </div>

              {/* Assessment Progress */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)',
                  boxShadow: '0 2px 6px rgba(11, 41, 66, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#123B5D' }}>
                  <Activity size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Assessment Progress</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  Task 3 of 8
                </div>
                <GlassProgress value={38} showPercentage={false} height={5} />
              </div>

              {/* Assessor Recommendation */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(18, 59, 93, 0.08)',
                  boxShadow: '0 2px 6px rgba(11, 41, 66, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                  <ShieldCheck size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Assessor Review</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '4px' }}>
                  Ready for Slot
                </div>
                <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                  Authorized Assessor Queued
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <GlassBadge variant="navy">Systematic RPL Pathway</GlassBadge>
          <h2 style={{ fontSize: '28px', color: 'var(--color-primary-navy)', marginTop: '10px' }}>
            How Recognition of Prior Learning Works
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '8px auto 0 auto' }}>
            Transforming informal on-the-job experience into a government-recognized NSQF qualification through structured evidence collection and authorized assessor review.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {[
            {
              step: '01',
              title: 'Workplace Documentation',
              desc: 'Log your occupations, past employers, duration, tools operated, and practical responsibilities in structured glass records.',
              icon: <FileSpreadsheet size={22} color="#123B5D" />
            },
            {
              step: '02',
              title: 'Self Declaration',
              desc: 'Complete an intuitive guided declaration explaining how you handle real-world challenges, safety protocols, and complex tasks.',
              icon: <FileCheck size={22} color="#25A7A0" />
            },
            {
              step: '03',
              title: 'Practical Evidence Submission',
              desc: 'Upload videos, photos, diagnostic reports, and testimonials proving practical capability on industrial machinery.',
              icon: <Layers size={22} color="#4DA3D9" />
            },
            {
              step: '04',
              title: 'Authorized Assessor Decision',
              desc: 'An accredited sector assessor evaluates your criteria score, verifies portfolio artifacts, and approves formal certification.',
              icon: <Award size={22} color="#10B981" />
            }
          ].map((item) => (
            <GlassCard key={item.step} style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(18, 59, 93, 0.1)',
                    boxShadow: '0 2px 6px rgba(11, 41, 66, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: 'rgba(18, 59, 93, 0.15)'
                  }}
                >
                  {item.step}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Sector Trades Covered */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--color-primary-navy)' }}>
            Aligned With National Qualifications (NCVET / NSQF)
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Supported trade sectors for high-impact vocational qualification
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          {[
            'Industrial Electrician (NSQF Level 5)',
            'Solar PV Grid Installation Specialist',
            'Automotive Electric Vehicle Technician',
            'CNC Precision Machining & Tooling',
            'Biomedical Equipment Maintenance',
            'Structural Welding & Pipe Fabrication',
            'Heavy Equipment Maintenance',
            'Smart Building Automation Specialist'
          ].map((trade) => (
            <span
              key={trade}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(18, 59, 93, 0.1)',
                boxShadow: '0 1px 3px rgba(11, 41, 66, 0.03)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={14} color="#25A7A0" />
              {trade}
            </span>
          ))}
        </div>
      </section>

      {/* Bottom Call to Action Card */}
      <GlassCard
        variant="accent"
        style={{
          padding: '36px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '24px'
        }}
      >
        <h2 style={{ fontSize: '24px', color: 'var(--color-primary-navy)' }}>
          Ready to Certify Your Practical Expertise?
        </h2>
        <p style={{ maxWidth: '560px', color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '14.5px' }}>
          Join thousands of skilled informal technicians gaining formal credentials, higher wages, and government qualification status.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <GlassButton
            size="lg"
            variant="primary"
            onClick={() => setCurrentView('dashboard')}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Access Worker Dashboard
          </GlassButton>

          <GlassButton
            size="lg"
            variant="secondary"
            onClick={() => {
              setUserRole('assessor');
              setCurrentView('assessor-dashboard');
            }}
            icon={<ShieldCheck size={18} />}
          >
            Switch to Assessor Workspace
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
