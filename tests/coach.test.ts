import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildInitialUserPrompt,
  looksLikeSolveRequest,
  type CoachContext
} from "../src/coach/coachPrompts";
import { checkOllama, streamChat } from "../src/coach/ollamaClient";

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

describe("buildInitialUserPrompt", () => {
  it("treats a starter-only editor as Rung 0", () => {
    const out = buildInitialUserPrompt(baseContext());
    expect(out).toMatch(/Rung 0/);
    expect(out).toMatch(/has not started|do not write code/i);
  });

  it("asks for one proactive tip when there is WIP code but no run", () => {
    const out = buildInitialUserPrompt(
      baseContext({ code: "def realized_pnl(trades):\n    total = 0\n    return total\n" })
    );
    expect(out).toMatch(/have not run it yet|proactive tip/i);
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

  it("affirms and offers to sharpen on a passing run", () => {
    const out = buildInitialUserPrompt(
      baseContext({ code: "def realized_pnl(trades):\n    return 42\n", runState: "passed" })
    );
    expect(out).toMatch(/PASSED/);
    expect(out).toMatch(/affirm|sharpening/i);
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
