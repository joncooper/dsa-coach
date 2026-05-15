import { ArrowRight, Sparkles, Star, TerminalSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { course, contentStats, findProblem } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";
import { ExportImport } from "./ExportImport";

export function Dashboard() {
  const { progress, progressSummary, settings, submissions } = useStore();
  const totalTrackable = course.lessons.length + course.problems.length + course.quizzes.length;
  const completePercent = Math.round((progressSummary.complete / totalTrackable) * 100);
  const starredProblems = course.problems.filter((problem) => settings[`problem:starred:${problem.id}`]?.value === true).slice(0, 8);
  const recentProblem = (() => {
    const seen = new Set<string>();
    for (const submission of submissions) {
      if (seen.has(submission.problemId)) continue;
      seen.add(submission.problemId);
      const candidate = findProblem(submission.problemId);
      if (candidate) return { problem: candidate, passed: submission.passed };
    }
    return undefined;
  })();

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Local course</p>
          <h1>DSA Coach</h1>
        </div>
        <ExportImport />
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-stat-strip" aria-label="Course overview">
          <span><strong>{completePercent}%</strong> complete</span>
          <span aria-hidden="true">·</span>
          <span><strong>{contentStats.totalProblemCount}</strong> runnable problems</span>
          <span aria-hidden="true">·</span>
          <span><strong>{progressSummary.due}</strong> reviews due</span>
        </div>
        {recentProblem ? (
          <Link className="resume-card" to={`/problem/${recentProblem.problem.id}`}>
            <div>
              <p className="eyebrow">Continue working</p>
              <h2>{recentProblem.problem.title}</h2>
              <p className="muted">
                Last run {recentProblem.passed ? "passed" : "did not pass"} · {recentProblem.problem.difficulty}
              </p>
            </div>
            <span className="resume-card-cta" aria-hidden="true">
              <TerminalSquare size={18} />
              Resume <ArrowRight size={16} />
            </span>
          </Link>
        ) : null}
      </div>

      {starredProblems.length ? (
        <section className="starred-panel" aria-labelledby="starred-problems-heading">
          <div className="section-heading">
            <h2 id="starred-problems-heading">Starred Problems</h2>
            <p>{starredProblems.length} saved for later</p>
          </div>
          <div className="starred-list">
            {starredProblems.map((problem) => {
              const chapter = course.chapters.find((candidate) => candidate.id === problem.chapterId);
              return (
                <Link className="row-link starred-problem-link" key={problem.id} to={`/problem/${problem.id}`}>
                  <span className="status-dot starred-dot" aria-hidden="true">
                    <Star size={15} />
                  </span>
                  <span>{problem.title}</span>
                  <small>{chapter?.title ?? "Problem"}</small>
                  <small>{problem.source}</small>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {course.problemSets.length ? (
        <section aria-labelledby="problem-sets-heading" className="problem-set-grid">
          <div className="section-heading">
            <h2 id="problem-sets-heading">Problem Sets</h2>
            <p>Focused, interview-calibrated practice outside the core modules</p>
          </div>
          <div className="problem-set-cards">
            {course.problemSets.map((set) => {
              const done = set.problems.filter((problem) => progress[itemKey("problem", problem.id)]?.status === "complete").length;
              const percent = set.problems.length ? Math.round((done / set.problems.length) * 100) : 0;
              return (
                <Link className="problem-set-card" key={set.id} to={`/set/${set.id}`}>
                  <p className="eyebrow problem-set-eyebrow">
                    <Sparkles size={13} />
                    Featured set
                  </p>
                  <h3>{set.title}</h3>
                  <p className="muted">{set.summary}</p>
                  <div className="progress-line" aria-label={`${percent}% complete`}>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <footer>
                    <span>{done}/{set.problems.length} done · {percent}%</span>
                    <ArrowRight size={18} />
                  </footer>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="section-heading">
        <h2>Modules</h2>
        <p>
          {contentStats.chapterCount} chapters, {contentStats.guidedProblemCount} guided problems, {contentStats.bonusProblemCount} bonus drills, {contentStats.quizCount} quizzes
        </p>
      </div>

      <div className="chapter-grid">
        {course.chapters.map((chapter) => {
          const chapterItems = [...chapter.lessons, ...chapter.problems, ...chapter.bonusProblems.map((problem) => problem.id), ...chapter.quizzes];
          const done = chapterItems.filter((id) => {
            const type = chapter.lessons.includes(id) ? "lesson" : chapter.quizzes.includes(id) ? "quiz" : "problem";
            return progress[itemKey(type, id)]?.status === "complete";
          }).length;
          const percent = chapterItems.length ? Math.round((done / chapterItems.length) * 100) : 0;
          return (
            <Link className="chapter-card" key={chapter.id} to={`/chapter/${chapter.id}`}>
              <div>
                <span className="chapter-number">{chapter.order.toString().padStart(2, "0")}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.summary}</p>
              </div>
              <div className="progress-line" aria-label={`${percent}% complete`}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <footer>
                <span>{percent}% complete</span>
                <ArrowRight size={18} />
              </footer>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
