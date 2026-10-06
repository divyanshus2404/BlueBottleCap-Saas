/**
 * Question pool for the browsable Question Bank.
 *
 * These alias the ALL_* sets, which are the small curated sets PLUS
 * `data/bulkQuestions`. The bank previously re-exported only the small sets,
 * so it showed 80 of the 291 questions actually shipped — the other 210 were
 * bundled and used by the mock tests but unreachable from the bank.
 *
 * Keep this pointed at ALL_*: anything added to bulkQuestions should appear
 * in the bank automatically, with no change here.
 */
export {
  ALL_PHYSICS as PHYSICS_QUESTIONS,
  ALL_CHEMISTRY as CHEMISTRY_QUESTIONS,
  ALL_MATHS as MATHS_QUESTIONS,
  ALL_BIOLOGY as BIOLOGY_QUESTIONS,
} from "./mockTest";
export type { MockQuestion } from "./mockTest";
