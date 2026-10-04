import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileNavigation } from './MobileNavigation';
import { Toast } from '../common/Toast';
import { AddExperienceModal } from '../modals/AddExperienceModal';
import { UploadEvidenceModal } from '../modals/UploadEvidenceModal';
import { EvidenceDetailsModal } from '../modals/EvidenceDetailsModal';
import { NotificationsDrawer } from '../modals/NotificationsDrawer';
import { WatchHowItWorksModal } from '../modals/WatchHowItWorksModal';
import { JobOpportunitiesModal } from '../modals/JobOpportunitiesModal';
import { LearningResourcesModal } from '../modals/LearningResourcesModal';
import { HelpSupportModal } from '../modals/HelpSupportModal';
import { LandingPage } from '../views/LandingPage';
import { WorkerDashboard } from '../views/WorkerDashboard';
import { ProfilePage } from '../views/ProfilePage';
import { WorkExperiencePage } from '../views/WorkExperiencePage';
import { ExperienceDetailPage } from '../views/ExperienceDetailPage';
import { SelfDeclarationPage } from '../views/SelfDeclarationPage';
import { EvidencePage } from '../views/EvidencePage';
import { AiAssistantPage } from '../views/AiAssistantPage';
import { AiAnalysisPage } from '../views/AiAnalysisPage';
import { QualificationMatchPage } from '../views/QualificationMatchPage';
import { AssessmentPage } from '../views/AssessmentPage';
import { AssessorDashboard } from '../views/AssessorDashboard';
import { AssessorCandidateView } from '../views/AssessorCandidateView';
import { ResultPage } from '../views/ResultPage';
import { SettingsPage } from '../views/SettingsPage';
import { LoginPage } from '../views/LoginPage';
import { SignupPage } from '../views/SignupPage';
import { EditProfileModal } from '../modals/EditProfileModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock } from 'lucide-react';
import heroImg from '../../assets/taj_mahal_hero.jpg';

export const AppShell: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isWatchModalOpen,
    setIsWatchModalOpen,
    isJobModalOpen,
    setIsJobModalOpen,
    isLearningModalOpen,
    setIsLearningModalOpen,
    isHelpModalOpen,
    setIsHelpModalOpen
  } = useApp();
  const { role, loading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    // If not authenticated and attempting to access protected page
    if (!role && !loading && currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup') {
      return (
        <div style={{ maxWidth: '520px', margin: '60px auto', textAlign: 'center' }}>
          <div 
            className="glass-card" 
            style={{
              padding: '36px 30px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Authentication Required
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Please sign in with your Worker or Assessor account to access SkillRPL portal features and records.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentView('login')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Go to Sign In
              </button>
              <button
                onClick={() => setCurrentView('signup')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Role-based protection: Worker attempting to access assessor views
    if (role === 'WORKER' && (currentView === 'assessor-dashboard' || currentView === 'assessor-candidate')) {
      return (
        <div style={{ maxWidth: '580px', margin: '60px auto', textAlign: 'center' }}>
          <div 
            className="glass-card" 
            style={{
              padding: '36px 30px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid #fed7aa',
              boxShadow: '0 20px 40px -15px rgba(234, 88, 12, 0.1)'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ffedd5', color: '#ea580c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldAlert size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Assessor Accreditation Required
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              You are signed in with a <strong>Candidate Worker</strong> profile. Candidate accounts cannot view assessor scoring panels, candidate portfolios, or finalize assessment decisions.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Return to Worker Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'dashboard':
        return <WorkerDashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'experience':
        return <WorkExperiencePage />;
      case 'experience-detail':
        return <ExperienceDetailPage />;
      case 'declaration':
        return <SelfDeclarationPage />;
      case 'evidence':
        return <EvidencePage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'ai-analysis':
        return <AiAnalysisPage />;
      case 'qualification-match':
        return <QualificationMatchPage />;
      case 'assessment':
        return <AssessmentPage />;
      case 'results':
        return <ResultPage />;
      case 'assessor-dashboard':
        return <AssessorDashboard />;
      case 'assessor-candidate':
        return <AssessorCandidateView />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WorkerDashboard />;
    }
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar for Desktop & Off-Canvas for Mobile */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Backdrop overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 41, 66, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 49
          }}
        />
      )}

      {/* Main Content Area */}
      <div
        className="app-main-container"
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s ease',
          position: 'relative'
        }}
      >
        {/* Full-Screen Transparent Taj Mahal Ambient Backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 'var(--sidebar-width)',
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <TopHeader onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main
          style={{
            flex: 1,
            padding: '24px 28px 80px 28px',
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {renderCurrentView()}
        </main>

        {/* Mobile Bottom Navigation (Visible under 900px) */}
        <MobileNavigation />
      </div>

      {/* Global Modals & Notifications Drawer */}
      <AddExperienceModal />
      <EditProfileModal />
      <UploadEvidenceModal />
      <EvidenceDetailsModal />
      <NotificationsDrawer />
      <WatchHowItWorksModal
        isOpen={isWatchModalOpen}
        onClose={() => setIsWatchModalOpen(false)}
      />
      <JobOpportunitiesModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
      />
      <LearningResourcesModal
        isOpen={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
      />
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      <Toast />

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 900px) {
          .app-main-container {
            margin-left: 0 !important;
          }
          .app-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .desktop-header-search {
            display: none !important;
          }
          main {
            padding: 16px 16px 90px 16px !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
