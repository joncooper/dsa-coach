import type { RunDiagnostic, RunResult } from "../../../src/core/types";
import { COACH_MARKDOWN_FORMATTING_RULES } from "../../../../shared/coachFormatting";

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CoachMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type CoachMode = "hint" | "debug" | "explain" | "review";

export const COACH_PROMPT_VERSION = "next-coach-v5-debug-prose";

export interface CoachMessageArgs {
  turns: CoachTurn[];
  question: string;
  mode: CoachMode;
  problemTitle: string;
  prompt: string;
  concepts: string[];
  difficulty: string;
  language: string;
  entrypoint: string;
  code: string;
  result: RunResult | null;
  failedVisible: RunResult["tests"];
  referenceCode: string;
}

type ContextSection = {
  title: string;
  body: string;
};

const commonRules = `You are DSA Coach, a coding coach inside a local programming practice app. You are talking directly to the learner while they work in an editor.

Non-negotiable rules:
- Answer the exact question the learner asked. If the question is narrow, answer narrowly.
- If the learner asks whether you can see their code, answer that directly first. If code is present, say yes and cite one concrete detail from it.
- The latest editor code is included when it is relevant. Treat it as current. Do not ask the learner to paste code unless the context says the editor buffer is empty.
- Meet the learner's approach before suggesting a different algorithm.
- Most failures are small local bugs, boundary cases, missing invariants, or state-update issues. Look for those first.
- No cheerleading, no emojis, no generic reassurance. Avoid phrases like "great job", "fantastic question", "absolutely correct", "you are one line away", and "I understand your frustration."

${COACH_MARKDOWN_FORMATTING_RULES}`;

const modeSystems: Record<CoachMode, string> = {
  hint: `${commonRules}

MODE: HINT
Give the smallest useful nudge.
- Prefer one pointed observation, one invariant, or one question that moves the learner forward.
- Do not provide a full algorithm.
- Do not provide runnable code or a replacement function.
- Do not use the reference solution unless the learner explicitly asks for the answer.
- If there is a likely local bug, name the suspect condition/state/update and why it matters.
- Keep it short: usually 1-3 compact paragraphs.`,
  debug: `${commonRules}

MODE: DEBUG
Use the learner's current code and latest run result as the source of truth.
- Start from the failing test, traceback, diagnostic, stdout, stderr, or mismatch when available.
- If a diagnostic includes a file, line, column, actual value, expected value, or traceback location, cite that concrete detail explicitly. Use the word "line" when a line number is available.
- If a failed test has expected/actual values, open with an observation that quotes both values, for example: "Expected X, but actual was Y." Then interpret the bug.
- If the actual value is null/undefined for a function problem, check for a missing return value or missing result collection before deeper algorithm changes. If that explains the failure, stop there unless the learner asks for a deeper algorithm review.
- If earlier outputs in a failing operation-list test match but a later aggregate, report, ranking, or lookup output differs, trace which prior successful operation should have updated the relevant state. Do not blame sorting, formatting, or unrelated edge cases unless the mismatch is only ordering or formatting.
- Identify the most likely local bug in their code before proposing any alternate approach.
- Suggest the smallest practical fix or diagnostic check.
- Keep the answer compact. Prefer under 120 words unless the learner asks for a deeper walkthrough.
- Debug answers are prose-only by default. Never include fenced code blocks, replacement snippets, or patch-style edits unless the learner explicitly asks for code with words like "show code", "write the function", or "give me the code". If a tiny fix helps, describe it inline, such as "guard the user lookup before reading the quota."
- Do not provide sample functions, replacement blocks, or a reference-style algorithm unless the learner explicitly asks for the solution.`,
  explain: `${commonRules}

MODE: EXPLAIN
Clarify the concept, problem statement, API behavior, error message, or invariant the learner is asking about.
- Use a small concrete example or trace when useful.
- Do not review or rewrite the learner's code unless the question asks about their code.
- Do not jump to the final solution. Explain the idea they need to understand.`,
  review: `${commonRules}

MODE: REVIEW
Review the current implementation like a careful teammate.
- Name what is sound briefly, then focus on bugs, fragile assumptions, edge cases, and readability issues.
- If the learner asks whether code is ugly or how to make it cleaner, prioritize naming, tuple/list unpacking, small helper extraction, and explicit data shapes.
- Prefer local edits, invariants, and tests over a wholesale rewrite.
- Use prose bullets by default. Do not include fenced code in Review mode unless the learner explicitly asks for code.
- Keep the answer compact. Prefer under 200 words unless the learner asks for a detailed review.
- Mention tests or examples that would reveal the issue.
- Do not provide a full reference solution unless explicitly asked.`
};

