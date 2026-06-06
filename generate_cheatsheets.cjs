const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const downloadsDir = path.join(__dirname, 'public', 'downloads');
fs.mkdirSync(downloadsDir, { recursive: true });

function formatHeader(doc, title, subtitle) {
  // Title
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#0F172A').text(title, { align: 'center' });
  doc.moveDown(0.2);
  
  // Subtitle
  doc.font('Helvetica-Oblique').fontSize(10).fillColor('#64748B').text(subtitle, { align: 'center' });
  doc.moveDown(0.8);
  
  // Top horizontal line divider
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
  doc.moveDown(1);
}

function formatSectionHeader(doc, title) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1E3A8A').text(title);
  doc.moveDown(0.4);
}

function formatFormulaRow(doc, label, formula) {
  const currentY = doc.y;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#334155').text(label, 60, currentY, { width: 180 });
  doc.font('Courier-Bold').fontSize(9.5).fillColor('#0284C7').text(formula, 250, currentY, { width: 300 });
  doc.moveDown(0.6);
  doc.x = 50;
}

function formatDescription(doc, text) {
  doc.font('Helvetica').fontSize(9.5).fillColor('#475569').text(text, 50, doc.y, { align: 'justify', lineGap: 2 });
  doc.moveDown(0.6);
}

function formatBullet(doc, text) {
  doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text(`•  ${text}`, 65, doc.y, { lineGap: 2 });
  doc.moveDown(0.45);
  doc.x = 50;
}

