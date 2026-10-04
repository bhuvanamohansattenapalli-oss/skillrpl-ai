import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  AppView,
  UserRole,
  CandidateProfile,
  WorkExperienceItem,
  SkillItem,
  SelfDeclarationData,
  EvidenceItem,
  AssessmentTask,
  CandidateForAssessor,
  ScoringCriterion,
  SkillResult,
  NotificationItem
} from '../types';
import {
  mockCandidateProfile,
  mockWorkExperiences,
  mockSelfDeclarationData,
  mockEvidenceItems,
  mockAssessmentTask,
  mockCandidatesForAssessor,
  mockScoringCriteria,
  mockSkillResults,
  mockNotifications
} from '../data/mockData';

interface ToastState {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  candidate: CandidateProfile;
  setCandidate: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  experiences: WorkExperienceItem[];
  addExperience: (exp: Omit<WorkExperienceItem, 'id'>) => void;
  editExperience: (id: string, updated: Partial<WorkExperienceItem>) => void;
  deleteExperience: (id: string) => void;
  selectedExperienceId: string | null;
  setSelectedExperienceId: (id: string | null) => void;
  openExperienceDetail: (id: string) => void;
  editingExperience: WorkExperienceItem | null;
  setEditingExperience: (exp: WorkExperienceItem | null) => void;
  addSkillToExperience: (experienceId: string, skill: Omit<SkillItem, 'id'>) => void;
  removeSkillFromExperience: (experienceId: string, skillId: string) => void;
  selfDeclaration: SelfDeclarationData;
  updateSelfDeclaration: (data: Partial<SelfDeclarationData>) => void;
  evidenceList: EvidenceItem[];
  addEvidence: (item: Omit<EvidenceItem, 'id' | 'uploadedAt' | 'status'> & Partial<Pick<EvidenceItem, 'status' | 'uploadedAt'>>) => void;
  editEvidence: (id: string, updated: Partial<EvidenceItem>) => void;
  deleteEvidence: (id: string) => void;
  selectedEvidence: EvidenceItem | null;
  setSelectedEvidence: (item: EvidenceItem | null) => void;
  editingEvidence: EvidenceItem | null;
  setEditingEvidence: (item: EvidenceItem | null) => void;
  isEvidenceDetailsModalOpen: boolean;
  setIsEvidenceDetailsModalOpen: (open: boolean) => void;
  assessmentTask: AssessmentTask;
  toggleAssessmentCriterion: (criterionId: string) => void;
  candidatesForAssessor: CandidateForAssessor[];
  selectedCandidate: CandidateForAssessor | undefined;
  setSelectedCandidateId: (id: string) => void;
  scoringCriteria: ScoringCriterion[];
  updateScore: (id: string, score: number, comments?: string) => void;
  skillResults: SkillResult[];
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  
  // Modals / Drawers
  isAddExperienceModalOpen: boolean;
  setIsAddExperienceModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  isUploadEvidenceModalOpen: boolean;
  setIsUploadEvidenceModalOpen: (open: boolean) => void;
  isNotificationsDrawerOpen: boolean;
  setIsNotificationsDrawerOpen: (open: boolean) => void;
  isWatchModalOpen: boolean;
  setIsWatchModalOpen: (open: boolean) => void;
  isJobModalOpen: boolean;
  setIsJobModalOpen: (open: boolean) => void;
  isLearningModalOpen: boolean;
  setIsLearningModalOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;

