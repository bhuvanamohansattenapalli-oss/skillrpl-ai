/**
 * Verified Question Bank for 10-MCQ Topic-Based RPL Assessments (SIH26242 Phase 4)
 * Provides authoritative, trade-aligned questions across standard vocational competencies.
 * Used for offline assessments, immediate fallback when AI is unavailable/rate-limited,
 * and high-reliability deterministic question generation.
 */

export interface VerifiedMCQQuestion {
  id?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, or 3
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
}

export interface TradeQuestionSet {
  trade: string;
  aliases: string[];
  categories: string[];
  questions: VerifiedMCQQuestion[];
}

export const VERIFIED_MCQ_BANK: Record<string, TradeQuestionSet> = {
  electrician: {
    trade: 'Electrician',
    aliases: ['electrician', 'electrical', 'wireman', 'lineman', 'general electrician', 'conduit wiring'],
    categories: ['Electrical Safety', 'Tools & Measurement', 'Wiring & Circuits', 'Testing & Maintenance', 'Fault Finding'],
    questions: [
      {
        question: 'Which device is commonly used to measure electrical current flowing through an active conductor without disconnecting it?',
        options: ['Voltmeter', 'Clamp-on Ammeter', 'Megohmmeter', 'Wattmeter'],
        correctAnswer: 1,
        category: 'Tools & Measurement',
        difficulty: 'EASY',
        explanation: 'A clamp-on ammeter (tong tester) measures alternating current in a live conductor via magnetic induction without breaking the circuit.'
      },
      {
        question: 'What is the primary purpose of an earth wire (grounding) in a domestic electrical wiring installation?',
        options: ['To increase the voltage supplied to appliances', 'To provide a low-resistance path to ground for fault currents', 'To reduce electricity consumption', 'To act as a secondary neutral conductor'],
        correctAnswer: 1,
        category: 'Electrical Safety',
        difficulty: 'EASY',
        explanation: 'Grounding provides a low-resistance path for fault currents directly to the earth, triggering circuit breakers and preventing electric shock.'
      },
      {
        question: 'Which instrument is specifically used to measure the insulation resistance of electrical cables and equipment?',
        options: ['Megohmmeter (Megger)', 'Digital Multimeter on Ohms range', 'Galvanometer', 'Tachometer'],
        correctAnswer: 0,
        category: 'Tools & Measurement',
        difficulty: 'MEDIUM',
        explanation: 'A Megohmmeter (Megger) generates high DC test voltage (typically 500V or 1000V) to verify insulation integrity of cables and windings.'
      },
      {
        question: 'According to Indian and International electrical standards, what color code is standard for the protective earth conductor in a flexible 3-core cable?',
        options: ['Red', 'Black', 'Green or Green with Yellow stripes', 'Blue'],
        correctAnswer: 2,
        category: 'Wiring & Circuits',
        difficulty: 'EASY',
        explanation: 'Under IS/IEC color coding, protective earth is designated by Green or Green with Yellow striped insulation.'
      },
      {
        question: 'What does a Miniature Circuit Breaker (MCB) provide protection against in an electrical distribution board?',
        options: ['Overcurrent and short circuit', 'Voltage surges only', 'Earth leakage current only', 'Reverse polarity in DC systems'],
        correctAnswer: 0,
        category: 'Electrical Safety',
        difficulty: 'MEDIUM',
        explanation: 'MCBs feature thermal-magnetic tripping mechanisms that trip under sustained overcurrent (overload) and sudden high-magnitude short circuits.'
      },
      {
        question: 'When a Residual Current Circuit Breaker (RCCB) trips repeatedly upon switching on a specific appliance, what is the most likely fault?',
        options: ['Low supply voltage from the mains', 'Earth leakage / insulation breakdown in the appliance', 'Loose neutral connection at the energy meter', 'The appliance has too high power rating'],
        correctAnswer: 1,
        category: 'Fault Finding',
        difficulty: 'MEDIUM',
        explanation: 'An RCCB detects imbalance between phase and neutral current; an appliance with deteriorated insulation causes leakage to ground, tripping the RCCB.'
      },
      {
        question: 'In a 3-phase, 415V AC system, what is the nominal line-to-neutral voltage?',
        options: ['110V', '230V / 240V', '415V', '440V'],
        correctAnswer: 1,
        category: 'Wiring & Circuits',
        difficulty: 'EASY',
        explanation: 'Phase-to-neutral voltage in a 415V three-phase star system is 415 / √3 ≈ 240V AC.'
      },
      {
        question: 'What type of fire extinguisher must NEVER be used on an energized live electrical fire?',
        options: ['Carbon Dioxide (CO2)', 'Dry Chemical Powder (DCP)', 'Pressurized Water', 'Clean agent (Halon replacement)'],
        correctAnswer: 2,
        category: 'Electrical Safety',
        difficulty: 'EASY',
        explanation: 'Water conducts electricity and exposes the operator to severe or fatal electrical shock. CO2 or dry powder must be used for electrical fires (Class C/E).'
      },
      {
        question: 'What is the function of a relay in an industrial motor control circuit?',
        options: ['To change AC into DC power', 'To allow a low-power control signal to switch a higher-power load', 'To measure the frequency of the power supply', 'To step down three-phase voltage directly'],
        correctAnswer: 1,
        category: 'Wiring & Circuits',
        difficulty: 'MEDIUM',
        explanation: 'A relay is an electrically operated switch that allows a low-power control circuit (e.g. 24V DC) to safely control high-power motor contactors.'
      },
      {
        question: 'Before carrying out maintenance on a disconnected electrical panel, what critical safety step must be performed?',
        options: ['Wipe the exterior panel with water', 'Lockout/Tagout (LOTO) and verify zero voltage with an approved tester', 'Bypass the main breaker to test continuity', 'Remove all earthing conductors'],
        correctAnswer: 1,
        category: 'Electrical Safety',
        difficulty: 'MEDIUM',
        explanation: 'Lockout/Tagout (LOTO) accompanied by a "prove-test-prove" zero voltage verification ensures the system is completely de-energized and safe to touch.'
      },
      {
        question: 'What happens to the total resistance when two identical 100-ohm resistors are connected in parallel?',
        options: ['It becomes 200 ohms', 'It becomes 50 ohms', 'It remains 100 ohms', 'It becomes 25 ohms'],
        correctAnswer: 1,
        category: 'Wiring & Circuits',
        difficulty: 'MEDIUM',
        explanation: 'For two identical resistors in parallel, R_total = R / 2 = 100 / 2 = 50 ohms.'
      },
      {
        question: 'Which tool is used to remove the outer insulation jacket and sheath from electrical cables without nicking the copper strands?',
        options: ['Hacksaw blade', 'Precision wire stripper', 'Side cutting pliers with blunt jaws', 'Pipe wrench'],
        correctAnswer: 1,
        category: 'Tools & Measurement',
        difficulty: 'EASY',
        explanation: 'Precision wire strippers with calibrated gauge notches strip insulation cleanly without scoring or weakening the conductive copper strands.'
      },
      {
        question: 'If an incandescent lamp flickers continuously when other loads operate, what is the most common underlying cause?',
        options: ['High earth resistance in the garden pit', 'A loose neutral connection or high-resistance junction point', 'The supply frequency has increased to 60Hz', 'Excessive capacitance in the circuit'],
        correctAnswer: 1,
        category: 'Fault Finding',
        difficulty: 'HARD',
        explanation: 'A loose neutral or loose terminal joint creates variable contact resistance under varying load currents, causing voltage drops and lamp flicker.'
      },
      {
        question: 'What is the recommended maximum earth electrode resistance for a domestic electrical installation according to national wiring codes?',
        options: ['Less than 5 to 8 ohms (ideally under 1-2 ohms)', 'Between 100 and 200 ohms', '500 ohms', 'Zero resistance is never measurable, so any value above 50 ohms is acceptable'],
        correctAnswer: 0,
        category: 'Testing & Maintenance',
        difficulty: 'HARD',
        explanation: 'Standard electrical codes require domestic earth electrode resistance to be under 5 to 8 ohms (industrial standards often mandate under 1 to 2 ohms).'
      },
      {
        question: 'What is the purpose of applying electrical joint compound or antioxidant paste when terminating aluminum conductors?',
        options: ['To increase the current rating by 50%', 'To prevent oxidation and galvanic corrosion at the termination point', 'To provide mechanical bonding without tightening screws', 'To insulate the bare aluminum lug'],
        correctAnswer: 1,
        category: 'Testing & Maintenance',
        difficulty: 'HARD',
        explanation: 'Aluminum rapidly forms a non-conductive oxide film in air; antioxidant paste prevents oxide buildup and galvanic corrosion at contact joints.'
      },
      {
        question: 'When installing electrical conduits in reinforced concrete structures, which conduit material is standard for chemical and corrosion resistance?',
        options: ['Thin-wall ungalvanized mild steel', 'Heavy-duty Rigid PVC or Galvanized Rigid Conduit (GI)', 'Flexible brass tubing', 'Bare aluminum tubing'],
        correctAnswer: 1,
        category: 'Wiring & Circuits',
        difficulty: 'MEDIUM',
        explanation: 'Heavy-duty rigid PVC or hot-dip galvanized steel conduit protects wiring from mechanical stress, moisture, and alkaline concrete slurry.'
      }
    ]
  },

  solar_pv: {
    trade: 'Solar PV Technician',
    aliases: ['solar', 'solar pv', 'solar technician', 'solar installer', 'rooftop solar', 'photovoltaic'],
    categories: ['PV System Safety', 'Tools & Inverters', 'Array Installation & Wiring', 'Testing & Commissioning', 'Maintenance & Fault Finding'],
    questions: [
      {
        question: 'What electrical output do photovoltaic (PV) solar panels generate under sunlight?',
        options: ['Alternating Current (AC)', 'Direct Current (DC)', 'High-frequency AC', 'Pulsed triangular AC'],
        correctAnswer: 1,
        category: 'Array Installation & Wiring',
        difficulty: 'EASY',
        explanation: 'Solar photovoltaic cells convert photons into Direct Current (DC) electricity via the photovoltaic effect.'
      },
      {
        question: 'Which component in a grid-connected solar system is responsible for converting solar DC power into synchronized AC power for building loads?',
        options: ['Charge Controller', 'Grid-Tie Solar Inverter', 'Isolation Transformer', 'DC Combiner Box'],
        correctAnswer: 1,
        category: 'Tools & Inverters',
        difficulty: 'EASY',
        explanation: 'A grid-tie solar inverter converts DC generated by the solar array into synchronized sinusoidal AC matching utility grid voltage and frequency.'
      },
      {
        question: 'Why must MC4 connectors never be unplugged while a solar string is under high load?',
        options: ['It damages the solar mounting clamps', 'A dangerous sustained DC electrical arc can form causing severe burns or fire', 'The inverter will lose its Wi-Fi configuration', 'It causes the battery to instantly discharge'],
        correctAnswer: 1,
        category: 'PV System Safety',
        difficulty: 'MEDIUM',
        explanation: 'DC current does not have natural zero crossings like AC, so breaking a live high-voltage DC string produces an intense sustained arc that can cause serious burns and fire.'
      },
      {
        question: 'What is the open-circuit voltage (Voc) of a solar panel module?',
        options: ['The voltage when maximum current is drawn', 'The maximum voltage measured across terminals when no electrical load is connected', 'The voltage during a dead short circuit', 'The operating voltage when connected to a 12V battery'],
        correctAnswer: 1,
        category: 'Testing & Commissioning',
        difficulty: 'MEDIUM',
        explanation: 'Voc (Open Circuit Voltage) is the maximum potential difference produced by a module under illumination when the external circuit is open.'
      },
      {
        question: 'Which specialized meter is used to measure solar irradiance (sunlight power per unit area in W/m²)?',
        options: ['Pyranometer / Solar Irradiance Meter', 'Lux Meter', 'Anemometer', 'Multimeter on Amp range'],
        correctAnswer: 0,
        category: 'Tools & Inverters',
        difficulty: 'MEDIUM',
        explanation: 'A pyranometer or calibrated solar irradiance meter measures solar flux density in Watts per square meter (W/m²) for performance ratio calculations.'
      },
      {
        question: 'What is the effect of partial shading on a series string of solar PV modules without bypass diodes?',
        options: ['The unshaded panels double their output', 'The shaded cell becomes a high-resistance load, creating a severe hotspot and reducing string output', 'Voltage increases while current remains unchanged', 'The system automatically switches to AC generation'],
        correctAnswer: 1,
        category: 'Maintenance & Fault Finding',
        difficulty: 'HARD',
        explanation: 'In a series string, current is limited by the weakest cell. Shaded cells become reverse-biased, dissipating power as heat (hotspots) and throttling the entire string.'
      },
      {
        question: 'In the Northern Hemisphere, which direction should fixed rooftop solar panels ideally face for maximum annual solar yield?',
        options: ['Due North', 'Due South', 'Due East', 'Due West'],
        correctAnswer: 1,
        category: 'Array Installation & Wiring',
        difficulty: 'EASY',
        explanation: 'In the northern hemisphere, true South orientation receives optimal sun exposure throughout the sun path across the seasons.'
      },
      {
        question: 'What safety mechanism prevents a grid-tied solar inverter from continuing to export power into the utility grid during a power outage?',
        options: ['Over-frequency boost', 'Anti-islanding protection', 'Maximum Power Point Tracking (MPPT)', 'Ground fault detection bypass'],
        correctAnswer: 1,
        category: 'PV System Safety',
        difficulty: 'HARD',
        explanation: 'Anti-islanding protection instantly shuts down inverter export within milliseconds of grid loss to protect utility linemen working on downstream power lines.'
      },
      {
        question: 'What type of cable is specifically mandated for outdoor DC wiring between solar modules and combiner boxes?',
        options: ['Standard PVC domestic building wire', 'UV-resistant, cross-linked polyethylene (XLPO) solar DC cable', 'Armored telephone cable', 'Bare copper winding wire'],
        correctAnswer: 1,
        category: 'Array Installation & Wiring',
        difficulty: 'MEDIUM',
        explanation: 'Solar DC cables must withstand extreme ultraviolet (UV) radiation, ambient temperature variations (-40°C to +90°C), and outdoor environmental moisture.'
      },
      {
        question: 'What does a high positive reading on a solar array insulation resistance test (Megger test) indicate?',
        options: ['Severe earth fault in the DC cabling', 'Good insulation integrity and absence of ground faults', 'The inverter is damaged', 'The modules are not absorbing sunlight'],
        correctAnswer: 1,
        category: 'Testing & Commissioning',
        difficulty: 'MEDIUM',
        explanation: 'A high insulation resistance value (typically >40 Mega-ohms) verifies that cable insulation and module frames are properly isolated from ground faults.'
      },
      {
        question: 'What is the function of Maximum Power Point Tracking (MPPT) algorithms in modern solar inverters?',
        options: ['To physically rotate the panels towards the sun', 'To dynamically adjust electrical operating voltage and current to extract maximum available power from the array', 'To protect panels from dust accumulation', 'To convert single-phase AC to three-phase AC'],
        correctAnswer: 1,
        category: 'Tools & Inverters',
        difficulty: 'MEDIUM',
        explanation: 'MPPT dynamically samples panel I-V curves and adjusts the inverter load impedance so the array operates at its peak power point (Pmp) under changing irradiance.'
      },
      {
        question: 'How should solar panels be cleaned to prevent thermal shock and micro-cracking of tempered front glass?',
        options: ['Wash with cold pressurized water during peak mid-day heat', 'Clean during early morning or late evening when module glass is cool', 'Use abrasive steel wool and wire brushes', 'Apply automotive acid solvent'],
        correctAnswer: 1,
        category: 'Maintenance & Fault Finding',
        difficulty: 'EASY',
        explanation: 'Spraying cold water on hot solar panels during mid-day induces thermal shock that can shatter the tempered glass or cause micro-cracks in silicon wafers.'
      }
    ]
  },

  plumber: {
    trade: 'Plumber',
    aliases: ['plumber', 'plumbing', 'pipefitter', 'sanitary installer', 'drainage installer'],
    categories: ['Plumbing Safety', 'Tools & Equipment', 'Piping & Drainage', 'Fixture Installation', 'Leak Detection & Repair'],
    questions: [
      {
        question: 'What is the primary function of a P-trap or S-trap installed under a plumbing fixture such as a sink or washbasin?',
        options: ['To increase water flow velocity', 'To retain a water seal that prevents toxic sewer gases and odors from entering the building', 'To filter out fine sand particles', 'To reduce water supply pressure'],
        correctAnswer: 1,
        category: 'Piping & Drainage',
        difficulty: 'EASY',
        explanation: 'A plumbing trap maintains a standing water barrier (water seal) that blocks noxious sewer gases, bacteria, and insects from rising into inhabited rooms.'
      },
      {
        question: 'Which tool is best suited for gripping and turning smooth cylindrical steel and iron pipes without slipping?',
        options: ['Adjustable Crescent wrench', 'Pipe Wrench (Stillson wrench)', 'Slip-joint pliers', 'Ball-peen hammer'],
        correctAnswer: 1,
        category: 'Tools & Equipment',
        difficulty: 'EASY',
        explanation: 'A Stillson pipe wrench features serrated directional jaws designed to bite into smooth round metal pipes when torque is applied.'
      },
      {
        question: 'What tape or compound is wrapped clockwise around male pipe threads before screwing threaded brass or GI fittings together?',
        options: ['Electrical insulation tape', 'PTFE (Teflon) thread seal tape', 'Masking tape', 'Duct tape'],
        correctAnswer: 1,
        category: 'Leak Detection & Repair',
        difficulty: 'EASY',
        explanation: 'PTFE (Teflon) tape lubricates threads for tighter engagement and fills microscopic gaps between mating male and female threads to prevent leaks.'
      },
      {
        question: 'In a gravity drainage system, what is the standard recommended minimum slope (fall) for horizontal soil and waste pipes?',
        options: ['1 in 40 to 1 in 100 (approx. 1% to 2.5% slope)', '1 in 5 (20% steep fall)', 'Completely flat (0% slope)', 'Upward slope away from the sewer'],
        correctAnswer: 0,
        category: 'Piping & Drainage',
        difficulty: 'MEDIUM',
        explanation: 'A 1:40 to 1:100 slope provides optimal self-cleansing velocity (approx. 0.75 m/s) allowing liquids to carry solid waste without leaving deposits.'
      },
      {
        question: 'What test is performed to verify that freshly installed water supply piping has no leaks before concealing pipes in walls?',
        options: ['Hydrostatic pressure test using a hand or electric test pump', 'Smoke test with cardboard smoke', 'Visual test with plain water under zero pressure', 'Voltage continuity test'],
        correctAnswer: 0,
        category: 'Leak Detection & Repair',
        difficulty: 'MEDIUM',
        explanation: 'Hydrostatic pressure testing subjects the pipe system to 1.5 times the rated working pressure with water for a specified holding time to reveal any joint leaks.'
      },
      {
        question: 'What causes "water hammer" in a residential piping network when a quarter-turn tap or solenoid valve closes abruptly?',
        options: ['Air entering the septic tank', 'A hydraulic shock wave traveling backward due to sudden momentum stoppage of moving water', 'Low water temperature in the boiler', 'Excessive pipe diameter'],
        correctAnswer: 1,
        category: 'Leak Detection & Repair',
        difficulty: 'MEDIUM',
        explanation: 'Water hammer occurs when fluid in motion is abruptly forced to stop, converting kinetic energy into a destructive high-pressure shock wave against pipe walls.'
      },
      {
        question: 'Which pipe material is widely recognized for hot and cold potable water distribution due to its fusion-welded joint reliability and scaling resistance?',
        options: ['PPR (Polypropylene Random Copolymer) / CPVC', 'Cast Iron', 'Unplasticized PVC (uPVC) standard cold pipe', 'Corrugated aluminum foil'],
        correctAnswer: 0,
        category: 'Piping & Drainage',
        difficulty: 'MEDIUM',
        explanation: 'PPR and CPVC pipes withstand high operating water temperatures (up to 70-90°C), do not corrode, and form monolithic homogeneous joints via heat fusion.'
      },
      {
        question: 'Why must a plumbing vent pipe (soil stack vent) terminate through the roof into open atmosphere?',
        options: ['To allow rain to flush the pipes', 'To equalize air pressure within the drainage stack and prevent trap seals from being siphoned out', 'To provide daylight inside drain pipes', 'To vent hot water heater steam'],
        correctAnswer: 1,
        category: 'Piping & Drainage',
        difficulty: 'HARD',
        explanation: 'Drainage stack vents equalize internal atmospheric pressure during fixture discharge, preventing siphonage of water seals in adjacent fixture traps.'
      },
      {
        question: 'When soldering or brazing copper water pipes, what chemical agent must be applied to remove surface oxides before adding solder filler?',
        options: ['Soldering flux (acid or rosin paste)', 'Engine oil', 'Liquid detergent', 'Concrete curing compound'],
        correctAnswer: 0,
        category: 'Tools & Equipment',
        difficulty: 'MEDIUM',
        explanation: 'Soldering flux cleans oxides from copper surfaces, shields metal from air during heating, and promotes capillary flow of molten solder into the joint.'
      },
      {
        question: 'What personal protective equipment is essential when clearing blocked municipal sewer lines or septic tanks?',
        options: ['Chemical-resistant heavy nitrile/rubber gloves, eye protection, and gas monitoring respirator', 'Cotton garden gloves only', 'Sunglasses and earplugs', 'No PPE is necessary if water is flowing'],
        correctAnswer: 0,
        category: 'Plumbing Safety',
        difficulty: 'EASY',
        explanation: 'Sewer maintenance exposes workers to biological pathogens (Hepatitis, E. coli) and lethal toxic gases (Hydrogen Sulfide H2S, Methane); heavy PPE is essential.'
      },
      {
        question: 'What is the function of a backflow preventer or non-return valve (NRV) in a domestic water supply line?',
        options: ['To increase the pressure from the municipal main', 'To prevent contaminated or stagnant water from flowing backward into the clean municipal drinking water supply', 'To measure the volume of consumed water', 'To soften hard water by removing calcium'],
        correctAnswer: 1,
        category: 'Piping & Drainage',
        difficulty: 'HARD',
        explanation: 'Backflow preventers prevent back-siphonage or back-pressure from reversing flow and contaminating the potable drinking water distribution system.'
      },
      {
        question: 'Which tool is used to create a clean, square, burr-free 90-degree cut on copper and plastic pipes?',
        options: ['Rotary pipe/tube cutter', 'Wood hand saw', 'Cold chisel and hammer', 'Angle grinder with stone blade'],
        correctAnswer: 0,
        category: 'Tools & Equipment',
        difficulty: 'EASY',
        explanation: 'A rotary tubing cutter rolls around the pipe circumference with a hardened cutting wheel, producing an accurate, perpendicular cut with minimal internal burr.'
      }
    ]
  },

  mason: {
    trade: 'Construction Mason',
    aliases: ['mason', 'masonry', 'bricklayer', 'brick mason', 'plasterer', 'civil construction'],
    categories: ['Site Safety & PPE', 'Mortar & Concrete Mixing', 'Brickwork & Blockwork', 'Plastering & Finishing', 'Quality Inspection'],
    questions: [
      {
        question: 'What tool is traditionally used by a mason to verify the exact vertical alignment (plumbness) of a brick wall or column?',
        options: ['Plumb bob (plumb rule)', 'Measuring tape', 'Wooden float', 'Chalk line'],
        correctAnswer: 0,
        category: 'Quality Inspection',
        difficulty: 'EASY',
        explanation: 'A plumb bob relies on gravity on a suspended weight to establish a true vertical reference line for checking the vertical plumbness of masonry work.'
      },
      {
        question: 'What is the standard nominal ratio of cement to sand typically specified for general brickwork mortar in residential masonry?',
        options: ['1:1', '1:4 to 1:6', '1:12', '1:20'],
        correctAnswer: 1,
        category: 'Mortar & Concrete Mixing',
        difficulty: 'EASY',
        explanation: 'Mortar mixes of 1:4 to 1:6 (one part Portland cement to 4 to 6 parts clean graded river sand) provide adequate compressive strength and workability for brickwork.'
      },
      {
        question: 'Why must clay bricks be thoroughly soaked in clean water for at least 1-2 hours prior to laying them in cement mortar?',
        options: ['To make the bricks softer to cut', 'To prevent dry bricks from absorbing moisture rapidly from the wet mortar, which weakens the cement bond', 'To wash off the red coloring', 'To reduce the weight of the wall'],
        correctAnswer: 1,
        category: 'Brickwork & Blockwork',
        difficulty: 'MEDIUM',
        explanation: 'Dry porous bricks suck mixing water out of fresh mortar before cement can properly hydrate, resulting in crumbly, non-adherent joints.'
      },
      {
        question: 'What is the purpose of the depression or indentation found on the top face of a standard clay brick (known as the "frog")?',
        options: ['To reduce the brick manufacturing cost only', 'To form a strong mechanical key (shear lock) with the mortar bed joint', 'To hold a branding label only', 'To collect rainwater during construction'],
        correctAnswer: 1,
        category: 'Brickwork & Blockwork',
        difficulty: 'MEDIUM',
        explanation: 'The frog creates a mechanical mortar key when filled with mortar and laid facing upward, significantly enhancing shear resistance and joint strength.'
      },
      {
        question: 'What is the process of applying water to newly built brickwork or concrete for 7 to 14 days called?',
        options: ['Slaking', 'Curing', 'Tempering', 'Rendering'],
        correctAnswer: 1,
        category: 'Plastering & Finishing',
        difficulty: 'EASY',
        explanation: 'Curing maintains moisture and temperature conditions necessary for cement hydration, enabling the masonry structure to achieve its design compressive strength.'
      },
      {
        question: 'Which brick bonding pattern features alternating courses of headers (ends of bricks) and stretchers (sides of bricks)?',
        options: ['English Bond', 'Stack Bond', 'Running/Stretcher Bond', 'Rubble Bond'],
        correctAnswer: 0,
        category: 'Brickwork & Blockwork',
        difficulty: 'MEDIUM',
        explanation: 'English bond consists of alternate courses of headers and stretchers and is widely considered the strongest masonry bond pattern for solid walls.'
      },
      {
        question: 'What tool is used by a plasterer to smooth the surface and eliminate minor ridges on fresh cement-sand wall plaster?',
        options: ['Wooden float or sponge float', 'Club hammer', 'Trowel heel only', 'Pickaxe'],
        correctAnswer: 0,
        category: 'Plastering & Finishing',
        difficulty: 'EASY',
        explanation: 'Wooden and sponge floats are rubbed in circular motions across the plaster coat to consolidate the surface, produce a uniform texture, and eliminate trowel marks.'
      },
      {
        question: 'What is the minimum safety equipment mandatory for a mason working on external building scaffolding above 2 meters height?',
        options: ['Safety helmet, safety harness with anchored lanyard, and non-slip safety shoes', 'Only a pair of sunglasses', 'Slippers and cotton shirt', 'Gloves only'],
        correctAnswer: 0,
        category: 'Site Safety & PPE',
        difficulty: 'EASY',
        explanation: 'Working at height requires fall arrest systems (full body harness anchored to a lifeline), hard hat for overhead hazards, and steel-toe safety footwear.'
      },
      {
        question: 'What is the term for the horizontal mortar layer on which bricks are placed?',
        options: ['Bed joint', 'Cross joint (perpend)', 'Frog joint', 'Soffit'],
        correctAnswer: 0,
        category: 'Brickwork & Blockwork',
        difficulty: 'EASY',
        explanation: 'The horizontal layer of mortar upon which bricks are set is termed the bed joint, while the vertical joint between adjacent bricks is the perpend.'
      },
      {
        question: 'What defect occurs in plaster when unslaked quicklime particles hydrate and expand inside the hardened wall coating after completion?',
        options: ['Blowing or popping of plaster', 'Efflorescence', 'Spalling from frost', 'Crazing'],
        correctAnswer: 0,
        category: 'Plastering & Finishing',
        difficulty: 'HARD',
        explanation: 'Unslaked lime particles absorb atmospheric moisture over time, expanding dramatically and popping out small conical craters (popping/blowing) on the wall.'
      },
      {
        question: 'What instrument is used to transfer horizontal elevation levels across wide distances on a construction site without optical levels?',
        options: ['Clear flexible water level tube', 'Steel foot ruler', 'Plumb bob', 'Mason trowel edge'],
        correctAnswer: 0,
        category: 'Quality Inspection',
        difficulty: 'MEDIUM',
        explanation: 'A transparent water level tube utilizes the hydrostatic principle (water finds its own level) to accurately transfer horizontal benchmarks across long spans.'
      },
      {
        question: 'What is the white crystalline powdery deposit that appears on dry brick surfaces due to soluble salts carried to the surface by evaporating water?',
        options: ['Efflorescence', 'Carbonation', 'Segregation', 'Bleeding'],
        correctAnswer: 0,
        category: 'Quality Inspection',
        difficulty: 'HARD',
        explanation: 'Efflorescence occurs when water-soluble salts within bricks or mortar are carried to the exterior face by migrating moisture and crystallize upon drying.'
      }
    ]
  },

  automotive: {
    trade: 'Automotive Technician',
    aliases: ['automotive', 'mechanic', 'auto technician', 'motor mechanic', 'automobile', 'car mechanic'],
    categories: ['Workshop Safety', 'Diagnostic Tools', 'Engine & Transmission', 'Brake & Suspension', 'Electrical Systems'],
    questions: [
      {
        question: 'Which tool should always be placed under a vehicle after raising it with a hydraulic floor jack before crawling underneath?',
        options: ['Jack stands with rated load capacity', 'A stack of concrete bricks', 'Wooden wedges only', 'The spare tire'],
        correctAnswer: 0,
        category: 'Workshop Safety',
        difficulty: 'EASY',
        explanation: 'Hydraulic jacks can experience sudden seal failure; rated mechanical jack stands placed on solid ground are mandatory to safely support a lifted vehicle.'
      },
      {
        question: 'What electronic tool is plugged into a vehicle’s 16-pin OBD-II port to read engine diagnostic trouble codes (DTCs) and live sensor data?',
        options: ['OBD-II Diagnostic Scanner / Scan Tool', 'Timing light', 'Hydrometer', 'Battery load tester'],
        correctAnswer: 0,
        category: 'Diagnostic Tools',
        difficulty: 'EASY',
        explanation: 'An OBD-II scanner interfaces with the Engine Control Module (ECM) through the standardized diagnostic port to read fault codes and live sensor streams.'
      },
      {
        question: 'What is the primary function of engine oil in an internal combustion engine?',
        options: ['To provide lubrication, reduce friction, dissipate heat, and inhibit corrosion', 'To burn inside cylinders to generate horsepower', 'To clean the windshield', 'To pressurize the brake master cylinder'],
        correctAnswer: 0,
        category: 'Engine & Transmission',
        difficulty: 'EASY',
        explanation: 'Engine oil forms a hydrodynamic lubricating film between moving parts, carries away heat, traps particulates, and protects internal metal against corrosion.'
      },
      {
        question: 'What is the primary function of the ABS (Anti-lock Braking System) during emergency hard braking?',
        options: ['To lock all wheels instantly for fastest stop', 'To prevent wheel lockup by rapidly modulating hydraulic pressure, maintaining driver steering control', 'To disconnect the alternator from the battery', 'To turn off the engine automatically'],
        correctAnswer: 1,
        category: 'Brake & Suspension',
        difficulty: 'MEDIUM',
        explanation: 'ABS monitors wheel rotational speeds and pulses brake caliper pressure so wheels do not lock into a skid, allowing the driver to steer around obstacles.'
      },
      {
        question: 'What instrument is used to check the state of charge and specific gravity of electrolyte liquid in a flooded lead-acid automotive battery?',
        options: ['Optical / Glass Battery Hydrometer', 'Barometer', 'Torque wrench', 'Anemometer'],
        correctAnswer: 0,
        category: 'Electrical Systems',
        difficulty: 'MEDIUM',
        explanation: 'A battery hydrometer measures electrolyte specific gravity (typically 1.265 to 1.280 when fully charged) to evaluate individual cell chemical condition.'
      },
      {
        question: 'What is the purpose of using a calibrated torque wrench when tightening cylinder head bolts or wheel lug nuts?',
        options: ['To tighten bolts as fast as possible', 'To ensure bolts are fastened to the exact clamping tension specified by the manufacturer', 'To remove stubborn rusted nuts', 'To ream out damaged threads'],
        correctAnswer: 1,
        category: 'Diagnostic Tools',
        difficulty: 'MEDIUM',
        explanation: 'Torque wrenches ensure threaded fasteners receive precise torque, preventing warpage of cylinder heads, stripped threads, or loose wheel assemblies.'
      },
      {
        question: 'What symptom indicates that air bubbles are trapped in a hydraulic brake system?',
        options: ['A spongy, soft brake pedal that travels excessively towards the floorboard', 'The steering wheel shakes at 80 km/h', 'The headlights become dim when braking', 'The engine stalls when shifting to reverse'],
        correctAnswer: 0,
        category: 'Brake & Suspension',
        difficulty: 'MEDIUM',
        explanation: 'Air is compressible while hydraulic brake fluid is incompressible; trapped air compresses under pedal pressure, resulting in a spongy, low brake pedal.'
      },
      {
        question: 'What component maintains the automotive battery at full charge and powers electrical accessories while the engine is running?',
        options: ['Alternator (generator)', 'Starter motor', 'Ignition coil', 'Radiator cooling fan'],
        correctAnswer: 0,
        category: 'Electrical Systems',
        difficulty: 'EASY',
        explanation: 'The engine-driven alternator generates AC voltage, rectifies it to DC, supplies vehicle electrical loads, and recharges the 12V starter battery.'
      },
      {
        question: 'What happens if a vehicle’s engine timing belt snaps while driving on an interference-engine design?',
        options: ['The vehicle safely glides with no internal engine damage', 'The pistons can strike open intake and exhaust valves, causing catastrophic bent valves and piston damage', 'The radiator boils over instantly', 'The tire pressure drops suddenly'],
        correctAnswer: 1,
        category: 'Engine & Transmission',
        difficulty: 'HARD',
        explanation: 'In interference engines, valve and piston travel spaces overlap; a broken timing belt halts camshaft rotation while crankshaft spins, causing valves to collide with pistons.'
      },
      {
        question: 'What does blue-grey smoke emitted continuously from a vehicle exhaust tailpipe usually indicate?',
        options: ['Engine oil is entering combustion chambers (worn piston rings or valve stem seals)', 'Excessive unburnt fuel (rich mixture)', 'Coolant leaking into cylinders from a blown head gasket', 'Normal clean exhaust on a cold morning'],
        correctAnswer: 0,
        category: 'Diagnostic Tools',
        difficulty: 'HARD',
        explanation: 'Blue exhaust smoke is characteristic of burning motor oil due to worn piston rings, cylinder bore wear, or failed valve stem seals.'
      },
      {
        question: 'Why must brake fluid be changed periodically according to vehicle service schedules?',
        options: ['Brake fluid is hygroscopic (absorbs moisture from air), which lowers its boiling point and causes internal corrosion', 'Brake fluid turns into solid plastic after 6 months', 'To change the color of the brake lines', 'Brake fluid evaporates completely during normal driving'],
        correctAnswer: 0,
        category: 'Brake & Suspension',
        difficulty: 'HARD',
        explanation: 'Glycol-based brake fluid absorbs ambient moisture over time; water contamination dramatically reduces fluid boiling point, leading to vapor lock brake failure.'
      },
      {
        question: 'What is the function of the thermostat in an automotive liquid cooling system?',
        options: ['To measure ambient cabin temperature', 'To regulate coolant flow to the radiator so the engine quickly reaches and maintains optimum operating temperature', 'To cycle the air conditioning compressor', 'To pump coolant through the cylinder block'],
        correctAnswer: 1,
        category: 'Engine & Transmission',
        difficulty: 'MEDIUM',
        explanation: 'The thermostat stays closed during cold startup to let engine warm up rapidly, then opens progressively to circulate coolant through the radiator for cooling.'
      }
    ]
  },

  general_technical: {
    trade: 'General Technical & Workplace Skills',
    aliases: ['general', 'technical', 'maintenance', 'fitter', 'welder', 'operator', 'vocational'],
    categories: ['Workplace Safety & PPE', 'Hand & Power Tools', 'Technical Measurement', 'Preventive Maintenance', 'Quality Assurance'],
    questions: [
      {
        question: 'What is the very first action to take upon discovering an injured, unconscious coworker near machinery in a workplace?',
        options: ['Pull the worker by the arm immediately', 'Assess the scene for ongoing electrical, mechanical, or gas hazards before approaching', 'Go home and report it tomorrow', 'Attempt to restart the machine to see what failed'],
        correctAnswer: 1,
        category: 'Workplace Safety & PPE',
        difficulty: 'EASY',
        explanation: 'Scene safety assessment ensures the rescuer does not become a second victim of live electricity, toxic gas, or moving machinery.'
      },
      {
        question: 'Which precision hand measuring tool is used to measure the outside diameter, inside diameter, and depth of a machined metal component to within 0.02 mm?',
        options: ['Vernier Caliper / Digital Caliper', 'Tape Measure', 'Carpenter Wood Rule', 'Plumb Bob'],
        correctAnswer: 0,
        category: 'Technical Measurement',
        difficulty: 'EASY',
        explanation: 'A vernier caliper possesses outside jaws, inside nibs, and a depth rod to provide accurate three-way dimensional measurements down to 0.02 mm.'
      },
      {
        question: 'What is the purpose of an SDS (Safety Data Sheet) in a workshop or industrial site?',
        options: ['To list the retail price of chemicals', 'To provide comprehensive information on chemical hazards, safe handling, PPE, storage, and emergency first aid', 'To schedule worker shift timings', 'To track machine maintenance warranty'],
        correctAnswer: 1,
        category: 'Workplace Safety & PPE',
        difficulty: 'EASY',
        explanation: 'Safety Data Sheets (SDS) communicate vital hazards, flash points, exposure limits, required PPE, spill cleanup, and first aid for all hazardous substances.'
      },
      {
        question: 'What is the standard procedure of Lockout/Tagout (LOTO) designed to prevent?',
        options: ['Theft of expensive tools during weekends', 'Unexpected machine energization or startup during service or maintenance operations', 'Workers taking unauthorized lunch breaks', 'Loss of company paperwork'],
        correctAnswer: 1,
        category: 'Workplace Safety & PPE',
        difficulty: 'MEDIUM',
        explanation: 'LOTO isolates hazardous energy sources (electrical, pneumatic, hydraulic, kinetic) with padlocks and warning tags to protect maintenance personnel.'
      },
      {
        question: 'What tool is designed to tap internal screw threads inside a pre-drilled cylindrical hole?',
        options: ['Thread Tap (Hand tap set)', 'Die and die stock', 'Twist drill bit', 'Reamer'],
        correctAnswer: 0,
        category: 'Hand & Power Tools',
        difficulty: 'MEDIUM',
        explanation: 'A tap cuts internal female screw threads inside a hole; a die cuts external male screw threads on a round rod or pipe.'
      },
      {
        question: 'What is the main benefit of performing scheduled Preventive Maintenance (PM) on equipment rather than Breakdown Maintenance?',
        options: ['It costs significantly more money', 'It avoids unexpected catastrophic failures, extends machinery lifespan, and maintains worker safety', 'It allows operators to skip cleaning equipment', 'It replaces broken machines every week'],
        correctAnswer: 1,
        category: 'Preventive Maintenance',
        difficulty: 'EASY',
        explanation: 'Preventive maintenance systematically inspects, lubricates, and replaces worn components before failure occurs, minimizing costly downtime.'
      },
      {
        question: 'When tightening a critical structural assembly with multiple bolts in a circular flange, what tightening sequence should always be followed?',
        options: ['Tighten bolts in circular clockwise order one by one to maximum tightness', 'Criss-cross (star) pattern in gradual progressive torque stages', 'Tighten whichever bolt is closest to the operator first', 'Tighten randomly without measuring torque'],
        correctAnswer: 1,
        category: 'Quality Assurance',
        difficulty: 'MEDIUM',
        explanation: 'A star or criss-cross tightening pattern distributes clamping force uniformly across the joint face, preventing gasket pinching, distortion, or leaks.'
      },
      {
        question: 'Which fire extinguisher color band code (or label) in international safety denotes a Dry Chemical Powder (DCP) unit suitable for flammable liquid and electrical fires?',
        options: ['Blue band (or labeled ABC Powder)', 'Pure solid red with no band (Water)', 'Cream band (Foam)', 'Black band (CO2)'],
        correctAnswer: 0,
        category: 'Workplace Safety & PPE',
        difficulty: 'MEDIUM',
        explanation: 'Under ISO/BS standards, dry powder fire extinguishers are designated with a blue color code and are rated for Class A, B, and C/electrical risks.'
      },
      {
        question: 'What does the term "5S" refer to in modern lean workshop management?',
        options: ['Sort, Set in order, Shine, Standardize, Sustain (methodology for workplace organization)', 'Five speeds of a lathe machine', 'Five sizes of metric bolts', 'Five steps of customer payment'],
        correctAnswer: 0,
        category: 'Quality Assurance',
        difficulty: 'EASY',
        explanation: '5S is a systematic lean workplace organization framework: Sort (Seiri), Set in order (Seiton), Shine (Seiso), Standardize (Seiketsu), and Sustain (Shitsuke).'
      },
      {
        question: 'What type of eye protection must be worn when operating a high-speed pedestal grinding wheel?',
        options: ['Regular prescription reading glasses', 'Impact-resistant safety goggles or a full-face shield conforming to industrial safety standards', 'Welding helmet with shade 12 dark glass', 'No eye protection is needed if wheel guard is on'],
        correctAnswer: 1,
        category: 'Workplace Safety & PPE',
        difficulty: 'EASY',
        explanation: 'High-speed grinding wheels can shatter or throw high-velocity metallic particles; impact-rated safety goggles or a full face shield are required.'
      },
      {
        question: 'What is a micrometer screw gauge primarily used for in mechanical workshops?',
        options: ['Measuring very small distances or thicknesses with accuracy up to 0.01 mm or 0.001 mm', 'Measuring current in heavy cables', 'Measuring the temperature of molten metals', 'Checking the flatness of large concrete floors'],
        correctAnswer: 0,
        category: 'Technical Measurement',
        difficulty: 'MEDIUM',
        explanation: 'A precision micrometer uses a calibrated screw thread to measure microscopic dimensions and thicknesses with 0.01 mm (or 1 micron) precision.'
      },
      {
        question: 'Why is it dangerous to use compressed air to blow metal dust and chips off machinery or worker clothing?',
        options: ['It uses too much electrical energy', 'Flying particles can cause severe eye blindness or penetrate the skin, and compressed air can enter the bloodstream', 'It makes a loud whistle noise', 'It oxidizes the metal too fast'],
        correctAnswer: 1,
        category: 'Workplace Safety & PPE',
        difficulty: 'MEDIUM',
        explanation: 'Compressed air can propel chips directly into eyes, embed particles into skin tissue, or cause fatal air embolisms if pointed at bare skin.'
      }
    ]
  }
};

