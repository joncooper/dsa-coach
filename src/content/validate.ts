import { z } from "zod";
import type { CourseData } from "../types";

const testSchema = z.object({
  name: z.string().min(1),
  args: z.array(z.unknown()),
  expected: z.unknown()
});

const problemSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.enum(["warmup", "easy", "medium", "hard"]),
  source: z.enum(["guided", "bonus"]),
  patterns: z.array(z.string().min(1)).min(1),
  prompt: z.string().min(40),
  constraints: z.array(z.string().min(5)).optional(),
  examples: z.array(testSchema).optional(),
  starterCode: z.string().min(20),
  referenceCode: z.string().min(20),
  solutionCode: z.string().min(20).optional(),
  entrypoint: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  adapter: z.enum(["default", "array", "linked-list", "binary-tree", "graph", "heap", "grid"]),
  visibleTests: z.array(testSchema).min(1),
  hiddenTests: z.array(testSchema).min(1),
  hints: z.array(z.string().min(8)).min(2),
  solution: z.string().min(30),
  walkthrough: z.string().min(30).optional(),
  followUps: z.array(z.string().min(5)).optional(),
  complexity: z.object({
    time: z.string().min(3),
    space: z.string().min(3)
  })
});

const lessonSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  title: z.string().min(1),
  concepts: z.array(z.string().min(1)).min(1),
  minutes: z.number().int().positive(),
  objectives: z.array(z.string().min(4)).min(3),
  workedExamples: z.array(z.string().min(30)).min(2),
  pitfalls: z.array(z.string().min(12)).min(3),
  linkedProblemIds: z.array(z.string().min(1)).min(1),
  body: z.string().min(200)
});

const quizSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  title: z.string().min(1),
  questions: z.array(
    z.object({
      id: z.string().min(1),
      prompt: z.string().min(10),
      choices: z.array(z.string().min(1)).min(2),
      answer: z.number().int().nonnegative(),
      explanation: z.string().min(10)
    })
  ).min(3)
});

const awkwardGeneratedPhrases = [
  /scored\s+big_o/i,
  /chapter-specific/i,
  /compact\s+\w+\s+review/i,
  /review queue/i,
  /practice sequence/i,
  /drill focuses/i,
  /drill reinforces/i
];

function assertUnique(label: string, ids: string[], errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      errors.push(`Duplicate ${label} id: ${id}`);
    }
    seen.add(id);
  }
}

