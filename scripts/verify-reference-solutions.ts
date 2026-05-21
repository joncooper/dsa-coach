import { course } from "../src/content/course";
import type { Problem } from "../src/types";
import { runProblemTests } from "./lib/pythonVerify";

/** Verify a problem's referenceCode and (if present) its solutionCode. */
export function verifyProblemReference(problem: Problem): string[] {
  const tests = [...problem.visibleTests, ...problem.hiddenTests];
  const out = runProblemTests({
    label: `${problem.id} [reference]`,
    code: problem.referenceCode,
    entrypoint: problem.entrypoint,
    adapter: problem.adapter,
    tests
  });
  if (problem.solutionCode) {
    out.push(
      ...runProblemTests({
        label: `${problem.id} [solution]`,
        code: problem.solutionCode,
        entrypoint: problem.entrypoint,
        adapter: problem.adapter,
        tests
      })
    );
  }
  return out;
}

/** Verify referenceCode and solutionCode for every part of a problem. */
function verifyParts(problem: Problem): string[] {
  if (!problem.parts?.length) return [];
  const out: string[] = [];
  for (const part of problem.parts) {
    const tests = [...part.visibleTests, ...part.hiddenTests];
    out.push(
      ...runProblemTests({
        label: `${problem.id}#${part.id} [reference]`,
        code: part.referenceCode,
        entrypoint: part.entrypoint,
        adapter: problem.adapter,
        tests
      })
    );
    if (part.solutionCode) {
      out.push(
        ...runProblemTests({
          label: `${problem.id}#${part.id} [solution]`,
          code: part.solutionCode,
          entrypoint: part.entrypoint,
          adapter: problem.adapter,
          tests
        })
      );
    }
  }
  return out;
}

const setProblems = (course.problemSets ?? []).flatMap((set) => set.problems);
const allProblems = [...course.problems, ...setProblems];

const failures = [...allProblems.flatMap(verifyProblemReference), ...allProblems.flatMap(verifyParts)];

const partCount = allProblems.reduce((total, problem) => total + (problem.parts?.length ?? 0), 0);
const solutionCount =
  allProblems.filter((problem) => problem.solutionCode).length +
  allProblems.reduce((total, problem) => total + (problem.parts?.filter((part) => part.solutionCode).length ?? 0), 0);

if (failures.length) {
  console.error("Reference/solution verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Reference + solution OK: ${allProblems.length} problems verified (${setProblems.length} from problem sets, ${partCount} parts, ${solutionCount} solutionCode bodies).`
);
