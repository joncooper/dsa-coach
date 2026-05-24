import { describe, expect, test } from "bun:test";
import { loadContentGraph } from "../src/content/loadContentGraph.js";
import { validateContentFiles, validateContentGraph } from "../src/core/validation.js";
import { languagePacks } from "../src/languages/languagePacks.js";

describe("content graph", () => {
  test("loads and validates canonical graph references", async () => {
    const graph = await loadContentGraph();
    expect(graph.tracks.map((track) => track.id)).toEqual(["main-course", "practice"]);
    expect(graph.modules.map((module) => module.id)).toEqual([
      "foundations",
      "arrays-strings",
      "hashing",
      "two-pointers-sliding-window",
      "stacks-queues",
      "linked-lists",
      "trees-graphs",
      "heaps",
      "greedy",
      "binary-search",
      "backtracking",
      "dynamic-programming",
      "interview-tools"
    ]);
    expect(graph.problems).toHaveLength(256);
    expect(graph.modules.find((module) => module.id === "foundations")?.sequence).toHaveLength(18);
    expect(graph.modules.find((module) => module.id === "arrays-strings")?.sequence).toHaveLength(18);
    expect(graph.modules.find((module) => module.id === "hashing")?.sequence).toHaveLength(18);
    expect(graph.modules.find((module) => module.id === "two-pointers-sliding-window")?.sequence).toHaveLength(18);
    expect(graph.modules.find((module) => module.id === "stacks-queues")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "linked-lists")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "trees-graphs")?.sequence).toHaveLength(21);
    expect(graph.modules.find((module) => module.id === "heaps")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "greedy")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "binary-search")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "backtracking")?.sequence).toHaveLength(15);
    expect(graph.modules.find((module) => module.id === "dynamic-programming")?.sequence).toHaveLength(18);
    expect(graph.modules.find((module) => module.id === "interview-tools")?.sequence).toHaveLength(9);
    expect(graph.problemSets.map((set) => set.id)).toEqual([
      "interview-prep",
      "aoc-year-1",
      "aoc-year-2",
      "aoc-year-3",
      "assessments",
      "lib-sortedcontainers",
      "lib-ordered-dict"
    ]);
    expect(graph.problemSets.find((set) => set.id === "interview-prep")?.entries).toHaveLength(18);
    expect(graph.problemSets.find((set) => set.id === "aoc-year-1")?.entries).toHaveLength(7);
    expect(graph.problemSets.find((set) => set.id === "aoc-year-2")?.entries).toHaveLength(7);
    expect(graph.problemSets.find((set) => set.id === "aoc-year-3")?.entries).toHaveLength(7);
    expect(graph.problemSets.find((set) => set.id === "assessments")?.entries).toHaveLength(3);
    expect(graph.problemSets.find((set) => set.id === "lib-sortedcontainers")?.entries).toHaveLength(2);
    expect(graph.problemSets.find((set) => set.id === "lib-ordered-dict")?.entries).toHaveLength(2);
    expect(graph.problems.map((problem) => problem.id)).toContain("tek-flood-fill");
    expect(graph.problems.map((problem) => problem.id)).toContain("lib-od-first-unique");
    expect(graph.problems.find((problem) => problem.id === "aoc-y1-d1-elevation-pairs")?.parts).toHaveLength(1);
    expect(graph.problems.find((problem) => problem.id === "asm-filesystem")?.parts).toHaveLength(3);
    expect(validateContentGraph(graph, languagePacks)).toEqual({ ok: true, errors: [] });
  });

  test("language solution files exist", async () => {
    const graph = await loadContentGraph();
    expect(await validateContentFiles(graph, new URL("../content", import.meta.url).pathname)).toEqual({
      ok: true,
      errors: []
    });
  });
});
