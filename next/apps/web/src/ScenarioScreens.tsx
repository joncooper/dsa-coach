import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { ContentGraph, Scenario, ScenarioCheckpoint, ScenarioSet } from "../../../src/core/types";
import { API_BASE } from "./apiBase";

export interface ScenarioAttemptSummary {
  attemptId: string;
  scenarioId: string;
  scenarioTitle: string;
  workspacePath: string;
  startedAt: string;
  updatedAt: string;
  checkpoints: ScenarioCheckpointResponse[];
  aiTurns: ScenarioAiTurn[];
  visibleRuns: ScenarioCommandResult[];
  hiddenRuns: ScenarioCommandResult[];
  judge?: ScenarioJudgeReport;
}

interface ScenarioCheckpointResponse {
  checkpointId: string;
  answer: string;
  createdAt: string;
}

interface ScenarioAiTurn {
  id: string;
  kind: "coach" | "judge";
  userMessage: string;
  response: string;
  createdAt: string;
}

interface ScenarioCommandResult {
  status: "passed" | "failed" | "timeout";
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  ranAt: string;
}

interface ScenarioJudgeReport {
  overall: "strong_hire" | "hire" | "mixed" | "no_hire";
  summary: string;
  scores: Array<{
    metricId: string;
    label: string;
    score: number;
    evidence: string;
    improvement: string;
  }>;
  highestRiskWeakness: string;
  nextDrill: string;
  createdAt: string;
}

interface CodexStatus {
  available: boolean;
  provider?: string;
  model?: string | null;
  reason?: string;
}

