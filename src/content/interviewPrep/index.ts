import type { Problem, ProblemSet } from "../../types";
import { setId, SUBCATEGORIES, type Subcategory } from "./_shared";
import { streamsProblems } from "./streams";
import { parsingProblems } from "./parsing";
import { intervalsProblems } from "./intervals";
import { aggregationProblems } from "./aggregation";
import { recursionProblems } from "./recursion";
import { systemDesignProblems } from "./systemDesign";
import { dependenciesProblems } from "./dependencies";
import { gridProblems } from "./grid";

/**
 * Each group's problems are stamped with their subcategory at assembly time,
 * so the membership lives in exactly one place: the module the problem is
 * authored in. Order here is the order the set renders in.
 */
const GROUPS: { id: Subcategory; problems: Problem[] }[] = [
  { id: "streams", problems: streamsProblems },
  { id: "parsing", problems: parsingProblems },
  { id: "intervals", problems: intervalsProblems },
  { id: "aggregation", problems: aggregationProblems },
  { id: "recursion", problems: recursionProblems },
  { id: "system-design", problems: systemDesignProblems },
  { id: "dependencies", problems: dependenciesProblems },
  { id: "grid", problems: gridProblems }
];

const problems: Problem[] = GROUPS.flatMap((group) =>
  group.problems.map((problem) => ({ ...problem, subcategory: group.id }))
);

export const interviewPrepSet: ProblemSet = {
  id: setId,
  title: "Practical Interview Problems",
  summary:
    "Practical, language-agnostic programming problems sized to a generalist coding interview that screens for clear thinking and structure rather than algorithm trivia.",
  intro:
    "These prompts mirror the generalist coding-interview style: each is solvable cleanly in 30–45 minutes in Python (or any language) and rewards decomposition, careful state handling, explicit edge cases, and a fully-tested implementation — not clever tricks. Treat each problem like a small system: name the state, validate inputs at the boundary, and pick the simplest data structure that fits. Several problems extend into a Part 2 that builds on your Part 1 solution.",
  problems
};

export const problemSets: ProblemSet[] = [interviewPrepSet];

export { SUBCATEGORIES };
export type { Subcategory };
