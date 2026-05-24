import type { Problem, ProblemLanguageSupport, ProblemTest, RunRequest } from "../core/types.js";

export interface RunTarget {
  label: string;
  tests: ProblemTest[];
  languages: Record<string, ProblemLanguageSupport>;
}

export function selectRunTarget(problem: Problem, request: RunRequest): RunTarget | undefined {
  if (!request.partId) {
    return {
      label: problem.id,
      tests: problem.tests,
      languages: problem.languages
    };
  }
  const part = problem.parts?.find((candidate) => candidate.id === request.partId);
  if (!part) return undefined;
  return {
    label: `${problem.id}#${part.id}`,
    tests: part.tests,
    languages: part.languages ?? problem.languages
  };
}
