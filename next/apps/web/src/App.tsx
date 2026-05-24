import { useEffect, useMemo, useRef, useState } from "react";
import type { ContentGraph, LanguageId, LanguagePack, Problem, ProblemPart, RunResult } from "../../../src/core/types";
import { migrateLegacyBackup, type LegacyBackupPayload } from "../../../src/storage/legacyMigration";
import type { NextUserData, NextWorkspaceState, WorkspaceEditorBuffer, WorkspaceSelection } from "../../../src/storage/userData";
import { API_BASE } from "./apiBase";
import { CodeEditor } from "./CodeEditor";

const USER_DATA_KEY = "dsa-coach-next:user-data";
const WORKSPACE_STATE_KEY = "dsa-coach-next:workspace-state";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; graph: ContentGraph; languages: LanguagePack[] }
  | { status: "error"; message: string };

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>("typescript");
  const [code, setCode] = useState("");
  const [sourceKind, setSourceKind] = useState<"starter" | "reference">("starter");
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [userData, setUserData] = useState<NextUserData | null>(() => loadStoredUserData());
  const [workspaceState, setWorkspaceState] = useState<NextWorkspaceState | null>(() => loadStoredWorkspaceState());
  const workspaceStateRef = useRef<NextWorkspaceState | null>(workspaceState);
  const [storageStatus, setStorageStatus] = useState("Checking app data storage...");
  const [daemonPersistenceAvailable, setDaemonPersistenceAvailable] = useState(false);
  const [migrationError, setMigrationError] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [graph, languages] = await Promise.all([
          getJson<ContentGraph>("/catalog"),
          getJson<LanguagePack[]>("/languages")
        ]);
        const [daemonUserData, daemonWorkspaceState] = await Promise.all([
          safeGetJson<{ userData: NextUserData | null }>("/user-data"),
          safeGetJson<{ workspaceState: NextWorkspaceState | null }>("/workspace-state")
        ]);
        const nextUserData = daemonUserData?.userData ?? loadStoredUserData();
        const nextWorkspaceState =
          daemonWorkspaceState?.workspaceState ??
          loadStoredWorkspaceState() ??
          (nextUserData ? workspaceStateFromUserData(nextUserData, null) : null);
        const initialSelection =
          validSelection(nextWorkspaceState?.lastSelection, graph) ??
          defaultSelection(graph, languages);
        if (!alive) return;
        setLoadState({ status: "ready", graph, languages });
        if (nextUserData) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(nextUserData));
          setUserData(nextUserData);
        }
        if (nextWorkspaceState) {
          workspaceStateRef.current = nextWorkspaceState;
          localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(nextWorkspaceState));
          setWorkspaceState(nextWorkspaceState);
        }
        setDaemonPersistenceAvailable(Boolean(daemonUserData && daemonWorkspaceState));
        setStorageStatus(
          daemonUserData && daemonWorkspaceState
            ? "Saving in the app data folder."
            : "Saving in browser storage fallback."
        );
        if (initialSelection) {
          setSelectedProblemId(initialSelection.problemId);
          setSelectedPartId(initialSelection.partId ?? "");
          setSelectedLanguage(initialSelection.language);
          setSourceKind(initialSelection.sourceKind);
        }
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

  useEffect(() => {
    workspaceStateRef.current = workspaceState;
  }, [workspaceState]);

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
      const selection: WorkspaceSelection = {
        problemId: selectedProblemId,
        partId: selectedPartId || undefined,
        language: selectedLanguage,
        sourceKind
      };
      const savedBuffer = findWorkspaceBuffer(workspaceStateRef.current, selection);
      if (savedBuffer) {
        if (alive) setCode(savedBuffer.code);
        return;
      }
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

  useEffect(() => {
    if (!selectedProblemId || !selectedLanguage) return;
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      const nextState = upsertWorkspaceBuffer(workspaceStateRef.current, {
        problemId: selectedProblemId,
        partId: selectedPartId || undefined,
        language: selectedLanguage,
        sourceKind,
        code,
        updatedAt: now
      });
      workspaceStateRef.current = nextState;
      setWorkspaceState(nextState);
      void persistWorkspaceState(nextState);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [code, selectedLanguage, selectedPartId, selectedProblemId, sourceKind]);

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

  async function persistImportedUserData(value: NextUserData) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(value));
    try {
      await postJson("/user-data", value);
      setDaemonPersistenceAvailable(true);
      setStorageStatus("Imported data saved in the app data folder.");
    } catch {
      setDaemonPersistenceAvailable(false);
      setStorageStatus("Imported data saved in browser storage fallback.");
    }
  }

  async function persistWorkspaceState(value: NextWorkspaceState) {
    localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(value));
    try {
      await postJson("/workspace-state", value);
      setDaemonPersistenceAvailable(true);
      setStorageStatus("Workspace saved in the app data folder.");
    } catch {
      setDaemonPersistenceAvailable(false);
      setStorageStatus("Workspace saved in browser storage fallback.");
    }
  }

  async function importLegacyBackup(file: File | undefined) {
    if (!file) return;
    setMigrationError("");
    try {
      const payload = JSON.parse(await file.text()) as LegacyBackupPayload;
      const migrated = migrateLegacyBackup(payload);
      setUserData(migrated);
      await persistImportedUserData(migrated);
      const nextWorkspaceState = workspaceStateFromUserData(migrated, workspaceStateRef.current);
      if (nextWorkspaceState) {
        workspaceStateRef.current = nextWorkspaceState;
        setWorkspaceState(nextWorkspaceState);
        await persistWorkspaceState(nextWorkspaceState);
        const activeBuffer = findWorkspaceBuffer(nextWorkspaceState, {
          problemId: selectedProblemId,
          partId: selectedPartId || undefined,
          language: selectedLanguage,
          sourceKind
        });
        if (activeBuffer) setCode(activeBuffer.code);
      }
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
            <p className="storage-status">{storageStatus}</p>
            {userData && daemonPersistenceAvailable ? (
              <a className="export-link" href={`${API_BASE}/user-data/export`}>
                Export imported data
              </a>
            ) : null}
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

async function safeGetJson<T>(path: string): Promise<T | undefined> {
  try {
    return await getJson<T>(path);
  } catch {
    return undefined;
  }
}

function loadStoredUserData(): NextUserData | null {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? (JSON.parse(raw) as NextUserData) : null;
  } catch {
    return null;
  }
}

function loadStoredWorkspaceState(): NextWorkspaceState | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STATE_KEY);
    return raw ? (JSON.parse(raw) as NextWorkspaceState) : null;
  } catch {
    return null;
  }
}

