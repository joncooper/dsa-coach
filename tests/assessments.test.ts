import { describe, expect, it } from "vitest";
import {
  appendScorecardHistory,
  resolveLevelCode,
  resumeShift
} from "../src/content/assessments/seeding";
import {
  bandScore,
  coachingSummary,
  levelPoints,
  mergeBestResult,
  summarizeScorecard
} from "../src/content/assessments/scoring";
import { findAssessment } from "../src/content/assessments";
import type {
  Assessment,
  AssessmentLevelResult,
  AssessmentSessionState
} from "../src/types";

const STARTER_L1 = "def solution(queries):\n    return []\n";
const STARTER_L2 = "def solution(queries):\n    return []  # extend L1\n";

describe("resolveLevelCode (carry-forward)", () => {
  it("resumes the current level's saved buffer when present", () => {
    expect(
      resolveLevelCode({
        level: 2,
        savedForLevel: "USER CODE",
        savedForPrevLevel: "L1 CODE",
        levelStarter: STARTER_L2
      })
    ).toBe("USER CODE");
  });

  it("treats an empty saved buffer as in-progress (does not overwrite)", () => {
    // The candidate may have intentionally cleared the editor; never replace it.
    expect(
      resolveLevelCode({
        level: 2,
        savedForLevel: "",
        savedForPrevLevel: "L1 CODE",
        levelStarter: STARTER_L2
      })
    ).toBe("");
  });

  it("seeds Level 1 from the authored starter when no buffer exists", () => {
    expect(
      resolveLevelCode({
        level: 1,
        savedForLevel: undefined,
        savedForPrevLevel: undefined,
        levelStarter: STARTER_L1
      })
    ).toBe(STARTER_L1);
  });

  it("seeds a higher level from the previous level's user buffer (never the reference)", () => {
    expect(
      resolveLevelCode({
        level: 3,
        savedForLevel: undefined,
        savedForPrevLevel: "L2 USER CODE",
        levelStarter: STARTER_L2
      })
    ).toBe("L2 USER CODE");
  });

  it("falls back to its own starter if the previous level was never opened", () => {
    expect(
      resolveLevelCode({
        level: 3,
        savedForLevel: undefined,
        savedForPrevLevel: undefined,
        levelStarter: STARTER_L2
      })
    ).toBe(STARTER_L2);
  });
});

describe("resumeShift (pause/resume timestamps)", () => {
  const START = "2026-05-19T10:00:00.000Z";
  const PAUSED = "2026-05-19T10:30:00.000Z"; // 30 min after start
  const END_90 = "2026-05-19T11:30:00.000Z"; // start + 90 min

  it("shifts startedAt and endsAt forward by the pause duration", () => {
    // Resume 10 minutes after pausing → both anchors shift by exactly 10 min.
    const RESUME_NOW = new Date("2026-05-19T10:40:00.000Z").getTime();
    const out = resumeShift({
      startedAt: START,
      endsAt: END_90,
      pausedAt: PAUSED,
      resumeNowMs: RESUME_NOW
    });
    expect(out.startedAt).toBe("2026-05-19T10:10:00.000Z"); // 10:00 + 10 min
    expect(out.endsAt).toBe("2026-05-19T11:40:00.000Z"); // 11:30 + 10 min
  });

  it("preserves elapsed (now - startedAt) across the pause", () => {
    // Pre-pause: at 10:30, elapsed = 30 min.
    // Post-resume at 10:40, elapsed should STILL be 30 min — the pause itself
    // doesn't count as practice time.
    const RESUME_NOW = new Date("2026-05-19T10:40:00.000Z").getTime();
    const out = resumeShift({
      startedAt: START,
      endsAt: END_90,
      pausedAt: PAUSED,
      resumeNowMs: RESUME_NOW
    });
    const elapsedAfter = RESUME_NOW - new Date(out.startedAt).getTime();
    expect(elapsedAfter).toBe(30 * 60_000);
  });

  it("preserves remaining (endsAt - now) across the pause", () => {
    // At pause time (10:30), remaining on a 90-min exam = 60 min.
    // After a 10-min pause and resume, remaining should still be 60 min.
    const RESUME_NOW = new Date("2026-05-19T10:40:00.000Z").getTime();
    const out = resumeShift({
      startedAt: START,
      endsAt: END_90,
      pausedAt: PAUSED,
      resumeNowMs: RESUME_NOW
    });
    const remainingAfter = new Date(out.endsAt!).getTime() - RESUME_NOW;
    expect(remainingAfter).toBe(60 * 60_000);
  });

  it("leaves endsAt undefined for practice mode (no countdown)", () => {
    const RESUME_NOW = new Date("2026-05-19T10:40:00.000Z").getTime();
    const out = resumeShift({
      startedAt: START,
      endsAt: undefined,
      pausedAt: PAUSED,
      resumeNowMs: RESUME_NOW
    });
    expect(out.endsAt).toBeUndefined();
    expect(out.startedAt).toBe("2026-05-19T10:10:00.000Z");
  });

  it("treats a negative pause duration as zero (clock drift safety)", () => {
    // If wall-clock moves backwards between pause and resume (NTP adjust),
    // never gift the candidate extra time.
    const BAD_RESUME = new Date("2026-05-19T10:20:00.000Z").getTime(); // before pause
    const out = resumeShift({
      startedAt: START,
      endsAt: END_90,
      pausedAt: PAUSED,
      resumeNowMs: BAD_RESUME
    });
    expect(out.startedAt).toBe(START);
    expect(out.endsAt).toBe(END_90);
  });
});

