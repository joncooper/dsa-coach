import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "../hooks/courseStoreContext";

export function ExportImport() {
  const { exportJson, importJson } = useStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");

  async function handleExport() {
    const json = await exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dsa-coach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Export ready");
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
