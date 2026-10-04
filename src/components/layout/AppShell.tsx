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
import { AssessmentPage } from '../views/AssessmentPage';
import { AssessorDashboard } from '../views/AssessorDashboard';
import { AssessorCandidateView } from '../views/AssessorCandidateView';
import { ResultPage } from '../views/ResultPage';
import { SettingsPage } from '../views/SettingsPage';
import { EditProfileModal } from '../modals/EditProfileModal';
import { useApp } from '../../context/AppContext';
import heroImg from '../../assets/taj_mahal_hero.jpg';

export const AppShell: React.FC = () => {
  const {
    currentView,
    isWatchModalOpen,
    setIsWatchModalOpen,
    isJobModalOpen,
    setIsJobModalOpen,
    isLearningModalOpen,
    setIsLearningModalOpen,
    isHelpModalOpen,
    setIsHelpModalOpen
  } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
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