// ==========================================
// 1. GENERATE PHYSICS DERIVATIONS PDF
// ==========================================
function generatePhysicsPDF() {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(downloadsDir, 'physics-derivations.pdf');
  doc.pipe(fs.createWriteStream(filePath));
  
  formatHeader(doc, 'JEE PHYSICS FORMULAS & DERIVATIONS', 'Comprehensive Quick-Reference Sheet (Kinematics, Rotational Dynamics, & Waves)');

  // SECTION 1: KINEMATICS
  formatSectionHeader(doc, '1. Kinematics & Projectile Motion');
  
  formatDescription(doc, 'Equations of Motion (Constant Acceleration): These linear differential derivations relate displacement (s), initial velocity (u), final velocity (v), acceleration (a), and time (t) under constant gravity field assumptions.');
  formatFormulaRow(doc, 'Velocity-Time Relation', 'v = u + a * t');
  formatFormulaRow(doc, 'Displacement-Time Relation', 's = u*t + 0.5 * a * t^2');
  formatFormulaRow(doc, 'Velocity-Displacement Relation', 'v^2 = u^2 + 2 * a * s');
  
  formatDescription(doc, 'Projectile Motion: In a uniform two-dimensional coordinate framework with horizontal launch angle theta (θ) and constant gravity vector g.');
  formatFormulaRow(doc, 'Time of Flight (T)', 'T = (2 * u * sin(theta)) / g');
  formatFormulaRow(doc, 'Maximum Height (H)', 'H = (u^2 * (sin(theta))^2) / (2 * g)');
  formatFormulaRow(doc, 'Horizontal Range (R)', 'R = (u^2 * sin(2 * theta)) / g');
  formatFormulaRow(doc, 'Equation of Trajectory', 'y = x * tan(theta) - (g * x^2) / (2 * u^2 * (cos(theta))^2)');

  // SECTION 2: ROTATIONAL DYNAMICS
  formatSectionHeader(doc, '2. Rotational Dynamics & Moment of Inertia');
  
  formatDescription(doc, 'Moment of Inertia (I): Represents the rotational inertia about a specified rigid body rotational axis, calculated via integral r^2 dm.');
  formatFormulaRow(doc, 'Thin Ring (Radius R)', 'I = M * R^2');
  formatFormulaRow(doc, 'Solid Disc (Radius R)', 'I = 0.5 * M * R^2');
  formatFormulaRow(doc, 'Solid Sphere (Radius R)', 'I = 0.4 * M * R^2   [2/5 MR^2]');
  formatFormulaRow(doc, 'Hollow Sphere (Radius R)', 'I = 0.67 * M * R^2  [2/3 MR^2]');
  formatFormulaRow(doc, 'Thin Rod (Length L, Center)', 'I = (1/12) * M * L^2');
  
  formatDescription(doc, 'Theorems & Kinetic Equations: Transforming translational constraints into angular system parameters.');
  formatFormulaRow(doc, 'Parallel Axis Theorem', 'I = I_cm + M * d^2');
  formatFormulaRow(doc, 'Perpendicular Axis Theorem', 'I_z = I_x + I_y   [For planar laminas]');
  formatFormulaRow(doc, 'Torque Equation', 'tau = I * alpha = r x F');
  formatFormulaRow(doc, 'Angular Momentum', 'L = I * omega = r x p');
  formatFormulaRow(doc, 'Rolling Kinetic Energy', 'K = 0.5 * M * v^2 + 0.5 * I * omega^2');

  doc.addPage();
  formatHeader(doc, 'JEE PHYSICS FORMULAS & DERIVATIONS', 'Part 2: Oscillations, Waves & Acoustic Doppler Principles');

  // SECTION 3: OSCILLATIONS & SHM
  formatSectionHeader(doc, '3. Simple Harmonic Motion (SHM)');
  
  formatDescription(doc, 'Simple Harmonic Motion: Governed by a linear restoring force proportional to displacement. The motion exhibits a sinusoidal pattern centered around a stable equilibrium state.');
  formatFormulaRow(doc, 'Differential Equation', 'd^2x/dt^2 + omega^2 * x = 0');
  formatFormulaRow(doc, 'Angular Frequency (omega)', 'omega = sqrt(k / m) = 2 * pi * f');
  formatFormulaRow(doc, 'Displacement (x)', 'x(t) = A * sin(omega * t + phi)');
  formatFormulaRow(doc, 'Velocity (v)', 'v(t) = A * omega * cos(omega * t + phi) = +/- omega * sqrt(A^2 - x^2)');
  formatFormulaRow(doc, 'Acceleration (a)', 'a(t) = - (omega^2) * x(t)');
  formatFormulaRow(doc, 'Simple Pendulum Period', 'T = 2 * pi * sqrt(L / g)');

  // SECTION 4: WAVE MECHANICS & ACOUSTIC EFFECTS
  formatSectionHeader(doc, '4. Wave Mechanics & Doppler Effect');
  
  formatDescription(doc, 'Wave Equations: Mathematical representation of localized energy propagation through spatial-temporal coordinates.');
  formatFormulaRow(doc, 'Wave Equation', 'y(x,t) = A * sin(k*x - omega*t + phi)');
  formatFormulaRow(doc, 'Wave Number (k)', 'k = 2 * pi / lambda');
  formatFormulaRow(doc, 'Wave Speed (v)', 'v = f * lambda = omega / k');
  
  formatDescription(doc, 'Doppler Effect: The apparent shift in acoustic pitch frequency detected by an observer moving relative to a sound emitter wave source.');
  formatFormulaRow(doc, 'General Doppler Formula', "f' = f * [(v +/- v_observer) / (v -/+ v_source)]");
  formatDescription(doc, 'Rule of Signs: Use the upper signs when the source/observer move toward each other (frequency rises). Use the lower signs when they move away (frequency drops).');

  doc.end();
  console.log('Generated Physics derivations PDF.');
}

