import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildInitialUserPrompt,
  COACH_PROMPT_VERSION,
  COACH_SYSTEM_PROMPT,
  looksLikeSolveRequest,
  type CoachContext
} from "../src/coach/coachPrompts";
import { checkOllama, streamChat } from "../src/coach/ollamaClient";
import { formatRelativeTime, groupCoachConversations } from "../src/coach/coachHistory";
import type { CoachExchangeRecord } from "../src/types";

function baseContext(overrides: Partial<CoachContext> = {}): CoachContext {
  return {
    problemTitle: "Realized P&L from a Trade Tape",
    prompt: "Compute realized P&L using FIFO matching.",
    constraints: ["0 <= len(trades) <= 10000."],
    code: "def realized_pnl(trades):\n    # Write your solution here.\n    pass\n",
    entrypoint: "realized_pnl",
    runState: "unrun",
    failedVisible: [],
    failedHiddenCount: 0,
    attemptCount: 0,
    authored: {
      hints: ["A deque gives O(1) access to the oldest lot.", "Track remaining qty per lot."],
      solution: "Maintain a FIFO queue of open BUY lots.",
      walkthrough: "Buys append; sells drain the left.",
      referenceCode: "def realized_pnl(trades):\n    return 0\n",
      complexity: { time: "O(n)", space: "O(n)" }
    },
    ...overrides
  };
}

describe("looksLikeSolveRequest", () => {
  it("detects explicit asks for the answer", () => {
    for (const t of [
      "just give me the code",
      "show me the solution",
      "tell me the answer",
      "I give up",
      "i quit",
      "I don't have time for this",
      "no time, full solution please",
      "write the code for me",
      "can you just show me?"
    ]) {
      expect(looksLikeSolveRequest(t)).toBe(true);
    }
  });

  it("does not fire on ordinary hint requests", () => {
    for (const t of [
      "what data structure should I use?",
      "is my loop bound right?",
      "give me a hint about the edge case",
      "why does the FIFO test fail?",
      "am I close?"
    ]) {
      expect(looksLikeSolveRequest(t)).toBe(false);
    }
  });
});

describe("system prompt steers toward debugging the learner's approach", () => {
  it("tells the model to find the smallest fix, not redirect to the reference", () => {
    expect(COACH_SYSTEM_PROMPT).toMatch(/MEET THE LEARNER'S APPROACH/);
    expect(COACH_SYSTEM_PROMPT).toMatch(/smallest change that makes their approach work/i);
    expect(COACH_SYSTEM_PROMPT).toMatch(/their strategy is sound and there is a local bug/i);
    expect(COACH_SYSTEM_PROMPT).toMatch(/not the required one/i);
  });

  it("reframes the reference as a correctness oracle, not the mandated approach", () => {
    expect(COACH_SYSTEM_PROMPT).toMatch(/CORRECTNESS ORACLE/);
    expect(COACH_SYSTEM_PROMPT).toMatch(/one valid solution among several/i);
  });

  it("has a stable, non-empty prompt version stamp", () => {
    expect(COACH_PROMPT_VERSION).toMatch(/\S/);
  });
});

describe("failed-submission guidance prefers a local fix", () => {
  it("instructs the model to assume the approach is viable before any rewrite", () => {
    const out = buildInitialUserPrompt(
      baseContext({
        code: "def realized_pnl(trades):\n    return 1\n",
        runState: "failed",
        attemptCount: 1,
        failedVisible: [{ name: "round trip", expected: "200", actual: "1" }]
      })
    );
    expect(out).toMatch(/smallest fix/i);
    expect(out).toMatch(/Assume their approach is viable/i);
  });
});

describe("buildInitialUserPrompt", () => {
  it("flags a starter-only editor as not started", () => {
    const out = buildInitialUserPrompt(baseContext());
    expect(out).toMatch(/has not started writing code/i);
  });

  it("notes WIP code that has not been run yet", () => {
    const out = buildInitialUserPrompt(
      baseContext({ code: "def realized_pnl(trades):\n    total = 0\n    return total\n" })
    );
    expect(out).toMatch(/have not run it yet/i);
    expect(out).not.toMatch(/has not started/i);
  });

  it("surfaces failing visible tests on a failed submission", () => {
    const out = buildInitialUserPrompt(
      baseContext({
        code: "def realized_pnl(trades):\n    return 1\n",
        runState: "failed",
        attemptCount: 2,
        failedVisible: [
          { name: "simple round trip", expected: "200", actual: "1" }
        ],
        failedHiddenCount: 3
      })
    );
    expect(out).toMatch(/did not pass/i);
    expect(out).toMatch(/simple round trip: expected 200, got 1/);
    expect(out).toMatch(/3 hidden test/);
    expect(out).toMatch(/run or submitted this problem 2 time/);
  });

  it("reports a passing run as context", () => {
    const out = buildInitialUserPrompt(
      baseContext({ code: "def realized_pnl(trades):\n    return 42\n", runState: "passed" })
    );
    expect(out).toMatch(/PASSED/);
  });

  it("tells the coach to answer the learner's question, not coach unprompted", () => {
    const out = buildInitialUserPrompt(baseContext());
    expect(out).toMatch(/answer exactly what they ask/i);
    expect(out).toMatch(/do not volunteer code coaching/i);
    expect(out).not.toMatch(/opening coaching message/i);
  });

  it("includes the multi-part title and grounds in authored content", () => {
    const out = buildInitialUserPrompt(
      baseContext({ partTitle: "Part 2: Multiple instruments" })
    );
    expect(out).toMatch(/Part 2: Multiple instruments/);
    expect(out).toMatch(/Authored hints/);
    expect(out).toMatch(/Reference solution \(do NOT reveal unless Rung 4\)/);
    expect(out).toMatch(/COACH REFERENCE/);
  });
});

describe("ollama client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function ndjsonStream(frames: string[]): ReadableStream<Uint8Array> {
    const enc = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const f of frames) controller.enqueue(enc.encode(f));
        controller.close();
      }
    });
  }

  it("streamChat concatenates content across NDJSON frames and skips junk", async () => {
    // Includes a frame split across two chunks and a malformed line.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        body: ndjsonStream([
          '{"message":{"content":"Hel"}}\n',
          '{"message":{"content":"lo "}}\nnot json\n',
          '{"message":{"content":"wor',
          'ld"}}\n',
          '{"message":{"content":"!"},"done":true}\n'
        ])
      }))
    );
    let acc = "";
    for await (const chunk of streamChat([{ role: "user", content: "hi" }])) acc += chunk;
    expect(acc).toBe("Hello world!");
  });

  it("streamChat throws a useful error on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 403, body: null, text: async () => "forbidden" }))
    );
    await expect(async () => {
      for await (const _ of streamChat([{ role: "user", content: "hi" }])) void _;
    }).rejects.toThrow(/403/);
  });

  it("checkOllama reports model-missing when gemma4 is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ models: [{ name: "qwen2.5:0.5b" }] }) }))
    );
    expect(await checkOllama()).toEqual({ available: false, model: null, reason: "model-missing" });
  });

  it("checkOllama reports available when gemma4:latest is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ models: [{ name: "gemma4:latest" }] }) }))
    );
    expect(await checkOllama()).toEqual({ available: true, model: "gemma4:latest" });
  });

  it("checkOllama reports unreachable when the fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection refused");
      })
    );
    expect(await checkOllama()).toEqual({ available: false, model: null, reason: "unreachable" });
  });
});

