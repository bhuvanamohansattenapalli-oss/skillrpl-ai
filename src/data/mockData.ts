import type {
  CandidateProfile,
  WorkExperienceItem,
  SelfDeclarationData,
  EvidenceItem,
  AssessmentTask,
  CandidateForAssessor,
  ScoringCriterion,
  SkillResult,
  NotificationItem
} from '../types';

export const mockCandidateProfile: CandidateProfile = {
  id: 'cand-001',
  name: 'Rajesh Kumar',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  dateOfBirth: '14 August 1994',
  gender: 'Male',
  email: 'rajesh.kumar.electric@gmail.com',
  phone: '+91 98452 31920',
  preferredContact: 'phone',
  aadhaarMasked: 'XXXX-XXXX-4819',
  location: 'Pune Industrial Area',
  state: 'Maharashtra',
  trade: 'Industrial Electrician & Solar PV Specialist',
  tradeCode: 'ELE/Q0105',
  nsqfLevel: 5,
  yearsOfExperience: 7.5,
  profileCompletion: 78,
  applicationId: 'RPL-IND-2026-0842',
  applicationStatus: 'In Progress',
  professionalSummary: 'Accomplished electrical technician with 7+ years of hands-on experience in 3-phase industrial wiring, motor starter installations, switchgear maintenance, and rooftop solar grid-tie inverters across manufacturing and commercial units.',
  preferredLanguage: 'English (English / हिन्दी)'
};

export const mockWorkExperiences: WorkExperienceItem[] = [
  {
    id: 'exp-1',
    occupation: 'Lead Industrial Wireman & Site Electrician',
    organization: 'Bharat Heavy Electrical Installations Pvt. Ltd.',
    location: 'Bhosari MIDC, Pune',
    startDate: '2021',
    endDate: 'Present',
    isCurrent: true,
    yearsOfExperience: 3.5,
    description: 'Performed industrial 3-phase power distribution, motor control center setup, preventive maintenance and basic fault diagnosis.',
    workType: 'Full-time',
    responsibilities: [
      'Configuring and terminating 415V 3-phase power distribution panels and motor control centers (MCC)',
      'Executing Star-Delta and VFD starter connections for 15HP-50HP industrial induction motors',
      'Implementing Lockout/Tagout (LOTO) safety protocols during preventative maintenance rounds',
      'Conducting insulation resistance (Megger) and earth loop impedance testing'
    ],
    toolsUsed: ['Megger 1000V Tester', 'Fluke Digital Multimeter', 'Hydraulic Crimping Tool', 'Cable Fault Locator', 'Torque Screwdriver'],
    workEnvironment: 'Factory',
    skillsGained: [
      { id: 'sk-1', name: 'Electrical Installation', level: 'Advanced', isSelfDeclared: true },
      { id: 'sk-2', name: 'Fault Diagnosis', level: 'Advanced', isSelfDeclared: true },
      { id: 'sk-3', name: 'Equipment Handling', level: 'Intermediate', isSelfDeclared: true },
      { id: 'sk-4', name: 'Safety Procedures & LOTO', level: 'Advanced', isSelfDeclared: true },
      { id: 'sk-5', name: 'Maintenance Operations', level: 'Intermediate', isSelfDeclared: true }
    ],
    evidenceIds: ['ev-001', 'ev-002'],
    isDemo: true
  },
  {
    id: 'exp-2',
    occupation: 'Electrical Maintenance Technician',
    organization: 'Apex Automotive Components Plant II',
    location: 'Chakan, Pune',
    startDate: '2018',
    endDate: '2021',
    isCurrent: false,
    yearsOfExperience: 2.7,
    description: 'Managed assembly line electrical panels, contactor replacements, sensor interlock calibration, and daily motor circuit health checks.',
    workType: 'Full-time',
    responsibilities: [
      'Carried out daily inspection of CNC machinery electrical panels and auxiliary cooling pumps',
      'Replaced blown thermal overload relays, auxiliary contactors, and miniature circuit breakers (MCBs)',
      'Assisted senior engineers in troubleshooting sensor interlocking and PLC I/O wiring'
    ],
    toolsUsed: ['Analog Clamp Meter', 'Wire Strippers', 'Soldering Station', 'Thermal Imaging Camera'],
    workEnvironment: 'Workshop',
    skillsGained: [
      { id: 'sk-6', name: 'Circuit Troubleshooting', level: 'Intermediate', isSelfDeclared: true },
      { id: 'sk-7', name: 'Relay & Contactor Replacement', level: 'Advanced', isSelfDeclared: true },
      { id: 'sk-8', name: 'Wire Stripping & Termination', level: 'Advanced', isSelfDeclared: true }
    ],
    evidenceIds: ['ev-003'],
    isDemo: true
  },
  {
    id: 'exp-3',
    occupation: 'Apprentice Wireman & Assistant',
    organization: 'Sharma Commercial Electrical Contractors',
    location: 'Navi Mumbai, Maharashtra',
    startDate: '2016',
    endDate: '2018',
    isCurrent: false,
    yearsOfExperience: 2.4,
    description: 'Assisted senior electricians in laying armored cables in trays, conduit bending, earth pit testing, and commercial lighting fit-outs.',
    workType: 'Apprenticeship',
    responsibilities: [
      'Laid armored cables in cable trays and conduits for warehouse lighting and sub-stations',
      'Prepared glanding and lugging for aluminum and copper armored conductors up to 70 sq.mm',
      'Maintained daily log sheets of earth pit resistance measurements'
    ],
    toolsUsed: ['Hacksaw', 'Conduit Bender', 'Ratchet Crimper', 'Earth Resistance Tester'],
    workEnvironment: 'Construction site',
    skillsGained: [
      { id: 'sk-9', name: 'Conduit Bending & Routing', level: 'Intermediate', isSelfDeclared: true },
      { id: 'sk-10', name: 'Cable Glanding & Lugging', level: 'Intermediate', isSelfDeclared: true },
      { id: 'sk-11', name: 'Earthing & Grounding Tests', level: 'Beginner', isSelfDeclared: true }
    ],
    evidenceIds: [],
    isDemo: true
  }
];

