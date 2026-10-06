import { Flashcard } from "../types";

/**
 * Spaced-repetition deck for JEE (Physics, Chemistry, Maths) and
 * NEET (adds Biology).
 *
 * Scope is deliberately narrow: standard results, definitions and named
 * reactions — the things worth recalling instantly in an exam. Anything
 * requiring a multi-step derivation belongs in the question bank, not here,
 * because a flashcard you cannot answer in ten seconds is not a flashcard.
 *
 * Categories drive the UI filter chips automatically (FlashcardDeck derives
 * them from this array), so adding a subject here is all that is needed.
 */
export const flashcardsData: Flashcard[] = [
  // ── Physics ──────────────────────────────────────────────────────────
  { id: "phy-1", category: "Physics", topic: "Simple Harmonic Motion", question: "What is the formula for the time period of a simple pendulum?", answer: "T = 2π√(L/g) — independent of the bob's mass and of amplitude (for small angles)." },
  { id: "phy-2", category: "Physics", topic: "Gravitation", question: "What is the escape velocity from the Earth's surface?", answer: "v_e = √(2gR) ≈ 11.2 km/s" },
  { id: "phy-3", category: "Physics", topic: "Gravitation", question: "What is the orbital velocity of a satellite at distance r from Earth's centre?", answer: "v_o = √(GM/r). At the surface this is v_e/√2 ≈ 7.9 km/s." },
  { id: "phy-4", category: "Physics", topic: "Mechanics", question: "State the work–energy theorem.", answer: "The net work done on a body equals its change in kinetic energy: W_net = ΔKE = ½mv² − ½mu²" },
  { id: "phy-5", category: "Physics", topic: "Mechanics", question: "Newton's second law in its most general form?", answer: "F = dp/dt. It reduces to F = ma only when mass is constant." },
  { id: "phy-6", category: "Physics", topic: "Rotational Motion", question: "Moment of inertia of a solid sphere about a diameter?", answer: "I = (2/5)MR²" },
  { id: "phy-7", category: "Physics", topic: "Rotational Motion", question: "Moment of inertia of a thin uniform rod about its centre, perpendicular to its length?", answer: "I = (1/12)ML². About one end it becomes (1/3)ML²." },
  { id: "phy-8", category: "Physics", topic: "Electrostatics", question: "State Coulomb's law and the value of k.", answer: "F = k·q₁q₂/r² with k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C²" },
  { id: "phy-9", category: "Physics", topic: "Electrostatics", question: "Capacitance of a parallel-plate capacitor?", answer: "C = κε₀A/d — proportional to plate area and dielectric constant, inversely proportional to separation." },
  { id: "phy-10", category: "Physics", topic: "Current Electricity", question: "How does resistance depend on the dimensions of a conductor?", answer: "R = ρL/A — proportional to length, inversely proportional to cross-sectional area." },
  { id: "phy-11", category: "Physics", topic: "Magnetism", question: "Force on a charge moving in a magnetic field?", answer: "F = qvB·sinθ, direction given by the right-hand rule. Combined with the electric force: F = q(E + v × B)." },
  { id: "phy-12", category: "Physics", topic: "Electromagnetic Induction", question: "State Faraday's law and Lenz's law.", answer: "ε = −N·dΦ/dt. The minus sign is Lenz's law: the induced current opposes the change producing it (conservation of energy)." },
  { id: "phy-13", category: "Physics", topic: "Optics", question: "State the lens formula and the mirror formula.", answer: "Lens: 1/v − 1/u = 1/f.  Mirror: 1/v + 1/u = 1/f.  (Cartesian sign convention.)" },
  { id: "phy-14", category: "Physics", topic: "Optics", question: "State Snell's law.", answer: "n₁·sinθ₁ = n₂·sinθ₂. Total internal reflection occurs beyond the critical angle when travelling into a rarer medium." },
  { id: "phy-15", category: "Physics", topic: "Modern Physics", question: "What is the de Broglie wavelength?", answer: "λ = h/p = h/(mv). For an electron accelerated through V volts: λ ≈ 1.226/√V nm." },
  { id: "phy-16", category: "Physics", topic: "Modern Physics", question: "State Einstein's photoelectric equation.", answer: "hν = φ + KE_max, where φ is the work function. Below the threshold frequency no emission occurs regardless of intensity." },
  { id: "phy-17", category: "Physics", topic: "Nuclear Physics", question: "Relate half-life to the decay constant.", answer: "t½ = ln2/λ ≈ 0.693/λ" },
  { id: "phy-18", category: "Physics", topic: "Thermodynamics", question: "State the first law of thermodynamics.", answer: "ΔU = Q − W — heat supplied to a system either raises its internal energy or does work." },
  { id: "phy-19", category: "Physics", topic: "Thermodynamics", question: "Efficiency of a Carnot engine?", answer: "η = 1 − T_cold/T_hot, with temperatures in kelvin. This is the maximum possible for those two reservoirs." },
  { id: "phy-20", category: "Physics", topic: "Waves", question: "Relate wave speed, frequency and wavelength.", answer: "v = fλ. For a stretched string, v = √(T/μ) where μ is mass per unit length." },

  // ── Chemistry ────────────────────────────────────────────────────────
  { id: "chem-1", category: "Chemistry", topic: "Organic Chemistry", question: "What reagent is used in the Clemmensen reduction?", answer: "Zn-Hg (zinc amalgam) with concentrated HCl. Reduces C=O to CH₂ under acidic conditions." },
  { id: "chem-2", category: "Chemistry", topic: "Organic Chemistry", question: "What reagent is used in the Wolff–Kishner reduction?", answer: "NH₂NH₂ (hydrazine) with KOH in ethylene glycol. Same C=O → CH₂ conversion as Clemmensen, but under basic conditions." },
  { id: "chem-3", category: "Chemistry", topic: "Organic Chemistry", question: "State Markovnikov's rule.", answer: "In the addition of HX to an unsymmetrical alkene, hydrogen attaches to the carbon already bearing more hydrogens — the route through the more stable carbocation." },
  { id: "chem-4", category: "Chemistry", topic: "Organic Chemistry", question: "Which aldehydes undergo the Cannizzaro reaction, and what is formed?", answer: "Aldehydes with no α-hydrogen (e.g. HCHO, benzaldehyde). They disproportionate under strong base into an alcohol and a carboxylate salt." },
  { id: "chem-5", category: "Chemistry", topic: "Organic Chemistry", question: "What is a Grignard reagent and what does it do to a ketone?", answer: "RMgX, made from an alkyl halide and Mg in dry ether. Adding it to a ketone then hydrolysing gives a tertiary alcohol. It is destroyed by water." },
  { id: "chem-6", category: "Chemistry", topic: "Atomic Structure", question: "State the Aufbau principle, Hund's rule and the Pauli exclusion principle.", answer: "Aufbau: fill lowest energy orbitals first. Hund: singly occupy degenerate orbitals before pairing. Pauli: no two electrons share all four quantum numbers." },
  { id: "chem-7", category: "Chemistry", topic: "Atomic Structure", question: "How many radial nodes and angular nodes does an orbital have?", answer: "Radial nodes = n − l − 1; angular nodes = l; total nodes = n − 1." },
  { id: "chem-8", category: "Chemistry", topic: "Chemical Bonding", question: "What shape and bond angle correspond to sp³, sp² and sp hybridisation?", answer: "sp³ tetrahedral 109.5°, sp² trigonal planar 120°, sp linear 180°." },
  { id: "chem-9", category: "Chemistry", topic: "Chemical Bonding", question: "How is bond order calculated in molecular orbital theory?", answer: "Bond order = (N_bonding − N_antibonding)/2. N₂ has order 3, O₂ has order 2 with two unpaired electrons (hence paramagnetic)." },
  { id: "chem-10", category: "Chemistry", topic: "Equilibrium", question: "State Le Chatelier's principle.", answer: "A system at equilibrium subjected to a change in concentration, pressure or temperature shifts so as to partly counteract that change." },
  { id: "chem-11", category: "Chemistry", topic: "Ionic Equilibrium", question: "State the Henderson–Hasselbalch equation.", answer: "pH = pKa + log([salt]/[acid]). Buffering is most effective when pH ≈ pKa." },
  { id: "chem-12", category: "Chemistry", topic: "Electrochemistry", question: "State the Nernst equation at 298 K.", answer: "E = E° − (0.0591/n)·log Q" },
  { id: "chem-13", category: "Chemistry", topic: "Electrochemistry", question: "State Faraday's first law of electrolysis.", answer: "m = (M·I·t)/(n·F), with F = 96500 C/mol. Mass deposited is proportional to charge passed." },
  { id: "chem-14", category: "Chemistry", topic: "Chemical Kinetics", question: "State the Arrhenius equation.", answer: "k = A·e^(−Ea/RT). Raising temperature or lowering activation energy increases the rate constant." },
  { id: "chem-15", category: "Chemistry", topic: "Chemical Kinetics", question: "What is the half-life of a first-order reaction?", answer: "t½ = 0.693/k — independent of initial concentration, which is the signature of first-order kinetics." },
  { id: "chem-16", category: "Chemistry", topic: "Solutions", question: "Name the four colligative properties.", answer: "Relative lowering of vapour pressure, boiling point elevation, freezing point depression, and osmotic pressure. All depend on the number of solute particles, not their identity." },
  { id: "chem-17", category: "Chemistry", topic: "Thermodynamics", question: "What determines spontaneity of a reaction?", answer: "ΔG = ΔH − TΔS. The process is spontaneous when ΔG < 0." },
  { id: "chem-18", category: "Chemistry", topic: "Periodic Table", question: "How do atomic radius and ionisation energy vary across a period and down a group?", answer: "Across a period: radius decreases, ionisation energy increases. Down a group: radius increases, ionisation energy decreases." },
  { id: "chem-19", category: "Chemistry", topic: "Coordination Compounds", question: "What does a strong field ligand do in crystal field theory?", answer: "It causes large splitting (Δ), favouring electron pairing — giving a low-spin, often diamagnetic complex. Spectrochemical order: I⁻ < Br⁻ < Cl⁻ < F⁻ < H₂O < NH₃ < en < CN⁻ < CO." },
  { id: "chem-20", category: "Chemistry", topic: "Polymers", question: "What distinguishes addition from condensation polymers? Give one example of each.", answer: "Addition polymers form without loss of a small molecule (polythene). Condensation polymers release one, usually water (nylon-6,6, terylene)." },

  // ── Mathematics ──────────────────────────────────────────────────────
  { id: "math-1", category: "Mathematics", topic: "Quadratic Equations", question: "For ax² + bx + c = 0, what are the roots, the sum and the product?", answer: "x = [−b ± √(b²−4ac)]/2a; sum = −b/a; product = c/a." },
  { id: "math-2", category: "Mathematics", topic: "Quadratic Equations", question: "What does the discriminant tell you?", answer: "D = b² − 4ac. D > 0 two distinct real roots; D = 0 equal real roots; D < 0 complex conjugate roots." },
  { id: "math-3", category: "Mathematics", topic: "Sequences & Series", question: "Sum of n terms of an AP and of a GP?", answer: "AP: Sₙ = n/2·[2a + (n−1)d].  GP: Sₙ = a(1−rⁿ)/(1−r) for r ≠ 1; S∞ = a/(1−r) when |r| < 1." },
  { id: "math-4", category: "Mathematics", topic: "Binomial Theorem", question: "What is the general term in the expansion of (x + y)ⁿ?", answer: "T_(r+1) = ⁿCᵣ · x^(n−r) · y^r" },
  { id: "math-5", category: "Mathematics", topic: "Permutations & Combinations", question: "Distinguish ⁿPᵣ from ⁿCᵣ.", answer: "ⁿPᵣ = n!/(n−r)! counts arrangements (order matters); ⁿCᵣ = n!/[r!(n−r)!] counts selections (order does not)." },
  { id: "math-6", category: "Mathematics", topic: "Calculus", question: "State the product, quotient and chain rules.", answer: "(uv)′ = u′v + uv′;  (u/v)′ = (u′v − uv′)/v²;  d/dx f(g(x)) = f′(g(x))·g′(x)." },
  { id: "math-7", category: "Mathematics", topic: "Calculus", question: "Derivatives of sin x, cos x, tan x, eˣ and ln x?", answer: "cos x, −sin x, sec²x, eˣ, and 1/x respectively." },
  { id: "math-8", category: "Mathematics", topic: "Calculus", question: "State the integration by parts formula.", answer: "∫u·dv = uv − ∫v·du. Choose u by ILATE: Inverse, Log, Algebraic, Trig, Exponential." },
  { id: "math-9", category: "Mathematics", topic: "Calculus", question: "What is ∫xⁿ dx, and what is the exception?", answer: "x^(n+1)/(n+1) + C for n ≠ −1. When n = −1 the integral is ln|x| + C." },
  { id: "math-10", category: "Mathematics", topic: "Limits", question: "Evaluate lim(x→0) sin x / x and lim(x→0) (1 + x)^(1/x).", answer: "The first is 1; the second is e." },
  { id: "math-11", category: "Mathematics", topic: "Coordinate Geometry", question: "Equation of a circle with centre (h, k) and radius r?", answer: "(x − h)² + (y − k)² = r². General form x² + y² + 2gx + 2fy + c = 0 has centre (−g, −f) and radius √(g² + f² − c)." },
  { id: "math-12", category: "Mathematics", topic: "Coordinate Geometry", question: "Distance from a point (x₁, y₁) to the line ax + by + c = 0?", answer: "|ax₁ + by₁ + c| / √(a² + b²)" },
  { id: "math-13", category: "Mathematics", topic: "Conic Sections", question: "Standard equation of a parabola, ellipse and hyperbola?", answer: "Parabola y² = 4ax; ellipse x²/a² + y²/b² = 1; hyperbola x²/a² − y²/b² = 1." },
  { id: "math-14", category: "Mathematics", topic: "Vectors", question: "Distinguish the dot product from the cross product.", answer: "a·b = |a||b|cosθ gives a scalar, zero when perpendicular. a×b = |a||b|sinθ·n̂ gives a vector, zero when parallel." },
  { id: "math-15", category: "Mathematics", topic: "Matrices & Determinants", question: "How do you find the inverse of a matrix, and when does it exist?", answer: "A⁻¹ = adj(A)/|A|, which exists only when |A| ≠ 0 (non-singular)." },
  { id: "math-16", category: "Mathematics", topic: "Complex Numbers", question: "State De Moivre's theorem.", answer: "(cosθ + i·sinθ)ⁿ = cos(nθ) + i·sin(nθ)" },
  { id: "math-17", category: "Mathematics", topic: "Complex Numbers", question: "What is the modulus of z = a + ib, and what is i²?", answer: "|z| = √(a² + b²), and i² = −1. Powers of i cycle with period 4." },
  { id: "math-18", category: "Mathematics", topic: "Trigonometry", question: "State the sine rule and the cosine rule.", answer: "a/sinA = b/sinB = c/sinC = 2R;  c² = a² + b² − 2ab·cosC." },
  { id: "math-19", category: "Mathematics", topic: "Probability", question: "State Bayes' theorem.", answer: "P(A|B) = P(B|A)·P(A) / P(B)" },
  { id: "math-20", category: "Mathematics", topic: "Probability", question: "Mean and variance of a binomial distribution?", answer: "Mean = np, variance = npq, where q = 1 − p." },

  // ── Biology (NEET) ───────────────────────────────────────────────────
  { id: "bio-1", category: "Biology", topic: "Cell Biology", question: "Why is the mitochondrion called the powerhouse of the cell?", answer: "It produces most of the cell's ATP via oxidative phosphorylation on the inner membrane (cristae). It has its own circular DNA and 70S ribosomes." },
  { id: "bio-2", category: "Biology", topic: "Cell Biology", question: "Which organelle is the site of protein synthesis, and what distinguishes prokaryotic ribosomes?", answer: "The ribosome. Prokaryotes have 70S (50S + 30S); eukaryotes have 80S (60S + 40S)." },
  { id: "bio-3", category: "Biology", topic: "Human Physiology", question: "What is the functional unit of the kidney and what does it do?", answer: "The nephron — it filters blood at the glomerulus, then reabsorbs and secretes along the tubule to form urine." },
  { id: "bio-4", category: "Biology", topic: "Human Physiology", question: "Trace the path of blood through the four chambers of the heart.", answer: "Body → right atrium → right ventricle → lungs → left atrium → left ventricle → body. The left ventricle is the thickest chamber." },
  { id: "bio-5", category: "Biology", topic: "Human Physiology", question: "Which cells secrete insulin and glucagon, and what do they do?", answer: "Beta cells of the islets of Langerhans secrete insulin (lowers blood glucose); alpha cells secrete glucagon (raises it)." },
  { id: "bio-6", category: "Biology", topic: "Genetics", question: "State Mendel's three laws.", answer: "Dominance; Segregation (alleles separate in gamete formation); Independent Assortment (applies to genes on different chromosomes)." },
  { id: "bio-7", category: "Biology", topic: "Genetics", question: "What are the phenotypic and genotypic ratios of a monohybrid and a dihybrid cross?", answer: "Monohybrid F₂: 3:1 phenotypic, 1:2:1 genotypic. Dihybrid F₂: 9:3:3:1 phenotypic." },
  { id: "bio-8", category: "Biology", topic: "Genetics", question: "What is a test cross used for?", answer: "Crossing an individual showing the dominant phenotype with a homozygous recessive, to determine whether it is homozygous or heterozygous." },
  { id: "bio-9", category: "Biology", topic: "Molecular Biology", question: "State the central dogma of molecular biology.", answer: "DNA → RNA → Protein, by replication, transcription and translation. Retroviruses reverse the first step using reverse transcriptase." },
  { id: "bio-10", category: "Biology", topic: "Molecular Biology", question: "Why is DNA replication described as semiconservative?", answer: "Each daughter molecule keeps one parental strand and one newly synthesised strand — shown by the Meselson–Stahl experiment." },
  { id: "bio-11", category: "Biology", topic: "Molecular Biology", question: "Which enzyme transcribes mRNA in eukaryotes?", answer: "RNA polymerase II. Polymerase I makes rRNA and polymerase III makes tRNA." },
  { id: "bio-12", category: "Biology", topic: "Plant Physiology", question: "Write the overall equation of photosynthesis and name the sites of its two stages.", answer: "6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O. Light reactions occur on the thylakoid membrane; the Calvin cycle in the stroma." },
  { id: "bio-13", category: "Biology", topic: "Plant Physiology", question: "How do C₄ plants differ from C₃ plants?", answer: "C₄ plants have Kranz anatomy and concentrate CO₂ in bundle-sheath cells, largely avoiding photorespiration — so they are more efficient in hot, dry conditions." },
  { id: "bio-14", category: "Biology", topic: "Plant Physiology", question: "Name the main plant hormones and one role of each.", answer: "Auxin (cell elongation, apical dominance), gibberellin (stem elongation), cytokinin (cell division), abscisic acid (stomatal closure, dormancy), ethylene (fruit ripening)." },
  { id: "bio-15", category: "Biology", topic: "Cell Division", question: "How does meiosis differ from mitosis?", answer: "Mitosis gives two diploid identical cells. Meiosis gives four haploid genetically varied cells via two divisions, with crossing over in prophase I." },
  { id: "bio-16", category: "Biology", topic: "Ecology", question: "State the 10% law of energy flow.", answer: "Roughly 10% of energy transfers from one trophic level to the next; the rest is lost mainly as heat. This limits food chains to 4–5 levels." },
  { id: "bio-17", category: "Biology", topic: "Ecology", question: "Which ecological pyramid is always upright, and why?", answer: "The pyramid of energy — energy is lost at each transfer, so it can never increase upward. Pyramids of number and biomass can invert." },
  { id: "bio-18", category: "Biology", topic: "Evolution", question: "What do Darwin's finches illustrate?", answer: "Adaptive radiation — one ancestral species diversifying into many, each with beak morphology suited to a different food source." },
  { id: "bio-19", category: "Biology", topic: "Biomolecules", question: "How does enzyme activity respond to temperature and pH?", answer: "Activity peaks at an optimum and falls either side; beyond the optimum the enzyme denatures as its active site loses shape. Enzymes lower activation energy without being consumed." },
  { id: "bio-20", category: "Biology", topic: "Human Physiology", question: "What is the structure of haemoglobin and what shifts its dissociation curve right?", answer: "Four subunits (2α + 2β), each with a haem iron binding one O₂. The curve shifts right — releasing more O₂ — with higher CO₂, higher temperature and lower pH (the Bohr effect)." },
];
