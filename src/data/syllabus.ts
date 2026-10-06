/**
 * JEE / NEET syllabus, chapter level.
 *
 * Shape is deliberately flat — exam → subject → chapter — because the planner
 * tracks one checkbox per chapter per stage. Anything finer (topic-level
 * checkboxes) makes the list unreadable at ~90 chapters and is what makes most
 * syllabus trackers get abandoned in week two.
 *
 * `weight` marks chapters that carry disproportionate marks in the real paper,
 * so the planner can suggest what to do next instead of just listing.
 */
export type ExamTrack = "JEE" | "NEET";

export interface Chapter {
  id: string;
  name: string;
  /** "high" = historically heavy weightage in the real paper. */
  weight?: "high";
}

export interface SyllabusSubject {
  subject: string;
  chapters: Chapter[];
}

export const SYLLABUS: Record<ExamTrack, SyllabusSubject[]> = {
  JEE: [
    {
      subject: "Physics",
      chapters: [
        { id: "jp-1", name: "Units, Dimensions & Measurement" },
        { id: "jp-2", name: "Kinematics" },
        { id: "jp-3", name: "Laws of Motion", weight: "high" },
        { id: "jp-4", name: "Work, Energy & Power", weight: "high" },
        { id: "jp-5", name: "Centre of Mass & Collisions" },
        { id: "jp-6", name: "Rotational Motion", weight: "high" },
        { id: "jp-7", name: "Gravitation" },
        { id: "jp-8", name: "Mechanical Properties of Solids & Fluids" },
        { id: "jp-9", name: "Thermal Properties & Calorimetry" },
        { id: "jp-10", name: "Thermodynamics", weight: "high" },
        { id: "jp-11", name: "Kinetic Theory of Gases" },
        { id: "jp-12", name: "Oscillations (SHM)", weight: "high" },
        { id: "jp-13", name: "Waves & Sound" },
        { id: "jp-14", name: "Electrostatics", weight: "high" },
        { id: "jp-15", name: "Capacitance" },
        { id: "jp-16", name: "Current Electricity", weight: "high" },
        { id: "jp-17", name: "Moving Charges & Magnetism" },
        { id: "jp-18", name: "Magnetism & Matter" },
        { id: "jp-19", name: "Electromagnetic Induction", weight: "high" },
        { id: "jp-20", name: "Alternating Current" },
        { id: "jp-21", name: "Electromagnetic Waves" },
        { id: "jp-22", name: "Ray Optics", weight: "high" },
        { id: "jp-23", name: "Wave Optics" },
        { id: "jp-24", name: "Dual Nature of Matter & Radiation" },
        { id: "jp-25", name: "Atoms & Nuclei" },
        { id: "jp-26", name: "Semiconductor Electronics" },
      ],
    },
    {
      subject: "Chemistry",
      chapters: [
        { id: "jc-1", name: "Some Basic Concepts of Chemistry", weight: "high" },
        { id: "jc-2", name: "Atomic Structure", weight: "high" },
        { id: "jc-3", name: "Classification of Elements & Periodicity" },
        { id: "jc-4", name: "Chemical Bonding & Molecular Structure", weight: "high" },
        { id: "jc-5", name: "States of Matter" },
        { id: "jc-6", name: "Thermodynamics (Chemical)", weight: "high" },
        { id: "jc-7", name: "Equilibrium", weight: "high" },
        { id: "jc-8", name: "Redox Reactions" },
        { id: "jc-9", name: "Solutions" },
        { id: "jc-10", name: "Electrochemistry", weight: "high" },
        { id: "jc-11", name: "Chemical Kinetics", weight: "high" },
        { id: "jc-12", name: "The p-Block Elements" },
        { id: "jc-13", name: "The d- and f-Block Elements" },
        { id: "jc-14", name: "Coordination Compounds", weight: "high" },
        { id: "jc-15", name: "Haloalkanes & Haloarenes" },
        { id: "jc-16", name: "Alcohols, Phenols & Ethers" },
        { id: "jc-17", name: "Aldehydes, Ketones & Carboxylic Acids", weight: "high" },
        { id: "jc-18", name: "Amines" },
        { id: "jc-19", name: "Biomolecules" },
        { id: "jc-20", name: "Organic Chemistry — Basic Principles", weight: "high" },
        { id: "jc-21", name: "Hydrocarbons" },
        { id: "jc-22", name: "Purification & Characterisation of Organic Compounds" },
      ],
    },
    {
      subject: "Mathematics",
      chapters: [
        { id: "jm-1", name: "Sets, Relations & Functions" },
        { id: "jm-2", name: "Complex Numbers", weight: "high" },
        { id: "jm-3", name: "Quadratic Equations" },
        { id: "jm-4", name: "Matrices & Determinants", weight: "high" },
        { id: "jm-5", name: "Permutations & Combinations" },
        { id: "jm-6", name: "Binomial Theorem" },
        { id: "jm-7", name: "Sequences & Series" },
        { id: "jm-8", name: "Limits, Continuity & Differentiability", weight: "high" },
        { id: "jm-9", name: "Differential Calculus — Applications", weight: "high" },
        { id: "jm-10", name: "Integral Calculus", weight: "high" },
        { id: "jm-11", name: "Differential Equations" },
        { id: "jm-12", name: "Straight Lines & Circles", weight: "high" },
        { id: "jm-13", name: "Conic Sections" },
        { id: "jm-14", name: "3D Geometry" },
        { id: "jm-15", name: "Vector Algebra" },
        { id: "jm-16", name: "Statistics & Probability", weight: "high" },
        { id: "jm-17", name: "Trigonometry" },
        { id: "jm-18", name: "Mathematical Reasoning" },
      ],
    },
  ],
  NEET: [
    {
      subject: "Biology",
      chapters: [
        { id: "nb-1", name: "The Living World" },
        { id: "nb-2", name: "Biological Classification" },
        { id: "nb-3", name: "Plant Kingdom" },
        { id: "nb-4", name: "Animal Kingdom", weight: "high" },
        { id: "nb-5", name: "Morphology of Flowering Plants" },
        { id: "nb-6", name: "Anatomy of Flowering Plants" },
        { id: "nb-7", name: "Structural Organisation in Animals" },
        { id: "nb-8", name: "Cell: The Unit of Life", weight: "high" },
        { id: "nb-9", name: "Biomolecules" },
        { id: "nb-10", name: "Cell Cycle & Cell Division", weight: "high" },
        { id: "nb-11", name: "Photosynthesis in Higher Plants", weight: "high" },
        { id: "nb-12", name: "Respiration in Plants" },
        { id: "nb-13", name: "Plant Growth & Development" },
        { id: "nb-14", name: "Breathing & Exchange of Gases" },
        { id: "nb-15", name: "Body Fluids & Circulation", weight: "high" },
        { id: "nb-16", name: "Excretory Products & Their Elimination" },
        { id: "nb-17", name: "Locomotion & Movement" },
        { id: "nb-18", name: "Neural Control & Coordination" },
        { id: "nb-19", name: "Chemical Coordination & Integration", weight: "high" },
        { id: "nb-20", name: "Sexual Reproduction in Flowering Plants", weight: "high" },
        { id: "nb-21", name: "Human Reproduction", weight: "high" },
        { id: "nb-22", name: "Reproductive Health" },
        { id: "nb-23", name: "Principles of Inheritance & Variation", weight: "high" },
        { id: "nb-24", name: "Molecular Basis of Inheritance", weight: "high" },
        { id: "nb-25", name: "Evolution" },
        { id: "nb-26", name: "Human Health & Disease" },
        { id: "nb-27", name: "Microbes in Human Welfare" },
        { id: "nb-28", name: "Biotechnology: Principles & Processes", weight: "high" },
        { id: "nb-29", name: "Biotechnology & Its Applications" },
        { id: "nb-30", name: "Organisms & Populations" },
        { id: "nb-31", name: "Ecosystem" },
        { id: "nb-32", name: "Biodiversity & Conservation" },
      ],
    },
    {
      subject: "Physics",
      chapters: [
        { id: "np-1", name: "Physical World & Measurement" },
        { id: "np-2", name: "Kinematics" },
        { id: "np-3", name: "Laws of Motion", weight: "high" },
        { id: "np-4", name: "Work, Energy & Power" },
        { id: "np-5", name: "Motion of System of Particles & Rigid Body", weight: "high" },
        { id: "np-6", name: "Gravitation" },
        { id: "np-7", name: "Properties of Bulk Matter" },
        { id: "np-8", name: "Thermodynamics", weight: "high" },
        { id: "np-9", name: "Kinetic Theory of Gases" },
        { id: "np-10", name: "Oscillations & Waves" },
        { id: "np-11", name: "Electrostatics", weight: "high" },
        { id: "np-12", name: "Current Electricity", weight: "high" },
        { id: "np-13", name: "Magnetic Effects of Current & Magnetism" },
        { id: "np-14", name: "Electromagnetic Induction & Alternating Current" },
        { id: "np-15", name: "Electromagnetic Waves" },
        { id: "np-16", name: "Optics", weight: "high" },
        { id: "np-17", name: "Dual Nature of Matter & Radiation" },
        { id: "np-18", name: "Atoms & Nuclei" },
        { id: "np-19", name: "Electronic Devices" },
      ],
    },
    {
      subject: "Chemistry",
      chapters: [
        { id: "nc-1", name: "Some Basic Concepts of Chemistry" },
        { id: "nc-2", name: "Structure of Atom", weight: "high" },
        { id: "nc-3", name: "Classification of Elements & Periodicity" },
        { id: "nc-4", name: "Chemical Bonding & Molecular Structure", weight: "high" },
        { id: "nc-5", name: "States of Matter" },
        { id: "nc-6", name: "Thermodynamics" },
        { id: "nc-7", name: "Equilibrium", weight: "high" },
        { id: "nc-8", name: "Redox Reactions" },
        { id: "nc-9", name: "Solutions" },
        { id: "nc-10", name: "Electrochemistry" },
        { id: "nc-11", name: "Chemical Kinetics" },
        { id: "nc-12", name: "p-Block Elements" },
        { id: "nc-13", name: "d- and f-Block Elements" },
        { id: "nc-14", name: "Coordination Compounds", weight: "high" },
        { id: "nc-15", name: "Haloalkanes & Haloarenes" },
        { id: "nc-16", name: "Alcohols, Phenols & Ethers" },
        { id: "nc-17", name: "Aldehydes, Ketones & Carboxylic Acids", weight: "high" },
        { id: "nc-18", name: "Amines" },
        { id: "nc-19", name: "Biomolecules" },
        { id: "nc-20", name: "Organic Chemistry — Basic Principles", weight: "high" },
        { id: "nc-21", name: "Hydrocarbons" },
      ],
    },
  ],
};

/** Three stages per chapter — the planner tracks each independently. */
export const STAGES = [
  { key: "learn", label: "Learn", hint: "Read the theory once" },
  { key: "practice", label: "Practice", hint: "Solve questions on it" },
  { key: "revise", label: "Revise", hint: "Come back after a gap" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export function chapterCount(track: ExamTrack): number {
  return SYLLABUS[track].reduce((n, s) => n + s.chapters.length, 0);
}
