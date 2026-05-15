import { Check, Sparkles, TerminalSquare } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findProblemSet } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";

export function ProblemSetPage() {
  const { setId } = useParams();
  const set = setId ? findProblemSet(setId) : undefined;
  const { progress } = useStore();

  if (!set) return <Navigate to="/" replace />;

  const completed = set.problems.filter((problem) => progress[itemKey("problem", problem.id)]?.status === "complete").length;
  const percent = set.problems.length ? Math.round((completed / set.problems.length) * 100) : 0;

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Problem set</p>
          <h1>{set.title}</h1>
          <p className="lead">{set.summary}</p>
        </div>
      </div>

      <div className="content-columns">
        <div className="stack">
          <div className="section-heading">
            <h2>Problems</h2>
            <p>{completed}/{set.problems.length} complete &middot; {percent}%</p>
          </div>
          {set.problems.map((problem) => {
            const done = progress[itemKey("problem", problem.id)]?.status === "complete";
            return (
              <Link className="row-link" to={`/problem/${problem.id}`} key={problem.id}>
                <TerminalSquare size={18} />
                <span>{problem.title}</span>
                <small>{problem.difficulty}</small>
                <span className={done ? "status-dot complete" : "status-dot"}>{done ? <Check size={14} /> : null}</span>
              </Link>
            );
          })}
        </div>

        <aside className="bonus-panel">
          <h2>
            <Sparkles size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
            How to use this set
          </h2>
          <p>{set.intro}</p>
          <p className="muted">
            Each problem keeps a separate workspace, notes, and history just like the modules. Run visible tests as you iterate, then submit hidden tests to verify the edge cases.
          </p>
        </aside>
      </div>
    </section>
  );
}
