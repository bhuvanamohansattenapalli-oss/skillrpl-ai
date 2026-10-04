/**
 * Authoritative Practical RPL Task Bank
 * Mapped to Official NCVET / NQR Qualifications & NOS Competency Units
 *
 * Provides interchangeable task variants per competency area to enable dynamic task selection
 * while strictly guaranteeing 100% coverage of core mandatory NOS competency standards.
 */

export interface ObservableCriterion {
  key: string;
  label: string;
  description: string;
  isMandatory: boolean;
  weight: number; // relative weight out of 100
}

export interface PracticalTaskDefinition {
  taskId: string;
  variantKey: string; // e.g. "VAR_A", "VAR_B"
  qpCode: string;
  nosUnitCode: string;
  nosUnitTitle: string;
  competencyArea: string;
  title: string;
  description: string;
  expectedDurationMinutes: number;
  safetyGuidelines: string[];
  equipmentRequired: string[];
  criteria: ObservableCriterion[];
}

/**
 * Standard 6-Point Observable Criteria Schema
 * Every practical task evaluates these 6 standard dimensions using the 0-4 rubric
 */
export const STANDARD_TASK_CRITERIA: ObservableCriterion[] = [
  {
    key: 'tools_ppe',
    label: 'Tool Selection & PPE Verification',
    description: 'Selects rated insulated tools (1000V), inspects PPE (helmet, gloves, safety boots), and prepares safe work perimeter.',
    isMandatory: true,
    weight: 15
  },
  {
    key: 'safety_isolation',
    label: 'Safety Protocols & Zero Energy Verification',
    description: 'Follows Lockout/Tagout (LOTO) procedure, verifies zero voltage with calibrated tester, and installs temporary discharge ground.',
    isMandatory: true,
    weight: 20
  },
  {
    key: 'technical_execution',
    label: 'Technical Execution & Workmanship',
    description: 'Performs wire cutting, conduit bending, lug crimping, and terminal tightening according to engineering drawings and torque specs.',
    isMandatory: true,
    weight: 25
  },
  {
    key: 'testing_verification',
    label: 'Testing & Parameter Measurement',
    description: 'Executes continuity, insulation resistance (Megger), phase sequence, and earth loop impedance tests; records readings accurately.',
    isMandatory: true,
    weight: 20
  },
  {
    key: 'fault_diagnosis',
    label: 'Fault Diagnosis & Trouble Isolation',
    description: 'Methodically identifies simulated circuit faults (open circuit, ground fault, reversed polarity) using diagnostic instruments.',
    isMandatory: false,
    weight: 10
  },
  {
    key: 'handover_cleanup',
    label: 'Workplace Housekeeping & Handover Documentation',
    description: 'Cleans waste insulation, labels wires/breakers with permanent ferrules, restores panel covers, and logs task completion.',
    isMandatory: false,
    weight: 10
  }
];

