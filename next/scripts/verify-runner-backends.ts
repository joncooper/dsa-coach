import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultContentRoot, loadContentGraph } from "../src/content/loadContentGraph.js";
import type { LanguageId, Problem, ProblemLanguageSupport } from "../src/core/types.js";
import { runtimeLanguagePacks } from "../src/languages/languagePacks.js";
import { LocalRunner } from "../src/runner/localRunner.js";

interface Target {
  label: string;
  problem: Problem;
  partId?: string;
  support: ProblemLanguageSupport;
}

const requestedLanguages = parseLanguages();
const graph = await loadContentGraph();
const runner = new LocalRunner(graph);
const packs = await runtimeLanguagePacks();
const available = new Map(packs.map((pack) => [pack.id, pack.runner.installedByDefault]));
const started = Date.now();
let checked = 0;
const skipped: string[] = [];
const failures: unknown[] = [];

for (const language of requestedLanguages) {
  if (!available.get(language)) {
    skipped.push(language);
    console.log(`skipping ${language}: runner toolchain is not available`);
    continue;
  }
  const targets = runnerTargets(language);
  console.log(`checking ${language}: ${targets.length} reference targets`);
  for (const target of targets) {
    const code = await readFile(resolve(defaultContentRoot, target.support.referencePath), "utf8");
    const result = await runner.run({
      language,
      problemId: target.problem.id,
      partId: target.partId,
      code,
      includeHidden: true,
      timeoutMs: language === "scala" ? 30000 : 10000
    });
    checked += 1;
    if (checked % 100 === 0) {
      console.log(`checked ${checked} targets in ${Math.round((Date.now() - started) / 1000)}s`);
    }
    if (result.status !== "passed") {
      failures.push({
        language,
        label: target.label,
        status: result.status,
        message: result.message,
        stderr: result.stderr,
        firstFailed: result.tests.find((test) => !test.passed)
      });
      console.log(`FAIL ${language} ${target.label}: ${result.status}`);
      if (failures.length >= 20) break;
    }
  }
  if (failures.length >= 20) break;
}

const summary = {
  checked,
  skipped,
  failures: failures.length,
  seconds: Math.round((Date.now() - started) / 1000)
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.log(JSON.stringify(failures, null, 2));
  process.exit(1);
}

function runnerTargets(language: LanguageId): Target[] {
  return graph.problems.flatMap((problem) => {
    const targets: Target[] = [];
    const support = problem.languages[language];
    if (support) targets.push({ label: problem.id, problem, support });
    for (const part of problem.parts ?? []) {
      const partSupport = part.languages?.[language];
      if (partSupport) {
        targets.push({
          label: `${problem.id}#${part.id}`,
          problem,
          partId: part.id,
          support: partSupport
        });
      }
    }
    return targets;
  });
}

function parseLanguages(): LanguageId[] {
  const arg = process.argv.find((value) => value.startsWith("--languages="));
  if (!arg) return ["typescript", "python", "go", "scala"];
  return arg.slice("--languages=".length).split(",").map((value) => value.trim()).filter(Boolean);
}
