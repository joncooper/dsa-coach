import { useEffect, useMemo, useState } from "react";
import type { ContentGraph, LanguagePack, Problem, ProblemPart, RunResult } from "../../../src/core/types";
import { migrateLegacyBackup, type LegacyBackupPayload } from "../../../src/storage/legacyMigration";
import type { NextUserData } from "../../../src/storage/userData";
import { CodeEditor } from "./CodeEditor";

const API_BASE = import.meta.env.VITE_DSA_DAEMON_URL ?? "http://127.0.0.1:4777";
const USER_DATA_KEY = "dsa-coach-next:user-data";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; graph: ContentGraph; languages: LanguagePack[] }
  | { status: "error"; message: string };

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("typescript");
  const [code, setCode] = useState("");
  const [sourceKind, setSourceKind] = useState<"starter" | "reference">("starter");
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [userData, setUserData] = useState<NextUserData | null>(() => loadStoredUserData());
  const [migrationError, setMigrationError] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [graph, languages] = await Promise.all([
          getJson<ContentGraph>("/catalog"),
          getJson<LanguagePack[]>("/languages")
        ]);
        if (!alive) return;
        setLoadState({ status: "ready", graph, languages });
        setSelectedProblemId(graph.problems[0]?.id ?? "");
      } catch (error) {
        if (alive) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const graph = loadState.status === "ready" ? loadState.graph : undefined;
  const languages = loadState.status === "ready" ? loadState.languages : [];
  const selectedProblem = useMemo(
    () => graph?.problems.find((problem) => problem.id === selectedProblemId),
    [graph?.problems, selectedProblemId]
  );
  const selectedPart = selectedProblem?.parts?.find((part) => part.id === selectedPartId);
  const selectedPack = languages.find((language) => language.id === selectedLanguage);
  const activeLanguages = selectedPart?.languages ?? selectedProblem?.languages;
  const supportedLanguages = selectedProblem
    ? languages.filter((language) => activeLanguages?.[language.id])
    : languages;
  const activeTests = selectedPart?.tests ?? selectedProblem?.tests ?? [];
  const activeSignature = selectedPart?.signature ?? selectedProblem?.signature;
  const activeSupport = activeLanguages?.[selectedLanguage];

  useEffect(() => {
    if (!selectedProblem) return;
    if (selectedPartId && !selectedProblem.parts?.some((part) => part.id === selectedPartId)) {
      setSelectedPartId("");
      return;
    }
    const languagesForSelection = selectedPart?.languages ?? selectedProblem.languages;
    if (!languagesForSelection[selectedLanguage]) {
      const fallback = Object.keys(languagesForSelection)[0];
      if (fallback) setSelectedLanguage(fallback);
    }
  }, [selectedLanguage, selectedPart, selectedPartId, selectedProblem]);

  useEffect(() => {
    if (!selectedProblemId || !selectedLanguage) return;
    let alive = true;
    setResult(null);
    void (async () => {
      try {
        const partParam = selectedPartId ? `&partId=${encodeURIComponent(selectedPartId)}` : "";
        const source = await getJson<{ code: string }>(
          `/source?problemId=${encodeURIComponent(selectedProblemId)}${partParam}&language=${encodeURIComponent(selectedLanguage)}&kind=${sourceKind}`
        );
        if (alive) setCode(source.code);
      } catch (error) {
        if (alive) setCode(`// Could not load ${sourceKind} source: ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedLanguage, selectedPartId, selectedProblemId, sourceKind]);

  async function run(includeHidden: boolean) {
    if (!selectedProblem) return;
    setBusy(true);
    setResult(null);
    try {
      setResult(
        await postJson<RunResult>("/run", {
          language: selectedLanguage,
          problemId: selectedProblem.id,
          partId: selectedPartId || undefined,
          code,
          includeHidden,
          timeoutMs: 1000
        })
      );
    } catch (error) {
      setResult({
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: 0,
        tests: [],
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setBusy(false);
    }
  }

  async function importLegacyBackup(file: File | undefined) {
    if (!file) return;
    setMigrationError("");
    try {
      const payload = JSON.parse(await file.text()) as LegacyBackupPayload;
      const migrated = migrateLegacyBackup(payload);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(migrated));
      setUserData(migrated);
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : String(error));
    }
  }

  if (loadState.status === "loading") {
    return <div className="boot-screen">Connecting to local runner...</div>;
  }

  if (loadState.status === "error") {
    return (
      <main className="error-screen">
        <h1>Runner daemon unavailable</h1>
        <p>{loadState.message}</p>
        <pre>cd next{"\n"}bun run daemon</pre>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">DC</span>
          <div>
            <h1>DSA Coach Next</h1>
            <p>Local multi-language workbench</p>
          </div>
        </div>

        <section className="nav-section" aria-label="Tracks">
          <h2>Tracks</h2>
          {loadState.graph.tracks.map((track) => (
            <div className="track-block" key={track.id}>
              <h3>{track.title}</h3>
              <ul>
                {track.entries.map((entry) => (
                  <li key={`${entry.kind}:${entry.id}`}>
                    <span>{entry.kind}</span>
                    {entry.id}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="nav-section" aria-label="Problems">
          <h2>Problems</h2>
          <div className="problem-list">
            {loadState.graph.problems.map((problem) => (
              <button
                type="button"
                key={problem.id}
                className={problem.id === selectedProblemId ? "active" : ""}
                onClick={() => {
                  setSelectedProblemId(problem.id);
                  setSelectedPartId("");
                }}
              >
                <span>{problem.title}</span>
                <small>{problem.difficulty}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="nav-section" aria-label="Legacy migration">
          <h2>Migration</h2>
          <div className="migration-panel">
            <label className="file-import">
              <span>Import current app backup</span>
              <input
                type="file"
                accept="application/json"
                onChange={(event) => void importLegacyBackup(event.target.files?.[0])}
              />
            </label>
            {migrationError ? <p className="migration-error">{migrationError}</p> : null}
            {userData ? <MigrationSummary userData={userData} /> : <p className="muted">No migrated user data loaded.</p>}
          </div>
        </section>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{selectedProblem?.concepts.join(" / ")}</p>
            <h2>{selectedProblem ? [selectedProblem.title, selectedPart?.title].filter(Boolean).join(" · ") : "No problem selected"}</h2>
          </div>
          <div className="daemon-pill">daemon {API_BASE.replace(/^https?:\/\//, "")}</div>
        </header>

        {selectedProblem ? (
          <div className="workspace-grid">
            <section className="prompt-pane">
              {selectedProblem.parts?.length ? (
                <>
                  <h3>Part</h3>
                  <select value={selectedPartId} onChange={(event) => setSelectedPartId(event.target.value)}>
                    <option value="">Base</option>
                    {selectedProblem.parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.title}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
              <h3>Prompt</h3>
              <p>{selectedPart?.prompt ?? selectedProblem.prompt}</p>
              <h3>Signature</h3>
              <code>{signatureLabel(selectedProblem, selectedPart)}</code>
              <h3>Tests</h3>
              <ul className="test-list">
                {activeTests.map((test) => (
                  <li key={test.name}>
                    <span>{test.visibility}</span>
                    {test.name}
                  </li>
                ))}
              </ul>
            </section>

            <section className="editor-pane">
              <div className="toolbar">
                <label>
                  <span>Language</span>
                  <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)}>
                    {supportedLanguages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.label}{language.runner.installedByDefault ? "" : " (not installed)"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Source</span>
                  <select value={sourceKind} onChange={(event) => setSourceKind(event.target.value as "starter" | "reference")}>
                    <option value="starter">Starter</option>
                    <option value="reference">Reference</option>
                  </select>
                </label>
                <button type="button" onClick={() => void run(false)} disabled={busy || !selectedPack?.runner.installedByDefault}>
                  Run visible
                </button>
                <button type="button" className="primary" onClick={() => void run(true)} disabled={busy || !selectedPack?.runner.installedByDefault}>
                  Submit all
                </button>
              </div>

              {!selectedPack?.runner.installedByDefault ? (
                <p className="notice">
                  {selectedPack?.label ?? selectedLanguage} is represented in the content graph, but its local runner pack is not installed in this prototype.
                </p>
              ) : null}

              <CodeEditor
                value={code}
                language={selectedLanguage}
                problemId={selectedProblem.id}
                partId={selectedPartId || undefined}
                signature={activeSignature}
                support={activeSupport}
                onChange={setCode}
              />

              <ResultPanel result={result} busy={busy} />
            </section>
          </div>
        ) : (
          <p>No problems are available in the content graph.</p>
        )}
      </main>
    </div>
  );
}

function MigrationSummary({ userData }: { userData: NextUserData }) {
  const counts = userData.migrationReport.counts;
  return (
    <div className="migration-summary">
      <strong>Legacy data imported</strong>
      <dl>
        <div>
          <dt>Progress</dt>
          <dd>{counts.progress}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{counts.notes}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{counts.attempts}</dd>
        </div>
        <div>
          <dt>Buffers</dt>
          <dd>{counts.editorBuffers}</dd>
        </div>
        <div>
          <dt>Coach</dt>
          <dd>{counts.coachLogs}</dd>
        </div>
      </dl>
      {userData.migrationReport.warnings.length ? (
        <p className="migration-warning">{userData.migrationReport.warnings.length} warning(s)</p>
      ) : null}
    </div>
  );
}

function ResultPanel({ result, busy }: { result: RunResult | null; busy: boolean }) {
  if (busy) return <section className="result-pane">Running locally...</section>;
  if (!result) return <section className="result-pane muted">No run yet.</section>;
  return (
    <section className={`result-pane status-${result.status}`}>
      <header>
        <strong>{result.status}</strong>
        <span>{result.durationMs} ms</span>
      </header>
      {result.message ? <pre>{result.message}</pre> : null}
      {result.stdout ? <pre>{result.stdout}</pre> : null}
      {result.stderr ? <pre>{result.stderr}</pre> : null}
      <div className="result-list">
        {result.tests.map((test) => (
          <article key={test.name} className={test.passed ? "passed" : "failed"}>
            <strong>{test.passed ? "Pass" : "Fail"}: {test.name}</strong>
            <dl>
              <div>
                <dt>Expected</dt>
                <dd>{JSON.stringify(test.expected)}</dd>
              </div>
              <div>
                <dt>Actual</dt>
                <dd>{JSON.stringify(test.actual)}</dd>
              </div>
            </dl>
            {test.error ? <pre>{test.error}</pre> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function signatureLabel(problem: Problem, part?: ProblemPart): string {
  const signature = part?.signature ?? problem.signature;
  const args = signature.inputs.map((input) => `${input.name}: ${typeLabel(input.type)}`).join(", ");
  return `${signature.name}(${args}) -> ${typeLabel(signature.output)}`;
}

function typeLabel(type: Problem["signature"]["output"]): string {
  const base = type.type === "array" ? `${typeLabel(type.items ?? { type: "any" })}[]` : type.type;
  return type.nullable ? `${base} | null` : base;
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

function loadStoredUserData(): NextUserData | null {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? (JSON.parse(raw) as NextUserData) : null;
  } catch {
    return null;
  }
}
