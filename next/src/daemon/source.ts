import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ContentGraph, LanguageId, Problem } from "../core/types.js";
import { ContentCatalog } from "../core/graph.js";

export type SourceKind = "starter" | "reference" | "solution";

export interface SourceRequest {
  problemId: string;
  partId?: string;
  language: LanguageId;
  kind: SourceKind;
}

export async function readProblemSource(
  graph: ContentGraph,
  contentRoot: string,
  request: SourceRequest
): Promise<{ problem: Problem; code: string }> {
  const catalog = new ContentCatalog(graph);
  const problem = catalog.problem(request.problemId);
  if (!problem) throw new Error(`Unknown problem ${request.problemId}`);
  const part = request.partId ? problem.parts?.find((candidate) => candidate.id === request.partId) : undefined;
  if (request.partId && !part) throw new Error(`Problem ${request.problemId} has no part ${request.partId}`);
  const support = (part?.languages ?? problem.languages)[request.language];
  const label = request.partId ? `${request.problemId}#${request.partId}` : request.problemId;
  if (!support) throw new Error(`Problem ${label} does not support ${request.language}`);
  const path =
    request.kind === "starter"
      ? support.starterPath
      : request.kind === "reference"
        ? support.referencePath
        : support.solutionPath;
  if (!path) throw new Error(`Problem ${label}/${request.language} has no ${request.kind} source`);
  return {
    problem,
    code: await readFile(resolve(contentRoot, path), "utf8")
  };
}