export function buildCoachMessages(args: CoachMessageArgs): CoachMessage[] {
  const lastTurn = args.turns[args.turns.length - 1];
  const priorTurns = lastTurn?.role === "user" && lastTurn.content === args.question
    ? args.turns.slice(0, -1)
    : args.turns;
  const solveRequest = looksLikeSolveRequest(args.question);
  const sections = buildModeContext(args, solveRequest);

  return [
    {
      role: "system",
      content: modeSystems[args.mode]
    },
    ...priorTurns.slice(-10),
    {
      role: "user",
      content: renderContextMessage(args, sections, solveRequest)
    }
  ];
}

export function buildModeContext(args: CoachMessageArgs, solveRequest = looksLikeSolveRequest(args.question)): ContextSection[] {
  if (solveRequest) return buildSolutionContext(args);
  if (args.mode === "debug") return buildDebugContext(args);
  if (args.mode === "explain") return buildExplainContext(args);
  if (args.mode === "review") return buildReviewContext(args);
  return buildHintContext(args);
}

function buildHintContext(args: CoachMessageArgs): ContextSection[] {
  return compactSections([
    problemSection(args),
    {
      title: "Prompt",
      body: args.prompt
    },
    editorCodeSection(args),
    firstFailureSection(args),
    {
      title: "Coach contract",
      body: "Hint mode: give one small nudge. Do not reveal the complete algorithm, do not write runnable code, and do not include a replacement function."
    }
  ]);
}

function buildDebugContext(args: CoachMessageArgs): ContextSection[] {
  return compactSections([
    problemSection(args),
    {
      title: "Prompt",
      body: args.prompt
    },
    editorCodeSection(args),
    runSummarySection(args.result),
    diagnosticsSection(args.result),
    failedTestsSection(args.failedVisible, 4),
    stdoutSection(args.result),
    {
      title: "Coach contract",
      body: "Debug mode: diagnose the current implementation. If failed tests are shown, start by quoting the expected and actual values. Then suggest the smallest local fix or diagnostic check. Keep it prose-only unless the learner explicitly asks for code."
    }
  ]);
}

function buildExplainContext(args: CoachMessageArgs): ContextSection[] {
  const codeRelevant = asksAboutCode(args.question);
  const runRelevant = asksAboutRunResult(args.question);
  return compactSections([
    problemSection(args),
    {
      title: "Prompt",
      body: args.prompt
    },
    codeRelevant ? editorCodeSection(args) : null,
    runRelevant ? runSummarySection(args.result) : null,
    runRelevant ? failedTestsSection(args.failedVisible, 2) : null,
    {
      title: "Coach contract",
      body: "Explain mode: explain the concept, invariant, API behavior, or wording. Do not solve the whole problem unless explicitly asked."
    }
  ]);
}

function buildReviewContext(args: CoachMessageArgs): ContextSection[] {
  return compactSections([
    problemSection(args),
    {
      title: "Prompt",
      body: args.prompt
    },
    editorCodeSection(args),
    runSummarySection(args.result),
    failedTestsSection(args.failedVisible, 3),
    {
      title: "Coach contract",
      body: "Review mode: evaluate the learner's implementation as written. Focus on correctness, invariants, edge cases, data model, helper extraction, and readability. Avoid replacement-code answers and fenced code blocks."
    }
  ]);
}

function buildSolutionContext(args: CoachMessageArgs): ContextSection[] {
  return compactSections([
    problemSection(args),
    {
      title: "Prompt",
      body: args.prompt
    },
    editorCodeSection(args),
    runSummarySection(args.result),
    failedTestsSection(args.failedVisible, 4),
    {
      title: "Reference solution allowed",
      body: `The learner explicitly asked for the answer. You may use this reference to provide complete corrected code and a short explanation.\n\n\`\`\`${args.language}\n${args.referenceCode.trim() || "(reference unavailable)"}\n\`\`\``
    }
  ]);
}

