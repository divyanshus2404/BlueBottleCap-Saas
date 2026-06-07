import { Flashcard } from "../types";

export const flashcardsData: Flashcard[] = [
  {
    id: "phy-1",
    question: "What is the formula for the time period of a simple pendulum?",
    answer: "T = 2π√(L/g)",
    category: "Physics",
    topic: "Simple Harmonic Motion"
  },
  {
    id: "phy-2",
    question: "What is the escape velocity from the surface of the Earth?",
    answer: "v_e = √(2gR) ≈ 11.2 km/s",
    category: "Physics",
    topic: "Gravitation"
  },
  {
    id: "chem-1",
    question: "What is the reagent used in the Clemmensen Reduction?",
    answer: "Zinc amalgam (Zn-Hg) and concentrated HCl",
    category: "Chemistry",
    topic: "Aldehydes and Ketones"
  },
  {
    id: "chem-2",
    question: "What is the order of stability of carbocations?",
    answer: "3° > 2° > 1° > methyl (due to hyperconjugation and +I effect)",
    category: "Chemistry",
    topic: "General Organic Chemistry"
  },
  {
    id: "math-1",
    question: "What is the integral of ln(x) dx?",
    answer: "x ln(x) - x + C",
    category: "Mathematics",
    topic: "Calculus"
  },
  {
    id: "math-2",
    question: "What is the condition for two lines with slopes m1 and m2 to be perpendicular?",
    answer: "m1 × m2 = -1",
    category: "Mathematics",
    topic: "Coordinate Geometry"
  }
];