export function validateCourse(course: CourseData): string[] {
  const errors: string[] = [];
  const chapterIds = new Set(course.chapters.map((chapter) => chapter.id));
  const lessonIds = new Set(course.lessons.map((lesson) => lesson.id));
  const problemIds = new Set(course.problems.map((problem) => problem.id));
  const quizIds = new Set(course.quizzes.map((quiz) => quiz.id));

  assertUnique("chapter", course.chapters.map((chapter) => chapter.id), errors);
  assertUnique("lesson", course.lessons.map((lesson) => lesson.id), errors);
  assertUnique("problem", course.problems.map((problem) => problem.id), errors);
  assertUnique("quiz", course.quizzes.map((quiz) => quiz.id), errors);

  if (course.chapters.length !== 13) errors.push(`Expected 13 chapters, found ${course.chapters.length}`);
  const guidedCount = course.problems.filter((problem) => problem.source === "guided").length;
  const bonusProblemIds = new Set(course.chapters.flatMap((chapter) => chapter.bonusProblems.map((problem) => problem.id)));
  if (guidedCount !== 70) errors.push(`Expected 70 guided problems, found ${guidedCount}`);
  const bonusCount = course.chapters.reduce((total, chapter) => total + chapter.bonusProblems.length, 0);
  if (bonusCount !== 140) errors.push(`Expected 140 bonus drills, found ${bonusCount}`);
  if (course.problems.length !== guidedCount + bonusCount) {
    errors.push(`Expected total problem count to equal guided + bonus, found ${course.problems.length}`);
  }
  if (course.quizzes.length !== 12) errors.push(`Expected 12 quizzes, found ${course.quizzes.length}`);

  for (const lesson of course.lessons) {
    const parsed = lessonSchema.safeParse(lesson);
    if (!parsed.success) errors.push(`Invalid lesson ${lesson.id}: ${parsed.error.issues[0]?.message ?? "schema error"}`);
    if (!chapterIds.has(lesson.chapterId)) errors.push(`Lesson ${lesson.id} references missing chapter ${lesson.chapterId}`);
    const wordCount = lesson.body.trim().split(/\s+/).length;
    if (wordCount < 850) errors.push(`Lesson ${lesson.id} is too short for beta depth: ${wordCount} words`);
    for (const heading of ["Learning Goals", "Pattern Recognition Signals", "Mental Model", "Worked Example 1", "Worked Example 2", "Implementation Checklist", "Common Mistakes", "Complexity Notes", "Practice Path"]) {
      if (!lesson.body.includes(`## ${heading}`)) errors.push(`Lesson ${lesson.id} missing section ${heading}`);
    }
    if (lesson.body.includes("This module focuses on")) errors.push(`Lesson ${lesson.id} still contains old generic template phrasing`);
    for (const linkedId of lesson.linkedProblemIds) {
      if (!problemIds.has(linkedId)) errors.push(`Lesson ${lesson.id} references missing linked problem ${linkedId}`);
    }
  }

  const promptFingerprints = new Map<string, string>();
  const bonusReferenceFingerprints = new Map<string, Set<string>>();
  for (const problem of course.problems) {
    const parsed = problemSchema.safeParse(problem);
    if (!parsed.success) errors.push(`Invalid problem ${problem.id}: ${parsed.error.issues[0]?.message ?? "schema error"}`);
    if (!chapterIds.has(problem.chapterId)) errors.push(`Problem ${problem.id} references missing chapter ${problem.chapterId}`);
    if (!problem.starterCode.includes(`def ${problem.entrypoint}(`)) {
      errors.push(`Problem ${problem.id} starter code does not define ${problem.entrypoint}`);
    }
    if (!problem.referenceCode.includes(`def ${problem.entrypoint}(`)) {
      errors.push(`Problem ${problem.id} reference code does not define ${problem.entrypoint}`);
    }
    if (!problem.solutionCode || !problem.solutionCode.includes(`def ${problem.entrypoint}(`)) {
      errors.push(`Problem ${problem.id} missing solution code for ${problem.entrypoint}`);
    }
    if (!problem.walkthrough) errors.push(`Problem ${problem.id} missing walkthrough`);
    if (!problem.constraints?.length) errors.push(`Problem ${problem.id} missing constraints`);
    if (!problem.examples?.length) errors.push(`Problem ${problem.id} missing examples`);
    for (const phrase of awkwardGeneratedPhrases) {
      if (phrase.test(problem.prompt)) {
        errors.push(`Problem ${problem.id} contains generated-feeling prompt phrasing: ${phrase}`);
      }
    }
    if (problem.source === "bonus" && !bonusProblemIds.has(problem.id)) {
      errors.push(`Bonus problem ${problem.id} is not attached to a chapter`);
    }
    if (problem.source === "bonus" && !problem.patterns.includes(problem.chapterId)) {
      errors.push(`Bonus problem ${problem.id} missing chapter pattern tag ${problem.chapterId}`);
    }
    const promptFingerprint = fingerprint(problem.prompt);
    const existingPromptId = promptFingerprints.get(promptFingerprint);
    if (existingPromptId && existingPromptId !== problem.id) {
      errors.push(`Duplicate prompt fingerprint between ${existingPromptId} and ${problem.id}`);
    }
    promptFingerprints.set(promptFingerprint, problem.id);
    if (problem.source === "bonus") {
      const chapterSet = bonusReferenceFingerprints.get(problem.chapterId) ?? new Set<string>();
      const referenceFingerprint = fingerprint(problem.solutionCode ?? problem.referenceCode);
      if (chapterSet.has(referenceFingerprint)) errors.push(`Duplicate bonus reference body in chapter ${problem.chapterId}: ${problem.id}`);
      chapterSet.add(referenceFingerprint);
      bonusReferenceFingerprints.set(problem.chapterId, chapterSet);
    }
    const allTestNames = [...problem.visibleTests, ...problem.hiddenTests].map((test) => test.name);
    assertUnique(`test for ${problem.id}`, allTestNames, errors);
  }

  for (const quiz of course.quizzes) {
    const parsed = quizSchema.safeParse(quiz);
    if (!parsed.success) errors.push(`Invalid quiz ${quiz.id}: ${parsed.error.issues[0]?.message ?? "schema error"}`);
    if (!chapterIds.has(quiz.chapterId)) errors.push(`Quiz ${quiz.id} references missing chapter ${quiz.chapterId}`);
    for (const question of quiz.questions) {
      if (question.answer >= question.choices.length) errors.push(`Quiz ${quiz.id} question ${question.id} has out-of-range answer`);
    }
  }

  for (const chapter of course.chapters) {
    for (const lessonId of chapter.lessons) {
      if (!lessonIds.has(lessonId)) errors.push(`Chapter ${chapter.id} references missing lesson ${lessonId}`);
    }
    for (const problemId of chapter.problems) {
      if (!problemIds.has(problemId)) errors.push(`Chapter ${chapter.id} references missing problem ${problemId}`);
    }
    for (const quizId of chapter.quizzes) {
      if (!quizIds.has(quizId)) errors.push(`Chapter ${chapter.id} references missing quiz ${quizId}`);
    }
    for (const bonus of chapter.bonusProblems) {
      const parsed = problemSchema.safeParse(bonus);
      if (!parsed.success) errors.push(`Invalid bonus problem ${bonus.id}: ${parsed.error.issues[0]?.message ?? "schema error"}`);
      if (!problemIds.has(bonus.id)) errors.push(`Chapter ${chapter.id} references missing bonus problem ${bonus.id}`);
      if (bonus.source !== "bonus") errors.push(`Chapter ${chapter.id} bonus problem ${bonus.id} is not marked as bonus`);
    }
  }

  return errors;
}

function fingerprint(value: string): string {
  return value
    .toLowerCase()
    .replace(/def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g, "def fn(")
    .replace(/[0-9]+/g, "#")
    .replace(/[^a-z#]+/g, " ")
    .trim();
}
