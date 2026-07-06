export interface MockQuestion {
  id: string;
  subject: "Physics" | "Chemistry" | "Maths";
  topic: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface MockTestConfig {
  id: string;
  name: string;
  duration: number; // minutes
  questions: MockQuestion[];
  marking: { correct: number; incorrect: number; unanswered: number };
}

export interface MockTestResult {
  testId: string;
  testName: string;
  answers: Record<string, number | null>;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeTaken: number; // seconds
  completedAt: string;
  subjectBreakdown: { subject: string; correct: number; total: number; score: number }[];
}

const PHYSICS_QUESTIONS: MockQuestion[] = [
  { id: "mt-p1", subject: "Physics", topic: "Mechanics", difficulty: "easy", prompt: "A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height reached? (g = 10 m/s²)", options: ["10 m", "20 m", "30 m", "40 m"], correct: 1, explanation: "h = v²/2g = 400/20 = 20 m" },
  { id: "mt-p2", subject: "Physics", topic: "Mechanics", difficulty: "medium", prompt: "Two blocks of masses 3 kg and 5 kg are connected by a string over a frictionless pulley. Find the acceleration of the system. (g = 10 m/s²)", options: ["2.5 m/s²", "3.75 m/s²", "5 m/s²", "1.25 m/s²"], correct: 0, explanation: "a = (m₂-m₁)g/(m₁+m₂) = (5-3)×10/(5+3) = 2.5 m/s²" },
  { id: "mt-p3", subject: "Physics", topic: "Electrostatics", difficulty: "medium", prompt: "Two charges of +2μC and -2μC are placed 10 cm apart. What is the electric field at the midpoint?", options: ["0 N/C", "1.44 × 10⁶ N/C", "2.88 × 10⁶ N/C", "7.2 × 10⁵ N/C"], correct: 2, explanation: "Fields from both charges point in the same direction at the midpoint. E = 2 × kq/r² = 2 × 9×10⁹ × 2×10⁻⁶ / (0.05)² = 2.88 × 10⁶ N/C" },
  { id: "mt-p4", subject: "Physics", topic: "Optics", difficulty: "easy", prompt: "A concave mirror has focal length 15 cm. An object is placed at 30 cm. Where is the image formed?", options: ["15 cm", "30 cm", "60 cm", "10 cm"], correct: 1, explanation: "1/v + 1/u = 1/f → 1/v = 1/(-15) - 1/(-30) = -1/30. v = -30 cm (real, at same distance)" },
  { id: "mt-p5", subject: "Physics", topic: "Thermodynamics", difficulty: "hard", prompt: "An ideal gas undergoes isothermal expansion from V to 2V. The work done by the gas is:", options: ["nRT", "nRT ln 2", "2nRT", "nRT/2"], correct: 1, explanation: "For isothermal process, W = nRT ln(V₂/V₁) = nRT ln 2" },
  { id: "mt-p6", subject: "Physics", topic: "Modern Physics", difficulty: "medium", prompt: "The de Broglie wavelength of an electron accelerated through 100V is approximately:", options: ["0.123 nm", "0.246 nm", "1.23 nm", "12.3 nm"], correct: 0, explanation: "λ = 1.226/√V nm = 1.226/√100 = 0.1226 ≈ 0.123 nm" },
  { id: "mt-p7", subject: "Physics", topic: "Waves", difficulty: "easy", prompt: "A tuning fork of frequency 340 Hz produces sound in air (v = 340 m/s). The wavelength is:", options: ["0.5 m", "1 m", "2 m", "0.1 m"], correct: 1, explanation: "λ = v/f = 340/340 = 1 m" },
  { id: "mt-p8", subject: "Physics", topic: "Magnetism", difficulty: "medium", prompt: "A current-carrying wire of length 2m in a magnetic field of 0.5T experiences a force of 5N. The current is:", options: ["2.5 A", "5 A", "10 A", "1 A"], correct: 1, explanation: "F = BIL → I = F/(BL) = 5/(0.5×2) = 5 A" },
  { id: "mt-p9", subject: "Physics", topic: "Mechanics", difficulty: "hard", prompt: "A satellite orbits Earth at height equal to Earth's radius. Its orbital velocity is (if surface escape velocity = 11.2 km/s):", options: ["5.6 km/s", "7.9 km/s", "11.2 km/s", "3.96 km/s"], correct: 0, explanation: "v_orbital = √(GM/r) where r = 2R. v_e = √(2GM/R) = 11.2 → GM/R = 62.72 → v = √(62.72/2) = 5.6 km/s" },
  { id: "mt-p10", subject: "Physics", topic: "Electrostatics", difficulty: "easy", prompt: "The capacitance of a parallel plate capacitor doubles when:", options: ["Plate area is halved", "Distance between plates is doubled", "Dielectric constant is doubled", "Charge is doubled"], correct: 2, explanation: "C = κε₀A/d. Doubling κ doubles capacitance." },
  { id: "mt-p11", subject: "Physics", topic: "Mechanics", difficulty: "medium", prompt: "A body of mass 5 kg is moving with velocity 10 m/s. A force of 10 N is applied for 3s. The final velocity is:", options: ["16 m/s", "13 m/s", "10 m/s", "20 m/s"], correct: 0, explanation: "a = F/m = 10/5 = 2 m/s². v = u + at = 10 + 2×3 = 16 m/s" },
  { id: "mt-p12", subject: "Physics", topic: "Rotational Motion", difficulty: "hard", prompt: "Moment of inertia of a solid sphere about its diameter is:", options: ["(2/5)MR²", "(2/3)MR²", "(1/2)MR²", "(3/5)MR²"], correct: 0, explanation: "For a solid sphere, I = (2/5)MR² about any diameter." },
  { id: "mt-p13", subject: "Physics", topic: "Gravitation", difficulty: "medium", prompt: "If Earth's radius is halved keeping mass same, the value of g would become:", options: ["g/4", "g/2", "2g", "4g"], correct: 3, explanation: "g = GM/R². If R → R/2, g → GM/(R/2)² = 4GM/R² = 4g" },
  { id: "mt-p14", subject: "Physics", topic: "Fluid Mechanics", difficulty: "easy", prompt: "A body floats in water with 2/3 of its volume submerged. Its relative density is:", options: ["2/3", "1/3", "3/2", "1"], correct: 0, explanation: "Fraction submerged = ρ_body/ρ_fluid = 2/3" },
  { id: "mt-p15", subject: "Physics", topic: "Waves", difficulty: "hard", prompt: "Two waves y₁ = 5sin(ωt) and y₂ = 5sin(ωt + π/3) superpose. The amplitude of the resultant is:", options: ["5√3", "5", "10", "5√2"], correct: 0, explanation: "A = √(A₁² + A₂² + 2A₁A₂cosφ) = √(25 + 25 + 50cos60°) = √75 = 5√3" },
  { id: "mt-p16", subject: "Physics", topic: "Current Electricity", difficulty: "medium", prompt: "Three resistors of 6Ω each are connected in parallel. The equivalent resistance is:", options: ["2Ω", "18Ω", "6Ω", "3Ω"], correct: 0, explanation: "1/R = 1/6 + 1/6 + 1/6 = 3/6 = 1/2 → R = 2Ω" },
  { id: "mt-p17", subject: "Physics", topic: "Electromagnetic Induction", difficulty: "hard", prompt: "A coil of 100 turns has flux changing from 0.1 Wb to 0.3 Wb in 0.02 s. The induced EMF is:", options: ["500 V", "1000 V", "100 V", "200 V"], correct: 1, explanation: "EMF = -N(dΦ/dt) = 100 × (0.3-0.1)/0.02 = 100 × 10 = 1000 V" },
  { id: "mt-p18", subject: "Physics", topic: "Semiconductors", difficulty: "easy", prompt: "In a p-n junction diode, the depletion region is formed due to:", options: ["Drift of majority carriers", "Diffusion of charge carriers", "External voltage", "Heating"], correct: 1, explanation: "Depletion region forms due to diffusion of electrons and holes across the junction." },
  { id: "mt-p19", subject: "Physics", topic: "Thermodynamics", difficulty: "medium", prompt: "In an adiabatic process for an ideal gas:", options: ["ΔQ = 0", "ΔW = 0", "ΔU = 0", "ΔT = 0"], correct: 0, explanation: "Adiabatic means no heat exchange, so ΔQ = 0. Work is done at the expense of internal energy." },
  { id: "mt-p20", subject: "Physics", topic: "Nuclear Physics", difficulty: "hard", prompt: "The binding energy per nucleon is maximum for:", options: ["U-238", "Fe-56", "He-4", "H-2"], correct: 1, explanation: "Fe-56 has the highest binding energy per nucleon (~8.8 MeV), making it the most stable nucleus." },
];

const CHEMISTRY_QUESTIONS: MockQuestion[] = [
  { id: "mt-c1", subject: "Chemistry", topic: "Atomic Structure", difficulty: "easy", prompt: "The number of radial nodes for a 3p orbital is:", options: ["0", "1", "2", "3"], correct: 1, explanation: "Radial nodes = n - l - 1 = 3 - 1 - 1 = 1" },
  { id: "mt-c2", subject: "Chemistry", topic: "Chemical Bonding", difficulty: "medium", prompt: "Which molecule has the highest bond order?", options: ["O₂", "N₂", "F₂", "C₂"], correct: 1, explanation: "N₂ has bond order 3 (triple bond), highest among these." },
  { id: "mt-c3", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "medium", prompt: "The IUPAC name of CH₃CH(OH)CH₃ is:", options: ["1-propanol", "2-propanol", "propan-1-ol", "isopropyl alcohol"], correct: 1, explanation: "OH is on the second carbon, making it propan-2-ol or 2-propanol." },
  { id: "mt-c4", subject: "Chemistry", topic: "Equilibrium", difficulty: "hard", prompt: "For the reaction N₂ + 3H₂ ⇌ 2NH₃, Kp = 0.5 atm⁻². What is Kc at 500K? (R = 0.082 L·atm/mol·K)", options: ["840.5", "0.5", "20.5", "0.0003"], correct: 0, explanation: "Kp = Kc(RT)^Δn. Δn = 2-4 = -2. Kc = Kp/(RT)⁻² = 0.5 × (0.082×500)² = 0.5 × 1681 = 840.5" },
  { id: "mt-c5", subject: "Chemistry", topic: "Thermochemistry", difficulty: "easy", prompt: "The enthalpy of formation of an element in its standard state is:", options: ["Positive", "Negative", "Zero", "Depends on the element"], correct: 2, explanation: "By convention, ΔH°f of an element in its standard state is zero." },
  { id: "mt-c6", subject: "Chemistry", topic: "Electrochemistry", difficulty: "medium", prompt: "In the electrochemical series, which metal is the strongest reducing agent?", options: ["Cu", "Zn", "Li", "Fe"], correct: 2, explanation: "Li has the most negative standard reduction potential (-3.04V), making it the strongest reducing agent." },
  { id: "mt-c7", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", prompt: "Markownikoff's rule is applicable to:", options: ["Symmetrical alkenes", "Unsymmetrical alkenes with HX", "All alkenes", "Alkynes only"], correct: 1, explanation: "Markownikoff's rule applies to addition of HX to unsymmetrical alkenes — H adds to carbon with more H atoms." },
  { id: "mt-c8", subject: "Chemistry", topic: "Periodic Table", difficulty: "easy", prompt: "Which has the largest atomic radius?", options: ["Na", "Mg", "Al", "K"], correct: 3, explanation: "K is in period 4, has the largest atomic radius among these elements." },
  { id: "mt-c9", subject: "Chemistry", topic: "Solutions", difficulty: "medium", prompt: "The boiling point elevation of a 0.1m aqueous NaCl solution (Kb = 0.52 K/m) is approximately:", options: ["0.052 K", "0.104 K", "0.52 K", "1.04 K"], correct: 1, explanation: "ΔTb = i·Kb·m = 2 × 0.52 × 0.1 = 0.104 K (i=2 for NaCl)" },
  { id: "mt-c10", subject: "Chemistry", topic: "Chemical Kinetics", difficulty: "medium", prompt: "The half-life of a first-order reaction is 693 seconds. The rate constant is:", options: ["10⁻³ s⁻¹", "10⁻² s⁻¹", "0.693 s⁻¹", "1.44 × 10⁻³ s⁻¹"], correct: 0, explanation: "k = 0.693/t½ = 0.693/693 = 10⁻³ s⁻¹" },
  { id: "mt-c11", subject: "Chemistry", topic: "Coordination Chemistry", difficulty: "hard", prompt: "The IUPAC name of [Co(NH₃)₅Cl]Cl₂ is:", options: ["Pentaamminechloridocobalt(III) chloride", "Pentaamminecobalt(III) chloride", "Chloropentaamminecobalt(II) chloride", "Pentaamminechlorocobalt(II) dichloride"], correct: 0, explanation: "Co is +3 (5×0 + 1×(-1) + 2×(-1) = -3, so Co = +3). Name: pentaamminechloridocobalt(III) chloride." },
  { id: "mt-c12", subject: "Chemistry", topic: "s-Block Elements", difficulty: "easy", prompt: "Which alkali metal has the highest ionization energy?", options: ["Na", "K", "Li", "Cs"], correct: 2, explanation: "Li has the smallest atomic radius among alkali metals, so highest IE." },
  { id: "mt-c13", subject: "Chemistry", topic: "p-Block Elements", difficulty: "medium", prompt: "Which allotrope of carbon is the hardest natural substance?", options: ["Graphite", "Fullerene", "Diamond", "Carbon nanotube"], correct: 2, explanation: "Diamond has a 3D tetrahedral network of sp³ carbons, making it the hardest natural substance." },
  { id: "mt-c14", subject: "Chemistry", topic: "Organic Chemistry", difficulty: "hard", prompt: "In SN1 reaction, the rate depends on:", options: ["Concentration of substrate only", "Concentration of nucleophile only", "Both substrate and nucleophile", "Neither"], correct: 0, explanation: "SN1 is unimolecular — rate = k[substrate]. The rate-determining step is carbocation formation." },
  { id: "mt-c15", subject: "Chemistry", topic: "Chemical Bonding", difficulty: "medium", prompt: "The hybridization of Xe in XeF₄ is:", options: ["sp³", "sp³d", "sp³d²", "dsp²"], correct: 2, explanation: "XeF₄: 4 bond pairs + 2 lone pairs = 6 electron pairs → sp³d² hybridization." },
  { id: "mt-c16", subject: "Chemistry", topic: "Polymers", difficulty: "easy", prompt: "Nylon-6,6 is an example of:", options: ["Addition polymer", "Condensation polymer", "Natural polymer", "Copolymer"], correct: 1, explanation: "Nylon-6,6 is formed by condensation of hexamethylenediamine and adipic acid with loss of water." },
  { id: "mt-c17", subject: "Chemistry", topic: "Surface Chemistry", difficulty: "medium", prompt: "Physical adsorption is characterized by:", options: ["High activation energy", "Irreversibility", "Low heat of adsorption", "Chemical bond formation"], correct: 2, explanation: "Physisorption involves weak van der Waals forces, low heat of adsorption (~20-40 kJ/mol), and is reversible." },
  { id: "mt-c18", subject: "Chemistry", topic: "Biomolecules", difficulty: "easy", prompt: "Sucrose on hydrolysis gives:", options: ["Two glucose molecules", "Two fructose molecules", "Glucose and fructose", "Glucose and galactose"], correct: 2, explanation: "Sucrose (C₁₂H₂₂O₁₁) hydrolyzes into one glucose and one fructose molecule." },
  { id: "mt-c19", subject: "Chemistry", topic: "d-Block Elements", difficulty: "hard", prompt: "Which transition metal shows the maximum number of oxidation states?", options: ["Fe", "Cr", "Mn", "Co"], correct: 2, explanation: "Mn shows oxidation states from +2 to +7 (the maximum among 3d elements), as it has 5 unpaired d-electrons." },
  { id: "mt-c20", subject: "Chemistry", topic: "Thermodynamics", difficulty: "medium", prompt: "For a spontaneous process at constant T and P:", options: ["ΔH must be negative", "ΔG must be negative", "ΔS must be positive", "ΔG must be positive"], correct: 1, explanation: "At constant T and P, a process is spontaneous when ΔG < 0 (Gibbs free energy decreases)." },
];

const MATHS_QUESTIONS: MockQuestion[] = [
  { id: "mt-m1", subject: "Maths", topic: "Calculus", difficulty: "easy", prompt: "∫₀¹ x² dx = ?", options: ["1/2", "1/3", "1/4", "1"], correct: 1, explanation: "[x³/3]₀¹ = 1/3" },
  { id: "mt-m2", subject: "Maths", topic: "Algebra", difficulty: "medium", prompt: "If α and β are roots of x² - 5x + 6 = 0, then α³ + β³ = ?", options: ["35", "65", "125", "63"], correct: 0, explanation: "α=2, β=3. α³+β³ = 8+27 = 35. Or use α³+β³ = (α+β)³ - 3αβ(α+β) = 125 - 90 = 35" },
  { id: "mt-m3", subject: "Maths", topic: "Trigonometry", difficulty: "easy", prompt: "sin²(30°) + cos²(30°) = ?", options: ["0", "1/2", "1", "√3/2"], correct: 2, explanation: "Pythagorean identity: sin²θ + cos²θ = 1 for all θ" },
  { id: "mt-m4", subject: "Maths", topic: "Vectors", difficulty: "medium", prompt: "If |a⃗| = 3, |b⃗| = 4, and a⃗·b⃗ = 6, the angle between them is:", options: ["30°", "45°", "60°", "90°"], correct: 2, explanation: "cos θ = a⃗·b⃗/(|a⃗||b⃗|) = 6/12 = 0.5 → θ = 60°" },
  { id: "mt-m5", subject: "Maths", topic: "Calculus", difficulty: "hard", prompt: "d/dx [ln(sin x)] = ?", options: ["cos x / sin x", "1/sin x", "cot x", "tan x"], correct: 2, explanation: "d/dx [ln(sin x)] = (1/sin x)·cos x = cos x/sin x = cot x" },
  { id: "mt-m6", subject: "Maths", topic: "Probability", difficulty: "medium", prompt: "Two dice are thrown. Probability of getting a sum of 7 is:", options: ["1/6", "5/36", "7/36", "1/12"], correct: 0, explanation: "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6" },
  { id: "mt-m7", subject: "Maths", topic: "Coordinate Geometry", difficulty: "easy", prompt: "Distance between points (1,2) and (4,6) is:", options: ["3", "4", "5", "7"], correct: 2, explanation: "d = √[(4-1)² + (6-2)²] = √[9+16] = √25 = 5" },
  { id: "mt-m8", subject: "Maths", topic: "Matrices", difficulty: "medium", prompt: "If A is a 3×3 matrix with |A| = 5, then |3A| = ?", options: ["15", "45", "135", "125"], correct: 2, explanation: "|kA| = k^n|A| where n is the order. |3A| = 3³×5 = 27×5 = 135" },
  { id: "mt-m9", subject: "Maths", topic: "Calculus", difficulty: "hard", prompt: "∫ dx/(x² + 4) = ?", options: ["(1/2)tan⁻¹(x/2) + C", "tan⁻¹(x/2) + C", "ln(x²+4) + C", "(1/4)tan⁻¹(x/2) + C"], correct: 0, explanation: "∫ dx/(x²+a²) = (1/a)tan⁻¹(x/a) + C. Here a=2, so (1/2)tan⁻¹(x/2) + C" },
  { id: "mt-m10", subject: "Maths", topic: "Algebra", difficulty: "easy", prompt: "The sum of first 10 natural numbers is:", options: ["45", "50", "55", "100"], correct: 2, explanation: "S = n(n+1)/2 = 10×11/2 = 55" },
  { id: "mt-m11", subject: "Maths", topic: "Complex Numbers", difficulty: "medium", prompt: "The modulus of (3 + 4i) is:", options: ["5", "7", "√7", "25"], correct: 0, explanation: "|3+4i| = √(3²+4²) = √(9+16) = √25 = 5" },
  { id: "mt-m12", subject: "Maths", topic: "3D Geometry", difficulty: "hard", prompt: "The angle between the planes 2x+y-z=3 and x-y+2z=5 is:", options: ["cos⁻¹(1/6)", "cos⁻¹(-1/6)", "60°", "90°"], correct: 1, explanation: "cos θ = |a₁a₂+b₁b₂+c₁c₂|/(√(a₁²+b₁²+c₁²)·√(a₂²+b₂²+c₂²)) = |2-1-2|/(√6·√6) = 1/6. But actual dot product is -1, so cos⁻¹(-1/6)." },
  { id: "mt-m13", subject: "Maths", topic: "Differential Equations", difficulty: "medium", prompt: "The order and degree of d²y/dx² + (dy/dx)³ = 0 are:", options: ["2, 1", "2, 3", "1, 3", "3, 2"], correct: 0, explanation: "Highest derivative is d²y/dx² → order 2. Its power is 1 → degree 1." },
  { id: "mt-m14", subject: "Maths", topic: "Sequences & Series", difficulty: "easy", prompt: "The 10th term of GP 2, 6, 18, ... is:", options: ["2×3⁹", "2×3¹⁰", "3⁹", "3¹⁰"], correct: 0, explanation: "a = 2, r = 3. T₁₀ = ar⁹ = 2×3⁹" },
  { id: "mt-m15", subject: "Maths", topic: "Limits", difficulty: "medium", prompt: "lim(x→0) sin(5x)/x = ?", options: ["0", "1", "5", "1/5"], correct: 2, explanation: "lim(x→0) sin(5x)/x = lim(x→0) 5·sin(5x)/(5x) = 5×1 = 5" },
  { id: "mt-m16", subject: "Maths", topic: "Permutations", difficulty: "medium", prompt: "The number of ways to arrange the letters of MISSISSIPPI is:", options: ["34650", "39916800", "11!/4!4!2!", "462"], correct: 0, explanation: "11!/(4!×4!×2!) = 39916800/1152 = 34650" },
  { id: "mt-m17", subject: "Maths", topic: "Conic Sections", difficulty: "hard", prompt: "The eccentricity of the ellipse x²/25 + y²/16 = 1 is:", options: ["3/5", "4/5", "5/3", "√(9/25)"], correct: 0, explanation: "a²=25, b²=16, c²=a²-b²=9, e=c/a=3/5" },
  { id: "mt-m18", subject: "Maths", topic: "Determinants", difficulty: "easy", prompt: "If |A| = 3 for a 2×2 matrix, then |A⁻¹| = ?", options: ["3", "1/3", "-3", "9"], correct: 1, explanation: "|A⁻¹| = 1/|A| = 1/3" },
  { id: "mt-m19", subject: "Maths", topic: "Calculus", difficulty: "hard", prompt: "The area bounded by y = x², x-axis, x=0 and x=2 is:", options: ["4/3", "8/3", "4", "2"], correct: 1, explanation: "A = ∫₀² x² dx = [x³/3]₀² = 8/3" },
  { id: "mt-m20", subject: "Maths", topic: "Statistics", difficulty: "easy", prompt: "The variance of the data 2, 4, 6, 8, 10 is:", options: ["4", "6", "8", "10"], correct: 2, explanation: "Mean=6. Variance = [(16+4+0+4+16)/5] = 40/5 = 8" },
];

export const MOCK_TESTS: MockTestConfig[] = [
  {
    id: "jee-mini-1",
    name: "JEE Mini Mock — Set 1",
    duration: 30,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(0, 4), ...CHEMISTRY_QUESTIONS.slice(0, 3), ...MATHS_QUESTIONS.slice(0, 3)],
  },
  {
    id: "jee-mini-2",
    name: "JEE Mini Mock — Set 2",
    duration: 30,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(4), ...CHEMISTRY_QUESTIONS.slice(3, 7), ...MATHS_QUESTIONS.slice(3, 7)],
  },
  {
    id: "jee-full-1",
    name: "JEE Full Mock — Paper 1",
    duration: 60,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(0, 10), ...CHEMISTRY_QUESTIONS.slice(0, 10), ...MATHS_QUESTIONS.slice(0, 10)],
  },
  {
    id: "jee-mini-3",
    name: "JEE Mini Mock — Set 3",
    duration: 30,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(10, 14), ...CHEMISTRY_QUESTIONS.slice(10, 13), ...MATHS_QUESTIONS.slice(10, 13)],
  },
  {
    id: "jee-mini-4",
    name: "JEE Mini Mock — Set 4",
    duration: 30,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(14, 18), ...CHEMISTRY_QUESTIONS.slice(13, 17), ...MATHS_QUESTIONS.slice(13, 17)],
  },
  {
    id: "jee-full-2",
    name: "JEE Full Mock — Paper 2",
    duration: 60,
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    questions: [...PHYSICS_QUESTIONS.slice(10), ...CHEMISTRY_QUESTIONS.slice(10), ...MATHS_QUESTIONS.slice(10)],
  },
];