export const mockSelfDeclarationData: SelfDeclarationData = {
  regularWorkType: 'Industrial Power Distribution, Motor Starters, and Solar Inverter Commissioning',
  selectedTools: [
    'Digital Multimeter (AC/DC True RMS)',
    'Insulation Resistance Tester (Megger)',
    'Earth Pit Resistance Tester',
    'Hydraulic Cable Lug Crimper',
    'Lockout / Tagout (LOTO) Kit',
    'Phase Sequence Indicator',
    'Torque Wrench for Busbars',
    'Infrared Thermometer / Camera'
  ],
  practicalTasks: [
    'Assemble and wire 3-phase distribution boards with MCB, RCCB, and SPD',
    'Connect and configure Star-Delta starters with thermal overload relays',
    'Perform earth resistance testing and install copper earth electrodes',
    'Read and execute single-line electrical schematics (SLD)',
    'Calibrate DC combiner box and string inverters for solar installations'
  ],
  difficultTaskScenario: 'During an unexpected plant power outage at Apex Automotive, a 40HP cooling compressor motor tripped intermittently. After isolating the supply and following LOTO protocols, I tested winding insulation with a 500V Megger, identified degradation in the T2 phase winding caused by mechanical vibration, isolated the faulty motor, and safely switched the auxiliary bypass pump within 45 minutes to prevent production stoppage.',
  safetyComplianceRating: 95,
  independentHandlingRating: 90,
  blueprintReadingRating: 82,
  troubleshootingRating: 85,
  declarationAgreed: true
};

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'ev-1',
    title: 'Residential Electrical Panel Installation',
    type: 'Work Photo',
    fileName: 'Electrical_Panel_Installation.jpg',
    fileSize: '4.2 MB',
    uploadedAt: 'Oct 02, 2026',
    dateOfWork: 'Aug 14, 2026',
    location: 'Industrial Tech Hub, Pune',
    roleInWork: 'I personally performed the wiring, busbar mounting, and preliminary continuity testing.',
    status: 'Reviewed',
    category: 'Panel Wiring & Installation',
    description: 'Residential electrical panel installation with dual 63A isolators, RCCB protection, neat busbar dressing, and standardized color-coded wiring.',
    thumbnailColor: '#123B5D',
    linkedSkills: ['Electrical Installation', 'Safety Procedures & LOTO', 'Equipment Handling'],
    isDemo: true
  },
  {
    id: 'ev-2',
    title: 'Lockout/Tagout (LOTO) Safety Protocol Execution',
    type: 'Work Photo',
    fileName: 'loto_safety_verification.jpg',
    fileSize: '4.8 MB',
    uploadedAt: 'Oct 01, 2026',
    dateOfWork: 'Sep 02, 2026',
    location: 'Substation Bay 4, Pune',
    roleInWork: 'I verified zero-energy state, applied the personal padlock, and documented the isolation log.',
    status: 'Reviewed',
    category: 'Workplace Safety & Compliance',
    description: 'Photographic documentation of secondary padlocked MCCB circuit isolation and tagged zero-voltage testing prior to panel access.',
    thumbnailColor: '#25A7A0',
    linkedSkills: ['Safety Procedures & LOTO', 'Equipment Handling'],
    isDemo: true
  },
  {
    id: 'ev-3',
    title: 'Motor Terminal Box Glanding & Earthing',
    type: 'Work Photo',
    fileName: 'motor_terminal_box_glanding.jpg',
    fileSize: '3.6 MB',
    uploadedAt: 'Sep 29, 2026',
    dateOfWork: 'Sep 18, 2026',
    location: 'Manufacturing Unit 2, Chakan',
    roleInWork: 'I personally terminated the armoured cables using brass glands and crimped lugs.',
    status: 'Uploaded',
    category: 'Cable Termination',
    description: 'High-resolution photo showing armoured cable glanding, neat earthing connection, and crimped lug terminations on a 15HP motor.',
    thumbnailColor: '#1A5280',
    linkedSkills: ['Electrical Installation', 'Circuit Troubleshooting'],
    isDemo: true
  },
  {
    id: 'ev-4',
    title: 'Thermal Imaging Busbar Inspection',
    type: 'Work Photo',
    fileName: 'thermal_busbar_scan.jpg',
    fileSize: '5.1 MB',
    uploadedAt: 'Sep 27, 2026',
    dateOfWork: 'Sep 24, 2026',
    location: 'Commercial Complex Substation, Pune',
    roleInWork: 'I conducted the infrared thermography survey to detect loose connections under full load.',
    status: 'Pending Review',
    category: 'Testing & Quality Assurance',
    description: 'Infrared thermal scan of main distribution busbars identifying balanced thermal distribution and absence of micro-resistance hotspots.',
    thumbnailColor: '#D97706',
    linkedSkills: ['Fault Diagnosis', 'Equipment Handling', 'Safety Procedures & LOTO'],
    isDemo: true
  },
  {
    id: 'ev-5',
    title: 'Motor Repair & Star-Delta Starter Wiring',
    type: 'Work Video',
    fileName: 'motor_repair_star_delta_demo.mp4',
    fileSize: '48.2 MB',
    duration: '2:45',
    uploadedAt: 'Yesterday at 4:30 PM',
    dateOfWork: 'Sep 28, 2026',
    location: 'Apprentice Training Workshop',
    roleInWork: 'I wired the complete control circuit from memory and configured the thermal overload relay.',
    status: 'Pending Review',
    category: 'Practical Demonstration',
    description: 'Video demonstration of 3-phase induction motor starter wiring, timer relay interlocking, and pre-start insulation check.',
    thumbnailColor: '#123B5D',
    linkedSkills: ['Electrical Installation', 'Fault Diagnosis', 'Equipment Handling'],
    isDemo: true
  },
  {
    id: 'ev-6',
    title: 'Insulation Resistance (Megger) Test Protocol',
    type: 'Work Video',
    fileName: 'megger_test_415v_busbar.mp4',
    fileSize: '52.1 MB',
    duration: '3:12',
    uploadedAt: 'Sep 25, 2026',
    dateOfWork: 'Oct 01, 2026',
    location: 'Substation Yard, Pune',
    roleInWork: 'I connected the 1000V insulation tester and recorded phase-to-earth leakage readings.',
    status: 'Reviewed',
    category: 'Testing & Quality Assurance',
    description: 'Live video test illustrating 1000V Megger application on 415V busbars with calibrated readings exceeding 50 Mega-ohms.',
    thumbnailColor: '#0B2942',
    linkedSkills: ['Fault Diagnosis', 'Safety Procedures & LOTO'],
    isDemo: true
  },
  {
    id: 'ev-7',
    title: 'Electrical Training Certificate - Industrial Automation',
    type: 'Certificate',
    fileName: 'Electrical_Training_Certificate.pdf',
    fileSize: '820 KB',
    uploadedAt: 'Sep 20, 2026',
    dateOfWork: 'Jan 15, 2025',
    location: 'National Skill Training Institute',
    roleInWork: 'Completed certified 240-hour hands-on industrial wiring, PLC basics, and safety curriculum.',
    status: 'Reviewed',
    category: 'Certifications',
    description: 'National Skill Development accredited advanced electrical maintenance and safety procedures certification.',
    thumbnailColor: '#25A7A0',
    linkedSkills: ['Electrical Installation', 'Safety Procedures & LOTO'],
    isDemo: true
  },
  {
    id: 'ev-8',
    title: 'Employer Experience Verification Letter',
    type: 'Work Document',
    fileName: 'bharat_electricals_exp_letter.pdf',
    fileSize: '1.2 MB',
    uploadedAt: 'Sep 28, 2026',
    dateOfWork: 'Sep 10, 2026',
    location: 'Bharat Industrial Electricals Ltd.',
    roleInWork: 'Lead technician on commercial panel installations and preventative maintenance shifts.',
    status: 'Pending Review',
    category: 'Work History Proof',
    description: 'Official certified employment proof detailing 3.5+ years of verified on-site electrical contracting and fault resolution.',
    thumbnailColor: '#4DA3D9',
    linkedSkills: ['Electrical Installation', 'Equipment Handling', 'Fault Diagnosis'],
    isDemo: true
  }
];

