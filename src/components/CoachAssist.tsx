import { useCallback, useRef, useState } from "react";
import { Bot, SendHorizontal, Sparkles, X } from "lucide-react";
import { checkOllama, streamChat, type ChatMessage, type OllamaStatus } from "../coach/ollamaClient";
import { MarkdownView } from "./MarkdownView";

interface CoachAssistProps {
  /** Label on the collapsed trigger button. */
  label: string;
  /** System prompt for this coach surface. */
  systemPrompt: string;
  /**
   * "auto" streams `seedPrompt` immediately when the panel opens (used for the
   * quiz "explain why I'm wrong" flow). "ask" shows an input and waits for the
   * learner to type a question.
   */
  mode: "auto" | "ask";
  /** The first message sent in "auto" mode. */
  seedPrompt?: string;
  /** Builds the first sent message from the learner's typed question ("ask" mode). */
  buildPrompt?: (question: string) => string;
  /** Placeholder for the "ask" mode input. */
  placeholder?: string;
}

interface Turn {
  role: "user" | "assistant";
  /** What to render in the UI. Empty user turns (the seeded ask) are not shown. */
  display: string;
}

/**
 * An inline, opt-in coach widget for lessons. Reuses the local-LLM client but
 * is its own surface: no escalation ladder, no eval logging — just a clear
 * explanation. Degrades gracefully when Ollama is not reachable.
 */
export function CoachAssist({ label, systemPrompt, mode, seedPrompt, buildPrompt, placeholder }: CoachAssistProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [input, setInput] = useState("");
  // The model-facing text of the first user turn (carries the lesson/quiz
  // context); kept separate from its UI display text.
  const firstSentRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (sent: ChatMessage[], displayTurns: Turn[]) => {
      setStreaming(true);
      setPartial("");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        let acc = "";
        for await (const chunk of streamChat(sent, controller.signal)) {
          acc += chunk;
          setPartial(acc);
        }
        setTurns([...displayTurns, { role: "assistant", display: acc || "(no response)" }]);
      } catch (err) {
        if (!controller.signal.aborted) {
          setTurns([
            ...displayTurns,
            {
              role: "assistant",
              display: `I couldn't reach the local model.\n\n\`\`\`\n${err instanceof Error ? err.message : String(err)}\n\`\`\``
            }
          ]);
        }
      } finally {
        setStreaming(false);
        setPartial("");
        abortRef.current = null;
      }
    },
    []
  );

  const buildMessages = useCallback(
    (displayTurns: Turn[]): ChatMessage[] => [
      { role: "system", content: systemPrompt },
      // The first user turn carries the context; later turns are verbatim.
      ...displayTurns.map((turn, index) =>
        index === 0 && turn.role === "user"
          ? { role: "user" as const, content: firstSentRef.current }
          : { role: turn.role, content: turn.display }
      )
    ],
    [systemPrompt]
  );

  const openPanel = useCallback(async () => {
    setOpen(true);
    if (status) return; // already probed once
    const probed = await checkOllama();
    setStatus(probed);
    if (probed.available && mode === "auto" && seedPrompt) {
      firstSentRef.current = seedPrompt;
      const displayTurns: Turn[] = [{ role: "user", display: "" }];
      setTurns(displayTurns);
      void stream(buildMessages(displayTurns), displayTurns);
    }
  }, [status, mode, seedPrompt, stream, buildMessages]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || streaming || !status?.available) return;
    setInput("");
    const isFirst = turns.length === 0;
    if (isFirst) {
      firstSentRef.current = buildPrompt ? buildPrompt(text) : text;
    }
    const displayTurns: Turn[] = [...turns, { role: "user", display: text }];
    setTurns(displayTurns);
    void stream(buildMessages(displayTurns), displayTurns);
  }, [input, streaming, status, turns, buildPrompt, stream, buildMessages]);

  const close = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setOpen(false);
    setStreaming(false);
    setPartial("");
  }, []);

  if (!open) {
    return (
      <button type="button" className="coach-assist-trigger" onClick={() => void openPanel()}>
        <Sparkles size={15} />
        {label}
      </button>
    );
  }

  const offline = status && !status.available;
  // In "ask" mode, or after the first answer, the learner can type.
  const showInput = status?.available && (mode === "ask" || turns.length > 0);

  return (
    <div className="coach-assist">
      <div className="coach-assist-head">
        <span className="coach-assist-title">
          <Bot size={15} />
          Coach
        </span>
        <button type="button" className="coach-assist-close" onClick={close} aria-label="Close coach">
          <X size={15} />
        </button>
      </div>

      <div className="coach-assist-body" tabIndex={0} aria-label="Coach conversation">
        {!status ? <p className="coach-assist-status">Checking for the local model…</p> : null}

        {offline ? (
          <div className="coach-assist-offline">
            <p>
              {status?.reason === "model-missing"
                ? "Ollama is running, but the coach model isn't installed."
                : "The coach uses a local model via Ollama, and it isn't reachable right now."}
            </p>
            <p className="coach-assist-muted">
              {status?.reason === "model-missing"
                ? "Install it, then reopen this panel:"
                : "Start it so it allows this origin, then reopen this panel:"}
            </p>
            <pre>
              <code>
                {status?.reason === "model-missing" ? "ollama pull gemma4:latest" : 'OLLAMA_ORIGINS="*" ollama serve'}
              </code>
            </pre>
            <p className="coach-assist-muted">The rest of the lesson works fine without it.</p>
          </div>
        ) : null}

        {turns.map((turn, index) =>
          turn.role === "assistant" ? (
            <div key={index} className="coach-assist-msg coach-assist-bot">
              <MarkdownView content={turn.display} />
            </div>
          ) : turn.display ? (
            <div key={index} className="coach-assist-msg coach-assist-user">
              {turn.display}
            </div>
          ) : null
        )}

        {streaming ? (
          <div className="coach-assist-msg coach-assist-bot">
            {partial ? <MarkdownView content={partial} /> : <span className="coach-assist-typing">Thinking…</span>}
          </div>
        ) : null}
      </div>

      {showInput ? (
        <div className="coach-assist-input">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder={turns.length > 0 ? "Ask a follow-up…" : (placeholder ?? "Ask a question…")}
            rows={2}
            aria-label="Ask the coach"
          />
          <button
            type="button"
            className="coach-assist-send"
            onClick={send}
            disabled={streaming || !input.trim()}
            aria-label="Send"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
