import { describe, expect, test } from "bun:test";
import { migrateLegacyBackup, type LegacyBackupPayload } from "../src/storage/legacyMigration.js";

describe("legacy backup migration", () => {
  test("preserves progress, notes, submissions, buffers, assessments, preferences, and coach logs", () => {
    const legacy: LegacyBackupPayload = {
      exportedAt: "2026-05-23T12:00:00.000Z",
      progress: [
        {
          key: "problem:running-maximum",
          type: "problem",
          id: "running-maximum",
          status: "complete",
          dueAt: "2026-05-30T12:00:00.000Z",
          updatedAt: "2026-05-23T12:01:00.000Z"
        }
      ],
      notes: [
        {
          key: "problem:running-maximum",
          itemType: "problem",
          itemId: "running-maximum",
          body: "Remember the invariant.",
          updatedAt: "2026-05-23T12:02:00.000Z"
        }
      ],
      submissions: [
        {
          id: 7,
          problemId: "running-maximum",
          code: "def running_maximum(nums): return nums",
          passed: false,
          result: { status: "failed" },
          createdAt: "2026-05-23T12:03:00.000Z"
        }
      ],
      settings: [
        { key: "code:running-maximum", value: "def running_maximum(nums):\n    return []" },
        { key: "code:multi-part#part-2", value: "def solve(x):\n    return x" },
        { key: "code:filesystem#L1", value: "def solution(queries):\n    return []" },
        { key: "scratchpad:running-maximum", value: "print('notes')" },
        { key: "assessment:code:filesystem#L2", value: "def solution(queries):\n    return []" },
        { key: "assessment:finish-code:filesystem#L2", value: "def solution(queries):\n    return ['done']" },
        { key: "assessment:session:filesystem", value: { status: "in-progress" } },
        { key: "assessment:scorecard:filesystem", value: { totalScore: 420 } },
        { key: "workspace:splitRatio", value: 38 }
      ],
      coachLogs: [
        {
          id: 2,
          conversationId: "conv-1",
          problemId: "running-maximum",
          model: "gemma4:latest",
          promptVersion: "test",
          userMessage: "hint?",
          messages: [],
          response: "Track the best value.",
          context: { runState: "failed" },
          createdAt: "2026-05-23T12:04:00.000Z"
        }
      ]
    };

    const migrated = migrateLegacyBackup(legacy, { migratedAt: "2026-05-23T12:05:00.000Z" });

    expect(migrated.progress).toHaveLength(1);
    expect(migrated.notes).toHaveLength(1);
    expect(migrated.attempts).toMatchObject([{ workspaceId: "running-maximum", language: "python", legacyId: 7 }]);
    expect(migrated.editorBuffers).toEqual([
      expect.objectContaining({ scope: "problem", contentId: "running-maximum", language: "python" }),
      expect.objectContaining({ scope: "problem-part", contentId: "multi-part", partId: "part-2" }),
      expect.objectContaining({ scope: "assessment-level", contentId: "asm-filesystem", level: 1 }),
      expect.objectContaining({ scope: "assessment-level", contentId: "asm-filesystem", level: 2 }),
      expect.objectContaining({ scope: "assessment-finish-snapshot", contentId: "asm-filesystem", level: 2 })
    ]);
    expect(migrated.scratchpads).toEqual([
      expect.objectContaining({ problemId: "running-maximum", language: "python" })
    ]);
    expect(migrated.assessmentState).toHaveLength(2);
    expect(migrated.assessmentState).toEqual([
      expect.objectContaining({
        assessmentId: "asm-filesystem",
        kind: "session",
        value: expect.objectContaining({
          assessmentId: "asm-filesystem",
          problemId: "asm-filesystem",
          activeLevel: 2,
          unlockedLevel: 2,
          language: "python",
          mode: "practice",
          startedAt: "2026-05-23T12:05:00.000Z",
          buffers: {
            1: "def solution(queries):\n    return []",
            2: "def solution(queries):\n    return []"
          }
        })
      }),
      expect.objectContaining({
        assessmentId: "asm-filesystem",
        kind: "scorecard",
        value: expect.objectContaining({
          assessmentId: "asm-filesystem",
          problemId: "asm-filesystem",
          totalScore: 420
        })
      })
    ]);
    expect(migrated.preferences).toEqual([{ key: "workspace:splitRatio", value: 38 }]);
    expect(migrated.coachLogs).toMatchObject([{ conversationId: "conv-1", legacyId: 2 }]);
    expect(migrated.legacySnapshots).toHaveLength(1);
    expect(migrated.migrationReport.counts).toMatchObject({
      progress: 1,
      notes: 1,
      attempts: 1,
      editorBuffers: 5,
      scratchpads: 1,
      assessmentState: 2,
      preferences: 1,
      coachLogs: 1
    });
  });

  test("creates a resumable assessment session when legacy code exists without session state", () => {
    const migrated = migrateLegacyBackup({
      settings: [
        { key: "assessment:code:banking#L3", value: "def solution(queries):\n    return ['ok']" }
      ]
    }, { migratedAt: "2026-05-23T12:05:00.000Z" });

    expect(migrated.assessmentState).toEqual([
      expect.objectContaining({
        assessmentId: "asm-banking",
        kind: "session",
        value: expect.objectContaining({
          assessmentId: "asm-banking",
          language: "python",
          activeLevel: 3,
          unlockedLevel: 3,
          buffers: { 3: "def solution(queries):\n    return ['ok']" }
        })
      })
    ]);
    expect(migrated.migrationReport.counts.assessmentState).toBe(1);
  });

  test("preserves explicit assessment level state while merging legacy buffers", () => {
    const migrated = migrateLegacyBackup({
      settings: [
        {
          key: "assessment:session:filesystem",
          value: {
            status: "in-progress",
            activeLevel: 1,
            unlockedLevel: 4,
            buffers: { 1: "def solution(queries):\n    return ['l1']" }
          }
        },
        { key: "assessment:code:filesystem#L3", value: "def solution(queries):\n    return ['l3']" }
      ]
    }, { migratedAt: "2026-05-23T12:05:00.000Z" });

    expect(migrated.assessmentState[0]).toMatchObject({
      assessmentId: "asm-filesystem",
      kind: "session",
      value: {
        activeLevel: 1,
        unlockedLevel: 4,
        buffers: {
          1: "def solution(queries):\n    return ['l1']",
          3: "def solution(queries):\n    return ['l3']"
        }
      }
    });
  });

  test("validates array fields before migration", () => {
    expect(() => migrateLegacyBackup({ settings: {} as never })).toThrow(/settings must be an array/);
  });
});
