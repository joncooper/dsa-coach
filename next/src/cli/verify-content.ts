import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultContentRoot, loadContentGraph } from "../content/loadContentGraph.js";
import { validateContentFiles, validateContentGraph } from "../core/validation.js";
import { languagePacks, installedLanguagePacks } from "../languages/languagePacks.js";
import { LocalRunner } from "../runner/localRunner.js";

const graph = await loadContentGraph();
const graphResult = validateContentGraph(graph, languagePacks);
const fileResult = await validateContentFiles(graph, defaultContentRoot);
const errors = [...graphResult.errors, ...fileResult.errors];

const runner = new LocalRunner(graph);
for (const problem of graph.problems) {
  for (const pack of installedLanguagePacks()) {
    if (pack.runner.strategy === "browser-worker") continue;
    const support = problem.languages[pack.id];
    if (!support) continue;
    const code = await readFile(resolve(defaultContentRoot, support.referencePath), "utf8");
    const result = await runner.run({
      language: pack.id,
      problemId: problem.id,
      code,
      includeHidden: true,
      timeoutMs: 1000
    });
    if (result.status !== "passed") {
      errors.push(`Reference failed for ${problem.id}/${pack.id}: ${result.message ?? result.status}`);
    }
  }
}

if (errors.length) {
  console.error("Content verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Content graph OK: ${graph.tracks.length} tracks, ${graph.modules.length} modules, ` +
    `${graph.problemSets.length} problem sets, ${countLabel(graph.scenarioSets.length, "scenario set")}, ` +
    `${graph.problems.length} problems, ${countLabel(graph.scenarios.length, "scenario")}.`
);

function countLabel(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
