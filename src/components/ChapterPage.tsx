import { Check, FileQuestion, FileText, TerminalSquare } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { course, findChapter, findLesson, findProblem, findQuiz } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { itemKey } from "../storage/db";

export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = chapterId ? findChapter(chapterId) : undefined;
  const { progress } = useStore();

  if (!chapter) return <Navigate to="/" replace />;

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Module {chapter.order.toString().padStart(2, "0")}</p>
          <h1>{chapter.title}</h1>
          <p className="lead">{chapter.summary}</p>
        </div>
      </div>

      <div className="content-columns">
        <div className="stack">
          <div className="section-heading">
            <h2>Lessons</h2>
          </div>
          {chapter.lessons.map((lessonId) => {
            const lesson = findLesson(lessonId);
            if (!lesson) return null;
            return (
              <Link className="row-link" to={`/lesson/${lesson.id}`} key={lesson.id}>
                <FileText size={18} />
                <span>{lesson.title}</span>
                <StatusDot complete={progress[itemKey("lesson", lesson.id)]?.status === "complete"} />
              </Link>
            );
          })}

          <div className="section-heading">
            <h2>Guided Problems</h2>
            <p>{chapter.problems.length} original prompts</p>
          </div>
          {chapter.problems.map((problemId) => {
            const problem = findProblem(problemId);
            if (!problem) return null;
            return (
              <Link className="row-link" to={`/problem/${problem.id}`} key={problem.id}>
                <TerminalSquare size={18} />
                <span>{problem.title}</span>
                <small>{problem.difficulty}</small>
                <StatusDot complete={progress[itemKey("problem", problem.id)]?.status === "complete"} />
              </Link>
            );
          })}

          {chapter.quizzes.map((quizId) => {
            const quiz = findQuiz(quizId);
            if (!quiz) return null;
            return (
              <Link className="row-link" to={`/quiz/${quiz.id}`} key={quiz.id}>
                <FileQuestion size={18} />
                <span>{quiz.title}</span>
                <StatusDot complete={progress[itemKey("quiz", quiz.id)]?.status === "complete"} />
              </Link>
            );
          })}
        </div>

        <aside className="bonus-panel">
          <h2>Runnable Bonus Drills</h2>
          <div className="bonus-list">
            {chapter.bonusProblems.map((bonus) => (
              <Link className="bonus-link" to={`/problem/${bonus.id}`} key={bonus.id}>
                <strong>{bonus.title}</strong>
                <p>{bonus.prompt}</p>
                <StatusDot complete={progress[itemKey("problem", bonus.id)]?.status === "complete"} />
              </Link>
            ))}
          </div>
          <p className="muted">Total course modules: {course.chapters.length}</p>
        </aside>
      </div>
    </section>
  );
}

function StatusDot({ complete }: { complete: boolean }) {
  return <span className={complete ? "status-dot complete" : "status-dot"}>{complete ? <Check size={14} /> : null}</span>;
}
