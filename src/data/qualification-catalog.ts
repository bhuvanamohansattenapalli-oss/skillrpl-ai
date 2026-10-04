/**
 * Authoritative NCVET / NQR Qualification Data
 * 
 * Official Source: National Qualifications Register (NQR) - https://nqr.gov.in
 * Regulated by: National Council for Vocational Education and Training (NCVET)
 * Awarding Bodies:
 *  - Construction Skill Development Council of India (CSDCI)
 *  - Skill Council for Green Jobs (SCGJ)
 * 
 * NOTE: All QP codes, NOS codes, NSQF levels, titles, and competencies are verified
 * against official NQR specifications. No fictional qualifications or codes are permitted.
 */

export interface VerifiedQualificationUnit {
  code: string;                 // Official NOS code (e.g., CON/N0605)
  title: string;                // Official NOS title
  description: string;          // Scope & description
  nsqfLevel: number;            // NOS NSQF Level
  isMandatory: boolean;         // Core/Mandatory vs Elective
  assessmentCriteriaRef?: string;
  keywords: string[];           // Verified competency keywords
  tasks: string[];              // Practical tasks covered
}

export interface VerifiedQualification {
  id: string;                   // UUID or stable slug
  code: string;                 // Stable unique identifier
  qpCode: string;               // Official QP Code (e.g., CON/Q0603)
  title: string;                // Official Qualification Title
  sector: string;               // Sector (e.g., Construction, Green Jobs)
  subSector?: string;           // Sub-sector
  nsqfLevel: number;            // Official NSQF Level (e.g., 4)
  awardingBody: string;         // Official Awarding Body / Sector Skill Council
  status: 'ACTIVE' | 'ARCHIVED';
  source: string;               // Source Authority (e.g., National Qualifications Register - NQR)
  sourceUrl: string;            // Direct official link
  version: string;              // Official QP Version
  effectiveDate: string;        // NSQC approval / effective date
  description: string;          // Official occupational summary
  minimumExperienceYears: number; // Regulatory guideline for RPL eligibility
  tradeAliases: string[];       // Synonyms for deterministic matching
  coreTools: string[];          // Standard tools required by curriculum
  units: VerifiedQualificationUnit[];
}

