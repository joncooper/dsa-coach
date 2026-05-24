import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";
import { defaultContentRoot, loadContentGraph } from "../src/content/loadContentGraph.js";
import { LocalRunner } from "../src/runner/localRunner.js";

describe("local runner", () => {
  test("runs representative TypeScript reference solutions against visible and hidden tests", async () => {
    const graph = await loadContentGraph();
    const runner = new LocalRunner(graph);
    const problemIds = ["sum-positive-readings", "tree-max-depth-local", "aoc-y1-d1-elevation-pairs"];
    for (const problem of graph.problems.filter((candidate) => problemIds.includes(candidate.id))) {
      const support = problem.languages.typescript;
      if (!support) continue;
      const code = await readFile(resolve(defaultContentRoot, support.referencePath), "utf8");
      const result = await runner.run({
        language: "typescript",
        problemId: problem.id,
        code,
        includeHidden: true,
        timeoutMs: 1000
      });
      if (result.status !== "passed") {
        throw new Error(`${problem.id} reference failed with ${result.status}: ${result.message ?? ""}`);
      }
      expect(result.tests).toHaveLength(problem.tests.length);

      for (const part of (problem.id === "aoc-y1-d1-elevation-pairs" ? problem.parts ?? [] : [])) {
        const partSupport = part.languages?.typescript;
        if (!partSupport) continue;
        const partCode = await readFile(resolve(defaultContentRoot, partSupport.referencePath), "utf8");
        const partResult = await runner.run({
          language: "typescript",
          problemId: problem.id,
          partId: part.id,
          code: partCode,
          includeHidden: true,
          timeoutMs: 1000
        });
        if (partResult.status !== "passed") {
          throw new Error(`${problem.id}#${part.id} reference failed with ${partResult.status}: ${partResult.message ?? ""}`);
        }
        expect(partResult.tests).toHaveLength(part.tests.length);
      }
    }
  });

  test("returns unsupported for unknown languages", async () => {
    const graph = await loadContentGraph();
    const result = await new LocalRunner(graph).run({
      language: "made-up-language",
      problemId: "sum-positive-readings",
      code: "",
      includeHidden: true
    });
    expect(result.status).toBe("unsupported");
  });

  test("runs Python and Go references when process runner verification is enabled", async () => {
    if (process.env.DSA_COACH_TEST_PROCESS_RUNNERS !== "1") return;
    const graph = await loadContentGraph();
    const runner = new LocalRunner(graph);
    const problem = graph.problems.find((candidate) => candidate.id === "sum-positive-readings");
    if (!problem) throw new Error("missing sum-positive-readings");
    for (const language of ["python", "go"] as const) {
      const support = problem.languages[language];
      const code = await readFile(resolve(defaultContentRoot, support.referencePath), "utf8");
      const result = await runner.run({
        language,
        problemId: problem.id,
        code,
        includeHidden: true,
        timeoutMs: 10000
      });
      expect(result.status).toBe("passed");
    }
  });
});
