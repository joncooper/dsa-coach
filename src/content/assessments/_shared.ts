import type { Assessment, AssessmentLevel, Problem, ProblemTest } from "../../types";

/**
 * CodeSignal ICF practice mode content.
 *
 * Each assessment is ONE evolving problem with four progressive levels:
 *   - Level 1 is the base `Problem`.
 *   - Levels 2-4 are `Problem.parts[]` (in order).
 *
 * The defining ICF behaviour is code carry-forward: the candidate's level-N
 * code becomes the starting point for level N+1. For that to work every level
 * MUST expose the SAME entrypoint with the SAME signature. We standardise on:
 *
 *     def solution(queries: List[List[str]]) -> List[str]
 *
 * Each query is `[OP, arg1, arg2, ...]` (all strings); the function returns one
 * string per query. Returning strings only (with "" for none/false-ish where
 * natural) keeps the harness's `actual == expected` comparison exact, so no
 * custom validators are needed — author every spec with deterministic output
 * (stable sort orders, integer arithmetic).
 */
export const ASSESSMENT_SET_ID = "assessments";
export const ASSESSMENT_ENTRYPOINT = "solution";

/** Stamps the set-level fields that are constant for every assessment problem. */
export function assessmentProblem(
  problem: Omit<Problem, "chapterId" | "source" | "adapter" | "entrypoint"> &
    Partial<Pick<Problem, "entrypoint">>
): Problem {
  return {
    chapterId: ASSESSMENT_SET_ID,
    source: "guided",
    adapter: "default",
    entrypoint: ASSESSMENT_ENTRYPOINT,
    ...problem
  };
}

/**
 * Default raw point weights — later levels are weighted heavier, matching the
 * CodeSignal cumulative model. Sum = 400; mapped onto the 200–600 band in
 * `scoring.ts`.
 */
export const DEFAULT_LEVEL_POINTS = [60, 90, 120, 130] as const;
export const DEFAULT_RECOMMENDED_MINUTES = [12, 20, 30, 28] as const;
export const ASSESSMENT_SCORE_BAND = { min: 200, max: 600 } as const;

/**
 * Builds the standard 4-level descriptor: level 1 → "base", levels 2-4 → the
 * Problem's parts[] ids (in order). `partIds` is the ordered list of the three
 * `ProblemPart.id`s for levels 2, 3, 4.
 */
export function standardLevels(partIds: [string, string, string]): AssessmentLevel[] {
  const partForLevel = ["base", ...partIds];
  return [1, 2, 3, 4].map((level) => ({
    level,
    partId: partForLevel[level - 1],
    maxPoints: DEFAULT_LEVEL_POINTS[level - 1],
    recommendedMinutes: DEFAULT_RECOMMENDED_MINUTES[level - 1]
  }));
}

/** Convenience for op-sequence tests: `solution([...queries])`. */
export function opTest(name: string, queries: string[][], expected: string[]): ProblemTest {
  return { name, args: [queries], expected };
}

export type { Assessment };
