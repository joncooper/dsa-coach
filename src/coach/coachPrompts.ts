// Prompt design for the local-LLM coach.
//
// Philosophy: a coach, not a gatekeeper. Default to Socratic guidance and
// escalate adaptively, but the learner owns their time — if they clearly
// want the solution, hand it over (once), and make the hand-over a teaching
// moment rather than a refusal. Never refuse the same ask twice.

export interface CoachFailedTest {
  name: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface CoachContext {
  problemTitle: string;
  /** Set when the learner is on a multi-part problem's Part 2+. */
  partTitle?: string;
  prompt: string;
  constraints?: string[];
  code: string;
  entrypoint: string;
  runState: "unrun" | "passed" | "failed" | "error";
  failedVisible: CoachFailedTest[];
  failedHiddenCount: number;
  stdout?: string;
  errorMessage?: string;
  /** Number of times the learner has run/submitted this problem. */
  attemptCount: number;
  authored: {
    hints: string[];
    solution: string;
    walkthrough?: string;
    referenceCode: string;
    complexity?: { time: string; space: string };
  };
}

export const COACH_SYSTEM_PROMPT = `You are an interactive coding coach inside DSA Coach, a practice tool where a learner solves Python problems in an in-browser editor. You are talking directly to the learner.

YOUR STANCE
You are a collaborator, not a gatekeeper. Your default is to guide the learner to their own insight. But the learner owns their time and their learning — if they genuinely want the answer, you give it to them. You never make someone beg.

ESCALATION LADDER — choose the rung from the attempt count AND what the learner is asking for:
- Rung 0 — empty editor / "where do I start": orient them. What should they notice in the prompt? Which shape fits (a scan, a map, a stack, two pointers, a recurrence)? No code.
- Rung 1 — first ask, code in progress: one Socratic nudge. Ask a pointed question or name the single pattern signal. No code.
- Rung 2 — "still stuck" / attempt 2 / a failing test: get concrete. Name the technique. Point at the SPECIFIC failing case or line. You may give a short pseudocode skeleton (structure only, not runnable Python).
- Rung 3 — attempt 3+ / "show me the approach": give the full algorithm in prose, plus the one tricky helper in code if it unblocks them. Leave the entrypoint body for them.
- Rung 4 — the learner clearly wants the solution ("just give me the code", "show me the answer", "I give up", "I don't have time", or they have asked for it twice): COMPLY. Give the complete, correct Python solution for the requested function. Then add 2-3 sentences: what makes it work and the one idea to internalize. This is a teaching moment, not a defeat.

ANTI-NAG RULE
You may, at most ONCE, offer a single soft check before Rung 4 — e.g. "Want one more hint first, or shall I just show you?" If they decline a hint, or have already asked twice, or used give-up language, go straight to Rung 4. Never refuse the same request twice. Never lecture them about learning more than one short sentence.

GROUNDING
You are given the problem's authored hints, reference solution, and walkthrough under "COACH REFERENCE". Base your guidance on that material so you stay correct. Do NOT reveal or paste the reference solution unless you are at Rung 4. When you do hand over code at Rung 4, produce a clean, idiomatic solution consistent with the reference — do not invent a different, unverified approach.

TONE & FORMAT
- Encouraging and concrete. Never say "wrong", "incorrect", or "you failed". Say what is close to working and what to adjust.
- Acknowledge what the learner already got right before the correction.
- Markdown. Short paragraphs, one idea each. Bullet lists for multiple suggestions.
- Wrap identifiers, keywords, and function names in backticks.
- Be concise: 2-4 short paragraphs unless you are delivering a full solution.`;

function fence(code: string): string {
  return "```python\n" + code.trim() + "\n```";
}

function authoredBlock(ctx: CoachContext): string {
  const a = ctx.authored;
  const parts: string[] = [];
  if (a.hints.length) {
    parts.push(
      "Authored hints (progressive — earlier ones are gentler):\n" +
        a.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")
    );
  }
  if (a.solution) parts.push(`Solution idea: ${a.solution}`);
  if (a.walkthrough) parts.push(`Walkthrough: ${a.walkthrough}`);
  if (a.complexity) parts.push(`Target complexity: time ${a.complexity.time}, space ${a.complexity.space}.`);
  parts.push("Reference solution (do NOT reveal unless Rung 4):\n" + fence(a.referenceCode));
  return parts.join("\n\n");
}

function stateBlock(ctx: CoachContext): string {
  const lines: string[] = [];
  const where = ctx.partTitle ? `${ctx.problemTitle} — ${ctx.partTitle}` : ctx.problemTitle;
  lines.push(`PROBLEM: ${where}`);
  lines.push(ctx.prompt.trim());
  if (ctx.constraints?.length) {
    lines.push("CONSTRAINTS:\n" + ctx.constraints.map((c) => `- ${c}`).join("\n"));
  }
  lines.push(`The learner has run or submitted this problem ${ctx.attemptCount} time(s).`);

  const code = ctx.code.trim();
  // "Unstarted" = nothing beyond the def signature, comments, and a bare
  // `pass` — i.e. the untouched starter scaffold.
  const meaningful = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .filter((line) => !/^(async\s+)?def\s+[A-Za-z_]\w*\s*\(.*\)\s*:/.test(line));
  const unstarted = meaningful.every((line) => line === "pass" || line === "...");

  if (!code || unstarted) {
    lines.push(
      "The editor is essentially empty — the learner has not started. Treat this as a Rung 0 'where do I start' ask. Orient them; do not write code."
    );
    return lines.join("\n\n");
  }

  lines.push("LEARNER'S CURRENT CODE:\n" + fence(code));

  if (ctx.runState === "passed") {
    lines.push(
      "Their last run PASSED. If they are asking a follow-up, answer it. Otherwise affirm what they did well and optionally pose a sharpening question (edge cases, complexity)."
    );
  } else if (ctx.runState === "failed" || ctx.runState === "error") {
    const ft = ctx.failedVisible
      .slice(0, 3)
      .map(
        (t) =>
          `- ${t.name}: expected ${t.expected}, got ${t.actual}${t.error ? ` (error: ${t.error})` : ""}`
      )
      .join("\n");
    lines.push(
      `Their last submission did not pass. Failing visible tests:\n${ft || "(none visible — failures are in hidden tests)"}` +
        (ctx.failedHiddenCount ? `\nPlus ${ctx.failedHiddenCount} hidden test(s) failing.` : "") +
        (ctx.errorMessage ? `\nRuntime/error output:\n${ctx.errorMessage.trim()}` : "") +
        (ctx.stdout?.trim() ? `\nTheir printed output:\n${ctx.stdout.trim()}` : "")
    );
    lines.push(
      "Diagnose the specific mistake from the failing case and the code. Pick the ladder rung from the attempt count and what they ask for."
    );
  } else {
    lines.push(
      "They have written code but have not run it yet — they want a proactive tip. Give ONE targeted observation about the next step or a pitfall you see. Do not rewrite their code."
    );
  }
  return lines.join("\n\n");
}

/** The first message sent when the coach panel is opened for a problem. */
export function buildInitialUserPrompt(ctx: CoachContext): string {
  return `${stateBlock(ctx)}

COACH REFERENCE (for your guidance only):
${authoredBlock(ctx)}

Give your opening coaching message now. Start at the lowest ladder rung that fits the situation above.`;
}

/**
 * Heuristic: does this learner message read as an explicit request for the
 * full solution? Used to tell the model to jump to Rung 4 without nagging.
 */
export function looksLikeSolveRequest(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(just )?(give|show|tell) me (the )?(answer|solution|code)\b/.test(t) ||
    /\b(full|complete|whole) (solution|answer|code)\b/.test(t) ||
    /\bi (give up|quit)\b/.test(t) ||
    /\b(don'?t have|no) time\b/.test(t) ||
    /\bjust (show|tell|give) me\b/.test(t) ||
    /\bwrite (it|the code) for me\b/.test(t)
  );
}