/**
 * Finds the best matching question set for a given topic or trade string.
 */
export function findQuestionSetForTopic(topic: string): TradeQuestionSet {
  const normalized = topic.trim().toLowerCase();

  for (const set of Object.values(VERIFIED_MCQ_BANK)) {
    if (set.trade.toLowerCase() === normalized) {
      return set;
    }
    for (const alias of set.aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return set;
      }
    }
  }

  // Fallback to electrician if electrical keywords, or general technical
  if (normalized.includes('elect') || normalized.includes('wire') || normalized.includes('power')) {
    return VERIFIED_MCQ_BANK.electrician;
  }
  if (normalized.includes('solar') || normalized.includes('pv') || normalized.includes('renew')) {
    return VERIFIED_MCQ_BANK.solar_pv;
  }
  if (normalized.includes('plumb') || normalized.includes('pipe') || normalized.includes('drain')) {
    return VERIFIED_MCQ_BANK.plumber;
  }
  if (normalized.includes('mason') || normalized.includes('brick') || normalized.includes('construct') || normalized.includes('civil')) {
    return VERIFIED_MCQ_BANK.mason;
  }
  if (normalized.includes('auto') || normalized.includes('motor') || normalized.includes('car') || normalized.includes('mechanic')) {
    return VERIFIED_MCQ_BANK.automotive;
  }

  return VERIFIED_MCQ_BANK.general_technical;
}

