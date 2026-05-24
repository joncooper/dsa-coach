import { course } from "../../src/content/course.ts";

const setProblemIds = new Set(course.problemSets.flatMap((set) => set.problems.map((problem) => problem.id)));
const courseProblemIds = new Set(course.problems.map((problem) => problem.id));
const allIds = new Set([...courseProblemIds, ...setProblemIds]);

const partCount = [
  ...course.problems,
  ...course.problemSets.flatMap((set) => set.problems).filter((problem) => !courseProblemIds.has(problem.id))
].reduce((total, problem) => total + (problem.parts?.length ?? 0), 0);

const byChapter = new Map<string, number>();
for (const problem of course.problems) {
  byChapter.set(problem.chapterId, (byChapter.get(problem.chapterId) ?? 0) + 1);
}

const bySet = course.problemSets.map((set) => ({
  id: set.id,
  title: set.title,
  problems: set.problems.length
}));

console.log(
  JSON.stringify(
    {
      courseProblems: course.problems.length,
      problemSetEntries: course.problemSets.reduce((total, set) => total + set.problems.length, 0),
      uniqueProblems: allIds.size,
      multiPartProblemParts: partCount,
      chapters: Object.fromEntries([...byChapter.entries()].sort(([left], [right]) => left.localeCompare(right))),
      problemSets: bySet
    },
    null,
    2
  )
);
