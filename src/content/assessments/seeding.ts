/**
 * Carry-forward seeding for assessment level buffers.
 *
 * CodeSignal ICF pre-populates Level N+1 with whatever the candidate left in
 * Level N — not the reference, not the starter, just their own most recent
 * code. This pure resolver enforces that contract:
 *
 *   1. If the current level already has a saved buffer (string), resume it.
 *      In-progress work is NEVER overwritten — that includes empty strings.
 *   2. Else if it's Level 1, fall back to the level's authored starter.
 *   3. Else (first visit to a higher level), seed from the previous level's
 *      saved buffer — the candidate's own code, never the reference.
 *   4. Defensive fallback: if the previous level was somehow never opened
 *      (gating should prevent this), fall back to the current level's
 *      starter so the editor is never empty.
 *
 * Keeping this as a pure function makes the rule trivially unit-testable
 * and decouples it from the IndexedDB-backed settings store the UI uses.
 */
export interface SeedingInput {
  /** 1..4 */
  level: number;
  /** Current level's saved buffer (from settings), if any. */
  savedForLevel: string | undefined;
  /** Previous level's saved buffer (from settings), if any. */
  savedForPrevLevel: string | undefined;
  /** The current level's authored `starterCode`. */
  levelStarter: string;
}

export function resolveLevelCode(input: SeedingInput): string {
  if (typeof input.savedForLevel === "string") return input.savedForLevel;
  if (input.level <= 1) return input.levelStarter;
  if (typeof input.savedForPrevLevel === "string") return input.savedForPrevLevel;
  return input.levelStarter;
}

/** Settings key for a per-level code buffer. */
export function codeKey(assessmentId: string, level: number): string {
  return `assessment:code:${assessmentId}#L${level}`;
}

/** Settings key for the session state. */
export function sessionKey(assessmentId: string): string {
  return `assessment:session:${assessmentId}`;
}

/** Settings key for the most recent scorecard. */
export function scorecardKey(assessmentId: string): string {
  return `assessment:scorecard:${assessmentId}`;
}
