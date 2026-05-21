import type { AdapterKind, Difficulty, ProblemTest } from "../../types";

/**
 * A hand-authored bonus problem for one chapter. `course.ts` maps each seed to
 * a full `BonusProblem` via `makeBonusProblem`. Unlike the old generic
 * generator, every seed is a real, chapter-specific practice problem.
 *
 * Authoring rules (enforced by `scripts/verify-bonus-chapter.ts`):
 * - `patterns` must include the `chapterId`.
 * - `code` must define `def <entrypoint>(` and pass every visible + hidden test.
 * - Within a chapter, no two seeds may share a structurally identical solution.
 * - `prompt` >= 40 chars, `solution`/`walkthrough` >= 30, each hint >= 8,
 *   each constraint >= 5; at least one visible and one hidden test.
 */
export interface BonusSeed {
  /** Stable id, e.g. "foundations-bonus-01". */
  id: string;
  chapterId: string;
  /** A specific, real problem title (no chapter suffix). */
  title: string;
  difficulty: Difficulty;
  /** Pattern tags; must include `chapterId`. */
  patterns: string[];
  /** Python function name the learner implements. */
  entrypoint: string;
  /** Parameter list for the starter stub, e.g. "nums, target". */
  signature: string;
  /** Defaults to "default". Use "linked-list"/"binary-tree" when inputs need adapting. */
  adapter?: AdapterKind;
  /** Problem statement. */
  prompt: string;
  /** Input / behaviour constraints. */
  constraints: string[];
  /** Progressive hints (gentle first). */
  hints: string[];
  /** One-paragraph approach summary. */
  solution: string;
  /** Short reasoning walkthrough. */
  walkthrough: string;
  /** Two interview-style follow-up questions. */
  followUps: string[];
  /** The verified Python solution; used as both referenceCode and solutionCode. */
  code: string;
  /** Illustrative tests, shown to the learner. */
  visibleTests: ProblemTest[];
  /** Hidden tests covering edge cases. */
  hiddenTests: ProblemTest[];
  time: string;
  space: string;
}