export const mockAssessmentTask: AssessmentTask = {
  id: 'task-3',
  taskNumber: 3,
  totalTasks: 8,
  title: 'Demonstrate the correct procedure for 3-phase induction motor starter connection and overload relay configuration',
  trade: 'Industrial Electrician',
  tradeCode: 'ELE/Q0105 (NSQF Level 5)',
  description: 'In this practical task, you are required to inspect the terminal block of a 415V 15HP squirrel cage induction motor, configure the overload protection unit to 1.15x full load amperage (FLA), execute proper phase earthing, and perform pre-commissioning safety checks.',
  safetyGuidelines: [
    'Always de-energize the incoming supply and verify zero energy with an approved voltage detector before touching terminals.',
    'Wear minimum Category 2 Arc Flash PPE including rated 1000V insulating gloves and safety spectacles.',
    'Ensure solid grounding of motor casing to the plant earth pit with dual independent copper conductors.'
  ],
  criteria: [
    {
      id: 'crit-1',
      label: 'Preparation: Isolating power source, obtaining required PPE, verifying circuit diagram and motor nameplate specs',
      checked: true
    },
    {
      id: 'crit-2',
      label: 'Tool selection: Selecting 1000V VDE insulated hand tools, calibrated digital multimeter, and torque screwdriver',
      checked: true
    },
    {
      id: 'crit-3',
      label: 'Procedure: Terminating line cables (R, Y, B) to contactor inputs, verifying star-delta jumper straps, and latching auxiliary contacts',
      checked: true
    },
    {
      id: 'crit-4',
      label: 'Safety: Dual-conductor protective bonding to earth terminal, clearance verification, and replacement of terminal box gasket',
      checked: true
    },
    {
      id: 'crit-5',
      label: 'Final result: Setting thermal overload relay tripping threshold accurately and executing simulated no-load rotation test',
      checked: false
    }
  ],
  candidateNotes: 'Completed terminal box inspection. Motor full load current is 21A; set bimetallic overload relay to 24.1A. Verified shaft free rotation by hand.',
  linkedEvidenceIds: ['ev-1', 'ev-5']
};

