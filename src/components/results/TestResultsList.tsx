import { Eye, EyeOff } from "lucide-react";
import type { RunResult } from "../../types";

/**
 * The visible/hidden test-result grouping shared by the problem workspace and
 * the timed assessment. Identical markup/classes to the original
 * ProblemPage block so existing styles apply unchanged.
 *
 * `lockHidden` enforces exam integrity: when true the "reveal hidden
 * diagnostics" control is suppressed and hidden tests never expand, regardless
 * of `showHiddenDiagnostics` (used during a timed exam; the report and
 * practice mode pass it false).
 */
export function TestResultsList({
  tests,
  showHiddenDiagnostics,
  onToggleHiddenDiagnostics,
  lockHidden = false
}: {
  tests: RunResult["tests"];
  showHiddenDiagnostics: boolean;
  onToggleHiddenDiagnostics?: (next: boolean) => void;
  lockHidden?: boolean;
}) {
  if (!tests.length) return <p className="muted">No run results yet.</p>;

  const visibleResults = tests.filter((test) => !test.hidden);
  const hiddenResults = tests.filter((test) => test.hidden);
  const failedVisibleCount = visibleResults.filter((test) => !test.passed).length;
  const passedVisibleCount = visibleResults.filter((test) => test.passed).length;
  const failedHiddenCount = hiddenResults.filter((test) => !test.passed).length;

  return (
    <div className="result-groups">
      <div className="result-group-header">
        <h3>Visible Tests</h3>
        <span>
          {failedVisibleCount
            ? `${failedVisibleCount} failing`
            : `${passedVisibleCount}/${visibleResults.length} passing`}
        </span>
      </div>
      <TestGroup title="" tests={visibleResults} reveal />
      {hiddenResults.length ? (
        <section className="result-group">
          <div className="result-group-header">
            <h3>Hidden Tests</h3>
            <span>{failedHiddenCount ? `${failedHiddenCount} failing` : "All passing"}</span>
          </div>
          {!lockHidden && onToggleHiddenDiagnostics ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onToggleHiddenDiagnostics(!showHiddenDiagnostics)}
            >
              {showHiddenDiagnostics ? <EyeOff size={18} /> : <Eye size={18} />}
              {showHiddenDiagnostics ? "Hide hidden diagnostics" : "Reveal hidden diagnostics"}
            </button>
          ) : null}
          <TestGroup
            title=""
            tests={hiddenResults}
            reveal={!lockHidden && showHiddenDiagnostics}
            hidden
          />
        </section>
      ) : null}
    </div>
  );
}

function TestGroup({
  title,
  tests,
  reveal,
  hidden = false
}: {
  title: string;
  tests: RunResult["tests"];
  reveal: boolean;
  hidden?: boolean;
}) {
  if (!tests.length) return null;
  return (
    <section className="result-group">
      {title ? <h3>{title}</h3> : null}
      <div className="test-results">
        {tests.map((test) => (
          <article
            className={test.passed ? "test-pass" : "test-fail"}
            key={`${test.name}-${hidden ? "hidden" : "visible"}`}
          >
            <strong>
              {test.passed ? "Pass" : "Fail"}: {hidden ? "Hidden" : test.name}
            </strong>
            {reveal ? (
              <div className="result-diff">
                <div>
                  <span>Args</span>
                  <code>{formatValue(test.args)}</code>
                </div>
                <div>
                  <span>Expected</span>
                  <code>{formatValue(test.expected)}</code>
                </div>
                <div>
                  <span>Actual</span>
                  <code>{formatValue(test.actual)}</code>
                </div>
                {test.error ? (
                  <div className="result-error-detail">
                    <span>Error</span>
                    <code>{test.error}</code>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="muted">Diagnostics hidden for practice integrity.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatValue(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