function renderContextMessage(args: CoachMessageArgs, sections: ContextSection[], solveRequest: boolean): string {
  return `${sections.map((section) => `## ${section.title}\n${section.body.trim()}`).join("\n\n")}

## Active coach mode
${args.mode}

## Learner question
${args.question}${solveRequest ? "\n\nThe learner is explicitly asking for the solution. Give the complete corrected code and a short explanation." : ""}`;
}

function problemSection(args: CoachMessageArgs): ContextSection {
  return {
    title: "Problem",
    body: [
      `Title: ${args.problemTitle}`,
      `Difficulty: ${args.difficulty}`,
      `Concepts: ${args.concepts.length ? args.concepts.join(", ") : "(none)"}`,
      `Language: ${args.language}`,
      `Entrypoint: ${args.entrypoint}`
    ].join("\n")
  };
}

function editorCodeSection(args: CoachMessageArgs): ContextSection {
  const currentCode = args.code.trim() ? args.code : "(empty editor buffer)";
  return {
    title: "Learner code",
    body: `\`\`\`${args.language}\n${currentCode}\n\`\`\``
  };
}

function runSummarySection(result: RunResult | null): ContextSection | null {
  if (!result) return {
    title: "Last run state",
    body: "not run yet"
  };
  const parts = [
    `Status: ${result.status}`,
    result.message ? `Message: ${result.message}` : "",
    `Duration: ${result.durationMs} ms`
  ].filter(Boolean);
  return {
    title: "Last run state",
    body: parts.join("\n")
  };
}

function firstFailureSection(args: CoachMessageArgs): ContextSection | null {
  if (!args.failedVisible.length) return null;
  return failedTestsSection(args.failedVisible, 1);
}

function failedTestsSection(failedVisible: RunResult["tests"], limit: number): ContextSection | null {
  if (!failedVisible.length) return null;
  const body = failedVisible
    .slice(0, limit)
    .map((test) => {
      const parts = [
        `- ${test.name}`,
        `  Expected: ${JSON.stringify(test.expected)}`,
        `  Actual: ${JSON.stringify(test.actual)}`,
        test.actual === null || typeof test.actual === "undefined"
          ? "  Note: null/undefined actual values often mean the function did not return a value or did not collect a result."
          : "",
        test.error ? `  Error: ${test.error}` : ""
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n");
  return {
    title: limit === 1 ? "First failing visible test" : "Failing visible tests",
    body
  };
}

function diagnosticsSection(result: RunResult | null): ContextSection | null {
  const diagnostics = result?.diagnostics ?? [];
  if (!diagnostics.length) return null;
  const primary = diagnostics.find((diagnostic) => diagnostic.line);
  const primaryLine = primary?.line
    ? `Primary location to mention: ${primary.file ? `${primary.file} ` : ""}line ${primary.line}.`
    : "";
  return {
    title: "Line-numbered diagnostics",
    body: [primaryLine, ...diagnostics.slice(0, 4).map(formatDiagnostic)].filter(Boolean).join("\n")
  };
}

function stdoutSection(result: RunResult | null): ContextSection | null {
  if (!result) return null;
  const output = [
    result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
    result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : ""
  ].filter(Boolean).join("\n\n");
  if (!output) return null;
  return {
    title: "Program output",
    body: output
  };
}

function formatDiagnostic(diagnostic: RunDiagnostic): string {
  const file = diagnostic.file ? `${diagnostic.file} ` : "";
  const line = diagnostic.line ? `line ${diagnostic.line}` : "";
  const column = diagnostic.column ? ` col ${diagnostic.column}` : "";
  const location = `${file}${line}${column}`.trim();
  return `- ${location ? `${location}: ` : ""}${diagnostic.severity}: ${diagnostic.message}`;
}

function compactSections(sections: Array<ContextSection | null>): ContextSection[] {
  return sections.filter((section): section is ContextSection => Boolean(section && section.body.trim()));
}

function looksLikeSolveRequest(text: string): boolean {
  const value = text.toLowerCase();
  return /\b(give|show|tell) me (the )?(answer|solution|code)\b/.test(value) ||
    /\b(full|complete) (answer|solution|code)\b/.test(value) ||
    /\bi (give up|quit)\b/.test(value);
}

function asksAboutCode(text: string): boolean {
  const value = text.toLowerCase();
  return /\b(my|this|the|current) code\b/.test(value) ||
    /\bimplementation\b/.test(value) ||
    /\bfunction\b/.test(value) ||
    /\bline\b/.test(value) ||
    /\bwhat am i doing\b/.test(value) ||
    /\bwhy (is|does|did|doesn't|isn't) (my|this|it)\b/.test(value);
}

function asksAboutRunResult(text: string): boolean {
  const value = text.toLowerCase();
  return /\b(test|tests|failing|failure|failed|error|traceback|stdout|stderr|actual|expected|mismatch|passing)\b/.test(value);
}
