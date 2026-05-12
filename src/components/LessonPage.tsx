import { CheckCircle2 } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findLesson, findProblem } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { MarkdownView } from "./MarkdownView";
import { NotesPanel } from "./NotesPanel";

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? findLesson(lessonId) : undefined;
  const { markProgress } = useStore();

  if (!lesson) return <Navigate to="/" replace />;

  return (
    <section className="page reading-page">
      <article className="reading">
        <p className="eyebrow">{lesson.minutes} min</p>
        <MarkdownView content={lesson.body} />
        <div className="concept-row">
          {lesson.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => void markProgress("lesson", lesson.id, "complete")}>
          <CheckCircle2 size={18} />
          Mark complete
        </button>
      </article>
      <aside className="lesson-side stack">
        <section className="notes-panel">
          <span>Learning Goals</span>
          <ul>
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
        <section className="notes-panel">
          <span>Practice Links</span>
          <div className="lesson-links">
            {lesson.linkedProblemIds.map((problemId) => {
              const problem = findProblem(problemId);
              if (!problem) return null;
              return (
                <Link key={problem.id} to={`/problem/${problem.id}`}>
                  {problem.title}
                </Link>
              );
            })}
          </div>
        </section>
        <NotesPanel type="lesson" id={lesson.id} />
      </aside>
    </section>
  );
}
