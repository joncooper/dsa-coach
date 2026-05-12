import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { findQuiz } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { NotesPanel } from "./NotesPanel";

export function QuizPage() {
  const { quizId } = useParams();
  const quiz = quizId ? findQuiz(quizId) : undefined;
  const { markProgress } = useStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((question) => answers[question.id] === question.answer).length;
  }, [answers, quiz]);

  if (!quiz) return <Navigate to="/" replace />;

  const complete = submitted && score === quiz.questions.length;

  return (
    <section className="page reading-page">
      <article className="reading stack">
        <div>
          <p className="eyebrow">{quiz.questions.length} questions</p>
          <h1>{quiz.title}</h1>
        </div>
        {quiz.questions.map((question, questionIndex) => (
          <fieldset className="quiz-question" key={question.id}>
            <legend>
              {questionIndex + 1}. {question.prompt}
            </legend>
            {question.choices.map((choice, choiceIndex) => (
              <label key={choice}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === choiceIndex}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                />
                {choice}
              </label>
            ))}
            {submitted ? (
              <p className={answers[question.id] === question.answer ? "quiz-correct" : "quiz-wrong"}>{question.explanation}</p>
            ) : null}
          </fieldset>
        ))}
        <div className="quiz-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setSubmitted(true);
              void markProgress("quiz", quiz.id, score === quiz.questions.length ? "complete" : "in-progress");
            }}
          >
            <CheckCircle2 size={18} />
            Grade quiz
          </button>
          {submitted ? (
            <strong>
              Score: {score}/{quiz.questions.length} {complete ? "complete" : ""}
            </strong>
          ) : null}
        </div>
      </article>
      <NotesPanel type="quiz" id={quiz.id} />
    </section>
  );
}
