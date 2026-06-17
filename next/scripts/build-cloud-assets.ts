import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type ContentGraph, type FunctionSignature, type LanguagePack, type ProblemLanguageSupport, type Scenario } from "../src/core/types.js";
import { languagePacks } from "../src/languages/languagePacks.js";
import { defaultContentRoot, loadContentGraph } from "../src/content/loadContentGraph.js";
import { readProblemSource, type SourceKind } from "../src/daemon/source.js";

interface ScenarioEditableFile {
  path: string;
  content: string;
}

interface ScenarioHiddenTestFile extends ScenarioEditableFile {
  visibility: "hidden";
}

interface CloudScenarioAssets {
  prompts: Record<string, string>;
  templates: Record<string, ScenarioEditableFile[]>;
  hiddenTests: Record<string, ScenarioHiddenTestFile[]>;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolveArg("--out") ?? resolve(root, "dist/web/cloud-data");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const graph = await loadContentGraph(defaultContentRoot);
await writeJson("catalog.json", publicContentGraph(graph));
await writeJson("languages.json", cloudLanguagePacks(languagePacks));
await writeJson("sources.json", await sourceMap(graph));
await writeJson("scenarios.json", await scenarioAssets(graph));

console.log(`Wrote Cloudflare demo assets to ${outDir}`);

function resolveArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function writeJson(name: string, value: unknown) {
  await writeFile(resolve(outDir, name), `${JSON.stringify(value)}\n`, "utf8");
}

function publicContentGraph(graph: ContentGraph): ContentGraph {
  return {
    ...graph,
    scenarios: graph.scenarios.map((scenario) => ({
      ...scenario,
      hiddenTestsPath: "",
      hiddenTestCommand: { command: "", args: [] }
    }))
  };
}

function cloudLanguagePacks(packs: LanguagePack[]): LanguagePack[] {
  return packs.map((pack) => ({
    ...pack,
    runner: {
      ...pack.runner,
      strategy: pack.id === "python" ? "browser-worker" : "host-process",
      installedByDefault: pack.id === "python"
    }
  }));
}

async function sourceMap(graph: ContentGraph): Promise<Record<string, string>> {
  const sources: Record<string, string> = {};
  for (const problem of graph.problems) {
    for (const [language, support] of Object.entries(problem.languages)) {
      await addSources(sources, problem.id, undefined, language, support, problem.signature);
    }
    for (const part of problem.parts ?? []) {
      for (const [language, support] of Object.entries(part.languages ?? problem.languages)) {
        await addSources(sources, problem.id, part.id, language, support, part.signature ?? problem.signature);
      }
    }
  }
  return sources;
}

async function addSources(
  sources: Record<string, string>,
  problemId: string,
  partId: string | undefined,
  language: string,
  support: ProblemLanguageSupport,
  signature: FunctionSignature
) {
  void support;
  void signature;
  for (const kind of ["starter", "reference", "solution"] as SourceKind[]) {
    try {
      const { code } = await readProblemSource(graph, defaultContentRoot, { problemId, partId, language, kind });
      sources[sourceKey(problemId, partId, language, kind)] = code;
    } catch {
      // Many problems do not have authored solution source files for every language.
    }
  }
}

function sourceKey(problemId: string, partId: string | undefined, language: string, kind: SourceKind): string {
  return [problemId, partId ?? "", language, kind].join("::");
}

async function scenarioAssets(graph: ContentGraph): Promise<CloudScenarioAssets> {
  const prompts: Record<string, string> = {};
  const templates: Record<string, ScenarioEditableFile[]> = {};
  const hiddenTests: Record<string, ScenarioHiddenTestFile[]> = {};
  for (const scenario of graph.scenarios) {
    prompts[scenario.id] = await readFile(resolve(defaultContentRoot, scenario.promptPath), "utf8");
    templates[scenario.id] = await collectTemplateFiles(scenario);
    hiddenTests[scenario.id] = await collectHiddenTestFiles(scenario);
  }
  return { prompts, templates, hiddenTests };
}

async function collectTemplateFiles(scenario: Scenario): Promise<ScenarioEditableFile[]> {
  const files: ScenarioEditableFile[] = [];
  const templateRoot = resolve(defaultContentRoot, scenario.templatePath);
  for (const editablePath of scenario.editablePaths) {
    await collectFiles(resolve(templateRoot, editablePath), editablePath, files, (name) => isTextEditableFile(name));
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function collectHiddenTestFiles(scenario: Scenario): Promise<ScenarioHiddenTestFile[]> {
  const files: ScenarioHiddenTestFile[] = [];
  const hiddenRoot = resolve(defaultContentRoot, scenario.hiddenTestsPath);
  const collected: ScenarioEditableFile[] = [];
  await collectFiles(hiddenRoot, "tests", collected, (name) => name.endsWith(".py"));
  for (const file of collected) files.push({ ...file, visibility: "hidden" });
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function collectFiles(
  root: string,
  relativeRoot: string,
  files: ScenarioEditableFile[],
  includeFile: (name: string) => boolean
): Promise<void> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "__pycache__" || entry.name.startsWith(".")) continue;
    const absolutePath = resolve(root, entry.name);
    const relativePath = `${relativeRoot}/${entry.name}`;
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, relativePath, files, includeFile);
      continue;
    }
    if (!entry.isFile() || !includeFile(entry.name)) continue;
    files.push({
      path: relativePath,
      content: await readFile(absolutePath, "utf8")
    });
  }
}

function isTextEditableFile(name: string): boolean {
  return [".py", ".txt", ".md", ".json", ".toml", ".yaml", ".yml", ".ini", ".cfg"].some((suffix) => name.endsWith(suffix));
}