// ==========================================
// 2. GENERATE CHEMISTRY REACTION MAP PDF
// ==========================================
function generateChemistryPDF() {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(downloadsDir, 'chemistry-reactions.pdf');
  doc.pipe(fs.createWriteStream(filePath));
  
  formatHeader(doc, 'JEE CHEMISTRY REACTION MAPS', 'Organic Synthesis Paths & Coordination Compound Split Kinetics');

  // SECTION 1: ORGANIC SYNTHESIS
  formatSectionHeader(doc, '1. Key Organic Reactions & Pathways');
  
  formatDescription(doc, 'Grignard Reagents (RMgX): Organometallic intermediates acting as highly polar nucleophiles. They react with carbonyl groups to build carbon-carbon bonds.');
  formatFormulaRow(doc, 'Active Hydrogens (Acid-Base)', 'RMgX + H2O -> RH + Mg(OH)X');
  formatFormulaRow(doc, 'Formaldehyde Addition', 'RMgX + HCHO -> Primary Alcohol (1 Degree)');
  formatFormulaRow(doc, 'Other Aldehydes', "RMgX + R'CHO -> Secondary Alcohol (2 Degree)");
  formatFormulaRow(doc, 'Ketones Addition', "RMgX + R'COR'' -> Tertiary Alcohol (3 Degree)");
  formatFormulaRow(doc, 'Carbon Dioxide Addition', 'RMgX + CO2 -> R-COOH (Carboxylic Acid)');
  
  formatDescription(doc, 'Aldol & Cannizzaro Condensations: Carbonyl coupling pathways dictated by the presence of acidic alpha-hydrogen atoms.');
  formatFormulaRow(doc, 'Aldol (with alpha-H)', '2 R-CH2-CHO + dil. NaOH -> beta-hydroxy aldehyde');
  formatFormulaRow(doc, 'Cannizzaro (no alpha-H)', '2 HCHO + conc. NaOH -> CH3OH + HCOONa  [Disproportionation]');
  
  formatDescription(doc, 'Electrophilic Aromatic Substitutions: Reagents reacting with aromatic benzene rings.');
  formatFormulaRow(doc, 'Benzene Nitration', 'C6H6 + HNO3/H2SO4 -> C6H5-NO2 + H2O');
  formatFormulaRow(doc, 'Friedel-Crafts Alkylation', 'C6H6 + R-Cl + anhydrous AlCl3 -> C6H5-R + HCl');
  formatFormulaRow(doc, 'Friedel-Crafts Acylation', 'C6H6 + R-CO-Cl + anhydrous AlCl3 -> C6H5-CO-R + HCl');

  // SECTION 2: SUBSTITUTION KINETICS
  formatSectionHeader(doc, '2. Nucleophilic Substitutions (SN1 vs SN2)');
  formatFormulaRow(doc, 'SN1 Rate Kinetics', 'Rate = k * [Substrate]   [2-Step, Carbocation Intermediate]');
  formatFormulaRow(doc, 'SN2 Rate Kinetics', 'Rate = k * [Substrate] * [Nu-]   [1-Step, Walden Inversion]');
  formatDescription(doc, 'SN1 pathways are favored by polar protic solvents, tertiary structures, and stable carbocations. SN2 pathways are favored by polar aprotic solvents, primary structures, and low steric hindrance.');

  doc.addPage();
  formatHeader(doc, 'JEE CHEMISTRY REACTION MAPS', 'Part 2: Crystal Field Split Energies & Kinetic Stability');

  // SECTION 3: COORDINATION SCHEMES
  formatSectionHeader(doc, '3. Crystal Field Theory (CFT)');
  
  formatDescription(doc, 'Crystal Field Splitting (d-Orbitals): The electrostatic approach of ligands lifts the degeneracy of metal d-orbitals. In octahedral fields, the energy splits into lower t2g and upper eg levels.');
  formatFormulaRow(doc, 'Octahedral Splitting (Do)', 'Splits into t2g (d_xy, d_yz, d_xz) & eg (d_x2-y2, d_z2)');
  formatFormulaRow(doc, 'Tetrahedral Splitting (Dt)', 'Dt = (4/9) * Do   [e is lower energy, t2 is higher]');
  formatFormulaRow(doc, 'CFSE calculation (Oct)', 'CFSE = [ -0.4 * n(t2g) + 0.6 * n(eg) ] * Do + m * P');
  formatDescription(doc, 'Where n(t2g) and n(eg) are electron populations, Do is the splitting constant, P is the pairing energy, and m is the number of electron pairs in the d-orbitals.');

  // SECTION 4: COORDINATION KINETICS
  formatSectionHeader(doc, '4. Kinetic & Thermodynamic Stability');
  formatFormulaRow(doc, 'Stepwise Formation Const.', 'K_n = [ML_n] / ([ML_(n-1)] * [L])');
  formatFormulaRow(doc, 'Overall Stability (Beta_n)', 'Beta_n = K_1 * K_2 * ... * K_n');
  formatDescription(doc, 'A high thermodynamic stability constant (log Beta) denotes a strong ligand-metal coordinate interaction. High kinetic inertness signifies slow rate exchange of ligands (e.g., d3 or low-spin d6 complexes).');

  doc.end();
  console.log('Generated Chemistry reaction mapping PDF.');
}

