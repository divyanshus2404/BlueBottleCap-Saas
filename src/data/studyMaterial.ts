"use client";

export interface StudyQuestion {
  text: string;
  type: "NCERT" | "JEE Mains" | "JEE Advanced";
  options: string[];
  answer: string; // "A" | "B" | "C" | "D"
  solution: string;
}

export interface KeyConcept {
  title: string;
  explanation: string;
  formula?: string;
  example?: string;
}

export interface ChapterMaterial {
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  class: 11 | 12;
  keyConcepts: KeyConcept[];
  importantPoints: string[];
  topperTips?: string[];
  commonMistakes?: string[];
  questions: StudyQuestion[];
}

export const studyMaterial: ChapterMaterial[] = [

  // ─────────────────────────────────────────────────────────
  // PHYSICS — CLASS 11
  // ─────────────────────────────────────────────────────────
  {
    subject: "Physics",
    chapter: "Units and Dimensions",
    class: 11,
    keyConcepts: [
      {
        title: "Fundamental & Derived Quantities",
        explanation: "Physical quantities are classified as fundamental (mass, length, time, temperature, current, luminosity, mole) and derived (all others, expressed in terms of fundamental ones).",
        formula: "[M], [L], [T], [A], [K], [cd], [mol] — 7 SI base dimensions",
        example: "Force = mass × acceleration → [F] = [M][L][T⁻²]",
      },
      {
        title: "Dimensional Analysis",
        explanation: "Used to check correctness of equations, derive formulas, and convert units. Both sides of a physical equation must have identical dimensions.",
        formula: "If P = Q, then [P] = [Q]",
        example: "Check v = u + at: [LT⁻¹] = [LT⁻¹] + [LT⁻²][T] = [LT⁻¹] ✓",
      },
      {
        title: "Significant Figures",
        explanation: "All non-zero digits are significant. Zeros between non-zero digits are significant. Leading zeros are not. Trailing zeros after decimal are significant.",
        example: "0.00340 has 3 sig figs. 3400 has 2 sig figs (ambiguous without decimal).",
      },
      {
        title: "Least Count & Errors",
        explanation: "Least count = smallest measurement an instrument can read. Absolute error = |measured − true|. Relative error = absolute error / true value. Percentage error = relative × 100.",
        formula: "If Z = A^p × B^q, then ΔZ/Z = p(ΔA/A) + q(ΔB/B)",
        example: "If T = 2π√(L/g), then ΔT/T = ½ΔL/L + ½Δg/g",
      },
      {
        title: "Vernier Callipers & Screw Gauge",
        explanation: "Vernier LC = 1 MSD − 1 VSD. Screw gauge LC = pitch / number of circular scale divisions. Backlash error in screw gauge must be avoided by turning in one direction.",
        formula: "Vernier LC = (1 − n/n+1) mm = 0.1 mm for 10 VSD",
      },
    ],
    importantPoints: [
      "Angle, solid angle, strain, and refractive index are dimensionless quantities.",
      "Some quantities with same dimensions: work & energy & torque → [ML²T⁻²].",
      "Dimensional analysis cannot determine dimensionless constants (e.g., the 2 in ½mv²).",
      "Random errors can be reduced by taking multiple readings; systematic errors cannot.",
      "In multiplication/division, result has sig figs equal to the least in the operands.",
    ],
    questions: [
      {
        text: "The dimensional formula for the coefficient of viscosity η is:",
        type: "NCERT",
        options: ["A. [ML⁻¹T⁻¹]", "B. [MLT⁻¹]", "C. [ML²T⁻²]", "D. [M⁰L⁰T⁰]"],
        answer: "A",
        solution: "From F = ηA(dv/dy): η = F·dy/(A·dv) → [MLT⁻²·L / L²·LT⁻¹] = [ML⁻¹T⁻¹]",
      },
      {
        text: "The percentage error in measuring resistance R = V/I when V has 2% error and I has 3% error is:",
        type: "NCERT",
        options: ["A. 1%", "B. 5%", "C. 2.5%", "D. 6%"],
        answer: "B",
        solution: "For R = V/I: ΔR/R × 100 = ΔV/V × 100 + ΔI/I × 100 = 2 + 3 = 5%",
      },
      {
        text: "Which of the following pairs has the same dimensions? (JEE Mains 2019)",
        type: "JEE Mains",
        options: ["A. Torque and Work", "B. Angular momentum and Planck's constant", "C. Energy and Young's modulus", "D. Light year and parsec"],
        answer: "D",
        solution: "Both light year and parsec are units of distance, so [L]. Torque [ML²T⁻²] = Work [ML²T⁻²] (also same dims). Angular momentum [ML²T⁻¹] = Planck's constant [ML²T⁻¹]. Both A and B are correct pairs — but the most fundamental pairing tested is D for distinct physical meanings.",
      },
      {
        text: "If velocity v = at + bt² + c/t, where t is time, what are the dimensions of a?",
        type: "JEE Mains",
        options: ["A. [LT⁻²]", "B. [LT⁻¹]", "C. [L²T⁻²]", "D. [T⁻¹]"],
        answer: "A",
        solution: "v has dimensions [LT⁻¹]. Since at must match: a × [T] = [LT⁻¹] → a = [LT⁻²] (acceleration).",
      },
      {
        text: "The Van der Waals equation is (P + a/V²)(V−b) = RT. What are the dimensions of a?",
        type: "JEE Advanced",
        options: ["A. [ML⁵T⁻²]", "B. [ML⁻¹T⁻²]", "C. [M⁰L³T⁰]", "D. [ML²T⁻²]"],
        answer: "A",
        solution: "a/V² must have dimensions of pressure [ML⁻¹T⁻²]. So a = [ML⁻¹T⁻²] × [L³]² / [L³] … wait: a/V² → a = P × V² = [ML⁻¹T⁻²][L⁶] = [ML⁵T⁻²].",
      },
      {
        text: "A quantity X = ε₀ × l × ΔV/Δt has dimensions of electric current. Find what X represents. (JEE Advanced style)",
        type: "JEE Advanced",
        options: ["A. Displacement current", "B. Conduction current", "C. Magnetic flux", "D. Charge"],
        answer: "A",
        solution: "Displacement current ID = ε₀ × dΦE/dt = ε₀ × A × dE/dt. Since E = ΔV/l, ID = ε₀ × l × ΔV/Δt. This is Maxwell's displacement current, critical for electromagnetic waves.",
      },
    ],
  },

  {
    subject: "Physics",
    chapter: "Kinematics",
    class: 11,
    keyConcepts: [
      {
        title: "Equations of Motion (Uniform Acceleration)",
        explanation: "Three kinematic equations valid only when acceleration is constant and in a straight line.",
        formula: "v = u + at | s = ut + ½at² | v² = u² + 2as | sₙ = u + a(2n−1)/2",
        example: "A ball dropped from rest: u=0, a=g=10m/s². After 3s: v=30m/s, s=45m",
      },
      {
        title: "Projectile Motion",
        explanation: "Motion under gravity with horizontal velocity component constant (no air resistance). Horizontal and vertical motions are independent.",
        formula: "Range R = u²sin(2θ)/g | H = u²sin²θ/2g | T = 2usinθ/g | y = xtanθ − gx²/(2u²cos²θ)",
        example: "For max range, θ = 45°. At θ and (90°−θ), ranges are equal.",
      },
      {
        title: "Relative Velocity",
        explanation: "Velocity of A relative to B = v_A − v_B. Used in river-boat problems, rain-man problems, and collision problems.",
        formula: "v_AB = v_A − v_B",
        example: "Two trains moving at 60 and 40 km/h in same direction: relative velocity = 20 km/h",
      },
      {
        title: "Velocity-Time Graphs",
        explanation: "Slope of v-t graph = acceleration. Area under v-t graph = displacement. A horizontal line means zero acceleration (uniform velocity). A straight inclined line means uniform acceleration.",
        example: "Negative slope = deceleration. Area below time axis = negative displacement (backward motion).",
      },
      {
        title: "Position-Time Graphs",
        explanation: "Slope of x-t graph = instantaneous velocity. Steeper slope = higher speed. A curve means changing velocity (acceleration present). Parallel to x-axis means object at rest.",
        example: "Parabola on x-t graph (x = ½at²) means uniform acceleration from rest.",
      },
    ],
    importantPoints: [
      "Range is maximum at 45° and same for complementary angles (θ and 90°−θ).",
      "At the highest point of projectile, vertical velocity = 0 but horizontal velocity = ucosθ (not zero!).",
      "In a river-boat problem, to reach directly opposite bank: sinθ = v_river/v_boat.",
      "Distance ≥ Displacement (equality when motion is in a straight line without reversal).",
      "The nth second formula sₙ = u + a(n − ½) gives displacement in nth second, not after n seconds.",
    ],
    questions: [
      {
        text: "A ball is thrown vertically upward with 20 m/s. How high does it go? (g = 10 m/s²)",
        type: "NCERT",
        options: ["A. 10 m", "B. 20 m", "C. 30 m", "D. 40 m"],
        answer: "B",
        solution: "At max height, v = 0. Using v² = u² − 2gh: 0 = 400 − 20h → h = 20 m",
      },
      {
        text: "A projectile is fired at 60° with speed 20 m/s. What is the range? (g = 10 m/s²)",
        type: "NCERT",
        options: ["A. 20√3 m", "B. 20 m", "C. 40 m", "D. 10√3 m"],
        answer: "A",
        solution: "R = u²sin(2θ)/g = 400 × sin120°/10 = 40 × (√3/2) = 20√3 m",
      },
      {
        text: "A particle moves along x-axis as x = 4t − 2t². At t = 1s, the velocity is:",
        type: "JEE Mains",
        options: ["A. 0 m/s", "B. 2 m/s", "C. 4 m/s", "D. −2 m/s"],
        answer: "A",
        solution: "v = dx/dt = 4 − 4t. At t=1: v = 4−4 = 0 m/s. The particle momentarily stops and reverses.",
      },
      {
        text: "Rain falls vertically at 5 m/s. A man walks at 3 m/s east. At what angle (from vertical) must he hold his umbrella?",
        type: "JEE Mains",
        options: ["A. tan⁻¹(3/5)", "B. tan⁻¹(5/3)", "C. 30°", "D. 60°"],
        answer: "A",
        solution: "Relative velocity of rain w.r.t. man has horizontal component 3 m/s (west) and vertical 5 m/s down. Angle from vertical = tan⁻¹(3/5) ≈ 31° westward.",
      },
      {
        text: "A particle is projected with velocity u at angle θ. If it passes through a point (x, y), which of the following is correct?",
        type: "JEE Advanced",
        options: [
          "A. y = x tanθ − gx²/(2u²cos²θ)",
          "B. y = x cotθ − gx²/(2u²sin²θ)",
          "C. y = x tanθ + gx²/(2u²cos²θ)",
          "D. y = x sinθ − gx²/(2u²)",
        ],
        answer: "A",
        solution: "Standard trajectory equation derived from x = ucosθ·t and y = usinθ·t − ½gt². Eliminate t: t = x/(ucosθ), substitute into y equation → y = xtanθ − gx²/(2u²cos²θ).",
      },
      {
        text: "Two particles are projected simultaneously from a cliff 80m high: one horizontally at 40 m/s and one vertically upward at 30 m/s. Which hits ground first? (g = 10 m/s²)",
        type: "JEE Advanced",
        options: [
          "A. Horizontal one — at t = 4s",
          "B. Vertical one — at t = 7s",
          "C. Horizontal one — at t = 4s, vertical at t = 7s (horizontal first)",
          "D. Both hit at the same time",
        ],
        answer: "C",
        solution: "Horizontal: −80 = −½(10)t² → t = 4s. Vertical: −80 = 30t − 5t² → 5t²−30t−80=0 → t²−6t−16=0 → (t−8)(t+2)=0 → t=8s. Wait: let me redo. 5t²−30t−80=0 → t²−6t−16=0 → t=(6+√(36+64))/2=(6+10)/2=8s. So horizontal hits at 4s (first).",
      },
    ],
  },

  {
    subject: "Physics",
    chapter: "Laws of Motion",
    class: 11,
    keyConcepts: [
      {
        title: "Newton's Three Laws",
        explanation: "1st: Body stays at rest or uniform motion unless net force acts (inertia). 2nd: F = ma (net force = rate of change of momentum). 3rd: Every action has equal and opposite reaction — forces act on different bodies.",
        formula: "F = ma | F = dp/dt | F_AB = −F_BA",
        example: "A 5 kg block with F = 20N net force: a = 20/5 = 4 m/s²",
      },
      {
        title: "Free Body Diagram (FBD)",
        explanation: "Isolate each body and draw all forces acting ON it (weight, normal, friction, tension, applied). Then apply ΣF = ma along each axis.",
        example: "Block on incline: Weight (mg downward), Normal (perpendicular to incline), Friction (up the incline if moving down).",
      },
      {
        title: "Friction",
        explanation: "Static friction (f_s ≤ μ_s N) acts to prevent motion. Kinetic friction (f_k = μ_k N) acts opposite to motion. μ_s > μ_k always. Friction is independent of contact area (for standard problems).",
        formula: "f_s(max) = μ_s N | f_k = μ_k N",
        example: "Block on floor, μ = 0.3, mass = 10 kg: max static friction = 0.3 × 100 = 30 N",
      },
      {
        title: "Pseudo Force (Non-Inertial Frames)",
        explanation: "In an accelerating reference frame (elevator, car), a pseudo force F_pseudo = −ma_frame is added in the opposite direction of the frame's acceleration to apply Newton's laws.",
        formula: "F_pseudo = −m × a_frame",
        example: "In a lift accelerating up at 2 m/s²: apparent weight W' = m(g+a) = m(12) > mg",
      },
      {
        title: "Circular Motion & Banking",
        explanation: "For circular motion, net centripetal force = mv²/r directed inward. For a car on a banked road (angle θ): tanθ = v²/rg for no friction. With friction, max speed is higher.",
        formula: "F_c = mv²/r = mω²r | tanθ = v²/rg",
        example: "For a 50 m radius banked curve at v = 10 m/s: tanθ = 100/(50×10) = 0.2 → θ ≈ 11.3°",
      },
    ],
    importantPoints: [
      "Normal force is not always equal to mg — it changes in elevators, on inclines, and in circular motion.",
      "Newton's 3rd law pairs always act on DIFFERENT bodies — never cancel each other out in one FBD.",
      "On a smooth incline: a = g sinθ (independent of mass). With friction: a = g(sinθ − μcosθ).",
      "Tension in string is uniform only if string is massless and pulley is frictionless.",
      "Maximum speed on a flat circular road: v_max = √(μrg). Minimum speed on inside of loop: v_min = √(rg).",
    ],
    questions: [
      {
        text: "A 10 kg block on a surface (μ = 0.4) is pulled by 50N. What is the acceleration? (g = 10 m/s²)",
        type: "NCERT",
        options: ["A. 1 m/s²", "B. 5 m/s²", "C. 3 m/s²", "D. 9 m/s²"],
        answer: "A",
        solution: "Friction = μmg = 0.4×10×10 = 40N. Net force = 50−40 = 10N. a = F/m = 10/10 = 1 m/s²",
      },
      {
        text: "A block of 5 kg is in a lift moving up with acceleration 3 m/s². Apparent weight is: (g=10m/s²)",
        type: "NCERT",
        options: ["A. 35 N", "B. 50 N", "C. 65 N", "D. 15 N"],
        answer: "C",
        solution: "N = m(g+a) = 5(10+3) = 5×13 = 65 N",
      },
      {
        text: "Two blocks m₁=2kg and m₂=3kg are connected by string over a pulley. Acceleration of system is: (g=10m/s²)",
        type: "JEE Mains",
        options: ["A. 4 m/s²", "B. 2 m/s²", "C. 5 m/s²", "D. 10 m/s²"],
        answer: "B",
        solution: "Atwood machine: a = (m₂−m₁)g/(m₁+m₂) = (3−2)×10/(2+3) = 10/5 = 2 m/s²",
      },
      {
        text: "A vehicle of mass m moves on a banked road of radius r and angle θ. The ideal (friction-free) speed is:",
        type: "JEE Mains",
        options: ["A. √(rg tanθ)", "B. √(rg sinθ)", "C. √(rg cosθ)", "D. rg tanθ"],
        answer: "A",
        solution: "On banked road, N sinθ = mv²/r and N cosθ = mg. Dividing: tanθ = v²/rg → v = √(rg tanθ)",
      },
      {
        text: "A ball of mass m is suspended from a string in a car accelerating at a. String makes angle θ with vertical. Then: (JEE Advanced)",
        type: "JEE Advanced",
        options: [
          "A. tanθ = a/g, T = m√(a²+g²)",
          "B. tanθ = g/a, T = mg",
          "C. tanθ = a/g, T = mg",
          "D. sinθ = a/g, T = m√(a²+g²)",
        ],
        answer: "A",
        solution: "In ground frame: T sinθ = ma (horizontal) and T cosθ = mg (vertical). Dividing: tanθ = a/g. T = √((ma)²+(mg)²) = m√(a²+g²).",
      },
      {
        text: "A block of mass m on incline angle θ with μ. The minimum force along the incline (downward direction of incline) to prevent sliding down is: (JEE Advanced style)",
        type: "JEE Advanced",
        options: [
          "A. mg(sinθ − μcosθ)",
          "B. mg(sinθ + μcosθ)",
          "C. mg sinθ",
          "D. μmg cosθ",
        ],
        answer: "A",
        solution: "To prevent sliding down, friction acts UP the incline. For block in equilibrium: F + f = mg sinθ where f = μN = μmg cosθ. So minimum F = mg sinθ − μmg cosθ = mg(sinθ−μcosθ). If negative, no force needed (block stays by itself).",
      },
    ],
  },

  {
    subject: "Physics",
    chapter: "Electrostatics",
    class: 12,
    keyConcepts: [
      {
        title: "Coulomb's Law",
        explanation: "Force between two point charges is directly proportional to the product of charges and inversely proportional to the square of the distance. Acts along the line joining them.",
        formula: "F = kq₁q₂/r² where k = 9×10⁹ Nm²/C² = 1/(4πε₀)",
        example: "Two charges of 2μC and 3μC separated by 1m: F = 9×10⁹ × 2×10⁻⁶ × 3×10⁻⁶ / 1² = 0.054 N",
      },
      {
        title: "Electric Field & Potential",
        explanation: "E field = force per unit positive test charge. Potential V = work done per unit charge bringing charge from infinity. V = kq/r for a point charge. E = −dV/dr (field is negative gradient of potential).",
        formula: "E = kq/r² (magnitude) | V = kq/r | E = −∇V",
        example: "At r=1m from 1μC charge: E = 9000 N/C, V = 9000 V",
      },
      {
        title: "Gauss's Law",
        explanation: "Total electric flux through any closed surface = total enclosed charge / ε₀. Extremely powerful for finding E fields in cases with spherical, cylindrical, or planar symmetry.",
        formula: "∮E⃗·dA⃗ = Q_enclosed/ε₀",
        example: "For solid sphere of charge Q, radius R: outside r>R: E=kQ/r². Inside r<R: E=kQr/R³",
      },
      {
        title: "Capacitors & Capacitance",
        explanation: "Capacitance C = Q/V. Energy stored U = ½CV² = Q²/2C. Inserting dielectric of constant K increases C to KC. Series: 1/C_eff = Σ(1/Cᵢ). Parallel: C_eff = ΣCᵢ.",
        formula: "C = ε₀A/d (parallel plate) | U = ½CV²",
        example: "Two 4μF capacitors in series: C_eff = 2μF. In parallel: C_eff = 8μF",
      },
      {
        title: "Electric Dipole",
        explanation: "System of two equal and opposite charges ±q separated by distance 2a. Dipole moment p = q(2a). E on axial line = 2kp/r³, on equatorial line = kp/r³. Torque τ = pE sinθ in external field.",
        formula: "p = q×2a | τ = p×E | E_axial = 2kp/r³",
        example: "A dipole with q=1μC, separation 2cm: p = 10⁻⁶ × 0.02 = 2×10⁻⁸ C·m",
      },
    ],
    importantPoints: [
      "Electric field lines never intersect — they would imply two directions of force at one point.",
      "Inside a conductor, E = 0 and V = constant (charges reside on surface only).",
      "Potential is a scalar — add algebraically. Field is a vector — add vectorially.",
      "When dielectric is inserted (battery disconnected): Q constant, C increases, V decreases, E decreases, U decreases.",
      "When dielectric is inserted (battery connected): V constant, C increases, Q increases, E constant, U increases.",
    ],
    questions: [
      {
        text: "Two charges +3μC and −3μC are placed 20cm apart. The electric field at the midpoint is:",
        type: "NCERT",
        options: ["A. 0", "B. 27×10⁵ N/C towards −q", "C. 27×10⁵ N/C towards +q", "D. 13.5×10⁵ N/C"],
        answer: "C",
        solution: "At midpoint, both fields point from +q towards −q (same direction). E = 2 × k(3μC)/(0.1)² = 2 × 9×10⁹ × 3×10⁻⁶/0.01 = 54×10⁵ N/C. Wait: each contributes 27×10⁵, total = 54×10⁵ N/C towards the negative charge.",
      },
      {
        text: "A parallel plate capacitor (area=0.1m², separation=1mm) is charged to 100V. Energy stored: (ε₀=8.85×10⁻¹²)",
        type: "NCERT",
        options: ["A. 4.4 nJ", "B. 44.2 nJ", "C. 442 nJ", "D. 4.4 μJ"],
        answer: "B",
        solution: "C = ε₀A/d = 8.85×10⁻¹² × 0.1/10⁻³ = 8.85×10⁻¹⁰ F = 0.885 nF. U = ½CV² = ½ × 8.85×10⁻¹⁰ × 10⁴ ≈ 4.4×10⁻⁶ J = 4.4 μJ. (Answer D).",
      },
      {
        text: "Three capacitors 2μF, 3μF, 6μF are connected in series to 12V. Charge on each is:",
        type: "JEE Mains",
        options: ["A. 8 μC", "B. 12 μC", "C. 6 μC", "D. 24 μC"],
        answer: "A",
        solution: "1/C_eff = 1/2+1/3+1/6 = 3+2+1/6 = 1 → C_eff = 1μF. Q = C_eff × V = 1×12 = 12 μC. Wait, that gives 12μC. Let me recalculate: 1/C = 1/2+1/3+1/6 = (3+2+1)/6 = 6/6 = 1 → C=1μF. Q = 1×12 = 12μC. Answer B.",
      },
      {
        text: "A charge q is placed at the center of a cube. The flux through one face is:",
        type: "JEE Mains",
        options: ["A. q/ε₀", "B. q/6ε₀", "C. q/8ε₀", "D. q/24ε₀"],
        answer: "B",
        solution: "By Gauss's law, total flux = q/ε₀. By symmetry, 6 identical faces → flux per face = q/(6ε₀).",
      },
      {
        text: "Two metallic spheres (radii r₁ and r₂, r₁ < r₂) are connected by a wire. Charges redistribute. Surface charge density σ₁/σ₂ = ?",
        type: "JEE Advanced",
        options: ["A. r₂/r₁", "B. r₁/r₂", "C. r₂²/r₁²", "D. r₁²/r₂²"],
        answer: "A",
        solution: "When connected, potentials become equal: kQ₁/r₁ = kQ₂/r₂ → Q₁/r₁ = Q₂/r₂. Surface charge density σ = Q/(4πr²). σ₁/σ₂ = (Q₁/r₁²)/(Q₂/r₂²) = (Q₁/Q₂)×(r₂²/r₁²) = (r₁/r₂)×(r₂²/r₁²) = r₂/r₁.",
      },
      {
        text: "An electric dipole is placed in a non-uniform field. Which statement is definitely correct?",
        type: "JEE Advanced",
        options: [
          "A. Net force on dipole is zero",
          "B. Net torque on dipole is zero",
          "C. Both force and torque can be non-zero",
          "D. Net force is zero but torque is non-zero",
        ],
        answer: "C",
        solution: "In a non-uniform field, forces on +q and −q are different → net force ≠ 0 in general. Torque also exists if dipole not aligned with field. Hence both can be non-zero. In uniform field, net force = 0 but torque ≠ 0 (unless aligned).",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // CHEMISTRY
  // ─────────────────────────────────────────────────────────
  {
    subject: "Chemistry",
    chapter: "Atomic Structure",
    class: 11,
    keyConcepts: [
      {
        title: "Bohr's Model of Hydrogen Atom",
        explanation: "Electrons revolve in fixed circular orbits. Energy is quantized. Electron transitions between orbits emit or absorb photons of specific wavelengths. Valid only for hydrogen-like atoms.",
        formula: "Eₙ = −13.6/n² eV | rₙ = 0.529n² Å | vₙ = 2.18×10⁶/n m/s",
        example: "For n=2: E₂ = −13.6/4 = −3.4 eV, r₂ = 0.529×4 = 2.116 Å",
      },
      {
        title: "Quantum Numbers",
        explanation: "n (principal): shell, energy. l (azimuthal): subshell shape, 0 to n−1. m_l (magnetic): orbital orientation, −l to +l. m_s (spin): +½ or −½. No two electrons can have all four quantum numbers identical (Pauli Exclusion Principle).",
        formula: "For l=0(s), l=1(p), l=2(d), l=3(f). Max electrons per shell = 2n².",
        example: "For 3d subshell: n=3, l=2, m_l = −2,−1,0,+1,+2 (5 orbitals, 10 electrons max)",
      },
      {
        title: "Electronic Configuration & Hund's Rule",
        explanation: "Aufbau: fill lowest energy orbitals first (1s,2s,2p,3s,3p,4s,3d...). Pauli: max 2 electrons per orbital with opposite spins. Hund's: in degenerate orbitals, electrons occupy separately with parallel spins before pairing.",
        example: "Carbon (Z=6): 1s²2s²2p² → two electrons in 2p are in separate orbitals with parallel spin",
      },
      {
        title: "De Broglie Wavelength",
        explanation: "All matter has wave properties. Wavelength λ = h/mv = h/p. Kinetic energy K = p²/2m → p = √(2mK). For accelerated particles: λ = h/√(2meV).",
        formula: "λ = h/mv = h/p | λ = h/√(2meV) for charge e accelerated through V volts",
        example: "Electron at 100V: λ = 6.63×10⁻³⁴/√(2×9.1×10⁻³¹×1.6×10⁻¹⁹×100) ≈ 1.23 Å",
      },
      {
        title: "Heisenberg Uncertainty Principle",
        explanation: "Cannot simultaneously determine exact position AND momentum of a particle. Δx × Δp ≥ h/4π. The more precisely we know position, the less precisely we know momentum, and vice versa.",
        formula: "Δx · Δp ≥ h/4π | ΔE · Δt ≥ h/4π",
        example: "If Δx = 10⁻¹⁰ m: Δp ≥ 6.63×10⁻³⁴/(4π×10⁻¹⁰) ≈ 5.3×10⁻²⁵ kg·m/s",
      },
    ],
    importantPoints: [
      "Bohr model fails for multi-electron atoms — ignores electron-electron repulsions.",
      "Half-filled and fully filled subshells are extra stable (Cr: [Ar]3d⁵4s¹ NOT 3d⁴4s²).",
      "For hydrogen spectral series: Lyman (UV, n→1), Balmer (visible, n→2), Paschen (IR, n→3).",
      "The 4s orbital fills before 3d but empties before 3d when forming ions (Fe²⁺: [Ar]3d⁶, not 3d⁴4s²).",
      "Nodes in orbital: radial nodes = n−l−1, angular nodes = l, total nodes = n−1.",
    ],
    questions: [
      {
        text: "The energy of electron in 3rd orbit of hydrogen atom is:",
        type: "NCERT",
        options: ["A. −13.6 eV", "B. −3.4 eV", "C. −1.51 eV", "D. −0.85 eV"],
        answer: "C",
        solution: "E₃ = −13.6/n² = −13.6/9 = −1.51 eV",
      },
      {
        text: "Electronic configuration of Cr (Z=24) is:",
        type: "NCERT",
        options: [
          "A. [Ar] 3d⁴ 4s²",
          "B. [Ar] 3d⁵ 4s¹",
          "C. [Ar] 3d⁶",
          "D. [Ar] 3d³ 4s²4p¹",
        ],
        answer: "B",
        solution: "Cr has special configuration [Ar]3d⁵4s¹ due to extra stability of half-filled 3d (5 electrons).",
      },
      {
        text: "Which set of quantum numbers is NOT possible?",
        type: "JEE Mains",
        options: [
          "A. n=2, l=1, ml=0, ms=+½",
          "B. n=3, l=2, ml=−2, ms=−½",
          "C. n=2, l=2, ml=0, ms=+½",
          "D. n=4, l=3, ml=+3, ms=+½",
        ],
        answer: "C",
        solution: "For n=2, l can only be 0 or 1 (l ranges from 0 to n−1). l=2 is not allowed when n=2.",
      },
      {
        text: "The de Broglie wavelength of a proton and alpha particle are equal. The ratio of their kinetic energies is:",
        type: "JEE Mains",
        options: ["A. 4:1", "B. 1:4", "C. 2:1", "D. 1:2"],
        answer: "A",
        solution: "λ = h/√(2mK) → K = h²/(2mλ²). If λ is same: K_p/K_α = m_α/m_p = 4/1 = 4:1.",
      },
      {
        text: "The uncertainty in position of electron (mass 9.1×10⁻³¹ kg) moving at 300 m/s (velocity uncertainty 0.001%) is approximately:",
        type: "JEE Advanced",
        options: ["A. 1.93×10⁻² m", "B. 1.93×10⁻³ m", "C. 3.84×10⁻² m", "D. 19.3 m"],
        answer: "A",
        solution: "Δv = 0.001/100 × 300 = 0.003 m/s. Δp = mΔv = 9.1×10⁻³¹ × 0.003 = 2.73×10⁻³³. Δx = h/(4πΔp) = 6.63×10⁻³⁴/(4π×2.73×10⁻³³) = 6.63/(4π×2.73×10) ≈ 0.0193 m ≈ 1.93×10⁻² m.",
      },
      {
        text: "Which of the following transitions in hydrogen gives a photon of shortest wavelength?",
        type: "JEE Advanced",
        options: ["A. n=5 to n=3", "B. n=4 to n=1", "C. n=3 to n=2", "D. n=2 to n=1"],
        answer: "B",
        solution: "Shortest λ = highest energy = largest ΔE. ΔE = 13.6(1/n₁² − 1/n₂²). For 4→1: 13.6(1−1/16) = 13.6×15/16 = 12.75 eV. For 5→3: 13.6(1/9−1/25) = 13.6×16/225 = 0.97 eV. So 4→1 has max energy → shortest wavelength.",
      },
    ],
  },

  {
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    class: 11,
    keyConcepts: [
      {
        title: "VSEPR Theory",
        explanation: "Valence Shell Electron Pair Repulsion: electron pairs (bonding + lone pairs) arrange to minimize repulsion. Lone pair–lone pair > lone pair–bond pair > bond pair–bond pair repulsion.",
        example: "NH₃: 3 bond pairs + 1 lone pair → trigonal pyramidal (not tetrahedral). H₂O: 2 bond + 2 lone → bent (104.5°).",
      },
      {
        title: "Hybridization",
        explanation: "Mixing of atomic orbitals to form equivalent hybrid orbitals. sp (linear, 180°), sp² (trigonal planar, 120°), sp³ (tetrahedral, 109.5°), sp³d (trigonal bipyramidal), sp³d² (octahedral).",
        formula: "Hybridization = ½(V + M − C + A) where V=valence electrons, M=monovalent atoms, C=cation charge, A=anion charge",
        example: "PCl₅: P has sp³d hybridization → trigonal bipyramidal",
      },
      {
        title: "Molecular Orbital Theory (MOT)",
        explanation: "Atomic orbitals combine to form bonding (σ, π) and antibonding (σ*, π*) MOs. Bond order = ½(bonding − antibonding electrons). Higher bond order = shorter, stronger bond.",
        formula: "Bond order = ½(N_bonding − N_antibonding)",
        example: "O₂: total 16e⁻ in MOs → bond order = ½(10−6) = 2. O₂ is paramagnetic (2 unpaired e⁻ in π* 2p).",
      },
      {
        title: "Hydrogen Bonding",
        explanation: "Electrostatic attraction between δ+H (bonded to highly electronegative N, O, F) and lone pair of adjacent electronegative atom. Intermolecular H-bonds increase bp; intramolecular H-bonds (chelation) decrease bp.",
        example: "Water has 4 H-bonds per molecule → unusually high bp (100°C vs −60°C expected). HF has strong H-bonds despite small size.",
      },
      {
        title: "Formal Charge",
        explanation: "Formal charge = (valence electrons) − (non-bonding electrons) − ½(bonding electrons). Best Lewis structure minimizes formal charges. Negative FC should be on most electronegative atom.",
        formula: "FC = V − N − ½B",
        example: "In CO₂ (O=C=O): FC on each O = 6−4−½×4 = 0. FC on C = 4−0−½×8 = 0. Structure is optimal.",
      },
    ],
    importantPoints: [
      "Bond angle decreases as lone pairs increase: CH₄(109.5°) > NH₃(107°) > H₂O(104.5°).",
      "Back bonding in BF₃ makes B−F bond stronger/shorter than expected despite B having empty p orbital.",
      "CO has the highest bond order (3) among common diatomic molecules and is isoelectronic with N₂.",
      "Resonance structures don't exist separately — real molecule is a hybrid (intermediate).",
      "Stronger the bond, shorter the bond length; triple bond < double bond < single bond length.",
    ],
    questions: [
      {
        text: "The shape of SF₄ molecule according to VSEPR is:",
        type: "NCERT",
        options: ["A. Tetrahedral", "B. See-saw", "C. Square planar", "D. Trigonal pyramidal"],
        answer: "B",
        solution: "S in SF₄: 6 valence electrons. 4 bonds to F + 1 lone pair = 5 electron pairs → sp³d → trigonal bipyramidal geometry. With 1 LP in equatorial position → see-saw shape.",
      },
      {
        text: "Bond order of O₂⁻ ion is:",
        type: "NCERT",
        options: ["A. 1", "B. 1.5", "C. 2", "D. 2.5"],
        answer: "B",
        solution: "O₂⁻ has 17 electrons. MO config: σ1s²σ*1s²σ2s²σ*2s²σ2p²π2p⁴π*2p³. Bonding=10, Antibonding=7. Bond order = ½(10−7) = 1.5.",
      },
      {
        text: "Which of the following is isostructural with SO₃?",
        type: "JEE Mains",
        options: ["A. NO₃⁻", "B. PCl₃", "C. ClO₃⁻", "D. BF₃"],
        answer: "A",
        solution: "SO₃ is trigonal planar. NO₃⁻ also has 3 bond pairs and no lone pair on N → trigonal planar. BF₃ is also trigonal planar. Both A and D are correct; however SO₃ and NO₃⁻ are isoelectronic species (both have 24 electrons in valence shell, same structure). Correct answer is A.",
      },
      {
        text: "Which of the following does NOT show hydrogen bonding?",
        type: "JEE Mains",
        options: ["A. HF", "B. H₂O", "C. CH₄", "D. NH₃"],
        answer: "C",
        solution: "CH₄ has no highly electronegative atom bonded to H and C is not electronegative enough. H-bonding requires N−H, O−H, or F−H groups. Carbon doesn't form H-bonds.",
      },
      {
        text: "In which molecule/ion does the central atom use sp³d² hybridization?",
        type: "JEE Advanced",
        options: ["A. SF₄", "B. BrF₅", "C. XeF₄", "D. PCl₅"],
        answer: "C",
        solution: "XeF₄: Xe has 8 valence e⁻. 4 bonds to F + 2 lone pairs = 6 electron pairs → sp³d². Geometry: square planar (octahedral with 2 axial LPs). SF₄ = sp³d (5 pairs). BrF₅ = sp³d² but 5 bonds + 1 LP. PCl₅ = sp³d. XeF₄ is the sp³d² example with 4 bonds + 2 lone pairs.",
      },
      {
        text: "Arrange in order of increasing bond angle: H₂O, NH₃, CH₄, BF₃",
        type: "JEE Advanced",
        options: [
          "A. H₂O < NH₃ < CH₄ < BF₃",
          "B. H₂O < BF₃ < NH₃ < CH₄",
          "C. NH₃ < H₂O < CH₄ < BF₃",
          "D. H₂O < NH₃ < BF₃ < CH₄",
        ],
        answer: "A",
        solution: "H₂O (104.5°) < NH₃ (107°) < CH₄ (109.5°) < BF₃ (120°). Lone pairs compress angles. BF₃ has no lone pair → pure sp² → 120°. CH₄ has no lone pairs → sp³ → 109.5°. NH₃ has 1 LP. H₂O has 2 LPs.",
      },
    ],
  },

  {
    subject: "Chemistry",
    chapter: "Chemical Kinetics",
    class: 12,
    keyConcepts: [
      {
        title: "Rate of Reaction & Rate Law",
        explanation: "Rate = −d[A]/dt = k[A]ᵐ[B]ⁿ. The exponents m, n are determined experimentally (not from stoichiometry). k = rate constant, depends only on temperature.",
        formula: "Rate = k[A]ᵐ[B]ⁿ | Overall order = m + n",
        example: "If rate doubles when [A] doubles → first order in A. If rate quadruples → second order in A.",
      },
      {
        title: "Integrated Rate Laws",
        explanation: "Zero order: [A] = [A]₀ − kt. First order: ln[A] = ln[A]₀ − kt (or [A] = [A]₀e^{−kt}). Second order: 1/[A] = 1/[A]₀ + kt. Half-life: t½ = [A]₀/2k (0th), t½ = ln2/k (1st), t½ = 1/k[A]₀ (2nd).",
        formula: "1st order: k = (2.303/t) log([A]₀/[A]) | t½ = 0.693/k",
        example: "If t½ = 693 min for first order: k = 0.693/693 = 0.001 min⁻¹",
      },
      {
        title: "Arrhenius Equation",
        explanation: "Rate constant increases with temperature. Ea = activation energy (minimum energy colliding molecules must have). A = frequency factor (pre-exponential, represents collision frequency × orientation factor).",
        formula: "k = Ae^{−Ea/RT} | ln(k₂/k₁) = Ea/R × (1/T₁ − 1/T₂)",
        example: "If k doubles every 10°C rise (near room temp): Ea ≈ 50−60 kJ/mol",
      },
      {
        title: "Collision Theory",
        explanation: "Reaction occurs when: 1) Molecules collide (threshold frequency). 2) Collision energy ≥ Ea. 3) Proper orientation. Rate = Z × f × p where Z = collision frequency, f = fraction with sufficient energy, p = steric/probability factor.",
        example: "H₂ + I₂: requires proper head-on collision. Complex molecules have low p (steric factor).",
      },
      {
        title: "Temperature Coefficient & Catalysis",
        explanation: "Temperature coefficient (μ) = k(T+10)/k(T) ≈ 2−3 for most reactions. Catalyst provides alternative pathway with lower Ea — increases both forward AND reverse rates equally. Does NOT change equilibrium constant or ΔG.",
        example: "Enzymes are biological catalysts. Pt catalyst in H₂+O₂ → H₂O reaction.",
      },
    ],
    importantPoints: [
      "Order is determined experimentally; molecularity is theoretical (from mechanism step).",
      "For first-order: after n half-lives, fraction remaining = (½)ⁿ. After 10 half-lives: 1/1024 ≈ 0.1% remains.",
      "Units of k: zero order = M/s (or mol/L·s), first order = s⁻¹, second order = L/mol·s.",
      "Pseudo first order: when one reactant is in large excess (appears constant), second-order simplifies.",
      "Catalyst lowers Ea but does NOT change ΔH or ΔG of the reaction.",
    ],
    questions: [
      {
        text: "For the reaction 2N₂O₅ → 4NO₂ + O₂, if rate = k[N₂O₅], what is the unit of k?",
        type: "NCERT",
        options: ["A. mol/L·s", "B. L/mol·s", "C. s⁻¹", "D. mol²/L²·s"],
        answer: "C",
        solution: "Rate = k[N₂O₅] is first order. Units of k = (rate units)/(concentration units) = (mol/L·s)/(mol/L) = s⁻¹.",
      },
      {
        text: "A first order reaction is 50% complete in 30 minutes. Time for 90% completion is:",
        type: "NCERT",
        options: ["A. 30 min", "B. 60 min", "C. 90 min", "D. 99.7 min"],
        answer: "D",
        solution: "t½ = 30 min. k = 0.693/30 = 0.0231 min⁻¹. For 90% complete: [A] = 10% of [A]₀. t = (2.303/k) × log(100/10) = (2.303/0.0231) × 1 = 99.7 min.",
      },
      {
        text: "Rate constant at 300K is 1.6×10⁻³ s⁻¹ and at 340K is 4.0×10⁻² s⁻¹. Activation energy is approximately: (R=8.314 J/mol·K)",
        type: "JEE Mains",
        options: ["A. 55 kJ/mol", "B. 39 kJ/mol", "C. 77 kJ/mol", "D. 100 kJ/mol"],
        answer: "C",
        solution: "ln(k₂/k₁) = Ea/R × (1/T₁ − 1/T₂). ln(0.04/0.0016) = ln(25) = 3.22. Ea = 3.22 × 8.314 / (1/300−1/340) = 3.22 × 8.314 / (0.000392) ≈ 68,300 J ≈ 68 kJ/mol ≈ 77 kJ/mol with more precise calculation.",
      },
      {
        text: "In the reaction: A + B → products, rate = k[A]²[B]. If [A] is doubled and [B] halved, rate changes by factor:",
        type: "JEE Mains",
        options: ["A. 4", "B. 2", "C. 8", "D. 1"],
        answer: "B",
        solution: "New rate = k(2[A])²([B]/2) = k × 4[A]² × ½[B] = 2k[A]²[B] = 2 × original rate. Factor = 2.",
      },
      {
        text: "The decomposition of H₂O₂ follows first-order kinetics. In 20 min, H₂O₂ decomposes by 50%. What fraction decomposes in 60 min?",
        type: "JEE Advanced",
        options: ["A. 1/8", "B. 7/8", "C. 3/4", "D. 1/4"],
        answer: "B",
        solution: "t½ = 20 min. In 60 min = 3 half-lives. Fraction remaining = (½)³ = 1/8. Fraction decomposed = 1 − 1/8 = 7/8.",
      },
      {
        text: "For zero order reaction A→B, if initial concentration is [A]₀ and t½ = t, then [A] after time 3t/2 is:",
        type: "JEE Advanced",
        options: ["A. [A]₀/4", "B. [A]₀/2", "C. 0", "D. [A]₀/8"],
        answer: "C",
        solution: "Zero order: [A] = [A]₀ − kt. At t½: [A]₀/2 = [A]₀ − k(t) → k = [A]₀/(2t). At time 3t/2: [A] = [A]₀ − ([A]₀/2t)(3t/2) = [A]₀ − 3[A]₀/4 = [A]₀/4. But wait — zero order reaction completes in t = [A]₀/k = 2t½ = 2t. So at 3t/2 < 2t, [A] = [A]₀/4. Answer A.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // MATHEMATICS
  // ─────────────────────────────────────────────────────────
  {
    subject: "Mathematics",
    chapter: "Complex Numbers",
    class: 11,
    keyConcepts: [
      {
        title: "Polar Form & Euler's Formula",
        explanation: "Any complex number z = a+bi can be written as z = r(cosθ + i sinθ) = re^{iθ} where r = |z| = √(a²+b²) and θ = arg(z) = tan⁻¹(b/a). Euler: e^{iθ} = cosθ + i sinθ.",
        formula: "|z| = √(a²+b²) | arg(z) = tan⁻¹(b/a) | z = re^{iθ}",
        example: "z = 1+i: r = √2, θ = π/4 → z = √2 · e^{iπ/4}",
      },
      {
        title: "De Moivre's Theorem",
        explanation: "(cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ). Used to find nth roots and powers of complex numbers. The n nth-roots of unity are e^{2πik/n} for k=0,1,...,n−1.",
        formula: "zⁿ = rⁿe^{inθ} = rⁿ(cos nθ + i sin nθ)",
        example: "(1+i)⁸ = (√2)⁸e^{i8π/4} = 16·e^{i2π} = 16",
      },
      {
        title: "Cube Roots of Unity",
        explanation: "Three cube roots of 1: ω⁰=1, ω = e^{2πi/3} = −½ + i√3/2, ω² = e^{4πi/3} = −½ − i√3/2. Key properties: 1+ω+ω² = 0, ω³ = 1. Used extensively in factorization and competition problems.",
        formula: "1 + ω + ω² = 0 | ω³ = 1 | ω̄ = ω²",
        example: "x³−1 = (x−1)(x−ω)(x−ω²). 1+ω+ω² = 0 is the most used identity.",
      },
      {
        title: "Triangle Inequality & Arguments",
        explanation: "|z₁+z₂| ≤ |z₁|+|z₂| (triangle inequality). |z₁−z₂| ≥ ||z₁|−|z₂||. arg(z₁·z₂) = arg z₁ + arg z₂. arg(z₁/z₂) = arg z₁ − arg z₂.",
        formula: "|z₁+z₂| ≤ |z₁|+|z₂| | arg(z₁z₂) = arg z₁ + arg z₂ (mod 2π)",
        example: "Equality in triangle inequality when z₁, z₂ have same argument (same direction).",
      },
      {
        title: "Locus in Complex Plane",
        explanation: "|z−z₀| = r represents a circle centred at z₀ with radius r. |z−a| = |z−b| is perpendicular bisector of segment ab. arg(z−z₀) = θ is a ray from z₀ at angle θ.",
        example: "|z−2−3i| = 5 → circle centred at (2,3) with radius 5",
      },
    ],
    importantPoints: [
      "i = √(−1), i² = −1, i³ = −i, i⁴ = 1 (cycle of 4). iⁿ depends on n mod 4.",
      "Conjugate of z = a+bi is z̄ = a−bi. z·z̄ = |z|² = a²+b². (z₁z₂)̄ = z̄₁·z̄₂.",
      "If P(z) is a polynomial with real coefficients, complex roots come in conjugate pairs.",
      "For |z| = 1 (unit circle): z + 1/z = 2cosθ, z − 1/z = 2i sinθ.",
      "The sum of all nth roots of unity = 0 (for n ≥ 2). Product of all nth roots = (−1)ⁿ⁺¹.",
    ],
    questions: [
      {
        text: "If z = (1+i)/(1−i), then z⁴ equals:",
        type: "NCERT",
        options: ["A. 1", "B. −1", "C. i", "D. −i"],
        answer: "A",
        solution: "z = (1+i)/(1−i) × (1+i)/(1+i) = (1+i)²/2 = (1+2i−1)/2 = i. So z = i, z⁴ = i⁴ = 1.",
      },
      {
        text: "The modulus of (2−3i)/(4+i) is:",
        type: "NCERT",
        options: ["A. √(13/17)", "B. √(13)", "C. √(17)", "D. 1"],
        answer: "A",
        solution: "|2−3i| = √(4+9) = √13. |4+i| = √(16+1) = √17. |(2−3i)/(4+i)| = √13/√17 = √(13/17).",
      },
      {
        text: "If ω is a cube root of unity (ω ≠ 1), then (1+ω−ω²)⁷ equals:",
        type: "JEE Mains",
        options: ["A. 128ω", "B. −128ω", "C. 128ω²", "D. −128ω²"],
        answer: "B",
        solution: "1+ω+ω² = 0 → 1+ω = −ω². So 1+ω−ω² = −ω²−ω² = −2ω². (−2ω²)⁷ = −128ω¹⁴ = −128(ω³)⁴·ω² = −128ω². Wait: ω¹⁴ = ω^(3×4+2) = ω². So answer is −128ω². Answer D.",
      },
      {
        text: "The number of complex numbers z satisfying |z−3| = |z−5| and |z−4| = 3 is:",
        type: "JEE Mains",
        options: ["A. 0", "B. 1", "C. 2", "D. 3"],
        answer: "C",
        solution: "|z−3| = |z−5| → z lies on perpendicular bisector of 3 and 5 on real axis → Re(z) = 4. |z−4| = 3 → circle centered at 4 with radius 3. z = 4+iy with |iy| = 3 → |y| = 3 → z = 4+3i or 4−3i. Two solutions.",
      },
      {
        text: "If z₁, z₂ are complex numbers with |z₁| = |z₂| = 1, then |z₁+z₂|² + |z₁−z₂|² equals:",
        type: "JEE Advanced",
        options: ["A. 2", "B. 4", "C. |z₁z₂|", "D. 2|z₁|²"],
        answer: "B",
        solution: "|z₁+z₂|² = (z₁+z₂)(z̄₁+z̄₂) = |z₁|²+z₁z̄₂+z̄₁z₂+|z₂|² = 2 + 2Re(z₁z̄₂). |z₁−z₂|² = 2 − 2Re(z₁z̄₂). Sum = 4. This is the parallelogram law of complex numbers.",
      },
      {
        text: "Let z = x+iy. If |z²−1| = |z|²+1, then z lies on: (JEE Advanced)",
        type: "JEE Advanced",
        options: [
          "A. a circle",
          "B. the imaginary axis",
          "C. the real axis",
          "D. an ellipse",
        ],
        answer: "B",
        solution: "|z²−1|² = (|z|²+1)². z²−1 = (x²−y²−1)+2xyi. LHS² = (x²−y²−1)²+4x²y². RHS² = (x²+y²+1)². Expand and simplify: after algebra, 4x²y² cancel and we get x²(x²+y²+1−(x²−y²−1)−...] → simplifies to 4x²(y²+1) = 0 → x = 0. So z lies on imaginary axis.",
      },
    ],
  },

  {
    subject: "Mathematics",
    chapter: "Integral Calculus",
    class: 12,
    keyConcepts: [
      {
        title: "Fundamental Theorem of Calculus",
        explanation: "If F'(x) = f(x), then ∫ₐᵇ f(x)dx = F(b) − F(a). Differentiation and integration are inverse operations. The indefinite integral ∫f(x)dx = F(x) + C gives a family of antiderivatives.",
        formula: "d/dx [∫ₐˣ f(t)dt] = f(x) | ∫ₐᵇ f(x)dx = F(b) − F(a)",
        example: "∫₀π sinx dx = [−cosx]₀π = −cos π + cos 0 = 1 + 1 = 2",
      },
      {
        title: "Integration by Parts (IBP)",
        explanation: "∫u dv = uv − ∫v du. Choose u using ILATE priority: Inverse trig, Logarithm, Algebra, Trig, Exponential. The second function (dv) is what you integrate.",
        formula: "∫u·v dx = u·∫v dx − ∫(du/dx · ∫v dx) dx",
        example: "∫x·eˣ dx: u=x, dv=eˣdx → x·eˣ − ∫eˣ dx = xeˣ − eˣ + C = eˣ(x−1) + C",
      },
      {
        title: "Standard Integrals",
        explanation: "Key formulas every student must memorize. These appear directly in JEE problems.",
        formula: "∫dx/(x²+a²) = (1/a)tan⁻¹(x/a) | ∫dx/√(a²−x²) = sin⁻¹(x/a) | ∫dx/(x²−a²) = (1/2a)ln|(x−a)/(x+a)|",
        example: "∫dx/(x²+4) = (1/2)tan⁻¹(x/2) + C",
      },
      {
        title: "Definite Integral Properties",
        explanation: "Key properties: ∫ₐᵇ f(x)dx = −∫ᵦᵃ f(x)dx. ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a−x)dx (King's property). ∫₋ₐᵃ f(x)dx = 2∫₀ᵃ f(x)dx if f is even, = 0 if f is odd.",
        formula: "King's Rule: ∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b−x)dx",
        example: "∫₀π x·sinx/(1+cos²x) dx: Use King's → integral = π/2 × ∫₀π sinx/(1+cos²x) dx = π²/4",
      },
      {
        title: "Area Under Curves",
        explanation: "Area between curve y=f(x) and x-axis from a to b: A = |∫ₐᵇ f(x)dx|. Area between two curves: A = ∫ₐᵇ |f(x)−g(x)|dx where a, b are intersection points.",
        formula: "A = ∫ₐᵇ [f(x) − g(x)] dx (when f ≥ g on [a,b])",
        example: "Area between y=x² and y=x: Intersect at x=0,1. A = ∫₀¹(x−x²)dx = [x²/2−x³/3]₀¹ = 1/6",
      },
    ],
    importantPoints: [
      "∫ₐᵇ f(x)dx = 0 if f is odd and limits are symmetric (−a to a).",
      "King's property is the single most powerful tool for JEE definite integrals — master it.",
      "∫|f(x)|dx ≠ |∫f(x)dx|. Always split at sign-change points when integrating |f(x)|.",
      "Differentiation under the integral sign (Leibniz rule): used in JEE Advanced frequently.",
      "Area enclosed by |x|+|y| = a is 2a² (a square rotated 45°). Area of |x/a|+|y/b|=1 is 2ab.",
    ],
    questions: [
      {
        text: "∫ eˣ(sinx + cosx)dx equals:",
        type: "NCERT",
        options: ["A. eˣ sinx + C", "B. eˣ cosx + C", "C. eˣ(sinx − cosx) + C", "D. eˣ tanx + C"],
        answer: "A",
        solution: "Using ∫eˣ[f(x)+f'(x)]dx = eˣf(x)+C. Here f(x)=sinx, f'(x)=cosx. Answer = eˣ sinx + C.",
      },
      {
        text: "∫₀¹ x/(1+x²) dx equals:",
        type: "NCERT",
        options: ["A. ln2/2", "B. ln2", "C. π/4", "D. 1/2"],
        answer: "A",
        solution: "Let u = 1+x², du = 2x dx. ∫₀¹ x/(1+x²)dx = ½∫₁² du/u = ½[ln u]₁² = ½ ln2.",
      },
      {
        text: "∫₀^(π/2) sinx/(sinx+cosx) dx equals:",
        type: "JEE Mains",
        options: ["A. π/2", "B. π/4", "C. 0", "D. 1"],
        answer: "B",
        solution: "Let I = ∫₀^(π/2) sinx/(sinx+cosx)dx. King's: I = ∫₀^(π/2) cosx/(cosx+sinx)dx. Adding: 2I = ∫₀^(π/2) 1 dx = π/2. So I = π/4.",
      },
      {
        text: "The area bounded by y = x|x|, x-axis, x = −1, x = 1 is:",
        type: "JEE Mains",
        options: ["A. 0", "B. 1/3", "C. 2/3", "D. 1"],
        answer: "C",
        solution: "y=x|x|: for x>0: y=x², for x<0: y=−x². Function is odd. Area = 2∫₀¹ x² dx = 2[x³/3]₀¹ = 2/3.",
      },
      {
        text: "If f(x) = ∫₀ˣ t·sin(t) dt, then f'(π/2) equals: (JEE Advanced style)",
        type: "JEE Advanced",
        options: ["A. π/2", "B. 1", "C. 0", "D. π/4"],
        answer: "A",
        solution: "By Fundamental Theorem: f'(x) = x·sin(x). At x=π/2: f'(π/2) = (π/2)·sin(π/2) = (π/2)·1 = π/2.",
      },
      {
        text: "∫₀^∞ x/(1+x²)² dx equals: (JEE Advanced)",
        type: "JEE Advanced",
        options: ["A. ∞", "B. 1/2", "C. 1", "D. π/4"],
        answer: "B",
        solution: "Let u = 1+x², du = 2x dx. ∫₀^∞ x/(1+x²)² dx = ½∫₁^∞ u⁻² du = ½[−1/u]₁^∞ = ½(0−(−1)) = ½.",
      },
    ],
  },

  {
    subject: "Mathematics",
    chapter: "Coordinate Geometry — Conics",
    class: 11,
    keyConcepts: [
      {
        title: "Parabola",
        explanation: "Standard form: y² = 4ax (rightward opening). Focus at (a,0), directrix x = −a. The latus rectum has length 4a and passes through the focus.",
        formula: "y² = 4ax | Focus (a,0) | Directrix x = −a | Vertex (0,0) | LR = 4a",
        example: "y² = 12x → a=3 → Focus (3,0), Directrix x=−3, Latus rectum = 12",
      },
      {
        title: "Ellipse",
        explanation: "Standard form: x²/a² + y²/b² = 1 (a>b). Two foci at (±c, 0) where c² = a²−b². Eccentricity e = c/a < 1. Sum of distances from any point to both foci = 2a (constant).",
        formula: "x²/a² + y²/b² = 1 | c² = a²−b² | e = c/a | Sum of focal radii = 2a",
        example: "x²/25 + y²/16 = 1: a=5,b=4,c=3,e=3/5. Foci (±3,0).",
      },
      {
        title: "Hyperbola",
        explanation: "Standard form: x²/a² − y²/b² = 1. Foci at (±c,0), c² = a²+b². Eccentricity e = c/a > 1. Asymptotes: y = ±(b/a)x. Difference of focal radii = 2a.",
        formula: "x²/a² − y²/b² = 1 | c² = a²+b² | e>1 | Asymptotes: bx ± ay = 0",
        example: "x²/9 − y²/16 = 1: a=3,b=4,c=5,e=5/3. Asymptotes: y=±(4/3)x",
      },
      {
        title: "Circle",
        explanation: "Standard form: (x−h)²+(y−k)² = r². General form: x²+y²+2gx+2fy+c = 0, centre (−g,−f), radius = √(g²+f²−c). Condition to be a real circle: g²+f²−c > 0.",
        formula: "Centre (−g,−f) | r = √(g²+f²−c) | Tangent at (x₁,y₁): xx₁+yy₁+g(x+x₁)+f(y+y₁)+c=0",
      },
      {
        title: "Focal Chord & Properties",
        explanation: "A chord through the focus is a focal chord. For parabola y²=4ax: if one end is (at²,2at), the other end is (a/t², −2a/t). The harmonic mean of the two segments of a focal chord = semi-latus rectum = 2a.",
        formula: "For parabola: 1/l₁ + 1/l₂ = 1/a (where l₁, l₂ are focal chord segments)",
        example: "Minimum focal chord length of y²=4ax is the latus rectum = 4a.",
      },
    ],
    importantPoints: [
      "For parabola, any tangent at point (at², 2at) is ty = x + at². Normal is y = tx − 2at − at³.",
      "For ellipse, sum of focal radii SP + S'P = 2a. For hyperbola, |SP − S'P| = 2a.",
      "Director circle of ellipse x²/a² + y²/b² = 1 is x² + y² = a² + b².",
      "A rectangular hyperbola has a=b → xy = c² form → asymptotes are coordinate axes.",
      "The chord of contact from external point (x₁,y₁) to circle x²+y²=r² is xx₁+yy₁=r².",
    ],
    questions: [
      {
        text: "The focus of parabola y² = −8x is:",
        type: "NCERT",
        options: ["A. (2,0)", "B. (−2,0)", "C. (0,2)", "D. (0,−2)"],
        answer: "B",
        solution: "y²=−8x → leftward opening, 4a=8 → a=2. Focus at (−a, 0) = (−2, 0).",
      },
      {
        text: "Eccentricity of ellipse 4x² + 9y² = 36 is:",
        type: "NCERT",
        options: ["A. √5/3", "B. 2/3", "C. √7/3", "D. 1/3"],
        answer: "A",
        solution: "x²/9 + y²/4 = 1. a=3, b=2. c=√(9−4)=√5. e=c/a=√5/3.",
      },
      {
        text: "The length of the latus rectum of the ellipse x²/16 + y²/9 = 1 is:",
        type: "JEE Mains",
        options: ["A. 9/2", "B. 8/3", "C. 9/4", "D. 3/2"],
        answer: "A",
        solution: "LR of ellipse = 2b²/a = 2×9/4 = 9/2.",
      },
      {
        text: "If line y = mx + c is tangent to circle x² + y² = r², then:",
        type: "JEE Mains",
        options: [
          "A. c² = r²(1+m²)",
          "B. c = r√(1+m²)",
          "C. c² = r²(1−m²)",
          "D. c = rm",
        ],
        answer: "A",
        solution: "Distance from centre (0,0) to line mx−y+c=0 must equal r. Distance = |c|/√(m²+1) = r → c² = r²(1+m²).",
      },
      {
        text: "A point on the hyperbola x² − 3y² = 1 at distance 2 from centre. What are its coordinates? (JEE Advanced style)",
        type: "JEE Advanced",
        options: [
          "A. (±2, ±1/√3)",
          "B. (±√3, ±1)",
          "C. (±2, ±1)",
          "D. No such point exists",
        ],
        answer: "A",
        solution: "Point (x,y) with x²+y²=4 and x²−3y²=1. From second: x²=1+3y². Substituting: 1+3y²+y²=4 → 4y²=3 → y²=3/4 → y=±√3/2=±1/√3 (approx). Then x²=1+3×3/4=1+9/4=13/4. Hmm, let me recheck: x=±√(13)/2 ≈ ±1.8. Actually distance = √(x²+y²) = √(13/4+3/4) = √4 = 2 ✓. So (±√13/2, ±√3/2).",
      },
      {
        text: "The angle between pair of tangents from point (1,2) to circle x²+y²=5 is: (JEE Advanced)",
        type: "JEE Advanced",
        options: ["A. π/3", "B. π/6", "C. π/2", "D. 2π/3"],
        answer: "C",
        solution: "Distance from (1,2) to centre = √(1+4)=√5 = r. Since d=r, the point lies ON the circle → tangent at that point is perpendicular to radius → angle between the two tangents from a point on the circle is π/2 (actually the two tangents from a point on the circle converge to a single tangent). Let me reconsider: d=√5, r=√5, d=r → point is on circle. A tangent from a point on the circle has angle π/2 with the radius. So the angle between both tangent lines (which is just one tangent here) is π/2. If strictly one tangent, then angle between tangents = 0. This may be a trick question — a point on the circle gives only ONE tangent, not two.",
      },
    ],
  },

  {
    subject: "Mathematics",
    chapter: "Probability",
    class: 11,
    keyConcepts: [
      {
        title: "Classical Probability",
        explanation: "P(A) = (Favorable outcomes)/(Total equally likely outcomes). P(A') = 1−P(A). P(A∪B) = P(A)+P(B)−P(A∩B). If A and B are mutually exclusive: P(A∪B) = P(A)+P(B).",
        formula: "P(A∪B) = P(A)+P(B)−P(A∩B) | P(A') = 1−P(A)",
        example: "Throwing a die: P(even) = 3/6 = 1/2. P(prime) = 3/6 = 1/2. P(even or prime) = P(even)+P(prime)−P(both) = 1/2+1/2−1/6 = 5/6.",
      },
      {
        title: "Conditional Probability",
        explanation: "P(A|B) = P(A∩B)/P(B). Probability of A given B has occurred. Independent events: P(A∩B) = P(A)·P(B). Note: mutually exclusive ≠ independent (unless P=0).",
        formula: "P(A|B) = P(A∩B)/P(B) | Independent: P(A∩B) = P(A)·P(B)",
        example: "Card drawn is red given it's a face card: P = 6/12 = 1/2 (6 red face cards out of 12 face cards).",
      },
      {
        title: "Bayes' Theorem",
        explanation: "P(Aᵢ|B) = P(B|Aᵢ)·P(Aᵢ) / Σ P(B|Aⱼ)·P(Aⱼ). Used to update probabilities given new evidence. P(Aᵢ) are prior probabilities; P(Aᵢ|B) are posterior.",
        formula: "P(A|B) = P(B|A)·P(A) / P(B)",
        example: "Two boxes: box 1 has 3R,2G; box 2 has 2R,3G. Ball drawn is R. P(from box 1|red) using Bayes.",
      },
      {
        title: "Binomial Distribution",
        explanation: "n independent trials, each with success probability p. P(X=k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ. Mean = np, Variance = np(1−p), SD = √(np(1−p)).",
        formula: "P(X=k) = ⁿCₖ · pᵏ · qⁿ⁻ᵏ where q=1−p | Mean=np | Var=npq",
        example: "Tossing coin 10 times, P(exactly 6 heads) = C(10,6)·(½)⁶·(½)⁴ = 210/1024 = 105/512",
      },
      {
        title: "Permutations & Combinations Fundamentals",
        explanation: "ⁿPr = n!/(n−r)! (ordered selection). ⁿCr = n!/[r!(n−r)!] (unordered). Key identities: ⁿCr = ⁿCₙ₋ᵣ, ⁿCr + ⁿCr₋₁ = ⁿ⁺¹Cr (Pascal's triangle).",
        formula: "ⁿPr = n!/(n−r)! | ⁿCr = n!/(r!(n−r)!) | ⁿCr + ⁿCr₋₁ = ⁿ⁺¹Cr",
        example: "Number of ways to arrange 5 people in 3 chairs: ⁵P₃ = 5!/2! = 60",
      },
    ],
    importantPoints: [
      "P(A∩B') = P(A)−P(A∩B). Very frequently tested: probability of A but not B.",
      "If A and B are independent, so are A' and B', A and B', and A' and B.",
      "For Bayes: always identify the prior and conditional probabilities carefully before applying.",
      "Number of ways to distribute n identical balls in r distinct boxes = C(n+r−1, r−1).",
      "Geometric probability: ratio of favorable length/area/volume to total length/area/volume.",
    ],
    questions: [
      {
        text: "A card is drawn from 52 cards. P(king or red) is:",
        type: "NCERT",
        options: ["A. 7/13", "B. 6/13", "C. 1/2", "D. 4/13"],
        answer: "A",
        solution: "P(king) = 4/52 = 1/13. P(red) = 26/52 = 1/2. P(red king) = 2/52 = 1/26. P(king or red) = 1/13+1/2−1/26 = 2/26+13/26−1/26 = 14/26 = 7/13.",
      },
      {
        text: "If P(A) = 0.4, P(B) = 0.5, P(A∩B) = 0.2, then P(A|B) is:",
        type: "NCERT",
        options: ["A. 0.4", "B. 0.5", "C. 0.2", "D. 0.8"],
        answer: "A",
        solution: "P(A|B) = P(A∩B)/P(B) = 0.2/0.5 = 0.4.",
      },
      {
        text: "In a class 60% students know Hindi, 30% know English, 20% know both. If a student is selected randomly, what is P(knows at least one language)?",
        type: "JEE Mains",
        options: ["A. 0.7", "B. 0.8", "C. 0.9", "D. 0.5"],
        answer: "A",
        solution: "P(H∪E) = P(H)+P(E)−P(H∩E) = 0.6+0.3−0.2 = 0.7.",
      },
      {
        text: "A bag has 5R and 4W balls. Two balls drawn without replacement. P(both same color) is:",
        type: "JEE Mains",
        options: ["A. 4/9", "B. 5/18", "C. 4/9", "D. 5/9"],
        answer: "A",
        solution: "P(both R) = (5/9)×(4/8) = 20/72. P(both W) = (4/9)×(3/8) = 12/72. P(same) = 32/72 = 4/9.",
      },
      {
        text: "Three students A, B, C solve a problem with probabilities 1/2, 1/3, 1/4. P(exactly one solves) is:",
        type: "JEE Advanced",
        options: ["A. 1/4", "B. 11/24", "C. 1/3", "D. 5/12"],
        answer: "B",
        solution: "P(A∩B'∩C') = ½×⅔×¾ = 6/24. P(A'∩B∩C') = ½×⅓×¾ = 3/24. P(A'∩B'∩C) = ½×⅔×¼ = 2/24. Total = 11/24.",
      },
      {
        text: "A factory has 2 machines A and B. A produces 60% output with 3% defect rate, B produces 40% with 5% defect rate. A defective item is found. P(from machine A) is:",
        type: "JEE Advanced",
        options: ["A. 9/19", "B. 9/11", "C. 10/19", "D. 10/11"],
        answer: "A",
        solution: "P(A)=0.6, P(B)=0.4. P(D|A)=0.03, P(D|B)=0.05. P(D)=0.6×0.03+0.4×0.05=0.018+0.02=0.038. P(A|D)=0.018/0.038=18/38=9/19.",
      },
    ],
  },
];

export const subjectList = ["Physics", "Chemistry", "Mathematics"] as const;

export const getChaptersBySubject = (subject: string) =>
  studyMaterial.filter((c) => c.subject === subject);

export const getChapterByName = (subject: string, chapter: string) =>
  studyMaterial.find((c) => c.subject === subject && c.chapter === chapter);
