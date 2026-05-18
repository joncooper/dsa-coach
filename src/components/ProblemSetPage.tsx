import { useMemo } from "react";
import { Check, Sparkles, TerminalSquare } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { findProblemSet } from "../content/course";
import { SUBCATEGORIES, type Subcategory } from "../content/problemSets";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";
import type { Problem } from "../types";

function ProblemRow({ problem, done }: { problem: Problem; done: boolean }) {
  return (
    <Link className="row-link" to={`/problem/${problem.id}`}>
      <TerminalSquare size={18} />
      <span className="row-title">{problem.title}</span>
      <span className={`difficulty-badge is-${problem.difficulty}`}>{problem.difficulty}</span>
      <span className={done ? "status-dot complete" : "status-dot"}>{done ? <Check size={14} /> : null}</span>
    </Link>
  );
}

export function ProblemSetPage() {
  const { setId } = useParams();
  const set = setId ? findProblemSet(setId) : undefined;
  const { progress } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const groups = useMemo(() => {
    if (!set) return [];
    return SUBCATEGORIES.map(({ id, label, blurb }) => ({
      id,
      label,
      blurb,
      problems: set.problems.filter((problem) => problem.subcategory === id)
    })).filter((group) => group.problems.length > 0);
  }, [set]);

  if (!set) return <Navigate to="/" replace />;

  const hasGroups = groups.length > 0;
  const requested = searchParams.get("cat");
  const active: Subcategory | "all" =
    requested && groups.some((group) => group.id === requested) ? (requested as Subcategory) : "all";

  const selectCategory = (value: Subcategory | "all") => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("cat");
    else next.set("cat", value);
    setSearchParams(next, { replace: true });
  };

  const isDone = (id: string) => progress[itemKey("problem", id)]?.status === "complete";
  const completed = set.problems.filter((problem) => isDone(problem.id)).length;
  const percent = set.problems.length ? Math.round((completed / set.problems.length) * 100) : 0;
  const visibleGroups = active === "all" ? groups : groups.filter((group) => group.id === active);

  return (
    <section className="page stack set-page">
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
            <p>
              {completed}/{set.problems.length} complete &middot; {percent}%
            </p>
          </div>

          {hasGroups ? (
            <>
              <div className="set-filter-bar" role="tablist" aria-label="Filter by category">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active === "all"}
                  className={active === "all" ? "set-filter is-active" : "set-filter"}
                  onClick={() => selectCategory("all")}
                >
                  All <span>{set.problems.length}</span>
                </button>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={active === group.id}
                    className={active === group.id ? "set-filter is-active" : "set-filter"}
                    onClick={() => selectCategory(group.id)}
                  >
                    {group.label} <span>{group.problems.length}</span>
                  </button>
                ))}
              </div>

              {visibleGroups.map((group) => {
                const groupDone = group.problems.filter((problem) => isDone(problem.id)).length;
                return (
                  <div className="set-group stack" key={group.id}>
                    <div className="set-group-heading">
                      <h3>{group.label}</h3>
                      <p>
                        {group.blurb} &middot; {groupDone}/{group.problems.length}
                      </p>
                    </div>
                    {group.problems.map((problem) => (
                      <ProblemRow key={problem.id} problem={problem} done={isDone(problem.id)} />
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            set.problems.map((problem) => (
              <ProblemRow key={problem.id} problem={problem} done={isDone(problem.id)} />
            ))
          )}
        </div>

        <aside className="bonus-panel set-aside">
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
