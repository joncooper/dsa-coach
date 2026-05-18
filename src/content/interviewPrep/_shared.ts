import type { Problem } from "../../types";

export const setId = "interview-prep";

export function setProblem(
  problem: Omit<Problem, "chapterId" | "source" | "adapter"> & Partial<Pick<Problem, "adapter">>
): Problem {
  return {
    chapterId: setId,
    source: "guided",
    adapter: problem.adapter ?? "default",
    ...problem
  };
}

export type Subcategory =
  | "streams"
  | "parsing"
  | "intervals"
  | "aggregation"
  | "recursion"
  | "system-design"
  | "dependencies"
  | "grid";

export const SUBCATEGORIES: { id: Subcategory; label: string; blurb: string }[] = [
  { id: "streams", label: "Stream & event processing", blurb: "Fold state over a sequence of events" },
  { id: "parsing", label: "Parsing & evaluation", blurb: "State machines, tokenizers, evaluators" },
  { id: "intervals", label: "Intervals & scheduling", blurb: "Overlap, sweep, resource counting" },
  { id: "aggregation", label: "Grouping, joins & aggregation", blurb: "Group-by, joins, rollups, ranking" },
  { id: "recursion", label: "Recursion over nested data", blurb: "Walk and rebuild tree-shaped data" },
  { id: "system-design", label: "Small-system design", blurb: "Model state from a command stream" },
  { id: "dependencies", label: "Dependency & ordering", blurb: "Topological order, cycle detection" },
  { id: "grid", label: "Grid & matrix", blurb: "2D traversal and region operations" }
];