// ==========================================
// 3. GENERATE MATH INTEGRATION PDF
// ==========================================
function generateMathPDF() {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(downloadsDir, 'math-integration.pdf');
  doc.pipe(fs.createWriteStream(filePath));
  
  formatHeader(doc, 'JEE MATHEMATICS FORMULA VAULT', 'Complete Derivatives, Integrals & Spatial Vector Matrix Math');

  // SECTION 1: DERIVATIVES & LIMITS
  formatSectionHeader(doc, '1. Derivatives & Standard Limits');
  
  formatFormulaRow(doc, 'Trig Limit', 'lim (x->0) [sin(x) / x] = 1');
  formatFormulaRow(doc, 'Exponential Limit', 'lim (x->0) [ (e^x - 1) / x ] = 1');
  formatFormulaRow(doc, 'Logarithmic Limit', 'lim (x->0) [ ln(1+x) / x ] = 1');
  formatFormulaRow(doc, 'Derivative of Inverse Sin', 'd/dx [ sin^-1(x) ] = 1 / sqrt(1 - x^2)');
  formatFormulaRow(doc, 'Derivative of Inverse Tan', 'd/dx [ tan^-1(x) ] = 1 / (1 + x^2)');
  formatFormulaRow(doc, 'Derivative of Inverse Sec', 'd/dx [ sec^-1(x) ] = 1 / (|x| * sqrt(x^2 - 1))');

  // SECTION 2: INTEGRATION TECHNIQUES
  formatSectionHeader(doc, '2. Integration Techniques & Formulas');
  
  formatFormulaRow(doc, 'Integration by Parts', 'Integral [ u * dv ] = u * v - Integral [ v * du ]');
  formatDescription(doc, 'ILATE Priority: Select the term "u" according to: Inverse trigonometric, Logarithmic, Algebraic, Trigonometric, and Exponential functions.');
  
  formatFormulaRow(doc, 'Standard integral type A', 'Integral [ dx / (x^2 - a^2) ] = (1/(2*a)) * ln| (x-a)/(x+a) | + C');
  formatFormulaRow(doc, 'Standard integral type B', 'Integral [ dx / (a^2 - x^2) ] = (1/(2*a)) * ln| (a+x)/(a-x) | + C');
  formatFormulaRow(doc, 'Standard integral type C', 'Integral [ dx / (x^2 + a^2) ] = (1/a) * tan^-1(x/a) + C');
  formatFormulaRow(doc, 'Standard integral type D', 'Integral [ dx / sqrt(a^2 - x^2) ] = sin^-1(x/a) + C');
  formatFormulaRow(doc, 'Standard integral type E', 'Integral [ dx / sqrt(x^2 +/- a^2) ] = ln| x + sqrt(x^2 +/- a^2) | + C');
  formatFormulaRow(doc, 'Standard integral type F', 'Integral [ sqrt(a^2 - x^2) dx ] = (x/2)*sqrt(a^2 - x^2) + (a^2/2)*sin^-1(x/a) + C');

  doc.addPage();
  formatHeader(doc, 'JEE MATHEMATICS FORMULA VAULT', 'Part 2: Vector Spaces, Determinants, & Linear Equation Matrices');

  // SECTION 3: VECTOR ALGEBRA
  formatSectionHeader(doc, '3. Vector Dot, Cross, & Triple Products');
  
  formatDescription(doc, 'Vectors are represented in 3D coordinate space with orthogonal unit vectors i, j, k.');
  formatFormulaRow(doc, 'Vector Dot Product', 'A . B = A_x*B_x + A_y*B_y + A_z*B_z = |A| * |B| * cos(theta)');
  formatFormulaRow(doc, 'Vector Cross Product', 'A x B = Determinant matrix of [ [i, j, k], [Ax, Ay, Az], [Bx, By, Bz] ]');
  formatFormulaRow(doc, 'Cross Product Magnitude', '|A x B| = |A| * |B| * sin(theta)');
  formatFormulaRow(doc, 'Vector Triple Product', 'A x (B x C) = (A . C) * B - (A . B) * C');
  formatFormulaRow(doc, 'Scalar Triple Product', '[A B C] = A . (B x C)   [Volume of parallelopiped]');

  // SECTION 4: DETERMINANTS & CRAMER RULE
  formatSectionHeader(doc, '4. Matrices, Cramer Rule, & Inverse Algebra');
  
  formatDescription(doc, 'Cramer Rule: Solves sets of simultaneous linear equations by checking ratios of determinant values.');
  formatFormulaRow(doc, 'Variables Solve Ratios', 'x = D_x / D,   y = D_y / D,   z = D_z / D   [For D !== 0]');
  formatDescription(doc, '1. If D !== 0: System has a unique solution (Consistent). \n2. If D === 0 and at least one D_i !== 0: System has no solution (Inconsistent). \n3. If D === 0 and all D_i === 0: System has infinitely many solutions.');
  
  formatFormulaRow(doc, 'Matrix Inverse Rule', 'A^-1 = (1 / |A|) * adj(A)   [For non-singular |A| !== 0]');

  doc.end();
  console.log('Generated Mathematics formula vault PDF.');
}

