import { access } from "node:fs/promises";
import { resolve } from "node:path";
import type { ContentGraph, ContentKind, ContentRef, LanguagePack, Problem, ProblemLanguageSupport } from "./types.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateContentGraph(graph: ContentGraph, languagePacks: LanguagePack[]): ValidationResult {
  const errors: string[] = [];
  const languages = new Set(languagePacks.map((pack) => pack.id));
  const moduleIds = new Set(graph.modules.map((module) => module.id));
  const problemSetIds = new Set(graph.problemSets.map((set) => set.id));
  const problemIds = new Set(graph.problems.map((problem) => problem.id));

  assertUnique("track", graph.tracks.map((track) => track.id), errors);
  assertUnique("module", graph.modules.map((module) => module.id), errors);
  assertUnique("problem set", graph.problemSets.map((set) => set.id), errors);
  assertUnique("problem", graph.problems.map((problem) => problem.id), errors);

  for (const track of graph.tracks) {
    for (const entry of track.entries) {
      if (!refExists(entry, moduleIds, problemSetIds, problemIds)) {
        errors.push(`Track ${track.id} references missing ${entry.kind}:${entry.id}`);
      }
    }
  }

  for (const module of graph.modules) {
    for (const entry of module.sequence) {
      if (!refExists(entry, moduleIds, problemSetIds, problemIds)) {
        errors.push(`Module ${module.id} references missing ${entry.kind}:${entry.id}`);
      }
    }
    for (const problemId of module.bonus ?? []) {
      if (!problemIds.has(problemId)) errors.push(`Module ${module.id} bonus references missing problem:${problemId}`);
    }
  }

  for (const set of graph.problemSets) {
    assertUnique(`problem in set ${set.id}`, set.entries.map((entry) => entry.problem), errors);
    for (const entry of set.entries) {
      if (!problemIds.has(entry.problem)) errors.push(`Problem set ${set.id} references missing problem:${entry.problem}`);
    }
  }

  for (const problem of graph.problems) {
    validateProblem(problem, languages, errors);
  }

  return { ok: errors.length === 0, errors };
}

export async function validateContentFiles(graph: ContentGraph, contentRoot: string): Promise<ValidationResult> {
  const errors: string[] = [];
  for (const problem of graph.problems) {
    for (const [language, support] of Object.entries(problem.languages)) {
      await assertSupportFiles(problem.id, language, support, contentRoot, errors);
    }
    for (const part of problem.parts ?? []) {
      for (const [language, support] of Object.entries(part.languages ?? {})) {
        await assertSupportFiles(`${problem.id}#${part.id}`, language, support, contentRoot, errors);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

function validateProblem(problem: Problem, languages: Set<string>, errors: string[]) {
  if (!problem.tests.some((test) => test.visibility === "visible")) {
    errors.push(`Problem ${problem.id} has no visible tests`);
  }
  if (!problem.tests.some((test) => test.visibility === "hidden")) {
    errors.push(`Problem ${problem.id} has no hidden tests`);
  }
  for (const [language, support] of Object.entries(problem.languages)) {
    if (!languages.has(language)) errors.push(`Problem ${problem.id} declares unsupported language ${language}`);
    if (!support.entrypoint.trim()) errors.push(`Problem ${problem.id}/${language} missing entrypoint`);
    if (!support.starterPath.trim()) errors.push(`Problem ${problem.id}/${language} missing starterPath`);
    if (!support.referencePath.trim()) errors.push(`Problem ${problem.id}/${language} missing referencePath`);
  }
  for (const part of problem.parts ?? []) {
    if (!part.tests.some((test) => test.visibility === "visible")) {
      errors.push(`Problem ${problem.id} part ${part.id} has no visible tests`);
    }
    if (!part.tests.some((test) => test.visibility === "hidden")) {
      errors.push(`Problem ${problem.id} part ${part.id} has no hidden tests`);
    }
    for (const [language, support] of Object.entries(part.languages ?? {})) {
      if (!languages.has(language)) errors.push(`Problem ${problem.id} part ${part.id} declares unsupported language ${language}`);
      if (!support.entrypoint.trim()) errors.push(`Problem ${problem.id} part ${part.id}/${language} missing entrypoint`);
      if (!support.starterPath.trim()) errors.push(`Problem ${problem.id} part ${part.id}/${language} missing starterPath`);
      if (!support.referencePath.trim()) errors.push(`Problem ${problem.id} part ${part.id}/${language} missing referencePath`);
    }
  }
}

async function assertSupportFiles(
  problemLabel: string,
  language: string,
  support: ProblemLanguageSupport,
  contentRoot: string,
  errors: string[]
) {
  for (const [field, path] of Object.entries({
    starterPath: support.starterPath,
    referencePath: support.referencePath,
    solutionPath: support.solutionPath
  })) {
    if (!path) continue;
    try {
      await access(resolve(contentRoot, path));
    } catch {
      errors.push(`${problemLabel}/${language} ${field} points to missing file ${path}`);
    }
  }
}

function assertUnique(label: string, ids: string[], errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

function refExists(
  ref: ContentRef,
  moduleIds: Set<string>,
  problemSetIds: Set<string>,
  problemIds: Set<string>
): boolean {
  if (ref.kind === "module") return moduleIds.has(ref.id);
  if (ref.kind === "problem-set") return problemSetIds.has(ref.id);
  if (ref.kind === "problem") return problemIds.has(ref.id);
  return ref.kind === ("lesson" as ContentKind) || ref.kind === ("quiz" as ContentKind)
    ? true
    : false;
}
