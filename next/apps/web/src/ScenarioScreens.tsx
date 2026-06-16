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
  const isOnsiteSet = scenarioSet.id === "ramp-onsite-coding";

  return (
    <section className="page stack scenario-index-page">
      <div className="page-header">
        {sidebarCollapsed ? <button type="button" className="secondary-button compact-button" onClick={onShowSidebar}>Show sidebar</button> : null}
        <div className="page-header-main">
          <p className="eyebrow">{isOnsiteSet ? "Onsite interview rehearsal" : "AI backend interview simulator"}</p>
          <h1>{scenarioSet.title}</h1>
          <p className="lead">{scenarioSet.summary}</p>
        </div>
      </div>

      <section className="scenario-guidance">
        <div>
          <h2>{isOnsiteSet ? "How to run a rehearsal" : "How to run a drill"}</h2>
          <p>
            {isOnsiteSet
              ? "Start a scenario, work in the generated Python workspace, and treat the Codex panel like a sparse interviewer: clarifying questions, time checks, and a debrief after the session."
              : "Start a scenario, open the generated Python workspace in your editor, and treat Codex like the interview AI tool: ask it to inspect, propose tests, review diffs, and pressure-test your plan while you stay in command."}
          </p>
        </div>
        <div>
          <h2>{isOnsiteSet ? "What the debrief scores" : "What this scores"}</h2>
          <p>
            {isOnsiteSet
              ? "The live round stays fair and low-signal. After you end it, the debrief evaluates framing, invariants, correctness, tests, tradeoffs, and communication."
              : "The judge looks at codebase comprehension, framing, AI direction, MVP judgment, correctness, testing, tradeoffs, and communication. Passing tests is necessary, but not the whole signal."}
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
  const [finalExplanation, setFinalExplanation] = useState("");
  const [codexStatus, setCodexStatus] = useState<CodexStatus | null>(null);
  const [leftTab, setLeftTab] = useState<"prompt" | "plan" | "scratchpad">("prompt");
  const [scenarioScratchpad, setScenarioScratchpad] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());

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
    setCheckpointDrafts({});
    setSessionEnded(false);
    setTimerPaused(false);
    setLeftTab("prompt");
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

  useEffect(() => {
    if (timerPaused) return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [timerPaused]);

  async function startAttempt() {
    await withBusy("Starting scenario", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/start", { scenarioId: scenario.id });
      setAttempt(nextAttempt);
      setCheckpointDrafts({});
      setDiff("");
      setSessionEnded(false);
      setTimerPaused(false);
      setClockNow(Date.now());
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
    await withBusy("Asking interviewer", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; response: string }>(
        "/scenarios/coach",
        { attemptId: attempt.attemptId, message: coachInput }
      );
      setAttempt(nextAttempt);
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
  const latestCoachTurns = attempt?.aiTurns.filter((turn) => turn.kind === "coach").slice(0, 3) ?? [];
  const workspacePath = attempt?.workspacePath;
  const isOnsiteInterview = isOnsiteScenario(scenario, prompt);
  const debriefOpen = sessionEnded || Boolean(attempt?.judge);
  const elapsedMs = attempt ? Math.max(0, clockNow - Date.parse(attempt.startedAt)) : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const remainingMinutes = Math.max(0, scenario.timeboxMinutes - elapsedMinutes);
  const phaseState = interviewPhaseState(scenario.timeboxMinutes, elapsedMinutes);
  const interviewerQuestion = currentInterviewerQuestion(phaseState.active.label, latestCoachTurns[0]);

  return (
    <section className={`scenario-workspace ${isOnsiteInterview ? "scenario-onsite-workspace" : ""}`}>
      <header className="scenario-interview-header">
        <div className="scenario-interview-title">
          {sidebarCollapsed ? <button type="button" className="secondary-button compact-button" onClick={onShowSidebar}>Show sidebar</button> : null}
          <button type="button" className="secondary-button compact-button" onClick={onBack}>Back</button>
          <div>
            <p className="problem-breadcrumb">
              <span>{isOnsiteInterview ? "Ramp Prep / Onsite Rehearsal" : "Ramp AI Backend Drills"}</span>
              <span>/</span>
              <span>{scenario.difficulty}</span>
            </p>
            <h1>{isOnsiteInterview ? `Ramp Onsite: ${scenario.title}` : scenario.title}</h1>
          </div>
        </div>
        <div className="scenario-interview-actions">
          <div className="scenario-timer" aria-label="Elapsed interview time">
            <span>{attempt ? formatClock(elapsedMs) : "--:--"}</span>
            <small>{debriefOpen ? "Ended" : timerPaused ? "Paused" : "Elapsed"}</small>
          </div>
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={() => setTimerPaused((paused) => !paused)}
            disabled={!attempt || debriefOpen}
          >
            {debriefOpen ? "Ended" : timerPaused ? "Resume" : "Pause"}
          </button>
          <button type="button" className="primary-button compact-button" onClick={() => void runVisible()} disabled={Boolean(busy) || !attempt}>
            Run tests
          </button>
          <button
            type="button"
            className="secondary-button compact-button scenario-danger-button"
            onClick={() => {
              setSessionEnded(true);
              setTimerPaused(true);
            }}
            disabled={!attempt || debriefOpen}
          >
            End session
          </button>
        </div>
      </header>

      <div className="scenario-phase-strip" aria-label="Interview pacing timeline">
        {phaseState.phases.map((phase, index) => (
          <div key={phase.label} className={`scenario-phase-step ${index < phaseState.activeIndex ? "done" : ""} ${index === phaseState.activeIndex ? "active" : ""}`}>
            <span>{phase.label}</span>
            <small>{phase.minutes} min</small>
          </div>
        ))}
      </div>

      {error ? <p className="scenario-error" role="alert">{error}</p> : null}
      {busy ? <p className="scenario-busy">{busy}...</p> : null}

      <div className="scenario-layout scenario-interview-layout">
        <aside className="scenario-prompt-pane scenario-live-left-pane">
          <div className="scenario-pane-tabs" role="tablist" aria-label="Scenario workspace tabs">
            {(["prompt", "plan", "scratchpad"] as const).map((tab) => (
              <button key={tab} type="button" className={leftTab === tab ? "active" : ""} onClick={() => setLeftTab(tab)}>
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {leftTab === "prompt" ? (
            <section className="prompt-primary scenario-tab-panel">
              <div className="prompt-primary-heading">
                <h2>Prompt</h2>
              </div>
              {prompt ? <ScenarioMarkdown content={prompt} /> : <p className="muted">Loading prompt...</p>}
            </section>
          ) : null}

          {leftTab === "plan" ? (
            <section className="scenario-tab-panel scenario-plan-panel">
              <div className="section-heading">
                <h2>Your plan</h2>
                <p>Candidate-authored notes. The interviewer does not score this live.</p>
              </div>
              {scenario.checkpoints.map((checkpoint) => (
                <article key={checkpoint.id} className="scenario-plan-note">
                  <header>
                    <span>{checkpoint.minute} min</span>
                    <strong>{checkpoint.title}</strong>
                  </header>
                  <p>{checkpoint.prompt}</p>
                  <textarea
                    value={checkpointDrafts[checkpoint.id] ?? ""}
                    onChange={(event) => setCheckpointDrafts((drafts) => ({ ...drafts, [checkpoint.id]: event.target.value }))}
                    rows={3}
                    disabled={!attempt}
                  />
                  <button type="button" className="secondary-button compact-button" onClick={() => void saveCheckpoint(checkpoint)} disabled={Boolean(busy) || !attempt}>
                    Save note
                  </button>
                </article>
              ))}
            </section>
          ) : null}

          {leftTab === "scratchpad" ? (
            <section className="scenario-tab-panel scenario-plan-panel">
              <div className="section-heading">
                <h2>Scratchpad</h2>
                <p>Private notes for assumptions, examples, and questions you want to ask out loud.</p>
              </div>
              <textarea
                className="scenario-freeform-notes"
                value={scenarioScratchpad}
                onChange={(event) => setScenarioScratchpad(event.target.value)}
                rows={16}
                placeholder="Examples, invariants, unresolved questions..."
              />
            </section>
          ) : null}
        </aside>

        <main className="scenario-main-pane scenario-session-pane">
          {!attempt ? (
            <section className="scenario-start-card">
              <p className="eyebrow">{scenario.timeboxMinutes} minute simulation</p>
              <h2>{isOnsiteInterview ? "Start mock interview" : "Start a fresh workspace"}</h2>
              <p>
                {isOnsiteInterview
                  ? "This creates a local Python repo with starter code and tests. Work from the prompt, talk through your approach, and keep Codex in interviewer mode."
                  : "This creates a local Python repo with starter code and tests. Use the generated workspace like the live interview backend."}
              </p>
              <button type="button" className="primary-button" onClick={() => void startAttempt()} disabled={Boolean(busy)}>
                Start session
              </button>
            </section>
          ) : (
            <>
              <section className="scenario-workbench">
                <header>
                  <div>
                    <p className="eyebrow">Workspace</p>
                    <code>{workspacePath}</code>
                  </div>
                  <div className="scenario-action-row">
                    <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("finder")}>Finder</button>
                    <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("vscode")}>VS Code</button>
                    <button type="button" className="primary-button compact-button" onClick={() => void openAttempt("cursor")}>Cursor</button>
                  </div>
                </header>
                <div className="scenario-diff-editor">
                  <div className="scenario-diff-editor-tab">current diff</div>
                  <pre><code>{diff || "# No changes yet. Open the workspace and start with the smallest useful implementation.\n"}</code></pre>
                </div>
              </section>

              <section className="scenario-test-output">
                <div className="section-heading">
                  <h2>Test output</h2>
                  <p>{latestVisible ? "Latest visible run." : "Run tests when you have a candidate implementation."}</p>
                </div>
                <ScenarioResultCard label="Visible tests" result={latestVisible} />
              </section>

              {debriefOpen ? (
                <section className="scenario-debrief-panel">
                  <div className="section-heading">
                    <h2>Debrief Studio</h2>
                    <p>Detailed feedback is intentionally held until the session ends.</p>
                  </div>
                  <textarea
                    value={finalExplanation}
                    onChange={(event) => setFinalExplanation(event.target.value)}
                    rows={4}
                    placeholder="Explain your assumptions, invariant, tests run, tradeoffs, and where you got stuck."
                  />
                  <div className="scenario-action-row">
                    <button type="button" className="secondary-button compact-button" onClick={() => void submitHidden()} disabled={Boolean(busy)}>
                      Run hidden tests
                    </button>
                    <button type="button" className="primary-button compact-button" onClick={() => void judgeAttempt()} disabled={Boolean(busy)}>
                      Generate debrief
                    </button>
                  </div>
                  {latestHidden ? <ScenarioResultCard label="Hidden submit" result={latestHidden} /> : null}
                  {attempt.judge ? <JudgeReport report={attempt.judge} /> : null}
                  <section className="scenario-rubric">
                    <h2>Rubric</h2>
                    {scenario.rubric.map((metric) => (
                      <details key={metric.id}>
                        <summary>{metric.label} <span>{metric.weight}%</span></summary>
                        <p>{metric.excellent}</p>
                      </details>
                    ))}
                  </section>
                </section>
              ) : null}
            </>
          )}
        </main>

        <aside className="scenario-interviewer-pane">
          <header>
            <div>
              <p className="eyebrow">Codex SDK</p>
              <h2>{isOnsiteInterview ? "Interviewer" : "Scenario coach"}</h2>
            </div>
            <span>{codexStatus?.available ? codexStatus.model ?? "ready" : "offline"}</span>
          </header>

          <section className="scenario-transcript">
            <h3>Live transcript</h3>
            {latestCoachTurns.length ? (
              latestCoachTurns.slice().reverse().map((turn) => (
                <div key={turn.id} className="scenario-transcript-turn">
                  <p><strong>You</strong> <span>{formatTime(turn.createdAt)}</span></p>
                  <p>{turn.userMessage}</p>
                  <p><strong>{isOnsiteInterview ? "Interviewer" : "Codex"}</strong></p>
                  <ScenarioMarkdown content={turn.response} />
                </div>
              ))
            ) : (
              <div className="scenario-transcript-turn">
                <p><strong>{isOnsiteInterview ? "Interviewer" : "Codex"}</strong></p>
                <p>{isOnsiteInterview ? "Start by restating the contract and calling out the first ambiguity you would clarify." : "Ask for a review, test strategy, or scenario-specific pressure test when you are ready."}</p>
              </div>
            )}
          </section>

          <section className="scenario-interviewer-card">
            <h3>Current question</h3>
            <p>{interviewerQuestion}</p>
          </section>

          <section className="scenario-interviewer-card quiet">
            <h3>Time check</h3>
            <p>{attempt ? `${Math.ceil(remainingMinutes)} minutes remaining. ${phaseState.active.label} is the active pacing band.` : "Timer starts when the session starts."}</p>
          </section>

          <section className="scenario-interviewer-input">
            <label htmlFor="scenario-interviewer-message">Ask or answer out loud</label>
            <textarea
              id="scenario-interviewer-message"
              value={coachInput}
              onChange={(event) => setCoachInput(event.target.value)}
              rows={4}
              placeholder={isOnsiteInterview ? "Ask a clarification, or tell the interviewer what you are about to do." : "Ask for review, tests, or a subtle nudge."}
              disabled={!attempt || debriefOpen}
            />
            <button type="button" className="primary-button compact-button" onClick={() => void askCoach()} disabled={Boolean(busy) || !coachInput.trim() || !attempt || debriefOpen}>
              Send
            </button>
          </section>

          <p className="scenario-debrief-lock">{debriefOpen ? "Debrief is open below the test output." : "Debrief unlocks when you end the session."}</p>
        </aside>
      </div>
    </section>
  );
}

interface InterviewPhase {
  label: string;
  minutes: number;
  endMinute: number;
}

function isOnsiteScenario(scenario: Scenario, prompt: string): boolean {
  const text = `${scenario.id} ${scenario.title} ${scenario.summary} ${scenario.evidence.note} ${prompt}`.toLowerCase();
  return text.includes("onsite") || text.includes("no-ai") || text.includes("no ai");
}

function interviewPhaseState(timeboxMinutes: number, elapsedMinutes: number): { phases: InterviewPhase[]; active: InterviewPhase; activeIndex: number } {
  const weights = [
    ["Read", 0.14],
    ["Clarify", 0.12],
    ["Design", 0.2],
    ["Build", 0.34],
    ["Test", 0.14],
    ["Review", 0.06]
  ] as const;
  let endMinute = 0;
  const phases = weights.map(([label, weight], index) => {
    const minutes = index === weights.length - 1
      ? Math.max(1, Math.round(timeboxMinutes - endMinute))
      : Math.max(1, Math.round(timeboxMinutes * weight));
    endMinute += minutes;
    return { label, minutes, endMinute };
  });
  const foundIndex = phases.findIndex((phase) => elapsedMinutes < phase.endMinute);
  const activeIndex = foundIndex === -1 ? phases.length - 1 : foundIndex;
  return { phases, active: phases[activeIndex], activeIndex };
}

function currentInterviewerQuestion(phase: string, latestTurn?: ScenarioAiTurn): string {
  if (latestTurn) return "Before you keep coding, say what changed in your plan and why.";
  if (phase === "Read") return "Restate the contract and the output shape before you design.";
  if (phase === "Clarify") return "What assumption would you ask the interviewer to confirm?";
  if (phase === "Design") return "What invariant does your data model need to preserve?";
  if (phase === "Build") return "Talk through the invariant before changing the code.";
  if (phase === "Test") return "Which edge case should prove the implementation is not just passing the happy path?";
  return "Summarize the tradeoff you would call out before handing this in.";
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${minutes}:${pad2(seconds)}`;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
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
