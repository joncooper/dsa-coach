import { useEffect, useState } from "react";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";

export function NotesPanel({ type, id }: { type: "lesson" | "problem" | "quiz"; id: string }) {
  const { notes, saveNote } = useStore();
  const key = itemKey(type, id);
  const [body, setBody] = useState(notes[key]?.body ?? "");

  useEffect(() => {
    setBody(notes[key]?.body ?? "");
  }, [key, notes]);

  return (
    <label className="notes-panel">
      <span>Notes</span>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} onBlur={() => void saveNote(type, id, body)} />
    </label>
  );
}