export const mockCandidatesForAssessor: CandidateForAssessor[] = [
  {
    id: 'cand-001',
    applicationId: 'RPL-IND-2026-0842',
    name: 'Rajesh Kumar',
    avatarInitials: 'RK',
    trade: 'Industrial Electrician & Solar PV',
    nsqfLevel: 5,
    experience: '7.5 Years',
    location: 'Pune, Maharashtra',
    evidenceCount: 6,
    assessmentStatus: 'Pending Review',
    submittedDate: 'Today, 11:20 AM',
    overallScore: 84,
    aiAssistedConfidence: 91
  },
  {
    id: 'cand-002',
    applicationId: 'RPL-IND-2026-0790',
    name: 'Sunita Verma',
    avatarInitials: 'SV',
    trade: 'Solar PV Installation & Grid Specialist',
    nsqfLevel: 4,
    experience: '6.0 Years',
    location: 'Jaipur, Rajasthan',
    evidenceCount: 9,
    assessmentStatus: 'In Progress',
    submittedDate: 'Yesterday, 03:45 PM',
    overallScore: 88,
    aiAssistedConfidence: 94
  },
  {
    id: 'cand-003',
    applicationId: 'RPL-IND-2026-0651',
    name: 'Mohammad Arif',
    avatarInitials: 'MA',
    trade: 'Automotive EV Powertrain Technician',
    nsqfLevel: 5,
    experience: '5.2 Years',
    location: 'Chennai, Tamil Nadu',
    evidenceCount: 7,
    assessmentStatus: 'Needs Review',
    submittedDate: 'Sep 30, 2026',
    overallScore: 68,
    aiAssistedConfidence: 79
  },
  {
    id: 'cand-004',
    applicationId: 'RPL-IND-2026-0518',
    name: 'Anand Patel',
    avatarInitials: 'AP',
    trade: 'CNC Precision Milling & Tooling',
    nsqfLevel: 5,
    experience: '8.0 Years',
    location: 'Vadodara, Gujarat',
    evidenceCount: 11,
    assessmentStatus: 'Completed',
    submittedDate: 'Sep 26, 2026',
    overallScore: 92,
    aiAssistedConfidence: 96
  },
  {
    id: 'cand-005',
    applicationId: 'RPL-IND-2026-0422',
    name: 'Priya Nair',
    avatarInitials: 'PN',
    trade: 'Biomedical Instrument Maintenance',
    nsqfLevel: 5,
    experience: '4.8 Years',
    location: 'Kochi, Kerala',
    evidenceCount: 8,
    assessmentStatus: 'Pending Review',
    submittedDate: 'Sep 24, 2026',
    overallScore: 78,
    aiAssistedConfidence: 86
  }
];

