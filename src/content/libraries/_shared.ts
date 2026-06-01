import type { Problem } from "../../types";

/**
 * Library practice — small, focused sections that teach a specific Python
 * library by giving you problems that are awkward without it.
 *
 * Each section is its own ProblemSet (one set per library), so the existing
 * /set/:setId routing, ProblemSetPage, and verify-reference-solutions gate
 * pick them up with no special-casing.
 */

export const LIBRARY_SORTEDCONTAINERS_SET_ID = "lib-sortedcontainers";
export const LIBRARY_ORDEREDDICT_SET_ID = "lib-ordered-dict";
export const LIBRARY_ASYNCIO_SET_ID = "lib-asyncio";

export const LIBRARY_SET_IDS: readonly string[] = [
  LIBRARY_SORTEDCONTAINERS_SET_ID,
  LIBRARY_ORDEREDDICT_SET_ID,
  LIBRARY_ASYNCIO_SET_ID
] as const;

/**
 * Builder for a library-section problem. Stamps `chapterId` (= setId),
 * `source: "guided"`, and `adapter: "default"`; the caller provides the
 * problem-specific fields plus its `entrypoint`.
 */
export function libraryProblem(setId: string) {
  return (
    problem: Omit<Problem, "chapterId" | "source" | "adapter"> &
      Partial<Pick<Problem, "adapter">>
  ): Problem => ({
    chapterId: setId,
    source: "guided",
    adapter: problem.adapter ?? "default",
    ...problem
  });
}
