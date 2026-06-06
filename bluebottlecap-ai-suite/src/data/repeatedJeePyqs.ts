import { JEEQuestion } from "./jeePyqs";

export interface RepeatedTest {
  id: string;
  name: string;
  type: "Mains" | "Advanced";
  subject: "Physics" | "Chemistry" | "Mathematics" | "Mixed";
  questions: JEEQuestion[];
}

export const repeatedTestsData: RepeatedTest[] = [
  {
    id: "rep-mains-1",
    name: "JEE Mains High-Yield Mock #1",
    type: "Mains",
    subject: "Mixed",
    questions: [
      {
        id: "rep-phy-1",
        year: "JEE Mains 2023",
        question: "A wire of resistance R is stretched to twice its original length. Assuming that its density and resistivity remain unchanged, what is the new resistance of the stretched wire?",
        options: [
          "A. 2R",
          "B. 4R",
          "C. R/2",
          "D. R/4"
        ],
        answer: "B",
        hints: [
          "Hint 1: When a wire is stretched, its volume remains constant. How does stretching affect the length and area of cross-section?",
          "Hint 2: Since length (L) becomes 2L, the cross-sectional area (A) must become A/2 to keep volume (V = A * L) constant.",
          "Hint 3: Resistance is given by R = rho * L / A. Calculate the new resistance R' using the new length 2L and area A/2."
        ],
        solution: "Let the initial length be L and area be A. Initial resistance is R = rho * L / A.\nWhen the wire is stretched to double its length, new length L' = 2L.\nSince volume remains constant (V = A * L = A' * L'), we get A' = V / L' = (A * L) / (2L) = A/2.\nThe new resistance is R' = rho * L' / A' = rho * (2L) / (A/2) = 4 * (rho * L / A) = 4R.",
        commonMistakes: "Students often forget that stretching a wire changes its cross-sectional area as well as its length. They assume area remains constant and select Option A (2R) instead of the correct Option B (4R)."
      },
      {
        id: "rep-chem-1",
        year: "JEE Mains 2022",
        question: "Which of the following compounds will undergo nucleophilic substitution (SN1) reaction at the fastest rate?",
        options: [
          "A. Ethyl chloride",
          "B. Isopropyl chloride",
          "C. tert-Butyl chloride",
          "D. Chlorobenzene"
        ],
        answer: "C",
        hints: [
          "Hint 1: The rate of SN1 reactions depends on the stability of the intermediate carbocation formed after the leaving group departs.",
          "Hint 2: Compare the carbocations formed: ethyl (primary), isopropyl (secondary), tert-butyl (tertiary), and phenyl (extremely unstable).",
          "Hint 3: Tertiary carbocations are stabilized by +I effect (inductive effect) of three methyl groups and 9 hyperconjugating hydrogens."
        ],
        solution: "In SN1 reactions, the rate-determining step is the formation of a carbocation intermediate.\nThe stability of carbocations follows the order: 3° > 2° > 1° > methyl.\n- tert-Butyl chloride forms a tertiary carbocation (highly stable).\n- Isopropyl chloride forms a secondary carbocation.\n- Ethyl chloride forms a primary carbocation.\n- Chlorobenzene does not undergo nucleophilic substitution under normal conditions due to partial double-bond character of C-Cl bond.\nTherefore, tert-Butyl chloride reacts fastest via SN1 mechanism.",
        commonMistakes: "Students occasionally confuse SN1 and SN2 reaction orders. SN2 favors primary halides due to minimal steric hindrance, whereas SN1 favors tertiary halides due to carbocation stability."
      },
      {
        id: "rep-math-1",
        year: "JEE Mains 2024",
        question: "Find the value of limit as x approaches 0 for [sin(x) - x] / x^3.",
        options: [
          "A. 0",
          "B. 1/6",
          "C. -1/6",
          "D. -1/3"
        ],
        answer: "C",
        hints: [
          "Hint 1: Direct substitution of x = 0 gives the indeterminate form 0/0. Try using L'Hopital's Rule or Taylor series expansion.",
          "Hint 2: The Taylor series expansion of sin(x) around x = 0 is: sin(x) = x - x^3/3! + x^5/5! - ... Substitute this in the numerator.",
          "Hint 3: Simplifying sin(x) - x gives: -x^3/6 + x^5/120 - ... Now divide by x^3 and take the limit as x approaches 0."
        ],
        solution: "Using Taylor Series Expansion for sin(x):\nsin(x) = x - x^3/3! + x^5/5! - ...\nsin(x) - x = -x^3/6 + x^5/120 - ...\nDividing by x^3:\n[sin(x) - x] / x^3 = -1/6 + x^2/120 - ...\nTaking limit as x -> 0, all terms containing x vanish, leaving -1/6.",
        commonMistakes: "Students applying L'Hopital's Rule multiple times often make algebraic sign errors in the derivative. It is critical to differentiate carefully: derivative of [sin(x)-x] is cos(x)-1, and then -sin(x), and then -cos(x), yielding -1/6."
      }
    ]
  },
  {
    id: "rep-mains-2",
    name: "JEE Mains High-Yield Mock #2",
    type: "Mains",
    subject: "Mixed",
    questions: [
      {
        id: "rep-chem-2",
        year: "JEE Mains 2023",
        question: "For a first-order reaction, the time required to complete 99.9% of the reaction is approximately how many times the half-life (t_1/2)?",
        options: [
          "A. 2 times",
          "B. 5 times",
          "C. 10 times",
          "D. 20 times"
        ],
        answer: "C",
        hints: [
          "Hint 1: Recall the integrated rate equation for a first-order reaction: k = (2.303 / t) * log(a / (a - x)).",
          "Hint 2: For half-life t_1/2, completion is 50%, so log(a / (a/2)) = log(2). This gives k = 2.303 * log(2) / t_1/2.",
          "Hint 3: For 99.9% completion, remaining concentration is 0.1% (a - x = 0.001a). Compare log(1000) = 3 with log(2) = 0.301."
        ],
        solution: "For first-order reaction:\nt_1/2 = 0.693 / k = (2.303 * log 2) / k = (2.303 * 0.301) / k\nt_99.9% = (2.303 / k) * log(100 / (100 - 99.9)) = (2.303 / k) * log(100 / 0.1) = (2.303 / k) * log(1000) = (2.303 * 3) / k\nDividing the two equations:\nt_99.9% / t_1/2 = 3 / 0.301 ≈ 9.97 ≈ 10 times.",
        commonMistakes: "Students often approximate log(2) incorrectly or make mental division mistakes. Remember that 99.9% completion is exactly 10 half-lives for first-order kinetics."
      },
      {
        id: "rep-math-2",
        year: "JEE Mains 2024",
        question: "If A and B are symmetric matrices of the same order, then AB - BA is a:",
        options: [
          "A. Symmetric matrix",
          "B. Skew-symmetric matrix",
          "C. Zero matrix",
          "D. Identity matrix"
        ],
        answer: "B",
        hints: [
          "Hint 1: Since A and B are symmetric, we have A^T = A and B^T = B.",
          "Hint 2: To check if a matrix M = AB - BA is symmetric or skew-symmetric, find its transpose M^T.",
          "Hint 3: Recall the transpose properties: (X - Y)^T = X^T - Y^T and (XY)^T = Y^T * X^T."
        ],
        solution: "Given that A and B are symmetric, we have A^T = A and B^T = B.\nLet M = AB - BA.\nTaking transpose on both sides:\nM^T = (AB - BA)^T = (AB)^T - (BA)^T\nUsing product rule for transpose:\nM^T = B^T * A^T - A^T * B^T\nSubstituting B^T = B and A^T = A:\nM^T = BA - AB\nM^T = -(AB - BA) = -M.\nSince M^T = -M, the matrix AB - BA is skew-symmetric.",
        commonMistakes: "Students confuse the ordering of matrix transpose products. They write (AB)^T = A^T B^T instead of B^T A^T, which leads them to select Option A (Symmetric) mistakenly."
      }
    ]
  },
  {
    id: "rep-advanced-1",
    name: "JEE Advanced High-Yield Mock #1",
    type: "Advanced",
    subject: "Mixed",
    questions: [
      {
        id: "rep-phy-3",
        year: "JEE Advanced 2021",
        question: "A particle of mass m is moving in a circular path of constant radius r such that its centripetal acceleration a_c is varying with time t as a_c = k^2 * r * t^2, where k is a constant. What is the total power delivered to the particle by the forces acting on it?",
        options: [
          "A. m * k^2 * r^2 * t",
          "B. m * k^2 * r * t",
          "C. m * k^2 * r^2 * t^2",
          "D. 0"
        ],
        answer: "A",
        hints: [
          "Hint 1: Centripetal acceleration is given by a_c = v^2 / r. Equate this to k^2 * r * t^2 to find velocity (v) as a function of time.",
          "Hint 2: Find the tangential acceleration a_t by differentiating velocity v with respect to time t: a_t = dv/dt.",
          "Hint 3: Tangential force is F_t = m * a_t. The power delivered to the particle is due only to the tangential force: Power = F_t * v. Centripetal forces do no work."
        ],
        solution: "Centripetal acceleration: a_c = v^2 / r = k^2 * r * t^2\n=> v^2 = k^2 * r^2 * t^2 => v = k * r * t.\nTangential acceleration: a_t = dv/dt = k * r.\nTangential force: F_t = m * a_t = m * k * r.\nCentripetal force is perpendicular to velocity, so it does zero work. Thus, power is delivered only by tangential force:\nPower = F_t * v = (m * k * r) * (k * r * t) = m * k^2 * r^2 * t.",
        commonMistakes: "Students often write Power = Force * Velocity using centripetal force, or assume power is zero because the radius is constant. Remember that tangential force speeds up the particle, requiring work and power."
      },
      {
        id: "rep-math-3",
        year: "JEE Advanced 2022",
        question: "Let f(x) = x^3 - 3x + 1. The number of distinct real roots of f(x) = 0 in the interval [-2, 2] is:",
        options: [
          "A. 1",
          "B. 2",
          "C. 3",
          "D. 0"
        ],
        answer: "C",
        hints: [
          "Hint 1: Find the derivative of f(x), which is f'(x) = 3x^2 - 3. Locate the critical points where f'(x) = 0.",
          "Hint 2: The critical points are x = -1 and x = 1. Evaluate the values of f(x) at the critical points and the boundaries of the interval: f(-2), f(-1), f(1), f(2).",
          "Hint 3: Look at the sign changes of f(x) between these points. Use Rolle's Theorem or Intermediate Value Theorem."
        ],
        solution: "f(x) = x^3 - 3x + 1\nf'(x) = 3x^2 - 3 = 3(x-1)(x+1).\nCritical points are x = -1 and x = 1.\nLet's evaluate the function values:\nf(-2) = (-2)^3 - 3(-2) + 1 = -8 + 6 + 1 = -1 < 0\nf(-1) = (-1)^3 - 3(-1) + 1 = -1 + 3 + 1 = 3 > 0\nf(1) = 1^3 - 3(1) + 1 = 1 - 3 + 1 = -1 < 0\nf(2) = 2^3 - 3(2) + 1 = 8 - 6 + 1 = 3 > 0\n\nBy Intermediate Value Theorem, since f(x) is continuous:\n- There is a root between -2 and -1 (f goes from -1 to 3).\n- There is a root between -1 and 1 (f goes from 3 to -1).\n- There is a root between 1 and 2 (f goes from -1 to 3).\n\nSince the degree of the polynomial is 3, it can have at most 3 real roots. Thus, it has exactly 3 distinct real roots in the interval [-2, 2].",
        commonMistakes: "Students sometimes find the roots of f'(x) and assume those are the roots of f(x). Evaluate f(x) values at the critical points to identify the exact sign flips."
      }
    ]
  }
];
