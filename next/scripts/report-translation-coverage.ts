import { course } from "../../src/content/course.ts";
import { loadContentGraph } from "../src/content/loadContentGraph.js";
import { languagePacks } from "../src/languages/languagePacks.js";

const graph = await loadContentGraph();

const legacyIds = new Set([
  ...course.problems.map((problem) => problem.id),
  ...course.problemSets.flatMap((set) => set.problems.map((problem) => problem.id))
]);
const nextIds = new Set(graph.problems.map((problem) => problem.id));
const missingFromNext = [...legacyIds].filter((id) => !nextIds.has(id)).sort();

const languageCoverage = Object.fromEntries(
  languagePacks.map((pack) => {
    const problems = graph.problems.filter((problem) => Boolean(problem.languages[pack.id]));
    const legacyMatches = problems.filter((problem) => legacyIds.has(problem.id));
    return [
      pack.id,
      {
        nextProblems: problems.length,
        legacyProblems: legacyMatches.length,
        percentageOfLegacy: legacyIds.size ? Math.round((legacyMatches.length / legacyIds.size) * 1000) / 10 : 0
      }
    ];
  })
);

console.log(
  JSON.stringify(
    {
      legacyProblemCount: legacyIds.size,
      nextProblemCount: graph.problems.length,
      migratedLegacyProblems: [...nextIds].filter((id) => legacyIds.has(id)).length,
      missingLegacyProblems: missingFromNext.length,
      missingLegacySample: missingFromNext.slice(0, 20),
      languageCoverage
    },
    null,
    2
  )
);