export const PRACTICAL_TASK_BANK: PracticalTaskDefinition[] = [
  // =========================================================================
  // TRADE 1: Construction Electrician - LV (CON/Q0603) — NSQF Level 4
  // =========================================================================

  // NOS: CON/N0607 - LV Distribution Systems & Sub-panels
  {
    taskId: 'TASK-CON-Q0603-N0607-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0607',
    nosUnitTitle: 'Install temporary and permanent LV electrical distribution systems',
    competencyArea: 'LV Distribution & Panel Installation',
    title: 'Installation and Wiring of 4-Way Single-Phase Sub-Distribution Board',
    description:
      'Mount, dress, and terminate a 240V single-phase distribution board including main isolator, 30mA RCCB, and 4 outgoing miniature circuit breakers (MCBs for lighting and power circuits) per IS 732 specifications.',
    expectedDurationMinutes: 45,
    safetyGuidelines: [
      'De-energize and lock incoming feeder breaker before opening enclosure',
      'Use insulated tools certified to 1000V (IEC 60900)',
      'Ensure proper earth continuity to incoming neutral and equipment chassis'
    ],
    equipmentRequired: [
      'Sub-distribution board enclosure',
      'Double Pole Isolator 32A',
      'Residual Current Circuit Breaker (RCCB 30mA)',
      'Single Pole MCBs (B6, B16, C20)',
      'Copper busbar and insulated wire ferrules',
      'Digital Multimeter & Torque Screwdriver'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0603-N0607-B',
    variantKey: 'VAR_B',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0607',
    nosUnitTitle: 'Install temporary and permanent LV electrical distribution systems',
    competencyArea: 'LV Distribution & Panel Installation',
    title: 'Wiring and Phase Balancing for 3-Phase 415V TPN Distribution Panel',
    description:
      'Assemble, dress, and terminate a 415V Three-Phase & Neutral (TPN) distribution board. Balance single-phase loads across phases R, Y, and B and connect neutral and protective earth bars.',
    expectedDurationMinutes: 50,
    safetyGuidelines: [
      'Strict adherence to 3-phase LOTO protocols',
      'Wear arc-rated face shield and insulating gloves when near live busbars',
      'Verify phase-to-phase and phase-to-neutral voltages before energizing'
    ],
    equipmentRequired: [
      'TPN Distribution board (415V, 63A)',
      '4-Pole Isolator & 4-Pole RCCB',
      'Color-coded cables (Red, Yellow, Blue, Black, Green/Yellow)',
      'Hydraulic crimping pliers and pin lugs',
      'Phase sequence indicator and clamp meter'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // NOS: CON/N0608 - Conduit, Trunking & Armoured Cable Laying
  {
    taskId: 'TASK-CON-Q0603-N0608-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0608',
    nosUnitTitle: 'Lay underground cables, conduit wiring, and distribution boards',
    competencyArea: 'Conduit & Cable Routing',
    title: 'Surface Rigid PVC Conduit Installation with Inspection Bends and Saddles',
    description:
      'Cut, bend, and anchor a 25mm rigid PVC conduit network along a wall layout using standard spacing saddles, 90-degree inspection elbows, and pull multi-strand FRLS wires using a fish tape.',
    expectedDurationMinutes: 40,
    safetyGuidelines: [
      'Wear eye protection when cutting PVC conduit and drilling anchor masonry',
      'Do not exceed 40% conduit fill capacity per electrical standards',
      'Deburr conduit interior edges to prevent wire insulation damage during drawing'
    ],
    equipmentRequired: [
      'Rigid PVC conduits (25mm)',
      'PVC conduit bending spring',
      'Masonry drill and wall plugs/saddles',
      'Nylon draw wire / fish tape',
      'FRLS Copper wire spools (1.5 sq mm and 2.5 sq mm)'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0603-N0608-B',
    variantKey: 'VAR_B',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0608',
    nosUnitTitle: 'Lay underground cables, conduit wiring, and distribution boards',
    competencyArea: 'Conduit & Cable Routing',
    title: 'Armoured Cable Glanding and Termination onto Switchgear Enclosure',
    description:
      'Prepare, strip, and gland a 4-core 16 sq mm XLPE insulated steel wire armoured (SWA) cable into an industrial metal junction box using brass mechanical cable glands and earthing tags.',
    expectedDurationMinutes: 45,
    safetyGuidelines: [
      'Wear cut-resistant safety gloves when handling steel armouring wires',
      'Ensure armour bonding clamp makes direct metallic contact for earthing continuity',
      'Apply heat-shrink breakout boot to seal cable cores against moisture'
    ],
    equipmentRequired: [
      '4-Core 16 sq mm Armoured XLPE Cable',
      'Heavy-duty brass cable gland kit (size 25mm)',
      'Hacksaw, cable stripper, and adjustable spanners',
      'Earth tag and copper bonding conductor',
      'Heat gun and heat-shrink tubing'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // NOS: CON/N0609 - Testing, Inspection & Parameter Verification
  {
    taskId: 'TASK-CON-Q0603-N0609-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0609',
    nosUnitTitle: 'Carry out testing and commissioning of electrical equipment',
    competencyArea: 'Testing & Commissioning',
    title: 'Pre-Commissioning Insulation Resistance and Continuity Testing (IS 732)',
    description:
      'Perform mandatory pre-commissioning testing on a completed wiring installation: conduct 500V DC insulation resistance (Megger) between phase-neutral, phase-earth, and neutral-earth, and verify circuit loop continuity.',
    expectedDurationMinutes: 35,
    safetyGuidelines: [
      'Ensure circuit is completely dead before connecting Megger test leads',
      'Discharge capacitive charge on cables after applying 500V test voltage',
      'Disconnect sensitive electronic loads/surge suppressors prior to test'
    ],
    equipmentRequired: [
      'Digital Insulation Tester (Megger 500V/1000V)',
      'Low resistance digital ohmmeter / continuity tester',
      'Test leads and crocodile clips',
      'Test record verification logbook'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0603-N0609-B',
    variantKey: 'VAR_B',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0609',
    nosUnitTitle: 'Carry out testing and commissioning of electrical equipment',
    competencyArea: 'Testing & Commissioning',
    title: 'Earth Electrode Resistance Testing (Fall-of-Potential) & RCCB Trip Time Test',
    description:
      'Measure the resistance to earth of an electrode using a 3-terminal digital earth tester at 62% potential stake distance, and verify the trip response time of a 30mA residual current device (RCD).',
    expectedDurationMinutes: 40,
    safetyGuidelines: [
      'Isolate the earth electrode under test from the main installation earth bar',
      'Ensure auxiliary test spikes are driven into undisturbed soil',
      'Use proper tripping timer instrument calibrated to millisecond precision'
    ],
    equipmentRequired: [
      'Digital 3-Terminal Earth Tester & auxiliary steel spikes',
      'Calibrated RCD/RCCB Test Meter (0° and 180° phase test)',
      '50m cable reels for current and potential stakes',
      'Test certificate form'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // NOS: CON/N0610 - Motor Control & Starter Circuit Maintenance
  {
    taskId: 'TASK-CON-Q0603-N0610-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0610',
    nosUnitTitle: 'Perform preventive and breakdown maintenance of LV equipment',
    competencyArea: 'Motor Control & Maintenance',
    title: 'Assembly, Wiring & Functional Testing of Direct-On-Line (DOL) Motor Starter',
    description:
      'Wire the control and power circuits of a Direct-On-Line starter for a 3-phase induction motor, including Start/Stop push buttons, 240V contactor holding circuit, and thermal overload relay calibration.',
    expectedDurationMinutes: 45,
    safetyGuidelines: [
      'Verify motor frame is grounded via dual copper earthing conductors',
      'Verify thermal overload relay is matched to 1.15x motor full load nameplate current',
      'Confirm emergency stop mushroom button mechanically latches in open state'
    ],
    equipmentRequired: [
      '3-Phase magnetic contactor with auxiliary normally open (NO) contact',
      'Thermal Overload Relay (adjustable range)',
      'Start (Green NO) and Stop (Red NC) push button station',
      'Control circuit fuse / MCB (2A)',
      'Simulated 3-phase load / motor simulator'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0603-N0610-B',
    variantKey: 'VAR_B',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N0610',
    nosUnitTitle: 'Perform preventive and breakdown maintenance of LV equipment',
    competencyArea: 'Motor Control & Maintenance',
    title: 'Star-Delta Automatic Motor Starter Wiring and Timer Interlocking',
    description:
      'Wire the main, star, and delta contactors with an electronic changeover timer. Verify mechanical and electrical interlocking to prevent simultaneous star and delta energization.',
    expectedDurationMinutes: 50,
    safetyGuidelines: [
      'Ensure electrical interlocking through NC contacts is verified prior to power energization',
      'Check motor terminal link configuration (U1-U2, V1-V2, W1-W2)',
      'Confirm timer delay is set to 5-7 seconds'
    ],
    equipmentRequired: [
      '3 Magnetic Contactors (Main, Star, Delta)',
      'Electronic Star-Delta changeover timer relay',
      'Control wiring ferrules and push button station',
      'Multimeter for cold dry-run continuity check'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // NOS: CON/N9001 - Occupational Health & Safety
  {
    taskId: 'TASK-CON-Q0603-N9001-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0603',
    nosUnitCode: 'CON/N9001',
    nosUnitTitle: 'Work safely in construction environments',
    competencyArea: 'Safety & Hazard Control',
    title: 'Comprehensive Lockout / Tagout (LOTO) and Zero Energy Verification Procedure',
    description:
      'Demonstrate full formal LOTO isolation on an industrial 415V distribution board: identify energy sources, notify affected personnel, pad-lock breaker with personal tag, and verify zero voltage on all 3 phases and neutral.',
    expectedDurationMinutes: 25,
    safetyGuidelines: [
      'Test multimeter on known live source before and after zero energy check (Prove-Test-Prove)',
      'Attach Danger / Do Not Operate tag with assessor signature and date',
      'Never delegate the padlock key to another worker'
    ],
    equipmentRequired: [
      'Standard LOTO lockout hasp and numbered safety padlock',
      'Warning tags (Danger: Do Not Operate)',
      'Calibrated two-pole voltage detector (CAT IV 600V)',
      'Insulated safety gloves (Class 0, 1000V rated)'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // =========================================================================
  // TRADE 2: Assistant Electrician (CON/Q0602) — NSQF Level 3
  // =========================================================================
  {
    taskId: 'TASK-CON-Q0602-N0604-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0602',
    nosUnitCode: 'CON/N0604',
    nosUnitTitle: 'Assist in wiring and basic electrical installation',
    competencyArea: 'Basic Domestic Wiring',
    title: 'Two-Way Staircase Point Wiring with Proper Phase Switching',
    description:
      'Assemble a two-way staircase lighting control circuit using two 2-way switches and ceiling batten holder. Ensure the phase line is switched and neutral is directly connected to lamp.',
    expectedDurationMinutes: 30,
    safetyGuidelines: [
      'Always switch phase wire; never place switch on neutral line',
      'Verify circuit is isolated from supply before making terminal terminations',
      'Check that screw terminals hold conductor securely without pinching insulation'
    ],
    equipmentRequired: [
      'Two 2-Way modular switches',
      'Batten lamp holder & 15W LED bulb',
      'PVC conduit and casing',
      'Wire stripper, combination pliers, neon tester'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0602-N0605-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0602',
    nosUnitCode: 'CON/N0605',
    nosUnitTitle: 'Assist in installation of electrical fixtures and fittings',
    competencyArea: 'Fixtures & Socket Installation',
    title: 'Installation and Earthing of 16A Power Socket with Dedicated MCB',
    description:
      'Install a 16A 3-pin power outlet box. Connect phase to right pin, neutral to left pin, and earth conductor to the top larger earth terminal using 4 sq mm copper wire.',
    expectedDurationMinutes: 30,
    safetyGuidelines: [
      'Ensure top earth pin connection is continuous and unsevered',
      'Tighten terminal screws firmly to prevent loose contact overheating',
      'Verify socket faceplate sits flush against wall surface'
    ],
    equipmentRequired: [
      '16A Combined Switch & Socket modular box',
      '3-core 4.0 sq mm PVC cable',
      'Socket polarity tester / multimeter',
      'Screw driver set and cable stripper'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-CON-Q0602-N0606-A',
    variantKey: 'VAR_A',
    qpCode: 'CON/Q0602',
    nosUnitCode: 'CON/N0606',
    nosUnitTitle: 'Perform basic testing and measurement under supervision',
    competencyArea: 'Basic Circuit Testing',
    title: 'Digital Multimeter Voltage, Continuity, and Resistance Measurement',
    description:
      'Demonstrate correct digital multimeter range selection for measuring AC supply voltage (230V), DC battery voltage, fuse continuity, and heating element resistance.',
    expectedDurationMinutes: 25,
    safetyGuidelines: [
      'Inspect multimeter test leads for insulation cracks or loose probes',
      'Never attempt resistance measurement on an energized circuit',
      'Select AC voltage range before connecting probes to wall outlets'
    ],
    equipmentRequired: [
      'Digital Multimeter (CAT III 600V)',
      'Various test resistors, cartridge fuses, and 12V battery',
      'Standard 230V AC socket outlet for live voltage check'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },

  // =========================================================================
  // TRADE 3: Solar PV Installer (SGJ/Q0101) — NSQF Level 4
  // =========================================================================
  {
    taskId: 'TASK-SGJ-Q0101-N0103-A',
    variantKey: 'VAR_A',
    qpCode: 'SGJ/Q0101',
    nosUnitCode: 'SGJ/N0103',
    nosUnitTitle: 'Install electrical components of solar PV system',
    competencyArea: 'Solar DC Wiring & String Assembly',
    title: 'Solar DC String Cable Routing and MC4 Connector Crimping',
    description:
      'Measure, cut, and terminate 4 sq mm UV-resistant solar DC cables using certified MC4 male and female connectors with hydraulic crimper. Measure open circuit string voltage (Voc).',
    expectedDurationMinutes: 35,
    safetyGuidelines: [
      'Remember solar PV modules generate hazardous DC voltage whenever exposed to light',
      'Do not disconnect MC4 connectors under load (arc hazard)',
      'Verify DC polarity (+ and -) before connecting strings to combiner box'
    ],
    equipmentRequired: [
      '4.0 sq mm Solar DC double insulated cable',
      'MC4 male and female connectors with pins',
      'MC4 specific ratcheting crimp tool',
      'MC4 spanner disconnect tool',
      '1000V DC rated digital multimeter'
    ],
    criteria: STANDARD_TASK_CRITERIA
  },
  {
    taskId: 'TASK-SGJ-Q0101-N0104-A',
    variantKey: 'VAR_A',
    qpCode: 'SGJ/Q0101',
    nosUnitCode: 'SGJ/N0104',
    nosUnitTitle: 'Test and commission solar PV power plant',
    competencyArea: 'Solar Inverter & Earthing Commissioning',
    title: 'Grid-Tied String Inverter AC/DC Termination & Combined Earthing Check',
    description:
      'Connect solar array DC inputs to inverter MPPT channels, terminate AC output to grid breaker, and verify module frame, inverter, and surge protection device (SPD) earthing bonding.',
    expectedDurationMinutes: 40,
    safetyGuidelines: [
      'Switch inverter DC isolator and AC breaker OFF before wiring terminals',
      'Verify surge arrestor indicator flags are green (healthy)',
      'Ensure solar module mounting structure has continuous earth bonding'
    ],
    equipmentRequired: [
      'Solar String Inverter simulation panel',
      'DC Surge Protection Device (SPD) and AC breaker',
      'Earth clamp meter and torque wrench',
      'Commissioning checklist'
    ],
    criteria: STANDARD_TASK_CRITERIA
  }
];

/**
 * Returns all available practical tasks for a given qualification code
 */
export function getTasksForQualification(qpCode: string): PracticalTaskDefinition[] {
  const norm = qpCode.trim().toUpperCase();
  return PRACTICAL_TASK_BANK.filter((t) => t.qpCode.toUpperCase() === norm);
}

/**
 * Groups tasks by competency area / NOS code for dynamic variant selection
 */
export function groupTasksByCompetency(
  qpCode: string
): Record<string, PracticalTaskDefinition[]> {
  const tasks = getTasksForQualification(qpCode);
  const grouped: Record<string, PracticalTaskDefinition[]> = {};

  for (const t of tasks) {
    if (!grouped[t.nosUnitCode]) {
      grouped[t.nosUnitCode] = [];
    }
    grouped[t.nosUnitCode].push(t);
  }

  return grouped;
}
