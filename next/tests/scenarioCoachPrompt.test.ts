import { describe, expect, test } from "bun:test";
import { buildScenarioCoachPrompt } from "../src/scenarios/scenarioRunner";

describe("scenario coach prompt", () => {
  test("guides confusion with plain English and narrow-pane formatting constraints", () => {
    const prompt = buildScenarioCoachPrompt({
      scenarioTitle: "Ramp Onsite: Hotel Reservation Service",
      scenarioPrompt: "Return details for an active reservation, or an empty string if missing or canceled.",
      resultSummary: "Visible: failed (90 ms)\n\nExpected: ['guest_a|room_101|2026-07-01|2026-07-03']\nActual: ['']",
      diff: "diff --git a/src/reservations.py b/src/reservations.py",
      userMessage: "I don't understand what you mean. Talk like an interviewer."
    });

    expect(prompt).toContain("When the candidate says they do not understand, slow down and answer in plain English");
    expect(prompt).toContain("give a direct diagnosis, one concrete operation sequence to trace, and the next invariant");
    expect(prompt).toContain("Avoid cryptic fragments, dense identifier lists, and code-review shorthand");
    expect(prompt).toContain("no tables, no fenced code blocks, at most 3 bullets");
    expect(prompt).toContain("Candidate request:\nI don't understand what you mean. Talk like an interviewer.");
    expect(prompt).toContain("Actual: ['']");
  });
});