  // Toast
  toast: ToastState | null;
  showToast: (text: string, type?: ToastState['type']) => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to deduce view from path
const getViewFromPath = (path: string): { view: AppView; expId: string | null } => {
  if (path === '/profile') return { view: 'profile', expId: null };
  if (path.startsWith('/experience/')) {
    const expId = path.replace('/experience/', '').trim();
    return { view: 'experience-detail', expId: expId || null };
  }
  if (path === '/experience') return { view: 'experience', expId: null };
  if (path === '/declaration') return { view: 'declaration', expId: null };
  if (path === '/evidence') return { view: 'evidence', expId: null };
  if (path === '/ai-assistant') return { view: 'ai-assistant', expId: null };
  if (path === '/ai-analysis') return { view: 'ai-analysis', expId: null };
  if (path === '/assessment') return { view: 'assessment', expId: null };
  if (path === '/results') return { view: 'results', expId: null };
  return { view: 'dashboard', expId: null };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = typeof window !== 'undefined' ? getViewFromPath(window.location.pathname) : { view: 'dashboard' as AppView, expId: null };
  const [currentView, setCurrentViewState] = useState<AppView>(initial.view);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(initial.expId || (mockWorkExperiences[0]?.id ?? null));
  const [editingExperience, setEditingExperience] = useState<WorkExperienceItem | null>(null);

  const [userRole, setUserRole] = useState<UserRole>('worker');
  const [candidate, setCandidate] = useState<CandidateProfile>(mockCandidateProfile);
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>(mockWorkExperiences);
  const [selfDeclaration, setSelfDeclaration] = useState<SelfDeclarationData>(mockSelfDeclarationData);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(mockEvidenceItems);
  const [assessmentTask, setAssessmentTask] = useState<AssessmentTask>(mockAssessmentTask);
  const [candidatesForAssessor] = useState<CandidateForAssessor[]>(mockCandidatesForAssessor);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-001');
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriterion[]>(mockScoringCriteria);
  const [skillResults] = useState<SkillResult[]>(mockSkillResults);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUploadEvidenceModalOpen, setIsUploadEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [isEvidenceDetailsModalOpen, setIsEvidenceDetailsModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync URL history state
  const setCurrentView = (view: AppView) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'profile') targetPath = '/profile';
      else if (view === 'experience') targetPath = '/experience';
      else if (view === 'experience-detail') targetPath = selectedExperienceId ? `/experience/${selectedExperienceId}` : '/experience';
      else if (view === 'declaration') targetPath = '/declaration';
      else if (view === 'evidence') targetPath = '/evidence';
      else if (view === 'ai-assistant') targetPath = '/ai-assistant';
      else if (view === 'ai-analysis') targetPath = '/ai-analysis';
      else if (view === 'assessment') targetPath = '/assessment';
      else if (view === 'results') targetPath = '/results';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  const openExperienceDetail = (id: string) => {
    setSelectedExperienceId(id);
    setCurrentViewState('experience-detail');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'experience-detail', id }, '', `/experience/${id}`);
    }
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { view, expId } = getViewFromPath(window.location.pathname);
      setCurrentViewState(view);
      if (expId) {
        setSelectedExperienceId(expId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (text: string, type: ToastState['type'] = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3800);
  };

  const hideToast = () => setToast(null);

  const addExperience = (newExp: Omit<WorkExperienceItem, 'id'>) => {
    const item: WorkExperienceItem = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setExperiences((prev) => [item, ...prev]);
    showToast('Work experience entry added successfully.', 'success');
  };

  const editExperience = (id: string, updated: Partial<WorkExperienceItem>) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp))
    );
    showToast('Work experience updated successfully.', 'success');
  };

  const deleteExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    showToast('Experience entry removed.', 'info');
    if (selectedExperienceId === id) {
      setCurrentView('experience');
    }
  };

  const addSkillToExperience = (experienceId: string, skill: Omit<SkillItem, 'id'>) => {
    const newSkill: SkillItem = {
      ...skill,
      id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isSelfDeclared: true
    };
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === experienceId) {
          return {
            ...exp,
            skillsGained: [...(exp.skillsGained || []), newSkill]
          };
        }
        return exp;
      })
    );
    showToast(`Added skill "${skill.name}" (Self-declared).`, 'success');
  };

  const removeSkillFromExperience = (experienceId: string, skillId: string) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id === experienceId) {
          return {
            ...exp,
            skillsGained: exp.skillsGained.filter((s) => s.id !== skillId)
          };
        }
        return exp;
      })
    );
    showToast('Skill removed from experience.', 'info');
  };

  const updateSelfDeclaration = (data: Partial<SelfDeclarationData>) => {
    setSelfDeclaration((prev) => ({ ...prev, ...data }));
    showToast('Self-declaration draft saved.', 'info');
  };

  const addEvidence = (itemData: Omit<EvidenceItem, 'id' | 'uploadedAt' | 'status'> & Partial<Pick<EvidenceItem, 'status' | 'uploadedAt'>>) => {
    const newEvidence: EvidenceItem = {
      ...itemData,
      id: `ev-${Date.now()}`,
      uploadedAt: itemData.uploadedAt || 'Just now',
      status: itemData.status || 'Uploaded',
      linkedSkills: itemData.linkedSkills || []
    };
    setEvidenceList((prev) => [newEvidence, ...prev]);
    showToast(`"${itemData.title}" submitted for assessor review.`, 'success');
  };

  const editEvidence = (id: string, updated: Partial<EvidenceItem>) => {
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    setSelectedEvidence((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
    showToast('Evidence details updated successfully.', 'success');
  };

  const deleteEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((ev) => ev.id !== id));
    if (selectedEvidence?.id === id) {
      setSelectedEvidence(null);
      setIsEvidenceDetailsModalOpen(false);
    }
    showToast('Evidence artifact removed.', 'info');
  };

  const toggleAssessmentCriterion = (criterionId: string) => {
    setAssessmentTask((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) =>
        c.id === criterionId ? { ...c, checked: !c.checked } : c
      )
    }));
  };

  const updateScore = (id: string, score: number, comments?: string) => {
    setScoringCriteria((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              score,
              comments: comments !== undefined ? comments : item.comments
            }
          : item
      )
    );
    showToast('Assessor evaluation updated.', 'info');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const selectedCandidate = candidatesForAssessor.find((c) => c.id === selectedCandidateId);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        userRole,
        setUserRole,
        candidate,
        setCandidate,
        experiences,
        addExperience,
        editExperience,
        deleteExperience,
        selectedExperienceId,
        setSelectedExperienceId,
        openExperienceDetail,
        editingExperience,
        setEditingExperience,
        addSkillToExperience,
        removeSkillFromExperience,
        selfDeclaration,
        updateSelfDeclaration,
        evidenceList,
        addEvidence,
        editEvidence,
        deleteEvidence,
        selectedEvidence,
        setSelectedEvidence,
        editingEvidence,
        setEditingEvidence,
        isEvidenceDetailsModalOpen,
        setIsEvidenceDetailsModalOpen,
        assessmentTask,
        toggleAssessmentCriterion,
        candidatesForAssessor,
        selectedCandidate,
        setSelectedCandidateId,
        scoringCriteria,
        updateScore,
        skillResults,
        notifications,
        markAllNotificationsRead,
        isAddExperienceModalOpen,
        setIsAddExperienceModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        isUploadEvidenceModalOpen,
        setIsUploadEvidenceModalOpen,
        isNotificationsDrawerOpen,
        setIsNotificationsDrawerOpen,
        isWatchModalOpen,
        setIsWatchModalOpen,
        isJobModalOpen,
        setIsJobModalOpen,
        isLearningModalOpen,
        setIsLearningModalOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        toast,
        showToast,
        hideToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
