import { course } from "./course";
import type { Difficulty, Problem, Quiz } from "../types";

export function searchProblems(query: string): Problem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return course.problems.filter((problem) =>
    `${problem.title} ${problem.difficulty} ${problem.patterns.join(" ")} ${problem.prompt}`.toLowerCase().includes(normalized)
  );
}

export function gradeQuiz(quiz: Quiz, answers: Record<string, number>) {
  const correct = quiz.questions.filter((question) => answers[question.id] === question.answer).length;
  return {
    correct,
    total: quiz.questions.length,
    passed: correct === quiz.questions.length
  };
}

export interface ProblemFilters {
  source?: Problem["source"];
  chapterId?: string;
  difficulty?: Difficulty;
  pattern?: string;
}

export function filterProblems(filters: ProblemFilters): Problem[] {
  return course.problems.filter((problem) => {
    if (filters.source && problem.source !== filters.source) return false;
    if (filters.chapterId && problem.chapterId !== filters.chapterId) return false;
    if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
    if (filters.pattern && !problem.patterns.includes(filters.pattern)) return false;
    return true;
  });
}