function defaultSelection(graph: ContentGraph, languages: LanguagePack[]): WorkspaceSelection | undefined {
  const problem = graph.problems[0];
  if (!problem) return undefined;
  const language = Object.keys(problem.languages)[0] ?? languages[0]?.id ?? "typescript";
  return {
    problemId: problem.id,
    language,
    sourceKind: "starter"
  };
}

function validSelection(selection: WorkspaceSelection | undefined, graph: ContentGraph): WorkspaceSelection | undefined {
  if (!selection) return undefined;
  const problem = graph.problems.find((candidate) => candidate.id === selection.problemId);
  if (!problem) return undefined;
  const part = selection.partId ? problem.parts?.find((candidate) => candidate.id === selection.partId) : undefined;
  const partId = selection.partId && part ? selection.partId : undefined;
  const languageMap = part?.languages ?? problem.languages;
  const language = languageMap[selection.language] ? selection.language : Object.keys(languageMap)[0];
  if (!language) return undefined;
  return {
    problemId: problem.id,
    partId,
    language,
    sourceKind: selection.sourceKind === "reference" ? "reference" : "starter"
  };
}

function findWorkspaceBuffer(
  state: NextWorkspaceState | null,
  selection: WorkspaceSelection
): WorkspaceEditorBuffer | undefined {
  const key = workspaceKey(selection);
  return state?.editorBuffers.find((buffer) => workspaceKey(buffer) === key);
}

function upsertWorkspaceBuffer(
  state: NextWorkspaceState | null,
  buffer: WorkspaceEditorBuffer
): NextWorkspaceState {
  const key = workspaceKey(buffer);
  const updatedAt = buffer.updatedAt;
  return {
    schemaVersion: 1,
    updatedAt,
    lastSelection: selectionFromBuffer(buffer),
    editorBuffers: [
      ...(state?.editorBuffers.filter((candidate) => workspaceKey(candidate) !== key) ?? []),
      buffer
    ]
  };
}

function workspaceStateFromUserData(
  userData: NextUserData,
  existing: NextWorkspaceState | null
): NextWorkspaceState | null {
  const imported = userData.editorBuffers.flatMap((record): WorkspaceEditorBuffer[] => {
    if (record.scope !== "problem" && record.scope !== "problem-part") return [];
    return [{
      problemId: record.contentId,
      partId: record.partId,
      language: record.language,
      sourceKind: "starter",
      code: record.code,
      updatedAt: userData.migratedAt
    }];
  });
  if (!imported.length) return existing;

  const merged = new Map<string, WorkspaceEditorBuffer>();
  for (const buffer of existing?.editorBuffers ?? []) {
    merged.set(workspaceKey(buffer), buffer);
  }
  for (const buffer of imported) {
    merged.set(workspaceKey(buffer), buffer);
  }
  const updatedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    updatedAt,
    lastSelection: existing?.lastSelection ?? selectionFromBuffer(imported[0]),
    editorBuffers: [...merged.values()]
  };
}

function selectionFromBuffer(buffer: WorkspaceEditorBuffer): WorkspaceSelection {
  return {
    problemId: buffer.problemId,
    partId: buffer.partId,
    language: buffer.language,
    sourceKind: buffer.sourceKind
  };
}

function workspaceKey(selection: WorkspaceSelection): string {
  return [
    selection.problemId,
    selection.partId ?? "",
    selection.language,
    selection.sourceKind
  ].join("\u0000");
}
