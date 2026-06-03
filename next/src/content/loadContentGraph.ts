import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ContentGraph, Module, Problem, ProblemSet, Scenario, ScenarioSet, Track } from "../core/types.js";

interface CatalogFile {
  version: number;
  tracks: Track[];
  modules: string[];
  problemSets: string[];
  scenarioSets?: string[];
  problems: string[];
  scenarios?: string[];
}

export const defaultContentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../content");

export async function loadContentGraph(contentRoot = defaultContentRoot): Promise<ContentGraph> {
  const catalog = await readJson<CatalogFile>(resolve(contentRoot, "catalog.json"));
  const [modules, problemSets, scenarioSets, problems, scenarios] = await Promise.all([
    Promise.all(catalog.modules.map((path) => readJson<Module>(resolve(contentRoot, path)))),
    Promise.all(catalog.problemSets.map((path) => readJson<ProblemSet>(resolve(contentRoot, path)))),
    Promise.all((catalog.scenarioSets ?? []).map((path) => readJson<ScenarioSet>(resolve(contentRoot, path)))),
    Promise.all(catalog.problems.map((path) => readJson<Problem>(resolve(contentRoot, path)))),
    Promise.all((catalog.scenarios ?? []).map((path) => readJson<Scenario>(resolve(contentRoot, path))))
  ]);

  return {
    version: catalog.version,
    tracks: catalog.tracks,
    modules,
    problemSets,
    scenarioSets,
    problems,
    scenarios
  };
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}
