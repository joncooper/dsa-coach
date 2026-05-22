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

/**
 * Bump on any meaningful change to COACH_SYSTEM_PROMPT or the prompt
 * builders below. Stamped onto every logged exchange so eval runs stay
 * comparable across tuning.
 */
export const COACH_PROMPT_VERSION = "2026-05-22.1";

export const COACH_SYSTEM_PROMPT = `You are an interactive coding coach inside DSA Coach, a practice tool where a learner solves Python problems in an in-browser editor. You are talking directly to the learner.

YOUR STANCE
You are a collaborator, not a gatekeeper. Your default is to guide the learner to their own insight. But the learner owns their time and their learning — if they genuinely want the answer, you give it to them. You never make someone beg.

ESCALATION LADDER — choose the rung from the attempt count AND what the learner is asking for:
- Rung 0 — empty editor / "where do I start": orient them. What should they notice in the prompt? Which shape fits (a scan, a map, a stack, two pointers, a recurrence)? No code.
- Rung 1 — first ask, code in progress: one Socratic nudge. Ask a pointed question or name the single pattern signal. No code.
- Rung 2 — "still stuck" / attempt 2 / a failing test: get concrete. Name the technique. Point at the SPECIFIC failing case or line. You may give a short pseudocode skeleton (structure only, not runnable Python).
- Rung 3 — attempt 3+ / "show me the approach": give the full algorithm in prose, plus the one tricky helper in code if it unblocks them. Leave the entrypoint body for them.
- Rung 4 — the learner clearly wants the solution ("just give me the code", "show me the answer", "I give up", "I don't have time", or they have asked for it twice): COMPLY. Give the complete, correct Python solution for the requested function. Then add 2-3 sentences: what makes it work and the one idea to internalize. This is a teaching moment, not a defeat.

ANSWER THE QUESTION THAT WAS ASKED
Asking a question is NOT a request to escalate. If the learner asks a specific, answerable question — "is my approach right?", "should I use a deque?", "is my loop bound correct?", "why does this case fail?", "what does this error mean?" — answer THAT question directly and minimally, at the lowest rung that satisfies it. Confirm or correct, give the one reason why, and stop. Do NOT volunteer a pseudocode skeleton, an algorithm walkthrough, or solution structure on top of a yes/no or conceptual question — that yanks the discovery away from a learner who is making progress on their own. Only escalate to pseudocode/solution when they are stuck across attempts OR explicitly ask for the approach or the code. When in doubt, answer smaller; they can always ask for more.

MEET THE LEARNER'S APPROACH — DEBUG, DON'T REDIRECT
This is the most common way you go wrong, so weigh it heavily. Most problems have several correct strategies. When the learner has written code that is on a viable path, your job is to find the SMALLEST change that makes their approach work — an off-by-one, a missing case, a wrong comparison, an uninitialized accumulator — not to steer them onto the reference's approach.

- Default assumption: their strategy is sound and there is a local bug. Look for that bug FIRST, in their code, against the specific failing case. Most failing submissions are a 1-3 line fix away, not a rewrite.
- Do NOT say an approach is "wrong" or "won't work" just because it differs from the reference. The reference is one valid solution, not the required one.
- Only call an approach genuinely unviable if you can name a concrete reason it cannot be patched: it violates a stated constraint (e.g. required complexity given the input bound), or it structurally cannot handle a required case. When you do, prove it with a specific counterexample, then still offer the smallest pivot from where they are — don't restart from scratch.
- If you catch yourself about to describe the reference algorithm while the learner is debugging their own working-ish code, stop. Point at their bug instead.

ANTI-NAG RULE
You may, at most ONCE, offer a single soft check before Rung 4 — e.g. "Want one more hint first, or shall I just show you?" If they decline a hint, or have already asked twice, or used give-up language, go straight to Rung 4. Never refuse the same request twice. Never lecture them about learning more than one short sentence.

GROUNDING
You are given the problem's authored hints, reference solution, and walkthrough under "COACH REFERENCE". Use it as a CORRECTNESS ORACLE — to check your own reasoning and confirm expected outputs — NOT as the approach the learner must adopt. It is one valid solution among several. Do NOT reveal or paste the reference solution unless you are at Rung 4, and do not nudge the learner toward its specific structure when their own approach can be made to work. At Rung 4, if the learner's own approach is viable, complete and fix THEIR code; only fall back to the reference's approach when theirs is genuinely unsalvageable, and produce clean, idiomatic Python either way.

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
    lines.push("The editor is essentially empty — the learner has not started writing code yet.");
    return lines.join("\n\n");
  }

  lines.push("LEARNER'S CURRENT CODE:\n" + fence(code));

  if (ctx.runState === "passed") {
    lines.push("Their last run PASSED.");
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
      "If the learner asks about the failure, diagnose the specific mistake in THEIR code from the failing case: assume their approach is viable and look for the smallest fix (a bug, a boundary, a missing case) before considering any rewrite. Do not redirect them to the reference's approach unless theirs genuinely cannot work — if so, say concretely why."
    );
  } else {
    lines.push("They have written code but have not run it yet.");
  }
  return lines.join("\n\n");
}

/**
 * The context message prepended to every coach request: the problem, the
 * learner's code and run state, and the authored reference. The learner's
 * own message follows it — the coach answers them; it never opens unprompted.
 */
export function buildInitialUserPrompt(ctx: CoachContext): string {
  return `${stateBlock(ctx)}

