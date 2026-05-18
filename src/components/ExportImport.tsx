import { Download, FlaskConical, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "../hooks/courseStoreContext";

export function ExportImport() {
  const { exportJson, importJson, exportCoachLog } = useStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleExport() {
    const json = await exportJson();
    download(json, `dsa-coach-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    setStatus("Export ready");
  }

  async function handleExportCoach() {
    const jsonl = await exportCoachLog();
    if (!jsonl) {
      setStatus("No coach conversations logged yet");
      return;
    }
    download(jsonl, `dsa-coach-evals-${new Date().toISOString().slice(0, 10)}.jsonl`, "application/x-ndjson");
    setStatus("Coach eval log exported");
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    await importJson(await file.text());
    setStatus("Import complete");
  }

  return (
    <div className="export-row">
      <button className="icon-button" type="button" onClick={handleExport} aria-label="Export progress">
        <Download size={18} />
        Export
      </button>
      <button className="icon-button" type="button" onClick={() => fileRef.current?.click()} aria-label="Import progress">
        <Upload size={18} />
        Import
      </button>
      <button
        className="icon-button"
        type="button"
        onClick={handleExportCoach}
        aria-label="Export coach eval log"
        title="Export logged coach conversations as JSONL for evals"
      >
        <FlaskConical size={18} />
        Coach log
      </button>
      <input
        ref={fileRef}
        className="hidden-input"
        type="file"
        accept="application/json"
        onChange={(event) => void handleImport(event.target.files?.[0])}
      />
      {status ? <span className="muted">{status}</span> : null}
    </div>
  );
}
