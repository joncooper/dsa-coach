import { useEffect, useMemo, useRef, useState } from "react";
import type { LanguageId, Problem, ProblemPart, RunResult } from "../../../src/core/types";
import type { UserCoachLogRecord } from "../../../src/storage/userData";
import { MarkdownView } from "../../../../src/components/MarkdownView";
import { API_BASE } from "./apiBase";
import { buildCoachMessages, COACH_PROMPT_VERSION } from "./coachMessages";
import type { CoachMessage, CoachMode } from "./coachMessages";

interface CoachPanelProps {
  problem: Problem;
  part?: ProblemPart;
  language: LanguageId;
  code: string;
  result: RunResult | null;
  coachLogs: UserCoachLogRecord[];
  visible: boolean;
  onClose: () => void;
  onLogExchange: (record: UserCoachLogRecord) => void;
  onRateExchange: (createdAt: string, feedback: CoachFeedback) => void;
}

interface CoachStatus {
  available: boolean;
  model: string | null;
  reason?: "unreachable" | "model-missing";
}

interface Turn {
  role: "user" | "assistant";
  content: string;
  logCreatedAt?: string;
  feedback?: CoachFeedback;
}

interface CoachFeedback {
  rating: "up" | "down";
  at: string;
}

interface CoachConversation {
  id: string;
  title: string;
  updatedAt: string;
  turns: Turn[];
}

const coachModes: Array<{ id: CoachMode; label: string; description: string }> = [
  { id: "hint", label: "Hint", description: "Small nudge, no code" },
  { id: "debug", label: "Debug", description: "Use failing tests and current code" },
  { id: "explain", label: "Explain", description: "Clarify the concept or spec" },
  { id: "review", label: "Review", description: "Review approach, bugs, and tradeoffs" }
];

function newConversationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CoachPanel({ problem, part, language, code, result, coachLogs, visible, onClose, onLogExchange, onRateExchange }: CoachPanelProps) {
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CoachMode>(() => result && result.status !== "passed" ? "debug" : "hint");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const conversationIdRef = useRef(newConversationId());

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
  const conversations = useMemo(() => groupConversations(coachLogs, problem.id), [coachLogs, problem.id]);

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
        mode,
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
      const createdAt = new Date().toISOString();
      onLogExchange({
        conversationId: conversationIdRef.current,
        problemId: problem.id,
        partTitle: part?.title,
        mode,
        surface: "problem",
        language,
        partId: part?.id,
        workspaceId: part?.id ? `${problem.id}:${part.id}` : problem.id,
        model: status.model ?? "Local Ollama",
        promptVersion: COACH_PROMPT_VERSION,
        userMessage: text,
        messages,
        response: response.message,
        context: {
          problemTitle: activeTitle,
          prompt: activePrompt,
          concepts: problem.concepts,
          difficulty: problem.difficulty,
          language,
          entrypoint,
          coachMode: mode,
          failedVisible,
          result
        },
        createdAt
      });
      setTurns((current) => [...current, { role: "assistant", content: response.message, logCreatedAt: createdAt }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function clearConversation() {
    conversationIdRef.current = newConversationId();
    setTurns([]);
    setError("");
    setHistoryOpen(false);
  }

  function selectConversation(conversation: CoachConversation) {
    conversationIdRef.current = conversation.id;
    setTurns(conversation.turns);
    setError("");
    setHistoryOpen(false);
  }

  function rate(index: number, rating: "up" | "down") {
    const turn = turns[index];
    if (!turn?.logCreatedAt) return;
    const feedback: CoachFeedback = { rating, at: new Date().toISOString() };
    setTurns((current) => current.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, feedback } : candidate));
    onRateExchange(turn.logCreatedAt, feedback);
  }

  if (!visible) return null;

  return (
    <aside className="coach-panel" aria-label="AI coach">
      <header className="coach-header">
        <div className="coach-header-left">
          <span className="coach-title">
            <CoachBotIcon />
            Coach
          </span>
          <div className="coach-history">
            <button
              type="button"
              className="coach-icon-button"
              aria-label="Conversation history"
              title="Conversation history"
              onClick={() => setHistoryOpen((value) => !value)}
              disabled={!conversations.length}
            >
              <HistoryIcon />
            </button>
            {historyOpen ? (
              <div className="coach-history-panel">
                {conversations.length ? conversations.map((conversation) => (
                  <button key={conversation.id} type="button" className="coach-history-item" onClick={() => selectConversation(conversation)}>
                    <span className="coach-history-item-title">{conversation.title}</span>
                    <span className="coach-history-item-meta">{new Date(conversation.updatedAt).toLocaleString()}</span>
                  </button>
                )) : <p className="coach-history-empty">No saved conversations.</p>}
              </div>
            ) : null}
          </div>
        </div>
        <div className="coach-actions">
          <button
            type="button"
            className="coach-icon-button"
            aria-label="New conversation"
            title="New conversation"
            onClick={clearConversation}
            disabled={!turns.length && !error}
          >
            <TrashIcon />
          </button>
          <button type="button" className="coach-icon-button" aria-label="Hide coach" title="Hide coach" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="coach-mode-strip" role="tablist" aria-label="Coach mode">
        {coachModes.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={mode === option.id}
            className={mode === option.id ? "coach-mode-button active" : "coach-mode-button"}
            title={option.description}
            onClick={() => setMode(option.id)}
          >
            <span>{option.label}</span>
            <small>{option.description}</small>
          </button>
        ))}
      </div>

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
            {emptyCoachMessage(mode)}
          </div>
        ) : null}

        {turns.map((turn, index) => (
          <div key={`${turn.role}:${index}`} className={turn.role === "user" ? "coach-msg coach-msg-user" : "coach-msg coach-msg-bot"}>
            {turn.role === "assistant" ? <MarkdownView content={turn.content} /> : turn.content}
            {turn.role === "assistant" && turn.logCreatedAt ? (
              <div className="coach-feedback">
                <button
                  type="button"
                  className={`coach-rate ${turn.feedback?.rating === "up" ? "is-active" : ""}`}
                  aria-label="Helpful"
                  aria-pressed={turn.feedback?.rating === "up"}
                  title="Helpful"
                  onClick={() => rate(index, "up")}
                >
                  <ThumbUpIcon />
                </button>
                <button
                  type="button"
                  className={`coach-rate ${turn.feedback?.rating === "down" ? "is-active" : ""}`}
                  aria-label="Not helpful"
                  aria-pressed={turn.feedback?.rating === "down"}
                  title="Not helpful"
                  onClick={() => rate(index, "down")}
                >
                  <ThumbDownIcon />
                </button>
                {turn.feedback ? <span className="coach-rate-note">Feedback saved.</span> : null}
              </div>
            ) : null}
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
          placeholder={status?.available ? coachPlaceholder(mode) : "Coach unavailable"}
          disabled={!status?.available || busy}
          rows={2}
        />
        <button type="button" className="primary-button coach-send" onClick={() => void send()} disabled={!status?.available || busy || !input.trim()}>
          <SendIcon />
        </button>
      </div>
    </aside>
  );
}

function emptyCoachMessage(mode: CoachMode): string {
  if (mode === "debug") return "Debug mode is on. Ask about the failing test, error, or current code path and I will stay close to your implementation.";
  if (mode === "explain") return "Explain mode is on. Ask about the problem statement, an invariant, an API detail, or why an approach works.";
  if (mode === "review") return "Review mode is on. Ask for a read on your implementation, edge cases, or style without getting a rewrite.";
  return "Hint mode is on. Ask for a nudge and I will keep it small unless you explicitly ask for the solution.";
}

function coachPlaceholder(mode: CoachMode): string {
  if (mode === "debug") return "Ask what is failing, what state is wrong, or why a test mismatches...";
  if (mode === "explain") return "Ask for a clarification, invariant, trace, or plain-English explanation...";
  if (mode === "review") return "Ask for a review of your approach, edge cases, or style...";
  return "Ask for a small hint, next step, or sanity check...";
}

function CoachBotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="6" y="9" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 5v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 13h.01M15 13h.01" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9 17h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 1 0 2.35-5.65" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 5v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M4 7h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M7 10v10H4V10h3Zm0 0 4-7c1.4 0 2.2 1.3 1.8 2.6L12 9h6.3c1.1 0 1.9 1 1.7 2.1l-1.2 6.5A3 3 0 0 1 15.9 20H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M7 14V4H4v10h3Zm0 0 4 7c1.4 0 2.2-1.3 1.8-2.6L12 15h6.3c1.1 0 1.9-1 1.7-2.1l-1.2-6.5A3 3 0 0 0 15.9 4H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M4 11.5 20 4l-7.5 16-2-6.5L4 11.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m10.5 13.5 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function groupConversations(logs: UserCoachLogRecord[], problemId: string): CoachConversation[] {
  const grouped = new Map<string, UserCoachLogRecord[]>();
  for (const log of logs) {
    if (log.problemId !== problemId) continue;
    const list = grouped.get(log.conversationId) ?? [];
    list.push(log);
    grouped.set(log.conversationId, list);
  }
  return Array.from(grouped.entries()).map(([id, records]) => {
    const ordered = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const latest = ordered[ordered.length - 1];
    const first = ordered[0];
    const turns = ordered.flatMap((record): Turn[] => {
      const recordTurns: Turn[] = [];
      if (record.userMessage) recordTurns.push({ role: "user", content: record.userMessage });
      recordTurns.push({
        role: "assistant",
        content: record.response,
        logCreatedAt: record.createdAt,
        feedback: isCoachFeedback(record.feedback) ? record.feedback : undefined
      });
      return recordTurns;
    });
    return {
      id,
      title: first?.userMessage?.slice(0, 54) || "Coach conversation",
      updatedAt: latest?.createdAt ?? "",
      turns
    };
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function isCoachFeedback(value: unknown): value is CoachFeedback {
  return Boolean(value && typeof value === "object" && ((value as CoachFeedback).rating === "up" || (value as CoachFeedback).rating === "down"));
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
