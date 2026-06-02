import { describe, expect, test } from "bun:test";
import { buildCoachMessages } from "../apps/web/src/coachMessages";

describe("coach prompt context", () => {
  test("puts the latest editor code in the final user message with the question", () => {
    const messages = buildCoachMessages({
      turns: [
        { role: "user", content: "I am stuck" },
        { role: "assistant", content: "Tell me what you tried." },
        { role: "user", content: "Can you see my new code?" }
      ],
      question: "Can you see my new code?",
      problemTitle: "Recent Event Counts",
      prompt: "Count timestamps in the recent window.",
      concepts: ["queue"],
      difficulty: "medium",
      language: "python",
      entrypoint: "recent_event_counts",
      code: "def recent_event_counts(timestamps, window):\n    return [42]",
      result: null,
      failedVisible: [],
      referenceCode: "def recent_event_counts(timestamps, window):\n    return []"
    });

    const finalMessage = messages.at(-1);
    expect(finalMessage?.role).toBe("user");
    expect(finalMessage?.content).toContain("Learner code:");
    expect(finalMessage?.content).toContain("def recent_event_counts(timestamps, window):\n    return [42]");
    expect(finalMessage?.content).toContain("Learner question:\nCan you see my new code?");
    expect(messages.slice(1, -1).map((message) => message.content)).not.toContain("Can you see my new code?");
  });
});