export const mockScoringCriteria: ScoringCriterion[] = [
  {
    id: 'sc-1',
    skill: '3-Phase Motor Wiring & Connections',
    weight: 25,
    score: 4,
    maxScore: 5,
    evidence: 'Video demonstration shows confident star-delta lead identification and correct contactor latching',
    comments: 'Strong dexterity. Cable termination is neat with proper ferrule tagging.'
  },
  {
    id: 'sc-2',
    skill: 'Protective Devices & Circuit Breaker Sizing',
    weight: 20,
    score: 4,
    maxScore: 5,
    evidence: 'Photo evidence and written declaration of MCCB and relay calculations',
    comments: 'Correct calculation of 1.15x FLA for continuous motor rating.'
  },
  {
    id: 'sc-3',
    skill: 'Electrical Safety & Lockout/Tagout Protocols',
    weight: 25,
    score: 5,
    maxScore: 5,
    evidence: 'Certified photo log of padlocked isolator, tag placement, and zero energy verification',
    comments: 'Exemplary safety awareness adhering strictly to IS 732 safety codes.'
  },
  {
    id: 'sc-4',
    skill: 'Fault Diagnosis & Insulation Testing',
    weight: 20,
    score: 3,
    maxScore: 5,
    evidence: 'Megger testing video shows correct probe connection but slight delay in busbar isolation',
    comments: 'Competent in equipment usage; recommend 4-hour refresher on high-capacitance cable discharge.'
  },
  {
    id: 'sc-5',
    skill: 'Documentation & Blueprint Interpretation',
    weight: 10,
    score: 4,
    maxScore: 5,
    evidence: 'Provided schematic markups and motor terminal configuration log',
    comments: 'Reads single-line electrical drawings clearly with standard IEC symbology.'
  }
];

