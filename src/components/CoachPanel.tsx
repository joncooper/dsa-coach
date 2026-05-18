import { Bot, SendHorizontal, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildInitialUserPrompt,
  COACH_PROMPT_VERSION,
  COACH_SYSTEM_PROMPT,
  looksLikeSolveRequest,
  type CoachContext
} from "../coach/coachPrompts";
import { checkOllama, COACH_MODEL, streamChat, type ChatMessage, type OllamaStatus } from "../coach/ollamaClient";
import { useStore } from "../hooks/courseStoreContext";
import type { CoachFeedback } from "../types";
import { MarkdownView } from "./MarkdownView";

interface CoachPanelProps {
  /** Rebuilt by the parent from the live problem/editor/test state. */
  buildContext: () => CoachContext;
  problemId: string;
  visible: boolean;
  onClose: () => void;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
  /** Set on logged assistant turns; links the bubble to its eval record. */
  exchangeId?: number;
  feedback?: CoachFeedback;
}

function newConversationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CoachPanel({ buildContext, problemId, visible, onClose }: CoachPanelProps) {
  const { logCoachExchange, rateCoachExchange } = useStore();
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [input, setInput] = useState("");
  // Index of the assistant turn whose thumbs-down comment box is open.
  const [commentFor, setCommentFor] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string>(newConversationId());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns, partial]);

  const run = useCallback(
    async (history: Turn[]) => {
      setStreaming(true);
      setPartial("");
      const controller = new AbortController();
      abortRef.current = controller;

      const lastUser = [...history].reverse().find((t) => t.role === "user");
      const userMessage = lastUser ? lastUser.content : null;
      const context = buildContext();

      // Bias a small model toward Rung 4 when the latest turn is an
      // explicit solve request, without showing the hint in the UI.
      const outgoing = history.map((t, i) => {
        if (i === history.length - 1 && t.role === "user" && looksLikeSolveRequest(t.content)) {
          return {
            ...t,
            content: `${t.content}\n\n[The learner is explicitly asking for the full solution. Go to Rung 4 now — give the complete code plus a brief why-it-works. Do not nag.]`
          };
        }
        return t;
      });

      const messages: ChatMessage[] = [
        { role: "system", content: COACH_SYSTEM_PROMPT },
        { role: "user", content: buildInitialUserPrompt(context) },
        ...outgoing.slice(-10).map((t) => ({ role: t.role, content: t.content }))
      ];

      try {
        let acc = "";
        for await (const chunk of streamChat(messages, controller.signal)) {
          acc += chunk;
          setPartial(acc);
        }
        const response = acc || "(no response)";
        let exchangeId: number | undefined;
        if (acc) {
          try {
            exchangeId = await logCoachExchange({
              conversationId: conversationIdRef.current,
              problemId,
              partTitle: context.partTitle,
              model: COACH_MODEL,
              promptVersion: COACH_PROMPT_VERSION,
              userMessage,
              messages,
              response: acc,
              context,
              createdAt: new Date().toISOString()
            });
          } catch {
            // Logging is best-effort — never block the conversation on it.
          }
        }
        setTurns((prev) => [...prev, { role: "assistant", content: response, exchangeId }]);
      } catch (err) {
        if (!controller.signal.aborted) {
          setTurns((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `I couldn't reach the local model. Make sure Ollama is running and started with \`OLLAMA_ORIGINS\` allowing this origin.\n\n\`\`\`\n${err instanceof Error ? err.message : String(err)}\n\`\`\``
            }
          ]);
        }
      } finally {
        setStreaming(false);
        setPartial("");
        abortRef.current = null;
      }
    },
    [buildContext, logCoachExchange, problemId]
  );

  // First time the panel becomes visible: probe Ollama, then open with
  // an initial coaching message. Conversation persists afterwards.
  useEffect(() => {
    if (!visible || startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      const s = await checkOllama();
      setStatus(s);
      if (s.available) void run([]);
    })();
  }, [visible, run]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || streaming || !status?.available) return;
    const next: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    setInput("");
    void run(next);
  }, [input, streaming, status, turns, run]);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setPartial("");
    setTurns([]);
    setCommentFor(null);
    setCommentText("");
    // A fresh conversation gets its own id so eval records stay grouped.
    conversationIdRef.current = newConversationId();
    if (status?.available) void run([]);
  }, [status, run]);

  function retryConnection() {
    void (async () => {
      const s = await checkOllama();
      setStatus(s);
      if (s.available && turns.length === 0) void run([]);
    })();
  }

  const rate = useCallback(
    (index: number, rating: "up" | "down", comment?: string) => {
      const turn = turns[index];
      if (!turn || turn.exchangeId == null) return;
      const feedback: CoachFeedback = {
        rating,
        comment: comment?.trim() || undefined,
        at: new Date().toISOString()
      };
      setTurns((prev) => prev.map((t, i) => (i === index ? { ...t, feedback } : t)));
      void rateCoachExchange(turn.exchangeId, feedback).catch(() => {
        // Best-effort; the in-memory state still reflects the user's intent.
      });
    },
    [turns, rateCoachExchange]
  );

  function onThumbDown(index: number) {
    setCommentFor(index);
    setCommentText(turns[index]?.feedback?.comment ?? "");
  }

  if (!visible) return null;

  return (
    <aside className="coach-panel" aria-label="AI coach">
      <header className="coach-header">
        <span className="coach-title">
          <Bot size={16} aria-hidden="true" />
          Coach
        </span>
        <div className="coach-actions">
          <button
            type="button"
            className="coach-icon-button"
            onClick={clearConversation}
            disabled={!status?.available || (turns.length === 0 && !streaming)}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
          <button type="button" className="coach-icon-button" onClick={onClose} aria-label="Hide coach">
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="coach-scroll" ref={scrollRef}>
        {status && !status.available ? (
          <div className="coach-offline">
            <p>
              {status.reason === "model-missing"
                ? "Ollama is running but the coach model isn't installed."
                : "The coach uses a local model via Ollama, and it isn't reachable."}
            </p>
            {status.reason === "model-missing" ? (
              <pre>
                <code>ollama pull gemma4:latest</code>
              </pre>
            ) : (
              <>
                <p className="muted">Start it so it allows this origin:</p>
                <pre>
                  <code>OLLAMA_ORIGINS="*" ollama serve</code>
                </pre>
              </>
            )}
            <button type="button" className="secondary-button" onClick={retryConnection}>
              Retry
            </button>
          </div>
        ) : null}

        {turns.map((turn, i) => (
          <div key={i} className={turn.role === "user" ? "coach-msg coach-msg-user" : "coach-msg coach-msg-bot"}>
            {turn.role === "assistant" ? <MarkdownView content={turn.content} /> : turn.content}
            {turn.role === "assistant" && turn.exchangeId != null ? (
              <div className="coach-feedback">
                <button
                  type="button"
                  className={`coach-rate ${turn.feedback?.rating === "up" ? "is-active" : ""}`}
                  onClick={() => rate(i, "up")}
                  aria-pressed={turn.feedback?.rating === "up"}
                  aria-label="Helpful"
                  title="Helpful"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  type="button"
                  className={`coach-rate ${turn.feedback?.rating === "down" ? "is-active" : ""}`}
                  onClick={() => onThumbDown(i)}
                  aria-pressed={turn.feedback?.rating === "down"}
                  aria-label="Not helpful"
                  title="Not helpful"
                >
                  <ThumbsDown size={14} />
                </button>
                {turn.feedback ? <span className="coach-rate-note">Thanks — feedback saved.</span> : null}
              </div>
            ) : null}
            {commentFor === i ? (
              <form
                className="coach-comment"
                onSubmit={(e) => {
                  e.preventDefault();
                  rate(i, "down", commentText);
                  setCommentFor(null);
                  setCommentText("");
                }}
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What was wrong? (optional — e.g. 'told me to rewrite when a 1-line fix worked')"
                  rows={2}
                  autoFocus
                />
                <div className="coach-comment-actions">
                  <button type="submit" className="primary-button compact-button">
                    Submit
                  </button>
                  <button
                    type="button"
                    className="secondary-button compact-button"
                    onClick={() => {
                      setCommentFor(null);
                      setCommentText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        ))}

        {streaming ? (
          <div className="coach-msg coach-msg-bot">
            {partial ? <MarkdownView content={partial} /> : <span className="coach-typing">Coach is thinking…</span>}
          </div>
        ) : null}
      </div>

      <div className="coach-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={status?.available ? "Ask for a hint, or say 'show me the code'…" : "Coach unavailable"}
          disabled={!status?.available || streaming}
          rows={2}
        />
        <button
          type="button"
          className="primary-button coach-send"
          onClick={send}
          disabled={!status?.available || streaming || !input.trim()}
          aria-label="Send"
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </aside>
  );
}