export function scoreMockTest(test: MockTestConfig, answers: Record<string, number | null>, timeTaken: number): MockTestResult {
  let correct = 0, incorrect = 0, unanswered = 0, score = 0;
  const subjectMap: Record<string, { correct: number; total: number; score: number }> = {};

  test.questions.forEach((q) => {
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0, score: 0 };
    subjectMap[q.subject].total++;

    const ans = answers[q.id];
    if (ans === null || ans === undefined) {
      unanswered++;
      score += test.marking.unanswered;
    } else if (ans === q.correct) {
      correct++;
      score += test.marking.correct;
      subjectMap[q.subject].correct++;
      subjectMap[q.subject].score += test.marking.correct;
    } else {
      incorrect++;
      score += test.marking.incorrect;
      subjectMap[q.subject].score += test.marking.incorrect;
    }
  });

  return {
    testId: test.id,
    testName: test.name,
    answers,
    score,
    maxScore: test.questions.length * test.marking.correct,
    correct,
    incorrect,
    unanswered,
    timeTaken,
    completedAt: new Date().toISOString(),
    subjectBreakdown: Object.entries(subjectMap).map(([subject, data]) => ({ subject, ...data })),
  };
}

const RESULTS_KEY = "bluebottlecap_mock_results";

export function saveMockResult(result: MockTestResult) {
  if (typeof window === "undefined") return;
  const existing = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
  existing.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(existing.slice(-20)));
}

export function getMockResults(): MockTestResult[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
}
