import { describe, expect, it } from "vitest";
import { course, contentStats } from "../src/content/course";
import { filterProblems, searchProblems, gradeQuiz } from "../src/content/selectors";
import { validateCourse } from "../src/content/validate";

describe("course content", () => {
  it("passes schema and reference validation", () => {
    expect(validateCourse(course)).toEqual([]);
    expect(contentStats.chapterCount).toBe(13);
    expect(contentStats.guidedProblemCount).toBe(70);
    expect(contentStats.bonusProblemCount).toBe(140);
    expect(contentStats.totalProblemCount).toBe(210);
    expect(contentStats.quizCount).toBe(12);
  });

  it("treats bonus drills as runnable problems", () => {
    const bonus = course.chapters[0].bonusProblems[0];
    expect(course.problems.find((problem) => problem.id === bonus.id)).toMatchObject({
      source: "bonus",
      entrypoint: expect.any(String),
      starterCode: expect.stringContaining("def "),
      referenceCode: expect.stringContaining("def "),
      visibleTests: expect.any(Array),
      hiddenTests: expect.any(Array)
    });
  });

  it("validates commercial beta lesson metadata", () => {
    for (const lesson of course.lessons) {
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(3);
      expect(lesson.workedExamples.length).toBeGreaterThanOrEqual(2);
      expect(lesson.pitfalls.length).toBeGreaterThanOrEqual(3);
      expect(lesson.linkedProblemIds.length).toBeGreaterThan(0);
      expect(lesson.body).toContain("## Worked Example 1");
      expect(lesson.body.trim().split(/\s+/).length).toBeGreaterThanOrEqual(850);
    }
  });

  it("finds problems by pattern", () => {
    const results = searchProblems("binary search");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((problem) => problem.chapterId === "binary-search")).toBe(true);
  });

  it("filters problems by beta fields", () => {
    const bonusFoundations = filterProblems({ source: "bonus", chapterId: "foundations", pattern: "foundations" });
    expect(bonusFoundations).toHaveLength(12);
    expect(filterProblems({ source: "guided", difficulty: "medium" }).every((problem) => problem.source === "guided")).toBe(true);
  });

  it("grades quizzes exactly", () => {
    const quiz = course.quizzes[0];
    const answers = Object.fromEntries(quiz.questions.map((question) => [question.id, question.answer]));
    expect(gradeQuiz(quiz, answers)).toEqual({ correct: quiz.questions.length, total: quiz.questions.length, passed: true });
  });
});
