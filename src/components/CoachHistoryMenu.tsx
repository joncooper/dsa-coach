import { History } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type CoachConversation, formatRelativeTime } from "../coach/coachHistory";

interface CoachHistoryMenuProps {
  /** Past conversations for the current problem, newest first. */
  conversations: CoachConversation[];
  /** Id of the conversation currently shown in the panel. */
  activeId: string;
  onSelect: (conversationId: string) => void;
}

/**
 * Dropdown in the coach header. Lists every saved conversation for the current
 * problem; picking one loads it back into the panel so the learner can reread
 * or continue it.
 */
export function CoachHistoryMenu({ conversations, activeId, onSelect }: CoachHistoryMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="coach-history" ref={rootRef}>
      <button
        type="button"
        className="coach-icon-button"
        onClick={() => setOpen((v) => !v)}
        disabled={conversations.length === 0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Conversation history"
        title="Conversation history"
      >
        <History size={16} />
      </button>
      {open ? (
        <div className="coach-history-panel" role="menu">
          {conversations.length === 0 ? (
            <p className="coach-history-empty">No saved conversations yet.</p>
          ) : (
            conversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  role="menuitem"
                  className={`coach-history-item ${isActive ? "is-active" : ""}`}
                  onClick={() => {
                    onSelect(conversation.id);
                    setOpen(false);
                  }}
                >
                  <span className="coach-history-item-title">{conversation.preview}</span>
                  <span className="coach-history-item-meta">
                    {isActive ? "Current · " : ""}
                    {formatRelativeTime(conversation.lastAt)} · {conversation.exchangeCount}{" "}
                    {conversation.exchangeCount === 1 ? "reply" : "replies"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