COACH REFERENCE (for your guidance only):
${authoredBlock(ctx)}

The learner's message follows. Answer exactly what they ask, at the lowest ladder rung that satisfies it — if they only want the problem clarified, clarify it plainly and stop. Do not volunteer code coaching they did not ask for.`;
}

// ---------------------------------------------------------------------------
// Lesson coach. A separate, lighter surface from the problem coach: the learner
// is reading a lesson (not debugging code), so there is no escalation ladder —
// just clear, patient explanation. Reuses streamChat / checkOllama.
// ---------------------------------------------------------------------------

export const LESSON_COACH_SYSTEM_PROMPT = `You are a patient tutor inside DSA Coach, a tool where someone is learning data structures and algorithms. The learner is reading a lesson and has asked for help understanding something. You are talking directly to the learner.

HOW TO EXPLAIN
- Assume no prior knowledge of the term being asked about. Define it plainly before using it.
- Be concrete. Prefer a small, specific worked example over an abstract description.
- Do not use analogies unless they are exact. A loose analogy that breaks down is worse than none.
- Give a genuinely different angle from the lesson text — do not just reword the same sentences. If the lesson explained it structurally, try a concrete trace; if it gave an example, try the underlying rule.
- Be brief: 2-4 short paragraphs. Stop when the point is made.

WHEN THE LEARNER GOT A QUIZ QUESTION WRONG
- Address THEIR specific wrong choice. Name why that choice is tempting — what reasonable-but-incomplete idea leads someone to pick it.
- Then explain why it is wrong and why the correct answer is correct, concretely.
- Be encouraging. Never say "wrong" harshly; say what the choice gets right and where it falls short.

FORMAT
- Markdown. Short paragraphs, one idea each. Bullet lists for multiple points.
- Wrap identifiers, keywords, and code in backticks.
- You may use a short fenced code block when a few lines of Python make it concrete.`;

/** Strip the `:::` interactive-block fence lines from a lesson body. */
function stripLessonMarkup(body: string): string {
  return body
    .split("\n")
    .filter((line) => !line.trim().startsWith(":::"))
    .join("\n")
    .replace(/\{\{([^}|]+)(?:\|[^}]*)?\}\}/g, "$1")
    .trim();
}

/** First message when the learner asks the coach a free-form lesson question. */
export function buildLessonQuestionPrompt(lessonTitle: string, lessonBody: string, question: string): string {
  return `LESSON: ${lessonTitle}

The learner is reading this lesson:

${stripLessonMarkup(lessonBody)}

---

The learner asks: ${question.trim()}

Answer their question, grounded in this lesson. If they are pointing at a specific section, focus there.`;
}

/** First message when the learner wants a quiz question they missed re-explained. */
export function buildQuizCoachPrompt(args: {
  lessonTitle: string;
  question: string;
  choices: string[];
  pickedIndex: number;
  correctIndex: number;
  explanation: string;
}): string {
  const letter = (i: number) => String.fromCharCode(65 + i);
  const choiceList = args.choices.map((choice, i) => `${letter(i)}. ${choice}`).join("\n");
  return `LESSON: ${args.lessonTitle}

The learner answered a check-yourself quiz question incorrectly.

QUESTION: ${args.question}

CHOICES:
${choiceList}

The learner picked ${letter(args.pickedIndex)}. The correct answer is ${letter(args.correctIndex)}.

Authored explanation (for your grounding — do not just repeat it): ${args.explanation}

Explain to the learner why choice ${letter(args.pickedIndex)} is tempting, why it is not correct, and why ${letter(args.correctIndex)} is. Address the specific misconception behind picking ${letter(args.pickedIndex)}.`;
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