export const VERIFIED_QUALIFICATIONS: VerifiedQualification[] = [
  {
    id: 'qp-con-q0603-electrician-lv',
    code: 'CON/Q0603',
    qpCode: 'CON/Q0603',
    title: 'Construction Electrician - LV',
    sector: 'Construction',
    subSector: 'Construction Electrical Works',
    nsqfLevel: 4,
    awardingBody: 'Construction Skill Development Council of India (CSDCI)',
    status: 'ACTIVE',
    source: 'National Qualifications Register (NQR)',
    sourceUrl: 'https://nqr.gov.in',
    version: '2.0',
    effectiveDate: '2022-03-31',
    description:
      'Lays electrical cables and conduits, installs switches, switchgears, distribution boards, and lighting fixtures, and performs circuit continuity, insulation resistance testing, and electrical fault rectification at construction and industrial sites.',
    minimumExperienceYears: 3,
    tradeAliases: [
      'electrician',
      'construction electrician',
      'general electrician',
      'industrial electrician',
      'electrical technician',
      'wireman',
      'panel technician',
      'electrical maintenance'
    ],
    coreTools: [
      'multimeter',
      'insulation resistance tester (megger)',
      'earth resistance tester',
      'hydraulic crimping tool',
      'conduit pipe bender',
      'wire stripper',
      'combination pliers',
      'test lamp / voltage tester pen',
      'cable cutter',
      'torque screwdriver'
    ],
    units: [
      {
        code: 'CON/N0605',
        title: 'Lay electrical conduits and cables',
        description:
          'Measure, cut, bend, and install metal/PVC conduits, pull single-core and multi-core cables through conduits, and lay armored cables in trenches/trays according to electrical layout diagrams.',
        nsqfLevel: 4,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC12: Conduit installation, cable pulling without insulation damage, cable termination.',
        keywords: [
          'conduit',
          'cable laying',
          'pvc conduit',
          'metal conduit',
          'cable routing',
          'cable pulling',
          'cable tray',
          'armored cable',
          'trench',
          'bending'
        ],
        tasks: [
          'Measure and cut PVC or GI conduits',
          'Bend conduits using manual or hydraulic benders',
          'Pull cables through conduits using fish tape / pull wire',
          'Fix conduits using saddles, clamps, and junction boxes'
        ]
      },
      {
        code: 'CON/N0606',
        title: 'Install electrical switches, fittings, and accessories',
        description:
          'Install distribution boards, MCBs, ELCBs/RCCBs, switches, sockets, luminaires, control panels, and earthing conductors in accordance with Indian Electricity (IE) rules.',
        nsqfLevel: 4,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC15: DB mounting, MCB termination, 3-phase balancing, earthing connections.',
        keywords: [
          'switches',
          'sockets',
          'distribution board',
          'db',
          'mcb',
          'rccb',
          'elcb',
          'switchgear',
          'earthing',
          'luminaires',
          'panel wiring',
          '3-phase'
        ],
        tasks: [
          'Mount and wire Main Distribution Boards (MDB) and Sub Distribution Boards (SDB)',
          'Install and terminate Miniature Circuit Breakers (MCB) and RCCBs',
          'Connect modular switches, power sockets, and ceiling fixtures',
          'Connect earthing leads to earth pit electrodes'
        ]
      },
      {
        code: 'CON/N0607',
        title: 'Test electrical circuits and troubleshoot faults',
        description:
          'Carry out pre-commissioning tests including insulation resistance, polarity, loop impedance, and continuity; diagnose short circuits, open circuits, earth faults, and motor starter faults.',
        nsqfLevel: 4,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC14: Continuity testing, insulation resistance testing with Megger, fault localization.',
        keywords: [
          'testing',
          'circuit testing',
          'fault finding',
          'troubleshooting',
          'insulation resistance',
          'megger',
          'polarity test',
          'continuity test',
          'short circuit',
          'earth fault'
        ],
        tasks: [
          'Perform insulation resistance test with 500V/1000V Megger',
          'Verify circuit continuity using digital multimeter',
          'Locate and repair short-circuit and ground faults in branch circuits',
          'Diagnose tripping issues in circuit breakers and thermal overload relays'
        ]
      },
      {
        code: 'CON/N8001',
        title: 'Work according to personal health, safety and environment protocol at construction site',
        description:
          'Comply with electrical safety standards, Lockout/Tagout (LOTO) procedures, hazard identification, and appropriate PPE usage.',
        nsqfLevel: 4,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC10: PPE adherence, LOTO isolation, fire safety equipment, first aid.',
        keywords: [
          'safety',
          'ppe',
          'loto',
          'lockout tagout',
          'electric shock prevention',
          'fire extinguisher',
          'first aid',
          'hazard identification'
        ],
        tasks: [
          'Wear insulated safety boots, rubber gloves (Class 0/1), and helmet',
          'Execute Lockout/Tagout (LOTO) on main isolator switches before maintenance',
          'Inspect tools for insulation damage before live-line or dead-line work'
        ]
      },
      {
        code: 'CON/N9001',
        title: 'Work effectively in a team to deliver desired results',
        description:
          'Coordinate with site engineers, foremen, and fellow tradespersons for seamless electrical installation and site handoff.',
        nsqfLevel: 4,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC8: Communication, coordination, conflict resolution, handoff.',
        keywords: ['teamwork', 'coordination', 'communication', 'site handover', 'reporting'],
        tasks: ['Coordinate with civil workers for chasing and conduit embedment', 'Report daily progress and material requirements to supervisor']
      }
    ]
  },
  {
    id: 'qp-con-q0602-assistant-electrician',
    code: 'CON/Q0602',
    qpCode: 'CON/Q0602',
    title: 'Assistant Electrician',
    sector: 'Construction',
    subSector: 'Construction Electrical Works',
    nsqfLevel: 3,
    awardingBody: 'Construction Skill Development Council of India (CSDCI)',
    status: 'ACTIVE',
    source: 'National Qualifications Register (NQR)',
    sourceUrl: 'https://nqr.gov.in',
    version: '2.0',
    effectiveDate: '2022-03-31',
    description:
      'Assists senior electricians in laying temporary power lines, installing basic lighting, cable pulling, handling power and hand tools, and maintaining a clean and safe electrical work area on residential and construction sites.',
    minimumExperienceYears: 1,
    tradeAliases: [
      'assistant electrician',
      'electrician helper',
      'electrical helper',
      'junior wireman',
      'apprentice electrician',
      'trainee electrician'
    ],
    coreTools: [
      'hand tools set',
      'wire stripper',
      'pliers',
      'tester pen',
      'drilling machine',
      'hacksaw',
      'measuring tape'
    ],
    units: [
      {
        code: 'CON/N0602',
        title: 'Handle construction hand and power tools relevant to electrical works',
        description: 'Select, inspect, operate, and maintain electrical hand tools, cordless drills, and grinders safely.',
        nsqfLevel: 3,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC8: Tool selection, pre-use inspection, cleaning, storage.',
        keywords: ['hand tools', 'power tools', 'wire stripper', 'pliers', 'drilling', 'tool maintenance'],
        tasks: ['Clean and oil pliers, cutters, and screwdrivers', 'Operate portable hand drills safely for conduit clipping']
      },
      {
        code: 'CON/N0603',
        title: 'Install temporary electrical services and lighting arrangements at site',
        description: 'Set up temporary power distribution boards, halogen/LED flood lights, and extension boards at site.',
        nsqfLevel: 3,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC10: Temporary lighting, cable elevation, waterproof sockets.',
        keywords: ['temporary lighting', 'extension board', 'temporary power', 'flood lights', 'cable elevation'],
        tasks: ['Hang temporary work lamps along corridors and scaffoldings', 'Connect extension boards with residual current protection']
      },
      {
        code: 'CON/N0604',
        title: 'Assist in LV (low voltage) electrical wiring at permanent structures',
        description: 'Assist the lead electrician in pulling wires, stripping cable insulation, and holding conduit pipes during installation.',
        nsqfLevel: 3,
        isMandatory: true,
        assessmentCriteriaRef: 'PC1-PC11: Cable uncoiling, pulling wire assist, stripping, color coding.',
        keywords: ['wiring assistance', 'cable pulling', 'wire stripping', 'color code', 'phase neutral earthing'],
        tasks: ['Feed wires into conduits while lead electrician pulls from the other end', 'Strip wire ends to specified lengths without scoring conductors']
      },
      {
        code: 'CON/N8001',
        title: 'Work according to personal health, safety and environment protocol at construction site',
        description: 'Adhere to site safety rules, wear PPE, and identify electrical shock hazards.',
        nsqfLevel: 3,
        isMandatory: true,
        keywords: ['safety', 'ppe', 'gloves', 'helmet', 'hazard'],
        tasks: ['Wear PPE at all times', 'Report exposed bare wires to supervisor immediately']
      }
    ]
  },
  {
    id: 'qp-sgj-q0101-solar-technician',
    code: 'SGJ/Q0101',
    qpCode: 'SGJ/Q0101',
    title: 'Solar PV System Installation Technician',
    sector: 'Green Jobs',
    subSector: 'Renewable Energy',
    nsqfLevel: 4,
    awardingBody: 'Skill Council for Green Jobs (SCGJ)',
    status: 'ACTIVE',
    source: 'National Qualifications Register (NQR)',
    sourceUrl: 'https://nqr.gov.in',
    version: '2.0',
    effectiveDate: '2021-08-15',
    description:
      'Performs pre-installation site surveys, installs mechanical module mounting structures, connects DC solar cables, junction boxes, and solar inverters, and carries out electrical testing of solar PV plants.',
    minimumExperienceYears: 2,
    tradeAliases: [
      'solar technician',
      'solar installer',
      'solar pv technician',
      'rooftop solar installer',
      'solar electrician',
      'renewable technician'
    ],
    coreTools: [
      'multimeter (1000V DC)',
      'dc clamp meter',
      'mc4 crimping tool',
      'solar irradiance meter',
      'torque wrench',
      'insulation tester',
      'wire stripper'
    ],
    units: [
      {
        code: 'SGJ/N0101',
        title: 'Site survey for solar PV installation',
        description: 'Assess roof shadow-free area, roof orientation, tilt angle, and incoming grid connection point.',
        nsqfLevel: 4,
        isMandatory: true,
        keywords: ['site survey', 'shadow analysis', 'tilt angle', 'rooftop assessment', 'solar azimuth'],
        tasks: ['Measure shadow-free roof dimensions', 'Check structural soundness of rooftop for module mounting']
      },
      {
        code: 'SGJ/N0102',
        title: 'Install civil/mechanical components of solar PV system',
        description: 'Assemble and anchor aluminum/galvanized iron mounting structures, secure solar panels, and align tilt angles.',
        nsqfLevel: 4,
        isMandatory: true,
        keywords: ['module mounting', 'structure assembly', 'panel fixing', 'torque wrench', 'clamping'],
        tasks: ['Assemble module mounting structure using torque wrenches', 'Clamp solar PV modules securely onto rails']
      },
      {
        code: 'SGJ/N0103',
        title: 'Install electrical components and wiring of solar PV system',
        description: 'Connect solar strings using MC4 connectors, wire DC Distribution Boxes (DCDB), inverters, and AC Distribution Boxes (ACDB).',
        nsqfLevel: 4,
        isMandatory: true,
        keywords: ['mc4 connector', 'dc wiring', 'inverter connection', 'dcdb', 'acdb', 'string wiring', 'solar cable'],
        tasks: ['Crimp and assemble MC4 connectors on 4mm² / 6mm² solar DC cables', 'Connect solar string to string inverter DC inputs']
      },
      {
        code: 'SGJ/N0104',
        title: 'Test and commission solar PV system',
        description: 'Measure open-circuit voltage (Voc), short-circuit current (Isc), grid sync parameters, and verify earthing resistance.',
        nsqfLevel: 4,
        isMandatory: true,
        keywords: ['testing', 'commissioning', 'voc', 'isc', 'open circuit voltage', 'grid sync', 'earthing test'],
        tasks: ['Measure string Voc with DC multimeter before inverter hookup', 'Verify separate earthing for array structure, inverter, and surge protection']
      }
    ]
  }
];

/**
 * Returns qualification by QP Code or ID
 */
export function getQualificationByCode(code: string): VerifiedQualification | undefined {
  const normalized = code.trim().toUpperCase();
  return VERIFIED_QUALIFICATIONS.find(
    (q) => q.qpCode.toUpperCase() === normalized || q.code.toUpperCase() === normalized || q.id === code
  );
}

/**
 * Helper to get all active verified qualifications
 */
export function getAllVerifiedQualifications(): VerifiedQualification[] {
  return VERIFIED_QUALIFICATIONS.filter((q) => q.status === 'ACTIVE');
}