export const mockSkillResults: SkillResult[] = [
  {
    id: 'sr-1',
    skill: 'Electrical Safety & LOTO Compliance',
    evidenceCount: 3,
    assessmentScore: 96,
    competencyLevel: 'Strong',
    currentLevelVal: 96,
    requiredLevelVal: 80,
    assessorNotes: 'Candidate demonstrates disciplined safety protocols exceeding standard workplace expectations.'
  },
  {
    id: 'sr-2',
    skill: '3-Phase Power Distribution & Motor Starters',
    evidenceCount: 4,
    assessmentScore: 88,
    competencyLevel: 'Strong',
    currentLevelVal: 88,
    requiredLevelVal: 75,
    assessorNotes: 'Extensive practical familiarity with both direct-on-line and star-delta starters.'
  },
  {
    id: 'sr-3',
    skill: 'Equipment Handling & Cable Glanding',
    evidenceCount: 2,
    assessmentScore: 82,
    competencyLevel: 'Competent',
    currentLevelVal: 82,
    requiredLevelVal: 70,
    assessorNotes: 'Clean wire dressing, correct torque specifications on busbars.'
  },
  {
    id: 'sr-4',
    skill: 'Schematics & Single-Line Diagram Reading',
    evidenceCount: 2,
    assessmentScore: 78,
    competencyLevel: 'Competent',
    currentLevelVal: 78,
    requiredLevelVal: 70,
    assessorNotes: 'Understands industrial electrical blueprints and auxiliary interlocking logic.'
  },
  {
    id: 'sr-5',
    skill: 'Advanced Fault Diagnosis & Harmonics',
    evidenceCount: 1,
    assessmentScore: 62,
    competencyLevel: 'Needs Development',
    currentLevelVal: 62,
    requiredLevelVal: 75,
    assessorNotes: 'Basic continuity and insulation testing is solid; requires bridge practice in oscilloscope harmonic analysis.'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Evidence Verified by Assessor',
    message: 'Your 3-Phase Main Distribution Board Assembly video has been verified and awarded full competency points.',
    time: '2 hours ago',
    type: 'success',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Next Assessment Task Unlocked',
    message: 'Task 03: "Demonstrate 3-phase induction motor starter connection" is ready for your submission.',
    time: '5 hours ago',
    type: 'info',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Assessor Review Scheduled',
    message: 'Dr. A. K. Sharma (Lead Assessor, Skill India NCVET) has scheduled your practical portfolio review for Oct 07.',
    time: 'Yesterday',
    type: 'review',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Complete Profile for 100% Readiness',
    message: 'Add your workshop environment details in My Experience to reach 100% profile completeness.',
    time: '2 days ago',
    type: 'warning',
    read: true
  }
];