describe("groupCoachConversations", () => {
  function record(
    over: Partial<CoachExchangeRecord> & { conversationId: string; createdAt: string }
  ): CoachExchangeRecord {
    return {
      id: 1,
      problemId: "p1",
      model: "gemma4:latest",
      promptVersion: "test",
      userMessage: null,
      messages: [],
      response: "ok",
      context: {},
      ...over
    };
  }

  it("groups exchanges by conversation, newest conversation first", () => {
    const convos = groupCoachConversations([
      record({ id: 1, conversationId: "a", createdAt: "2026-05-20T10:00:00Z", response: "intro A" }),
      record({ id: 2, conversationId: "a", createdAt: "2026-05-20T10:05:00Z", userMessage: "hint?", response: "reply A" }),
      record({ id: 3, conversationId: "b", createdAt: "2026-05-21T09:00:00Z", response: "intro B" })
    ]);
    expect(convos.map((c) => c.id)).toEqual(["b", "a"]);
    expect(convos[1].exchangeCount).toBe(2);
  });

  it("reconstructs turns in time order, user turn before each reply", () => {
    const [convo] = groupCoachConversations([
      record({ id: 2, conversationId: "a", createdAt: "2026-05-20T10:05:00Z", userMessage: "hint?", response: "reply" }),
      record({ id: 1, conversationId: "a", createdAt: "2026-05-20T10:00:00Z", response: "intro" })
    ]);
    expect(convo.turns).toEqual([
      { role: "assistant", content: "intro", exchangeId: 1 },
      { role: "user", content: "hint?" },
      { role: "assistant", content: "reply", exchangeId: 2 }
    ]);
  });

  it("labels a conversation with its first user message, or a fallback", () => {
    const [withUser] = groupCoachConversations([
      record({ conversationId: "a", createdAt: "2026-05-20T10:00:00Z", response: "intro" }),
      record({ conversationId: "a", createdAt: "2026-05-20T10:01:00Z", userMessage: "why does my loop fail", response: "r" })
    ]);
    expect(withUser.preview).toBe("why does my loop fail");

    const [openingOnly] = groupCoachConversations([
      record({ conversationId: "b", createdAt: "2026-05-20T10:00:00Z", response: "intro" })
    ]);
    expect(openingOnly.preview).toBe("Coach intro");
  });

  it("returns an empty list when there are no records", () => {
    expect(groupCoachConversations([])).toEqual([]);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-05-21T12:00:00Z");

  it("formats recent times relatively", () => {
    expect(formatRelativeTime("2026-05-21T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-05-21T11:30:00Z", now)).toBe("30m ago");
    expect(formatRelativeTime("2026-05-21T09:00:00Z", now)).toBe("3h ago");
    expect(formatRelativeTime("2026-05-19T12:00:00Z", now)).toBe("2d ago");
  });

  it("falls back to a calendar date for older times", () => {
    expect(formatRelativeTime("2026-04-15T12:00:00Z", now)).toMatch(/Apr/);
  });
});