export function ScenarioSetScreen({
  graph,
  scenarioSet,
  attempts,
  sidebarCollapsed,
  onShowSidebar,
  onOpenScenario
}: {
  graph: ContentGraph;
  scenarioSet: ScenarioSet;
  attempts: ScenarioAttemptSummary[];
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenScenario: (scenarioId: string, attemptId?: string) => void;
}) {
  const latestByScenario = useMemo(() => latestAttemptsByScenario(attempts), [attempts]);

  return (
    <section className="page stack scenario-index-page">
      <div className="page-header">
        {sidebarCollapsed ? <button type="button" className="secondary-button compact-button" onClick={onShowSidebar}>Show sidebar</button> : null}
        <div className="page-header-main">
          <p className="eyebrow">AI backend interview simulator</p>
          <h1>{scenarioSet.title}</h1>
          <p className="lead">{scenarioSet.summary}</p>
        </div>
      </div>

      <section className="scenario-guidance">
        <div>
          <h2>How to run a drill</h2>
          <p>
            Start a scenario, open the generated Python workspace in your editor, and treat Codex like the interview AI tool:
            ask it to inspect, propose tests, review diffs, and pressure-test your plan while you stay in command.
          </p>
        </div>
        <div>
          <h2>What this scores</h2>
          <p>
            The judge looks at codebase comprehension, framing, AI direction, MVP judgment, correctness, testing,
            tradeoffs, and communication. Passing tests is necessary, but not the whole signal.
          </p>
        </div>
      </section>

      <div className="scenario-grid">
        {scenarioSet.entries.map((entry) => {
          const scenario = graph.scenarios.find((candidate) => candidate.id === entry.scenario);
          if (!scenario) return null;
          const latest = latestByScenario.get(scenario.id);
          const latestStatus = latest?.hiddenRuns[0]?.status ?? latest?.visibleRuns[0]?.status;
          return (
            <button
              key={scenario.id}
              type="button"
              className="scenario-card"
              onClick={() => onOpenScenario(scenario.id, latest?.attemptId)}
            >
              <p className="eyebrow">{entry.category ?? "scenario"} / {scenario.timeboxMinutes} min</p>
              <h2>{scenario.title}</h2>
              <p>{scenario.summary}</p>
              <div className="tag-row compact-tags">
                <span>{scenario.difficulty}</span>
                {scenario.concepts.slice(0, 3).map((concept) => <span key={concept}>{concept}</span>)}
              </div>
              <footer>
                <span>{latest ? `Resume attempt / ${latestStatus ?? "started"}` : "Start scenario"}</span>
                <span aria-hidden="true">{"->"}</span>
              </footer>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ScenarioWorkspaceScreen({
  scenario,
  attemptId,
  sidebarCollapsed,
  onShowSidebar,
  onBack,
  onAttemptsChanged
}: {
  scenario: Scenario;
  attemptId?: string;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onBack: () => void;
  onAttemptsChanged: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [attempt, setAttempt] = useState<ScenarioAttemptSummary | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [diff, setDiff] = useState("");
  const [checkpointDrafts, setCheckpointDrafts] = useState<Record<string, string>>({});
  const [coachInput, setCoachInput] = useState("");
  const [coachResponse, setCoachResponse] = useState("");
  const [finalExplanation, setFinalExplanation] = useState("");
  const [codexStatus, setCodexStatus] = useState<CodexStatus | null>(null);

  useEffect(() => {
    let alive = true;
    setError("");
    void (async () => {
      try {
        const [{ prompt: nextPrompt }, status] = await Promise.all([
          getJson<{ prompt: string }>(`/scenarios/prompt?scenarioId=${encodeURIComponent(scenario.id)}`),
          safeGetJson<CodexStatus>("/codex/status")
        ]);
        if (!alive) return;
        setPrompt(nextPrompt);
        setCodexStatus(status);
      } catch (err) {
        if (alive) setError(errorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
  }, [scenario.id]);

  useEffect(() => {
    let alive = true;
    setAttempt(null);
    setDiff("");
    setCoachResponse("");
    setCheckpointDrafts({});
    if (!attemptId) return () => {
      alive = false;
    };
    void (async () => {
      try {
        const { attempt: nextAttempt } = await getJson<{ attempt: ScenarioAttemptSummary }>(
          `/scenarios/attempt?attemptId=${encodeURIComponent(attemptId)}`
        );
        if (!alive) return;
        setAttempt(nextAttempt);
        setCheckpointDrafts(draftsFromAttempt(nextAttempt));
        await refreshDiff(nextAttempt.attemptId, alive);
      } catch (err) {
        if (alive) setError(errorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
  }, [attemptId]);

  async function startAttempt() {
    await withBusy("Starting scenario", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/start", { scenarioId: scenario.id });
      setAttempt(nextAttempt);
      setCheckpointDrafts({});
      setDiff("");
      onAttemptsChanged();
    });
  }

  async function openAttempt(target: "cursor" | "vscode" | "finder") {
    if (!attempt) return;
    await withBusy(`Opening ${target}`, async () => {
      await postJson("/scenarios/open", { attemptId: attempt.attemptId, target });
    });
  }

  async function runVisible() {
    if (!attempt) return;
    await withBusy("Running visible tests", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; result: ScenarioCommandResult }>(
        "/scenarios/run-visible",
        { attemptId: attempt.attemptId }
      );
      setAttempt(nextAttempt);
      await refreshDiff(nextAttempt.attemptId);
      onAttemptsChanged();
    });
  }

  async function submitHidden() {
    if (!attempt) return;
    await withBusy("Submitting hidden tests", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; result: ScenarioCommandResult }>(
        "/scenarios/submit-hidden",
        { attemptId: attempt.attemptId }
      );
      setAttempt(nextAttempt);
      await refreshDiff(nextAttempt.attemptId);
      onAttemptsChanged();
    });
  }

  async function saveCheckpoint(checkpoint: ScenarioCheckpoint) {
    if (!attempt) return;
    await withBusy("Saving checkpoint", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/checkpoint", {
        attemptId: attempt.attemptId,
        checkpointId: checkpoint.id,
        answer: checkpointDrafts[checkpoint.id] ?? ""
      });
      setAttempt(nextAttempt);
      onAttemptsChanged();
    });
  }

  async function askCoach() {
    if (!attempt || !coachInput.trim()) return;
    await withBusy("Asking Codex coach", async () => {
      const { attempt: nextAttempt, response } = await postJson<{ attempt: ScenarioAttemptSummary; response: string }>(
        "/scenarios/coach",
        { attemptId: attempt.attemptId, message: coachInput }
      );
      setAttempt(nextAttempt);
      setCoachResponse(response);
      setCoachInput("");
      onAttemptsChanged();
    });
  }

  async function judgeAttempt() {
    if (!attempt) return;
    await withBusy("Judging attempt", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; report: ScenarioJudgeReport }>(
        "/scenarios/judge",
        { attemptId: attempt.attemptId, finalExplanation }
      );
      setAttempt(nextAttempt);
      onAttemptsChanged();
    });
  }

  async function refreshDiff(attemptToRefresh = attempt?.attemptId, alive = true) {
    if (!attemptToRefresh) return;
    const { diff: nextDiff } = await getJson<{ diff: string }>(`/scenarios/diff?attemptId=${encodeURIComponent(attemptToRefresh)}`);
    if (alive) setDiff(nextDiff);
  }

  async function withBusy(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }

  const latestVisible = attempt?.visibleRuns[0];
  const latestHidden = attempt?.hiddenRuns[0];
  const latestCoachTurn = attempt?.aiTurns.find((turn) => turn.kind === "coach");
  const workspacePath = attempt?.workspacePath;

  return (
    <section className="scenario-workspace">
      <header className="problem-context-bar scenario-context-bar">
        {sidebarCollapsed ? <button type="button" className="secondary-button compact-button" onClick={onShowSidebar}>Show sidebar</button> : null}
        <div className="problem-context-main">
          <p className="problem-breadcrumb">
            <span>Ramp AI Backend Drills</span>
            <span>/</span>
            <span>{scenario.difficulty}</span>
          </p>
          <div className="problem-title-row">
            <h1>{scenario.title}</h1>
            <div className="tag-row compact-tags">
              {scenario.concepts.slice(0, 4).map((concept) => <span key={concept}>{concept}</span>)}
            </div>
          </div>
        </div>
        <div className="problem-context-actions">
          <button type="button" className="secondary-button compact-button" onClick={onBack}>Back to drills</button>
          {attempt ? (
            <>
              <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("finder")}>Finder</button>
              <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("vscode")}>VS Code</button>
              <button type="button" className="primary-button compact-button" onClick={() => void openAttempt("cursor")}>Cursor</button>
            </>
          ) : null}
        </div>
      </header>

      {error ? <p className="scenario-error" role="alert">{error}</p> : null}
      {busy ? <p className="scenario-busy">{busy}...</p> : null}

      <div className="scenario-layout">
        <aside className="scenario-prompt-pane">
          <section className="prompt-primary">
            <div className="prompt-primary-heading">
              <h2>Interviewer prompt</h2>
            </div>
            {prompt ? <ScenarioMarkdown content={prompt} /> : <p className="muted">Loading prompt...</p>}
          </section>

          <section className="scenario-rubric">
            <h2>Rubric</h2>
            {scenario.rubric.map((metric) => (
              <details key={metric.id}>
                <summary>{metric.label} <span>{metric.weight}%</span></summary>
                <p>{metric.excellent}</p>
              </details>
            ))}
          </section>
        </aside>

        <main className="scenario-main-pane">
          {!attempt ? (
            <section className="scenario-start-card">
              <p className="eyebrow">{scenario.timeboxMinutes} minute simulation</p>
              <h2>Start a fresh workspace</h2>
              <p>
                This creates a local Python repo with starter code and tests. Use the generated workspace like the live interview backend.
              </p>
              <button type="button" className="primary-button" onClick={() => void startAttempt()} disabled={Boolean(busy)}>
                Start scenario
              </button>
            </section>
          ) : (
            <>
              <section className="scenario-control-card">
                <div>
                  <p className="eyebrow">Workspace</p>
                  <code>{workspacePath}</code>
                </div>
                <div className="scenario-action-row">
                  <button type="button" className="secondary-button compact-button" onClick={() => void runVisible()} disabled={Boolean(busy)}>
                    Run visible tests
                  </button>
                  <button type="button" className="primary-button compact-button" onClick={() => void submitHidden()} disabled={Boolean(busy)}>
                    Submit hidden tests
                  </button>
                  <button type="button" className="secondary-button compact-button" onClick={() => void refreshDiff()} disabled={Boolean(busy)}>
                    Refresh diff
                  </button>
                </div>
              </section>

              <section className="scenario-results-grid">
                <ScenarioResultCard label="Visible tests" result={latestVisible} />
                <ScenarioResultCard label="Hidden submit" result={latestHidden} />
              </section>

              <section className="scenario-checkpoints">
                <div className="section-heading">
                  <h2>Interview checkpoints</h2>
                  <p>Use these to rehearse the process signal, not just the final answer.</p>
                </div>
                {scenario.checkpoints.map((checkpoint) => (
                  <article key={checkpoint.id} className="scenario-checkpoint">
                    <header>
                      <span>{checkpoint.minute} min</span>
                      <h3>{checkpoint.title}</h3>
                    </header>
                    <p>{checkpoint.prompt}</p>
                    <textarea
                      value={checkpointDrafts[checkpoint.id] ?? ""}
                      onChange={(event) => setCheckpointDrafts((drafts) => ({ ...drafts, [checkpoint.id]: event.target.value }))}
                      rows={3}
                    />
                    <button type="button" className="secondary-button compact-button" onClick={() => void saveCheckpoint(checkpoint)} disabled={Boolean(busy)}>
                      Save checkpoint
                    </button>
                  </article>
                ))}
              </section>

              <section className="scenario-ai-card">
                <div className="section-heading">
                  <h2>Codex coach</h2>
                  <p>{codexStatus?.available ? "Using your local Codex login through the SDK." : `Codex unavailable${codexStatus?.reason ? `: ${codexStatus.reason}` : "."}`}</p>
                </div>
                <textarea
                  value={coachInput}
                  onChange={(event) => setCoachInput(event.target.value)}
                  rows={4}
                  placeholder="Ask for review, edge cases, test ideas, or a subtle hint. Do not ask it to take over."
                />
                <div className="scenario-action-row">
                  <button type="button" className="primary-button compact-button" onClick={() => void askCoach()} disabled={Boolean(busy) || !coachInput.trim()}>
                    Ask coach
                  </button>
                </div>
                {coachResponse || latestCoachTurn ? (
                  <div className="scenario-ai-response">
                    <ScenarioMarkdown content={coachResponse || latestCoachTurn?.response || ""} />
                  </div>
                ) : null}
              </section>

              <section className="scenario-ai-card">
                <div className="section-heading">
                  <h2>Final judge</h2>
                  <p>Paste the explanation you would give the interviewer, then get rubric-calibrated feedback.</p>
                </div>
                <textarea
                  value={finalExplanation}
                  onChange={(event) => setFinalExplanation(event.target.value)}
                  rows={4}
                  placeholder="Explain your assumptions, invariant, tests run, tradeoffs, and how you used AI."
                />
                <button type="button" className="primary-button compact-button" onClick={() => void judgeAttempt()} disabled={Boolean(busy)}>
                  Judge attempt
                </button>
                {attempt.judge ? <JudgeReport report={attempt.judge} /> : null}
              </section>

              <section className="scenario-diff-card">
                <div className="section-heading">
                  <h2>Current diff</h2>
                  <p>What the judge and coach will inspect.</p>
                </div>
                <pre><code>{diff || "(no changes yet)"}</code></pre>
              </section>
            </>
          )}
        </main>
      </div>
    </section>
  );
}

function ScenarioResultCard({ label, result }: { label: string; result?: ScenarioCommandResult }) {
  return (
    <article className={`scenario-result-card ${result?.status ?? "idle"}`}>
      <header>
        <h3>{label}</h3>
        <span>{result ? `${result.status} / ${result.durationMs} ms` : "not run"}</span>
      </header>
      {result ? (
        <>
          <p className="muted">{result.command}</p>
          {result.stdout ? <pre><code>{result.stdout}</code></pre> : null}
          {result.stderr ? <pre><code>{result.stderr}</code></pre> : null}
        </>
      ) : (
        <p className="muted">Run this when you have a candidate implementation.</p>
      )}
    </article>
  );
}

function JudgeReport({ report }: { report: ScenarioJudgeReport }) {
  return (
    <div className="scenario-judge-report">
      <p className="eyebrow">{report.overall.replaceAll("_", " ")}</p>
      <h3>{report.summary}</h3>
      <div className="scenario-score-list">
        {report.scores.map((score) => (
          <article key={score.metricId}>
            <header>
              <strong>{score.label}</strong>
              <span>{score.score}/5</span>
            </header>
            <p>{score.evidence}</p>
            <p className="muted">{score.improvement}</p>
          </article>
        ))}
      </div>
      <p><strong>Highest-risk weakness:</strong> {report.highestRiskWeakness}</p>
      <p><strong>Next drill:</strong> {report.nextDrill}</p>
    </div>
  );
}

function ScenarioMarkdown({ content }: { content: string }) {
  return <div className="scenario-markdown">{renderMarkdown(content)}</div>;
}

function renderMarkdown(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    nodes.push(<p key={`p-${key++}`}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    nodes.push(<ul key={`ul-${key++}`}>{list.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>);
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(<h3 key={`h3-${key++}`}>{renderInline(trimmed.slice(4))}</h3>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      nodes.push(<h2 key={`h2-${key++}`}>{renderInline(trimmed.slice(3))}</h2>);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      nodes.push(<h1 key={`h1-${key++}`}>{renderInline(trimmed.slice(2))}</h1>);
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return nodes;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return <span key={index}>{part}</span>;
  });
}

function draftsFromAttempt(attempt: ScenarioAttemptSummary): Record<string, string> {
  const drafts: Record<string, string> = {};
  for (const checkpoint of attempt.checkpoints) {
    drafts[checkpoint.checkpointId] = checkpoint.answer;
  }
  return drafts;
}

function latestAttemptsByScenario(attempts: ScenarioAttemptSummary[]): Map<string, ScenarioAttemptSummary> {
  const latest = new Map<string, ScenarioAttemptSummary>();
  for (const attempt of attempts) {
    const existing = latest.get(attempt.scenarioId);
    if (!existing || attempt.updatedAt > existing.updatedAt) latest.set(attempt.scenarioId, attempt);
  }
  return latest;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const value = await res.json().catch(() => undefined);
  if (!res.ok) throw new Error(value?.error ?? `${res.status} ${res.statusText}`);
  return value as T;
}

async function safeGetJson<T>(path: string): Promise<T | null> {
  try {
    return await getJson<T>(path);
  } catch {
    return null;
  }
}

async function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const value = await res.json().catch(() => undefined);
  if (!res.ok) throw new Error(value?.error ?? `${res.status} ${res.statusText}`);
  return value as T;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
