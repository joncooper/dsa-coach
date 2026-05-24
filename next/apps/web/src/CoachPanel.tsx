import { useEffect, useMemo, useRef, useState } from "react";
import type { LanguageId, Problem, ProblemPart, RunResult } from "../../../src/core/types";
import { API_BASE } from "./apiBase";

interface CoachPanelProps {
  problem: Problem;
  part?: ProblemPart;
  language: LanguageId;
  code: string;
  result: RunResult | null;
  visible: boolean;
  onClose: () => void;
}

interface CoachStatus {
  available: boolean;
  model: string | null;
  reason?: "unreachable" | "model-missing";
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface CoachMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function CoachPanel({ problem, part, language, code, result, visible, onClose }: CoachPanelProps) {
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    void refreshStatus();
  }, [visible]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns, busy]);

  const activePrompt = part?.prompt ?? problem.prompt;
  const activeTitle = part ? `${problem.title} - ${part.title}` : problem.title;
  const entrypoint = (part?.languages ?? problem.languages)[language]?.entrypoint ?? problem.signature.name;
  const failedVisible = useMemo(
    () => result?.tests.filter((test) => !test.passed && test.visibility === "visible") ?? [],
    [result?.tests]
  );

  async function refreshStatus() {
    try {
      setStatus(await getJson<CoachStatus>("/coach/status"));
    } catch {
      setStatus({ available: false, model: null, reason: "unreachable" });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || !status?.available) return;
    const nextTurns: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(nextTurns);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const referenceCode = await loadReferenceCode(problem.id, part?.id, language);
      const messages = buildCoachMessages({
        turns: nextTurns,
        question: text,
        problemTitle: activeTitle,
        prompt: activePrompt,
        concepts: problem.concepts,
        difficulty: problem.difficulty,
        language,
        entrypoint,
        code,
        result,
        failedVisible,
        referenceCode
      });
      const response = await postJson<{ message: string }>("/coach/chat", { messages });
      setTurns((current) => [...current, { role: "assistant", content: response.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <aside className="coach-panel" aria-label="AI coach">
      <header className="coach-header">
        <div className="coach-header-left">
          <span className="coach-title">Coach</span>
          <small>{status?.model ?? "Local Ollama"}</small>
        </div>
        <div className="coach-actions">
          <button
            type="button"
            className="coach-icon-button"
            aria-label="New conversation"
            title="New conversation"
            onClick={() => {
              setTurns([]);
              setError("");
            }}
            disabled={!turns.length && !error}
          >
            New
          </button>
          <button type="button" className="coach-icon-button" aria-label="Hide coach" title="Hide coach" onClick={onClose}>
            x
          </button>
        </div>
      </header>

      <div className="coach-scroll" ref={scrollRef}>
        {status && !status.available ? (
          <div className="coach-offline">
            <p>
              {status.reason === "model-missing"
                ? "Ollama is running, but the coach model is not installed."
                : "The coach uses a local Ollama model, and it is not reachable."}
            </p>
            <pre><code>{status.reason === "model-missing" ? "ollama pull gemma4:latest" : "OLLAMA_ORIGINS=\"*\" ollama serve"}</code></pre>
            <button type="button" className="secondary-button compact-button" onClick={() => void refreshStatus()}>
              Retry
            </button>
          </div>
        ) : null}

        {status?.available && !turns.length && !busy ? (
          <div className="coach-msg coach-msg-bot">
            How can I help? Ask for a hint, a read on your approach, or a plain-English clarification of the problem.
          </div>
        ) : null}

        {turns.map((turn, index) => (
          <div key={`${turn.role}:${index}`} className={turn.role === "user" ? "coach-msg coach-msg-user" : "coach-msg coach-msg-bot"}>
            {turn.content}
          </div>
        ))}
        {busy ? <div className="coach-msg coach-msg-bot coach-typing">Coach is thinking...</div> : null}
        {error ? <div className="coach-msg coach-msg-bot coach-error">{error}</div> : null}
      </div>

      <div className="coach-input">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder={status?.available ? "Ask a question - a hint, clarification, or 'show me the code'..." : "Coach unavailable"}
          disabled={!status?.available || busy}
          rows={2}
        />
        <button type="button" className="primary-button coach-send" onClick={() => void send()} disabled={!status?.available || busy || !input.trim()}>
          Send
        </button>
      </div>
    </aside>
  );
}

async function loadReferenceCode(problemId: string, partId: string | undefined, language: string): Promise<string> {
  try {
    const partParam = partId ? `&partId=${encodeURIComponent(partId)}` : "";
    const response = await getJson<{ code: string }>(
      `/source?problemId=${encodeURIComponent(problemId)}${partParam}&language=${encodeURIComponent(language)}&kind=reference`
    );
    return response.code;
  } catch {
    return "";
  }
}

function buildCoachMessages(args: {
  turns: Turn[];
  question: string;
  problemTitle: string;
  prompt: string;
  concepts: string[];
  difficulty: string;
  language: string;
  entrypoint: string;
  code: string;
  result: RunResult | null;
  failedVisible: NonNullable<RunResult["tests"]>;
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

  return [
    {
      role: "system",
      content: `You are DSA Coach, a local coding coach inside a programming practice app. Be concise, concrete, and helpful. Prefer debugging the learner's current approach over redirecting to a different algorithm. Give hints by default, but if the learner asks for the solution, comply.`
    },
    {
      role: "user",
      content: `Problem: ${args.problemTitle}
Difficulty: ${args.difficulty}
Concepts: ${args.concepts.join(", ")}
Language: ${args.language}
Entrypoint: ${args.entrypoint}

Prompt:
${args.prompt}

Learner code:
\`\`\`${args.language}
${args.code}
\`\`\`

Last run state: ${runState}
Failing visible tests:
${failures}

Reference solution for grounding only:
\`\`\`${args.language}
${args.referenceCode}
\`\`\`
${solveHint}`
    },
    ...args.turns.slice(-10)
  ];
}

function looksLikeSolveRequest(text: string): boolean {
  const value = text.toLowerCase();
  return /\b(give|show|tell) me (the )?(answer|solution|code)\b/.test(value) ||
    /\b(full|complete) (answer|solution|code)\b/.test(value) ||
    /\bi (give up|quit)\b/.test(value);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