// ==========================================
// 4. GENERATE COMPLETE JEE SYLLABUS OUTLINE PDF
// ==========================================
function generateSyllabusPDF() {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(downloadsDir, 'jee-syllabus.pdf');
  doc.pipe(fs.createWriteStream(filePath));
  
  formatHeader(doc, 'OFFICIAL JEE MAINS & ADVANCED SYLLABUS', 'Complete Curricular Outline (Class 11 & Class 12 Coursework)');

  // SECTION 1: PHYSICS
  formatSectionHeader(doc, '1. Physics Syllabus Core Topics');
  
  formatDescription(doc, 'Class 11 Physics Topics: Foundation of classical mechanics, gravity dynamics, kinetic theories, thermodynamic cycles, and wave mechanics.');
  formatBullet(doc, 'Units and Dimensions: Dimensional Analysis, Least count, Vernier Callipers, Screw Gauge errors.');
  formatBullet(doc, 'Kinematics: Projectiles, Frame of Reference, Relative Velocity, Uniform/Non-uniform motion.');
  formatBullet(doc, 'Laws of Motion: Newton\'s Laws, Friction coefficients, Centripetal & Coriolis pseudo forces.');
  formatBullet(doc, 'Work, Energy and Power: Work-Energy Theorem, Conservative forces, Elastic collisions.');
  formatBullet(doc, 'Rotational Motion: Angular momentum, Moment of Inertia, Rolling and Torque dynamics.');
  formatBullet(doc, 'Gravitation: Kepler\'s Laws, Escaping Velocity, Satellite orbits potentials.');
  formatBullet(doc, 'Properties of Solids and Liquids: Young\'s Modulus, Surface Tension, Viscosity, Bernoulli theorem.');
  formatBullet(doc, 'Thermodynamics: Heat engine Carnot efficiency, Second Law, isothermal/adiabatic expansions.');
  formatBullet(doc, 'Kinetic Theory of Gases: Ideal gas assumptions, Mean free path, Degree of Freedom values.');
  formatBullet(doc, 'Oscillations and Waves: SHM dampings, Wave Speed string mediums, Acoustics Doppler shifts.');
  
  formatDescription(doc, 'Class 12 Physics Topics: Electromagnetism, light wave physics, semiconductor devices, and atomic modern physics models.');
  formatBullet(doc, 'Electrostatics: Coulomb\'s law, Gauss theorem flux, electrostatic potential capacity.');
  formatBullet(doc, 'Current Electricity: Ohm\'s law, Kirchhoff\'s junction rules, Potentiometer, Wheatstone bridge.');
  formatBullet(doc, 'Magnetic Effects of Current & Magnetism: Biot-Savart, Ampere\'s law, Cyclotron, Magnetic fields.');
  formatBullet(doc, 'Electromagnetic Induction: Faraday\'s law, Lenz\'s law, Self & Mutual Inductance calculations.');
  formatBullet(doc, 'Alternating Current: LCR circuit resonance, Quality factor, Power in AC, Transformer ratios.');
  formatBullet(doc, 'Electromagnetic Waves: Displacement current, EM wave spectrum propagation.');
  formatBullet(doc, 'Optics: Reflection, Refraction, Lens formulas, Wave interference Young double slit, Diffraction.');
  formatBullet(doc, 'Dual Nature of Matter & Radiation: Photoelectric effect, de Broglie wave relation.');
  formatBullet(doc, 'Atoms and Nuclei: Rutherford, Bohr hydrogen model, Radioactivity half-lives, Nuclear fusion/fission.');
  formatBullet(doc, 'Electronic Devices: Semiconductor p-n junction diode, I-V characteristics, Logic Gates.');
  formatBullet(doc, 'Experimental Skills: Galvanometer resistance, Focal length lenses, Speed of sound resonance tube.');

  doc.addPage();
  formatHeader(doc, 'OFFICIAL JEE MAINS & ADVANCED SYLLABUS', 'Part 2: Chemistry and Mathematics Curriculum Outline');

  // SECTION 2: CHEMISTRY
  formatSectionHeader(doc, '2. Chemistry Syllabus Core Topics');
  
  formatDescription(doc, 'Physical Chemistry: Basic stoichiometry, atomic quantum structures, thermodynamic state systems, and chemical/electro-kinetics.');
  formatBullet(doc, 'Some Basic Concepts of Chemistry: Mole fraction, Molality, Molarity, Stoichiometry, Empirical formulas.');
  formatBullet(doc, 'Atomic Structure: Bohr model, Quantum numbers, Aufbau principle, Hund\'s rule, dual nature.');
  formatBullet(doc, 'Chemical Bonding: Lewis structure, VSEPR model, Hybridization, Molecular orbital configurations.');
  formatBullet(doc, 'Chemical Thermodynamics: First/Second laws, Enthalpy, Entropy, Gibbs energy spontaneity.');
  formatBullet(doc, 'Solutions: Raoult\'s law, Colligative properties (elevation of boiling point, osmotic pressure).');
  formatBullet(doc, 'Equilibrium: Law of mass action, Le Chatelier, pH, solubility product buffer solutions.');
  formatBullet(doc, 'Redox & Electrochemistry: Nernst equation cell EMF, Conductance, electrolysis Faraday rules.');
  formatBullet(doc, 'Chemical Kinetics: Collision theory, first order rates, Arrhenius equation activations.');
  
  formatDescription(doc, 'Inorganic & Organic Chemistry: Periodic coordination ligands, salt analysis, reaction mechanisms, and bio-synthesis.');
  formatBullet(doc, 'Classification of Elements: Periodic properties, Atomic radius, Electronegativity, Ionization enthalpy.');
  formatBullet(doc, 'p-Block Elements: Group 13 to 18 elements trends, oxides structures, anomalous properties.');
  formatBullet(doc, 'd- and f-Block Elements: Transition series configuration, Lanthanoids contraction, interstitial compounds.');
  formatBullet(doc, 'Coordination Compounds: Werner theory, IUPAC rules, Isomerism, VBT, Crystal Field Theory.');
  formatBullet(doc, 'Salt Analysis: Identification of acidic/basic radicals (Pb2+, Cu2+, Fe3+, Cl-, SO4(2-)).');
  formatBullet(doc, 'Metallurgy: Concentration, reduction, refining operations of Iron, Copper, Zinc.');
  formatBullet(doc, 'Organic Chemistry: Hydrocarbons, Grignard RMgX, Aldol reactions, Halides, Alcohols, Phenols, Ethers.');

  // SECTION 3: MATHEMATICS
  formatSectionHeader(doc, '3. Mathematics Syllabus Core Topics');
  
  formatDescription(doc, 'Algebra, Calculus, and Geometry: Functional analysis, matrix calculations, limits, differential systems, vectors, and probability.');
  formatBullet(doc, 'Sets, Relations and Functions: Types of relations, equivalence relations, domain, range.');
  formatBullet(doc, 'Complex Numbers & Quadratic: Argand plane, Euler formula, roots coefficients relations.');
  formatBullet(doc, 'Matrices & Determinants: Inverse matrix, Adjoint, Cramer\'s system rules linear equations.');
  formatBullet(doc, 'Permutations and Combinations: Circular permutations, binomial combinations notation.');
  formatBullet(doc, 'Sequences & Series: Arithmetic, Geometric progressions, AGP, summation of series.');
  formatBullet(doc, 'Calculus (Limits, Integrals, Diff. Eq.): L\'Hospital rules, derivatives, definite integral areas.');
  formatBullet(doc, 'Co-ordinate Geometry: Straight lines, circles, parabola, ellipse, hyperbola standard equations.');
  formatBullet(doc, 'Vector Algebra & 3D Geometry: Dot/cross products, lines/planes projections, shortest distances.');
  formatBullet(doc, 'Probability & Statistics: Bayes theorem, Poisson/Binomial variables, mean/variance deviations.');

  doc.end();
  console.log('Generated JEE Syllabus Outline PDF.');
}

// Run functions
try {
  generatePhysicsPDF();
  generateChemistryPDF();
  generateMathPDF();
  generateSyllabusPDF();
  console.log('🎉 Successfully created all cheatsheets in public/downloads!');
} catch (e) {
  console.error('Error generating cheatsheets:', e);
}
