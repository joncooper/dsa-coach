import type { RunResult } from "../../../src/core/types";

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CoachMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function buildCoachMessages(args: {
  turns: CoachTurn[];
  question: string;
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
}): CoachMessage[] {
  const runState = args.result
    ? `${args.result.status}${args.result.message ? `: ${args.result.message}` : ""}`
    : "not run yet";
  const failures = args.failedVisible
    .slice(0, 4)
    .map((test) => `- ${test.name}: expected ${JSON.stringify(test.expected)}, actual ${JSON.stringify(test.actual)}${test.error ? ` (${test.error})` : ""}`)
    .join("\n") || "(none)";
  const solveHint = looksLikeSolveRequest(args.question)
    ? "\nThe learner is explicitly asking for the solution. Give the complete corrected code and a short explanation."
    : "";
  const lastTurn = args.turns[args.turns.length - 1];
  const priorTurns = lastTurn?.role === "user" && lastTurn.content === args.question
    ? args.turns.slice(0, -1)
    : args.turns;
  const currentCode = args.code.trim() ? args.code : "(empty editor buffer)";

  return [
    {
      role: "system",
      content: `You are DSA Coach, a local coding coach inside a programming practice app. Be concise, concrete, and helpful. Prefer debugging the learner's current approach over redirecting to a different algorithm. Give hints by default, but if the learner asks for the solution, comply. The final user message always includes the current editor code; use it as the learner's latest code and do not ask them to paste code unless that block is empty.`
    },
    ...priorTurns.slice(-10),
    {
      role: "user",
      content: `Current workspace context:

Problem: ${args.problemTitle}
Difficulty: ${args.difficulty}
Concepts: ${args.concepts.join(", ")}
Language: ${args.language}
Entrypoint: ${args.entrypoint}

Prompt:
${args.prompt}

Learner code:
\`\`\`${args.language}
${currentCode}
\`\`\`

Last run state: ${runState}
Failing visible tests:
${failures}

Reference solution for grounding only:
\`\`\`${args.language}
${args.referenceCode}
\`\`\`

Learner question:
${args.question}
${solveHint}`
    }
  ];
}

function looksLikeSolveRequest(text: string): boolean {
  const value = text.toLowerCase();
  return /\b(give|show|tell) me (the )?(answer|solution|code)\b/.test(value) ||
    /\b(full|complete) (answer|solution|code)\b/.test(value) ||
    /\bi (give up|quit)\b/.test(value);
}
