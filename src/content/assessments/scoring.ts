import type {
  Assessment,
  AssessmentLevelResult,
  AssessmentScorecard,
  AssessmentSessionState
} from "../../types";

/**
 * Pure scoring for the CodeSignal ICF mode. Mirrors the platform's model:
 * per-level partial credit (each test equal weight within its level, hidden
 * weighted like visible), cumulative across levels, then linearly mapped onto
 * the score band (CodeSignal floors at 200 and caps at 600).
 *
 * All functions here are deterministic and side-effect free so they can be
 * unit-tested directly and called after every run.
 */

/** Raw points earned at one level (best-of-submissions result feeds this). */
export function levelPoints(result: AssessmentLevelResult, maxPoints: number): number {
  const passed = result.visiblePassed + result.hiddenPassed;
  const total = result.visibleTotal + result.hiddenTotal;
  if (total <= 0) return 0;
  return Math.round((maxPoints * passed) / total);
}

/** Maps cumulative raw points onto the assessment's banded score (e.g. 200–600). */
export function bandScore(
  rawPoints: number,
  maxRawPoints: number,
  band: { min: number; max: number }
): number {
  if (maxRawPoints <= 0) return band.min;
  const clamped = Math.max(0, Math.min(rawPoints, maxRawPoints));
  return Math.round(band.min + (band.max - band.min) * (clamped / maxRawPoints));
}

/**
 * Keeps the stronger of two results for the same level (CodeSignal counts your
 * best submission per level). Compares total tests passed; ties resolve to the
 * more recent run so attempt counts and timestamps stay monotonic.
 */
export function mergeBestResult(
  a: AssessmentLevelResult | undefined,
  b: AssessmentLevelResult
): AssessmentLevelResult {
  if (!a) return b;
  const aPassed = a.visiblePassed + a.hiddenPassed;
  const bPassed = b.visiblePassed + b.hiddenPassed;
  const best = bPassed >= aPassed ? b : a;
  // Attempts and "last run" always reflect the full history, not just the best.
  return {
    ...best,
    attempts: Math.max(a.attempts, b.attempts),
    lastRunAt: a.lastRunAt > b.lastRunAt ? a.lastRunAt : b.lastRunAt
  };
}

/** Builds the end-of-assessment scorecard from the session's best per-level results. */
export function summarizeScorecard(
  assessment: Assessment,
  session: AssessmentSessionState,
  elapsedMs: number
): AssessmentScorecard {
  const perLevel: AssessmentLevelResult[] = [];
  let rawPoints = 0;
  let maxRawPoints = 0;
  let completedLevels = 0;

  for (const lvl of assessment.levels) {
    maxRawPoints += lvl.maxPoints;
    const result = session.levelResults[lvl.level];
    if (!result) {
      perLevel.push({
        level: lvl.level,
        visiblePassed: 0,
        visibleTotal: 0,
        hiddenPassed: 0,
        hiddenTotal: 0,
        attempts: 0,
        points: 0,
        lastRunAt: ""
      });
      continue;
    }
    const points = levelPoints(result, lvl.maxPoints);
    rawPoints += points;
    const total = result.visibleTotal + result.hiddenTotal;
    if (total > 0 && result.visiblePassed + result.hiddenPassed === total) {
      completedLevels += 1;
    }
    perLevel.push({ ...result, points });
  }

  return {
    assessmentId: assessment.id,
    mode: session.mode,
    totalScore: bandScore(rawPoints, maxRawPoints, assessment.scoreBand),
    rawPoints,
    maxRawPoints,
    perLevel,
    elapsedMs,
    completedLevels,
    generatedAt: new Date().toISOString()
  };
}

/**
 * One-line, heuristic (no-LLM) coaching takeaway for the report screen.
 * Targets the most common ICF failure modes: stalling early vs. running out
 * of time on the back half.
 */
export function coachingSummary(card: AssessmentScorecard): string {
  const solved = card.completedLevels;
  const lastFull = [...card.perLevel].reverse().find(
    (l) => l.visibleTotal + l.hiddenTotal > 0 &&
      l.visiblePassed + l.hiddenPassed === l.visibleTotal + l.hiddenTotal
  );
  const reached = card.perLevel.filter((l) => l.attempts > 0).length;

  if (solved === 4) {
    return "All four levels cleared — focus next on doing it faster and on the first submission.";
  }
  if (solved === 0 && reached <= 1) {
    return "Stalled on Level 1 — practice translating an operation list into a clean dispatcher before optimising.";
  }
  if (reached > solved + 1) {
    return `Reached Level ${reached} but only fully cleared ${solved} — slow down on edge cases; the hidden tests are where points leak.`;
  }
  if (lastFull && lastFull.level >= 2 && reached === lastFull.level) {
    return `Solid through Level ${lastFull.level}, then time ran out — time-box the early levels tighter to bank the harder ones.`;
  }
  return `Cleared ${solved} of 4 levels — review the unsolved level's reference, then replay under the clock.`;
}
