import { ArrowRight, CheckCircle2, Clock3, ListChecks, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { course, contentStats } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";
import { ExportImport } from "./ExportImport";

export function Dashboard() {
  const { progress, progressSummary, settings } = useStore();
  const totalTrackable = course.lessons.length + course.problems.length + course.quizzes.length;
  const completePercent = Math.round((progressSummary.complete / totalTrackable) * 100);
  const starredProblems = course.problems.filter((problem) => settings[`problem:starred:${problem.id}`]?.value === true).slice(0, 8);

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Local course</p>
          <h1>DSA Coach</h1>
        </div>
        <ExportImport />
      </div>

      <div className="metric-grid">
        <div className="metric">
          <CheckCircle2 size={22} />
          <span>{completePercent}%</span>
          <p>Complete</p>
        </div>
        <div className="metric">
          <ListChecks size={22} />
          <span>{contentStats.totalProblemCount}</span>
          <p>Total runnable problems</p>
        </div>
        <div className="metric">
          <Clock3 size={22} />
          <span>{progressSummary.due}</span>
          <p>Reviews due</p>
        </div>
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