describe("appendScorecardHistory", () => {
  it("returns a single-entry array when there is no prior history", () => {
    const out = appendScorecardHistory(undefined, "a");
    expect(out).toEqual(["a"]);
  });

  it("prepends the new entry (newest first)", () => {
    const out = appendScorecardHistory(["b", "c"], "a");
    expect(out).toEqual(["a", "b", "c"]);
  });

  it("caps growth so unbounded attempts don't bloat settings", () => {
    const seed = Array.from({ length: 20 }, (_, i) => `e${i}`);
    const out = appendScorecardHistory(seed, "new", 20);
    expect(out).toHaveLength(20);
    expect(out[0]).toBe("new");
    // Oldest entry (e19) gets dropped.
    expect(out).not.toContain("e19");
    expect(out).toContain("e18");
  });

  it("treats a non-array prior value as empty (defensive against bad storage)", () => {
    // Cast-as-any-shape simulates a settings record that lost its array.
    const out = appendScorecardHistory(undefined as unknown as string[], "a");
    expect(out).toEqual(["a"]);
  });
});

describe("scoring math", () => {
  const result = (visible: [number, number], hidden: [number, number]): AssessmentLevelResult => ({
    level: 1,
    visiblePassed: visible[0],
    visibleTotal: visible[1],
    hiddenPassed: hidden[0],
    hiddenTotal: hidden[1],
    attempts: 1,
    points: 0,
    lastRunAt: "2026-05-19T00:00:00.000Z"
  });

  it("levelPoints gives full credit when every test passes", () => {
    expect(levelPoints(result([4, 4], [6, 6]), 60)).toBe(60);
  });

  it("levelPoints gives partial credit weighted by test count", () => {
    // 5/10 tests passed * 100 max -> 50
    expect(levelPoints(result([2, 4], [3, 6]), 100)).toBe(50);
  });

  it("levelPoints returns 0 when the level was never run", () => {
    expect(levelPoints(result([0, 0], [0, 0]), 100)).toBe(0);
  });

  it("bandScore maps 0 raw to the band floor and full raw to the ceiling", () => {
    expect(bandScore(0, 400, { min: 200, max: 600 })).toBe(200);
    expect(bandScore(400, 400, { min: 200, max: 600 })).toBe(600);
    expect(bandScore(200, 400, { min: 200, max: 600 })).toBe(400);
  });

  it("bandScore clamps inputs to the band edges", () => {
    expect(bandScore(-5, 400, { min: 200, max: 600 })).toBe(200);
    expect(bandScore(9999, 400, { min: 200, max: 600 })).toBe(600);
  });

  it("mergeBestResult keeps the run that passed more total tests", () => {
    const weaker = result([1, 4], [0, 6]);
    const stronger = { ...result([3, 4], [4, 6]), attempts: 2, lastRunAt: "2026-05-19T01:00:00.000Z" };
    const merged = mergeBestResult(weaker, stronger);
    expect(merged.visiblePassed).toBe(3);
    expect(merged.hiddenPassed).toBe(4);
    // Attempts accumulate; lastRunAt reflects the most recent run.
    expect(merged.attempts).toBe(2);
    expect(merged.lastRunAt).toBe("2026-05-19T01:00:00.000Z");
  });

  it("mergeBestResult keeps the previous best when the new run is weaker", () => {
    const stronger = result([4, 4], [5, 6]);
    const weaker = { ...result([1, 4], [1, 6]), attempts: 3, lastRunAt: "2026-05-19T02:00:00.000Z" };
    const merged = mergeBestResult(stronger, weaker);
    expect(merged.visiblePassed).toBe(4);
    expect(merged.hiddenPassed).toBe(5);
    // But the attempt counter still bumps and the lastRunAt advances.
    expect(merged.attempts).toBe(3);
    expect(merged.lastRunAt).toBe("2026-05-19T02:00:00.000Z");
  });
});