/**
 * Deterministic pseudo-random generator for consistent variation per seed.
 */
function pseudoRandom(seed: number) {
  let s = Math.sin(seed++) * 10000;
  return s - Math.floor(s);
}

/**
 * Selects exactly 10 questions from the verified question bank for a topic.
 * Ensures:
 * 1. Exactly 10 questions are returned.
 * 2. Questions vary between attempts (using seed or Math.random).
 * 3. All questions have exactly 4 options.
 * 4. Exactly one valid correctAnswer (0..3).
 * 5. Balanced competency categories and difficulty distribution.
 */
export function selectQuestionsFromBank(topic: string, count: number = 10, seed?: number): VerifiedMCQQuestion[] {
  const questionSet = findQuestionSetForTopic(topic);
  const pool = [...questionSet.questions];

  // If pool has fewer than count (edge case), supplement from general_technical
  if (pool.length < count) {
    for (const q of VERIFIED_MCQ_BANK.general_technical.questions) {
      if (!pool.some(p => p.question === q.question)) {
        pool.push(q);
      }
      if (pool.length >= count * 2) break;
    }
  }

  // Group by category to ensure broad competency coverage
  const categories = Array.from(new Set(pool.map(q => q.category)));
  const byCategory: Record<string, VerifiedMCQQuestion[]> = {};
  for (const cat of categories) {
    byCategory[cat] = pool.filter(q => q.category === cat);
  }

  let currentSeed = seed !== undefined ? seed : null;
  const rng = currentSeed !== null ? () => { const res = pseudoRandom(currentSeed!); currentSeed! += 1; return res; } : () => Math.random();

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort(() => rng() - 0.5);
  }

  const selected: VerifiedMCQQuestion[] = [];
  const selectedQuestions = new Set<string>();

  // Pass 1: pick 1 question from each category to ensure comprehensive coverage
  for (const cat of categories) {
    if (selected.length >= count) break;
    const item = byCategory[cat].find(q => !selectedQuestions.has(q.question));
    if (item) {
      selected.push(item);
      selectedQuestions.add(item.question);
    }
  }

  // Pass 2: fill remaining slots from the remaining pool
  const remaining = pool.filter(q => !selectedQuestions.has(q.question)).sort(() => rng() - 0.5);
  for (const q of remaining) {
    if (selected.length >= count) break;
    selected.push(q);
    selectedQuestions.add(q.question);
  }

  // Pass 3: In extreme edge cases, take whatever is available up to count
  while (selected.length < count && pool.length > 0) {
    const next = pool[selected.length % pool.length];
    selected.push(next);
  }

  // Return exactly count questions, shuffled
  const finalQuestions = selected.slice(0, count).sort(() => rng() - 0.5);

  return finalQuestions.map((q, idx) => ({
    ...q,
    id: `qb_${idx}_${Date.now()}`
  }));
}
