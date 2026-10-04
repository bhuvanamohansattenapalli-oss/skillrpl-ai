export type AppView = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'profile'
  | 'experience'
  | 'experience-detail'
  | 'declaration'
  | 'evidence'
  | 'ai-assistant'
  | 'ai-analysis'
  | 'qualification-match'
  | 'assessment'
  | 'results'
  | 'assessor-dashboard'
  | 'assessor-candidate'
  | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionLink?: {
    label: string;
    view: AppView;
  };
}

export type UserRole = 'worker' | 'assessor';

export interface SkillItem {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isSelfDeclared: boolean;
}

export type WorkType = 
  | 'Full-time'
  | 'Part-time'
  | 'Self-employed'
  | 'Apprenticeship'
  | 'Informal work'
  | 'Other';

export type WorkEnvironment = 
  | 'Workshop'
  | 'Construction site'
  | 'Factory'
  | 'Farm'
  | 'Office'
  | 'Field'
  | 'Other';

export interface CandidateProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string;
  email: string;
  phone: string;
  preferredContact?: 'phone' | 'email';
  aadhaarMasked: string;
  location: string;
  state: string;
  trade: string;
  primaryTrade?: string;
  tradeCode: string;
  nsqfLevel: number;
  yearsOfExperience: number;
  profileCompletion: number;
  applicationId: string;
  applicationStatus: 'In Progress' | 'Evidence Submitted' | 'Under Assessor Review' | 'Competent / Certified';
  professionalSummary: string;
  preferredLanguage: string;
}

export interface WorkExperienceItem {
  id: string;
  occupation: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  yearsOfExperience: number;
  description?: string;
  responsibilities: string[];
  toolsUsed: string[];
  workType?: WorkType;
  workEnvironment: string;
  skillsGained: SkillItem[];
  evidenceIds?: string[];
  verifiedBy?: string;
  isDemo?: boolean;
}

export interface SelfDeclarationData {
  regularWorkType: string;
  selectedTools: string[];
  practicalTasks: string[];
  difficultTaskScenario: string;
  safetyComplianceRating: number;
  independentHandlingRating: number;
  blueprintReadingRating: number;
  troubleshootingRating: number;
  declarationAgreed: boolean;
}

export type EvidenceType =
  | 'Work Photo'
  | 'Work Video'
  | 'Certificate'
  | 'Training Record'
  | 'Work Document'
  | 'Portfolio / Work Sample'
  | 'Other'
  | 'video'
  | 'photo'
  | 'document'
  | 'certificate';

export type EvidenceStatus =
  | 'Uploaded'
  | 'Pending Review'
  | 'Reviewed'
  | 'Verified'
  | 'Needs Clarification';

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  fileName: string;
  fileSize: string;
  duration?: string;
  uploadedAt: string;
  status: EvidenceStatus;
  category?: string;
  description: string;
  thumbnailColor?: string;
  thumbnailUrl?: string;
  dateOfWork?: string;
  location?: string;
  roleInWork?: string;
  linkedSkills?: string[];
  isDemo?: boolean;
}

export interface AssessmentTask {
  id: string;
  taskNumber: number;
  totalTasks: number;
  title: string;
  trade: string;
  tradeCode: string;
  description: string;
  safetyGuidelines: string[];
  criteria: {
    id: string;
    label: string;
    checked: boolean;
  }[];
  candidateNotes?: string;
  linkedEvidenceIds: string[];
}

export interface CandidateForAssessor {
  id: string;
  applicationId: string;
  name: string;
  avatarInitials: string;
  trade: string;
  nsqfLevel: number;
  experience: string;
  location: string;
  evidenceCount: number;
  assessmentStatus: 'Pending Review' | 'In Progress' | 'Completed' | 'Needs Review';
  submittedDate: string;
  overallScore?: number;
  aiAssistedConfidence?: number;
}

export interface ScoringCriterion {
  id: string;
  skill: string;
  weight: number;
  score: number; // 1 to 5
  maxScore: number;
  evidence: string;
  comments: string;
}

export interface SkillResult {
  id: string;
  skill: string;
  evidenceCount: number;
  assessmentScore: number;
  competencyLevel: 'Needs Development' | 'Competent' | 'Strong';
  currentLevelVal: number; // 0 - 100
  requiredLevelVal: number; // 0 - 100
  assessorNotes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'review';
  read: boolean;
}

// ==========================================
// REAL WORKER RPL APPLICATION WORKFLOW TYPES
// ==========================================

export type RPLApplicationStatus =
  | 'DRAFT'
  | 'SELF_DECLARATION_COMPLETED'
  | 'ASSESSMENT_READY'
  | 'SUBMITTED'
  | 'UNDER_ASSESSMENT'
  | 'COMPLETED';

export interface WorkerExperienceEntry {
  id?: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
  tasksPerformed: string;
  toolsUsed: string;
}

export interface SelfDeclaredSkillEntry {
  id?: string;
  taskName: string;
  experienceText: string;
  toolsUsed: string;
  confidenceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  statusLabel?: string; // "Self-declared — pending assessment"
}

export interface RPLApplicationFormData {
  // Step 1: Profile / Personal Information
  name: string;
  location: string;
  trade: string;
  yearsOfExperience: number;
  phone?: string;
  email?: string;
  preferredLanguage?: string;

  // Step 2: Self Declaration
  workplaceType: string;
  employmentType: 'Employment' | 'Self-employed' | 'Both' | 'Contract';
  workEnvironments: string[];
  safetyPracticeAgreement: boolean;

  // Step 3: Experience Details (Multiple entries)
  experiences: WorkerExperienceEntry[];

  // Step 4: Skills & Tasks (Self-declared)
  skills: SelfDeclaredSkillEntry[];

  // Step 5: AI Analysis & Qualification Mapping results snapshot
  aiAnalysisId?: string;
  aiAnalysisSnapshot?: {
    summary?: string;
    strengths?: string[];
    recommendations?: string[];
    potentialSkillMatches?: string[];
    suggestedCompetencyAreas?: string[];
    suggestedEvidence?: string[];
    areasRequiringVerification?: string[];
    model?: string;
    createdAt?: string;
  };
  selectedQpCode?: string;
  qualificationMappings?: any[];
  mappingStatus?: 'SUGGESTED' | 'ACCEPTED' | 'REJECTED' | 'FLAGGED_INCORRECT' | 'MODIFIED_BY_ASSESSOR';
  assessorMappingNotes?: string;

  // Step 6: Evidence (marked "Next step")
  evidenceNote?: string;
}

export interface RPLApplicationListItem {
  id: string;
  applicationNumber: string;
  tradeTitle: string;
  status: RPLApplicationStatus;
  currentStep: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