describe("summarizeScorecard", () => {
  const assessment = findAssessment("filesystem") as Assessment;

  function session(overrides: Partial<AssessmentSessionState> = {}): AssessmentSessionState {
    return {
      assessmentId: "filesystem",
      mode: "exam",
      startedAt: "2026-05-19T00:00:00.000Z",
      unlockedLevel: 1,
      levelResults: {},
      status: "in-progress",
      ...overrides
    };
  }

  it("produces band floor when nothing was attempted", () => {
    const card = summarizeScorecard(assessment, session(), 0);
    expect(card.totalScore).toBe(200);
    expect(card.rawPoints).toBe(0);
    expect(card.maxRawPoints).toBe(400);
    expect(card.completedLevels).toBe(0);
    expect(card.perLevel).toHaveLength(4);
  });

  it("counts only fully-passed levels as completed", () => {
    const card = summarizeScorecard(
      assessment,
      session({
        levelResults: {
          1: {
            level: 1,
            visiblePassed: 4,
            visibleTotal: 4,
            hiddenPassed: 6,
            hiddenTotal: 6,
            attempts: 1,
            points: 0,
            lastRunAt: "2026-05-19T00:10:00.000Z"
          },
          2: {
            level: 2,
            visiblePassed: 4,
            visibleTotal: 4,
            hiddenPassed: 3,
            hiddenTotal: 5,
            attempts: 1,
            points: 0,
            lastRunAt: "2026-05-19T00:20:00.000Z"
          }
        }
      }),
      45 * 60_000
    );
    expect(card.completedLevels).toBe(1); // L1 full, L2 partial
    expect(card.perLevel[0].points).toBe(60); // L1 full = 60
    expect(card.perLevel[1].points).toBeGreaterThan(0);
    expect(card.perLevel[1].points).toBeLessThan(90);
    expect(card.totalScore).toBeGreaterThan(200);
  });

  it("awards the full 600 when every test passes on every level", () => {
    const full = (level: number): AssessmentLevelResult => ({
      level,
      visiblePassed: 10,
      visibleTotal: 10,
      hiddenPassed: 10,
      hiddenTotal: 10,
      attempts: 1,
      points: 0,
      lastRunAt: "2026-05-19T00:30:00.000Z"
    });
    const card = summarizeScorecard(
      assessment,
      session({ levelResults: { 1: full(1), 2: full(2), 3: full(3), 4: full(4) } }),
      80 * 60_000
    );
    expect(card.completedLevels).toBe(4);
    expect(card.rawPoints).toBe(card.maxRawPoints);
    expect(card.totalScore).toBe(600);
  });
});

describe("coachingSummary heuristics", () => {
  function card(over: {
    completedLevels?: number;
    perLevel: AssessmentLevelResult[];
  }) {
    return {
      assessmentId: "filesystem" as const,
      mode: "exam" as const,
      totalScore: 0,
      rawPoints: 0,
      maxRawPoints: 400,
      perLevel: over.perLevel,
      elapsedMs: 0,
      completedLevels: over.completedLevels ?? 0,
      generatedAt: "2026-05-19T00:00:00.000Z"
    };
  }
  const lvl = (level: number, attempts: number, passed: number, total: number): AssessmentLevelResult => ({
    level,
    visiblePassed: passed,
    visibleTotal: total,
    hiddenPassed: 0,
    hiddenTotal: 0,
    attempts,
    points: 0,
    lastRunAt: attempts ? "2026-05-19T00:10:00.000Z" : ""
  });

  it("celebrates a clean sweep", () => {
    const all = card({
      completedLevels: 4,
      perLevel: [lvl(1, 1, 4, 4), lvl(2, 1, 5, 5), lvl(3, 1, 6, 6), lvl(4, 1, 7, 7)]
    });
    expect(coachingSummary(all)).toMatch(/faster/i);
  });

  it("calls out stalling on Level 1", () => {
    const stalled = card({
      completedLevels: 0,
      perLevel: [lvl(1, 3, 1, 4), lvl(2, 0, 0, 0), lvl(3, 0, 0, 0), lvl(4, 0, 0, 0)]
    });
    expect(coachingSummary(stalled)).toMatch(/level 1/i);
  });

  it("flags reaching far but cleaning few", () => {
    const overreach = card({
      completedLevels: 1,
      perLevel: [lvl(1, 1, 4, 4), lvl(2, 1, 2, 5), lvl(3, 1, 1, 6), lvl(4, 0, 0, 0)]
    });
    expect(coachingSummary(overreach)).toMatch(/hidden|edge|leak/i);
  });
});
