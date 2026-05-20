import { Clock, Layers, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { assessments } from "../content/assessments";
import { scorecardKey } from "../content/assessments/seeding";
import { useStore } from "../hooks/courseStoreContext";
import type { AssessmentScorecard } from "../types";

/**
 * Landing page for the CodeSignal ICF practice mode — lists every assessment
 * as a card and surfaces the candidate's last banded score so resuming feels
 * natural. The card itself is the rules-screen entry point; mode selection
 * (timed exam vs. untimed practice) happens there.
 */
export function AssessmentIndexPage() {
  const { settings } = useStore();

  return (
    <section className="page assessment-index-page">
      <header className="page-header">
        <h1>CodeSignal ICF Practice</h1>
        <p className="page-intro">
          One evolving problem, four progressive levels, ninety minutes. Your code from
          each level carries forward into the next — this mode trains the format itself,
          not just the algorithms. Pick an assessment to start.
        </p>
      </header>

      <ul className="assessment-card-grid" aria-label="Available assessments">
        {assessments.map((a) => {
          const scorecard = settings[scorecardKey(a.id)]?.value as AssessmentScorecard | undefined;
          return (
            <li key={a.id} className="assessment-card">
              <header className="assessment-card-header">
                <div>
                  <h2>
                    <Link to={`/assessment/${a.id}`}>{a.title}</Link>
                  </h2>
                  <p className="assessment-card-blurb">{a.blurb}</p>
                </div>
                <span className="assessment-card-archetype">{labelForArchetype(a.archetype)}</span>
              </header>

              <dl className="assessment-card-meta">
                <div>
                  <dt><Clock size={14} aria-hidden /> Time</dt>
                  <dd>{a.totalMinutes} min</dd>
                </div>
                <div>
                  <dt><Layers size={14} aria-hidden /> Levels</dt>
                  <dd>{a.levels.length} progressive</dd>
                </div>
                <div>
                  <dt><Trophy size={14} aria-hidden /> Last score</dt>
                  <dd>{scorecard ? `${scorecard.totalScore} (${labelForMode(scorecard.mode)})` : "—"}</dd>
                </div>
              </dl>

              <div className="assessment-card-actions">
                <Link className="primary-button" to={`/assessment/${a.id}`}>
                  {scorecard ? "Resume or replay" : "Start"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function labelForArchetype(kind: "filesystem" | "banking" | "in-memory-db"): string {
  if (kind === "filesystem") return "File system";
  if (kind === "banking") return "Banking / ledger";
  return "In-memory DB";
}

function labelForMode(mode: "exam" | "practice"): string {
  return mode === "exam" ? "timed" : "practice";
}
