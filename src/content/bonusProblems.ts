import type { BonusSeed } from "./bonus/types";
import { bonus as foundations } from "./bonus/foundations";
import { bonus as arraysStrings } from "./bonus/arrays-strings";
import { bonus as twoPointers } from "./bonus/two-pointers-sliding-window";
import { bonus as hashing } from "./bonus/hashing";
import { bonus as linkedLists } from "./bonus/linked-lists";
import { bonus as stacksQueues } from "./bonus/stacks-queues";
import { bonus as treesGraphs } from "./bonus/trees-graphs";
import { bonus as heaps } from "./bonus/heaps";
import { bonus as greedy } from "./bonus/greedy";
import { bonus as binarySearch } from "./bonus/binary-search";
import { bonus as backtracking } from "./bonus/backtracking";
import { bonus as dynamicProgramming } from "./bonus/dynamic-programming";
import { bonus as interviewTools } from "./bonus/interview-tools";

/**
 * Every authored bonus problem, ordered by chapter (the order matches
 * `chaptersBase` in `course.ts`). Each chapter's problems were hand-authored
 * to drill that chapter's patterns — see `src/content/bonus/*.ts`.
 */
export const bonusSeeds: BonusSeed[] = [
  ...foundations,
  ...arraysStrings,
  ...twoPointers,
  ...hashing,
  ...linkedLists,
  ...stacksQueues,
  ...treesGraphs,
  ...heaps,
  ...greedy,
  ...binarySearch,
  ...backtracking,
  ...dynamicProgramming,
  ...interviewTools
];
