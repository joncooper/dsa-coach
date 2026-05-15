import { ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../hooks/courseStoreContext";

interface DisciplineChecklistProps {
  problemId: string;
}

const ITEMS: { id: string; label: string; hint: string }[] = [
  { id: "read-twice", label: "Read prompt twice", hint: "Once for shape, once for the corner cases." },
  { id: "restate", label: "Restate the requirements in your own words", hint: "Out loud or in a comment. Catches misreadings before they become bugs." },
  { id: "assumptions", label: "List assumptions and ask the obvious clarifying question", hint: "Empty input? Negative values? Ties? Ordering of output?" },
  { id: "sketch", label: "Sketch the approach before typing", hint: "Pseudocode, data flow, or a one-line plan in a comment." },
  { id: "test-first", label: "Write at least one new test before the implementation", hint: "Drives the contract; gives you a green-light moment when it passes." },
  { id: "narrate", label: "Narrate one tradeoff while coding", hint: "\"I'm using a dict here; if ordering mattered I'd switch to a list of tuples.\"" }
];

export function DisciplineChecklist({ problemId }: DisciplineChecklistProps) {
  const { settings, saveSetting } = useStore();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setVersion((value) => value + 1);
  }, [problemId]);

  const checks = ITEMS.map((item) => {
    const stored = settings[`discipline:${problemId}:${item.id}`]?.value;
    return { ...item, checked: stored === true };
  });
  const done = checks.filter((item) => item.checked).length;
  const total = ITEMS.length;

  function toggle(itemId: string, next: boolean) {
    void saveSetting(`discipline:${problemId}:${itemId}`, next);
  }

  function reset() {
    for (const item of ITEMS) {
      void saveSetting(`discipline:${problemId}:${item.id}`, false);
    }
    setVersion((value) => value + 1);
  }

  return (
    <details className="discipline-checklist" open={open} onToggle={(event) => setOpen(event.currentTarget.open)} key={version}>
      <summary>
        <ClipboardCheck size={16} aria-hidden="true" />
        <span>Interview discipline</span>
        <small className="prompt-detail-count">
          {done}/{total}
        </small>
      </summary>
      <ul>
        {checks.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(event) => toggle(item.id, event.currentTarget.checked)}
              />
              <span className="discipline-label">{item.label}</span>
            </label>
            <p className="discipline-hint">{item.hint}</p>
          </li>
        ))}
      </ul>
      {done > 0 ? (
        <button type="button" className="tertiary-button discipline-reset" onClick={reset}>
          Reset checklist
        </button>
      ) : null}
    </details>
  );
}
