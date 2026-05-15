import { Bot, SendHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildInitialUserPrompt,
  COACH_SYSTEM_PROMPT,
  looksLikeSolveRequest,
  type CoachContext
} from "../coach/coachPrompts";
import { checkOllama, streamChat, type ChatMessage, type OllamaStatus } from "../coach/ollamaClient";
import { MarkdownView } from "./MarkdownView";

interface CoachPanelProps {
  /** Rebuilt by the parent from the live problem/editor/test state. */
  buildContext: () => CoachContext;
  visible: boolean;
  onClose: () => void;
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export function CoachPanel({ buildContext, visible, onClose }: CoachPanelProps) {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [input, setInput] = useState("");
  const startedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
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
        { role: "user", content: buildInitialUserPrompt(buildContext()) },
        ...outgoing.slice(-10).map((t) => ({ role: t.role, content: t.content }))
      ];

      try {
        let acc = "";
        for await (const chunk of streamChat(messages, controller.signal)) {
          acc += chunk;
          setPartial(acc);
        }
        setTurns((prev) => [...prev, { role: "assistant", content: acc || "(no response)" }]);
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
    [buildContext]
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

  function retryConnection() {
    void (async () => {
      const s = await checkOllama();
      setStatus(s);
      if (s.available && turns.length === 0) void run([]);
    })();
  }

  if (!visible) return null;

  return (
    <aside className="coach-panel" aria-label="AI coach">
      <header className="coach-header">
        <span className="coach-title">
          <Bot size={16} aria-hidden="true" />
          Coach
        </span>
        <button type="button" className="coach-close" onClick={onClose} aria-label="Hide coach">
          <X size={16} />
        </button>
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
