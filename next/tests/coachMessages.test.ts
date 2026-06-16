import { describe, expect, test } from "bun:test";
import { buildCoachMessages, type CoachMessageArgs, type CoachMode } from "../apps/web/src/coachMessages";

const referenceCode = "def recent_event_counts(timestamps, window):\n    return [i + 1 for i in range(len(timestamps))]";

function baseArgs(overrides: Partial<CoachMessageArgs> = {}): CoachMessageArgs {
  return {
    turns: [
      { role: "user", content: "I am stuck" },
      { role: "assistant", content: "What have you tried?" },
      { role: "user", content: "Can you see my new code?" }
    ],
    question: "Can you see my new code?",
    mode: "debug",
    problemTitle: "Recent Event Counts",
    prompt: "Count timestamps in the recent window.",
    concepts: ["queue", "sliding window"],
    difficulty: "medium",
    language: "python",
    entrypoint: "recent_event_counts",
    code: "def recent_event_counts(timestamps, window):\n    return [42]",
    result: null,
    failedVisible: [],
    referenceCode,
    ...overrides
  };
}

describe("coach prompt context", () => {
  test("puts the latest editor code in the final user message with the question", () => {
    const messages = buildCoachMessages(baseArgs());

    const finalMessage = messages.at(-1);
    expect(finalMessage?.role).toBe("user");
    expect(finalMessage?.content).toContain("## Learner code");
    expect(finalMessage?.content).toContain("def recent_event_counts(timestamps, window):\n    return [42]");
    expect(finalMessage?.content).toContain("## Learner question\nCan you see my new code?");
    expect(messages.slice(1, -1).map((message) => message.content)).not.toContain("Can you see my new code?");
  });

  test.each(["hint", "debug", "explain", "review"] as CoachMode[])("%s mode does not include reference code by default", (mode) => {
    const messages = buildCoachMessages(baseArgs({
      mode,
      question: mode === "explain" ? "What does the recent window mean?" : "Help me understand what is wrong."
    }));

    expect(messages.map((message) => message.content).join("\n")).not.toContain(referenceCode);
    expect(messages.at(0)?.content).toContain(`MODE: ${mode.toUpperCase()}`);
  });

  test("solution requests are allowed to include reference code", () => {
    const messages = buildCoachMessages(baseArgs({
      mode: "hint",
      question: "I give up, show me the solution"
    }));

    const finalMessage = messages.at(-1)?.content ?? "";
    expect(finalMessage).toContain("Reference solution allowed");
    expect(finalMessage).toContain(referenceCode);
  });

  test("hint mode includes only the first failing visible test", () => {
    const messages = buildCoachMessages(baseArgs({
      mode: "hint",
      question: "Subtly help me with this failure.",
      result: {
        status: "failed",
        stdout: "",
        stderr: "",
        durationMs: 12,
        tests: []
      },
      failedVisible: [
        { name: "small", passed: false, visibility: "visible", args: [], expected: [1, 2], actual: null },
        { name: "duplicates", passed: false, visibility: "visible", args: [], expected: [1, 1], actual: null }
      ]
    }));

    const finalMessage = messages.at(-1)?.content ?? "";
    expect(finalMessage).toContain("First failing visible test");
    expect(finalMessage).toContain("small");
    expect(finalMessage).not.toContain("duplicates");
  });

  test("debug mode includes diagnostics and failing tests", () => {
    const messages = buildCoachMessages(baseArgs({
      mode: "debug",
      question: "Why is this failing?",
      result: {
        status: "runtime-error",
        stdout: "",
        stderr: "Traceback",
        durationMs: 8,
        diagnostics: [
          { severity: "error", message: "KeyError: 'f'", file: "solution.py", line: 105 }
        ],
        tests: []
      },
      failedVisible: [
        { name: "quota", passed: false, visibility: "visible", args: [], expected: true, actual: undefined, error: "KeyError: 'f'" }
      ]
    }));

    const finalMessage = messages.at(-1)?.content ?? "";
    expect(finalMessage).toContain("Diagnostics");
    expect(finalMessage).toContain("solution.py, line 105");
    expect(finalMessage).toContain("quota");
    expect(finalMessage).toContain("stderr:");
  });

  test("explain mode omits code for pure concept questions", () => {
    const messages = buildCoachMessages(baseArgs({
      mode: "explain",
      question: "What does this problem mean by recent window?"
    }));

    const finalMessage = messages.at(-1)?.content ?? "";
    expect(finalMessage).not.toContain("## Learner code");
    expect(finalMessage).toContain("## Prompt");
  });
});
