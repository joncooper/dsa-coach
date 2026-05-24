import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ContentGraph, Module, Problem, ProblemSet, Track } from "../core/types.js";

interface CatalogFile {
  version: number;
  tracks: Track[];
  modules: string[];
  problemSets: string[];
  problems: string[];
}

export const defaultContentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../content");

export async function loadContentGraph(contentRoot = defaultContentRoot): Promise<ContentGraph> {
  const catalog = await readJson<CatalogFile>(resolve(contentRoot, "catalog.json"));
  const [modules, problemSets, problems] = await Promise.all([
    Promise.all(catalog.modules.map((path) => readJson<Module>(resolve(contentRoot, path)))),
    Promise.all(catalog.problemSets.map((path) => readJson<ProblemSet>(resolve(contentRoot, path)))),
    Promise.all(catalog.problems.map((path) => readJson<Problem>(resolve(contentRoot, path))))
  ]);

  return {
    version: catalog.version,
    tracks: catalog.tracks,
    modules,
    problemSets,
    problems
  };
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}
