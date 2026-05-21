import { CheckCircle2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findLesson, findProblem } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { LESSON_COACH_SYSTEM_PROMPT, buildLessonQuestionPrompt } from "../coach/coachPrompts";
import { CoachAssist } from "./CoachAssist";
import { LessonContent } from "./LessonContent";
import { NotesPanel } from "./NotesPanel";

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? findLesson(lessonId) : undefined;
  const { markProgress } = useStore();
  // First-attempt tally across the lesson's inline quizzes and fill-ins.
  const [checkpoints, setCheckpoints] = useState({ correct: 0, total: 0 });
  const onCheckpoint = useCallback((correct: boolean) => {
    setCheckpoints((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1
    }));
  }, []);

  if (!lesson) return <Navigate to="/" replace />;

  return (
    <section className="page reading-page">
      <article className="reading">
        <p className="eyebrow">{lesson.minutes} min</p>
        <LessonContent content={lesson.body} lessonTitle={lesson.title} onCheckpoint={onCheckpoint} />
        <div className="lesson-ask">
          <p className="lesson-ask-copy">Something here not clicking? Ask the coach to explain it another way.</p>
          <CoachAssist
            label="Ask the coach about this lesson"
            mode="ask"
            systemPrompt={LESSON_COACH_SYSTEM_PROMPT}
            buildPrompt={(question) => buildLessonQuestionPrompt(lesson.title, lesson.body, question)}
            placeholder="e.g. Can you explain the Mental Model section a different way?"
          />
        </div>
        <div className="concept-row">
          {lesson.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
        <div className="lesson-complete-row">
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              void markProgress(
                "lesson",
                lesson.id,
                "complete",
                checkpoints.total > 0 ? checkpoints : undefined
              )
            }
          >
            <CheckCircle2 size={18} />
            Mark complete
          </button>
          {checkpoints.total > 0 ? (
            <span className="lesson-checkpoint-tally">
              Checkpoints: {checkpoints.correct}/{checkpoints.total} right first try
            </span>
          ) : null}
        </div>
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
