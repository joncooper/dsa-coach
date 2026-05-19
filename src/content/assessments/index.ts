import type { Assessment, Problem, ProblemSet } from "../../types";
import { ASSESSMENT_SET_ID } from "./_shared";
import { filesystemAssessment, filesystemProblem } from "./filesystem";

export { ASSESSMENT_SET_ID } from "./_shared";

/**
 * CodeSignal ICF practice assessments.
 *
 * `assessmentProblemSet` is an additive `ProblemSet` (so the existing content
 * validation and reference-solution verification gates cover every level via
 * the normal problem-set path — no special-casing). `assessments` is the
 * exam-only metadata registry consumed by the assessment UI; it is NOT part
 * of `CourseData` and intentionally does not inflate any course counts.
 *
 * Ship order: Progressive Filesystem first; Banking and In-Memory DB are
 * appended here as they are authored.
 */
const ASSESSMENT_PROBLEMS: Problem[] = [filesystemProblem];

export const assessments: Assessment[] = [filesystemAssessment];

export const assessmentProblemSet: ProblemSet = {
  id: ASSESSMENT_SET_ID,
  title: "CodeSignal ICF Practice",
  summary:
    "Timed, four-level evolving problems in the CodeSignal Industry Coding Framework format.",
  intro:
    "Each assessment is one problem that grows across four progressive levels under a single carry-forward solution. Practice the format itself: read all levels first, design a data model that survives to Level 4, and bank the early levels fast so the hard ones have time.",
  problems: ASSESSMENT_PROBLEMS
};

export const assessmentSets: ProblemSet[] = [assessmentProblemSet];

/** Look up the exam descriptor for an assessment id. */
export function findAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
