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

/**
 * Snapshot of a per-level code buffer captured at the moment the session
 * finished (submitted or expired). Survives any post-finish edits in
 * review mode so the report screen can always show "what you had when the
 * clock stopped" as a benchmark.
 */
export function finishCodeKey(assessmentId: string, level: number): string {
  return `assessment:finish-code:${assessmentId}#L${level}`;
}

/** Settings key for the session state. */
export function sessionKey(assessmentId: string): string {
  return `assessment:session:${assessmentId}`;
}

/** Settings key for the most recent scorecard. */
export function scorecardKey(assessmentId: string): string {
  return `assessment:scorecard:${assessmentId}`;
}

/**
 * Compute the resumed `startedAt` / `endsAt` after a pause.
 *
 * Both timestamps are shifted forward by the pause duration so that
 *   elapsed   = nowAfterResume - startedAt'
 *   remaining = endsAt'        - nowAfterResume
 * stay equal to their pre-pause values without bookkeeping a running pause
 * total. Pure, isoformat in / isoformat out, easy to unit-test.
 */
export interface ResumeInput {
  startedAt: string;
  endsAt?: string;
  pausedAt: string;
  /** When the resume happens (epoch ms). Caller passes Date.now() in prod. */
  resumeNowMs: number;
}

export interface ResumeOutput {
  startedAt: string;
  endsAt?: string;
}

export function resumeShift(input: ResumeInput): ResumeOutput {
  const pauseMs = Math.max(0, input.resumeNowMs - new Date(input.pausedAt).getTime());
  const shifted = (iso: string) => new Date(new Date(iso).getTime() + pauseMs).toISOString();
  return {
    startedAt: shifted(input.startedAt),
    endsAt: input.endsAt ? shifted(input.endsAt) : undefined
  };
}
