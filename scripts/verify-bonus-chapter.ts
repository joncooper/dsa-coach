import type { BonusSeed } from "../src/content/bonus/types";
import { runProblemTests } from "./lib/pythonVerify";

/**
 * Verify one chapter's authored bonus problems in isolation: schema rules,
 * within-chapter uniqueness, and Python correctness of every solution. Imports
 * only the one chapter file, so chapters can be authored and checked in
 * parallel without touching the whole course build.
 *
 *   bun scripts/verify-bonus-chapter.ts <chapter-id>
 */

const VALID_DIFFICULTY = new Set(["warmup", "easy", "medium", "hard"]);
const VALID_ADAPTER = new Set(["default", "array", "linked-list", "binary-tree", "graph", "heap", "grid"]);
const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Mirrors validate.ts: collapses identifiers + numbers so structural twins collide. */
function fingerprint(value: string): string {
  return value
    .toLowerCase()
    .replace(/def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g, "def fn(")
    .replace(/[0-9]+/g, "#")
    .replace(/[^a-z#]+/g, " ")
    .trim();
}

async function main() {
  const chapterId = process.argv[2];
  if (!chapterId) {
    console.error("Usage: bun scripts/verify-bonus-chapter.ts <chapter-id>");
    process.exit(2);
  }

  let seeds: BonusSeed[];
  try {
    const mod = (await import(`../src/content/bonus/${chapterId}.ts`)) as { bonus?: BonusSeed[] };
    if (!Array.isArray(mod.bonus)) {
      console.error(`src/content/bonus/${chapterId}.ts must 'export const bonus: BonusSeed[]'.`);
      process.exit(1);
    }
    seeds = mod.bonus;
  } catch (error) {
    console.error(`Could not import src/content/bonus/${chapterId}.ts: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  const errors: string[] = [];
  const ids = new Set<string>();
  const codeFingerprints = new Map<string, string>();
  const promptFingerprints = new Map<string, string>();

  function structural(label: string, ok: boolean, message: string) {
    if (!ok) errors.push(`${label}: ${message}`);
  }

  for (const seed of seeds) {
    const label = seed.id || "(missing id)";
    structural(label, typeof seed.id === "string" && seed.id.length > 0, "missing id");
    structural(label, !ids.has(seed.id), "duplicate id within chapter");
    ids.add(seed.id);
    structural(label, seed.chapterId === chapterId, `chapterId must be "${chapterId}", got "${seed.chapterId}"`);
    structural(label, typeof seed.title === "string" && seed.title.length > 0, "missing title");
    structural(label, VALID_DIFFICULTY.has(seed.difficulty), `bad difficulty "${seed.difficulty}"`);
    structural(label, Array.isArray(seed.patterns) && seed.patterns.length >= 1, "patterns must be non-empty");
    structural(label, (seed.patterns ?? []).includes(chapterId), `patterns must include the chapter id "${chapterId}"`);
    structural(label, IDENTIFIER.test(seed.entrypoint ?? ""), `entrypoint "${seed.entrypoint}" is not a valid identifier`);
    structural(label, typeof seed.signature === "string", "missing signature");
    structural(label, seed.adapter === undefined || VALID_ADAPTER.has(seed.adapter), `bad adapter "${seed.adapter}"`);
    structural(label, (seed.prompt ?? "").length >= 40, "prompt must be >= 40 chars");
    structural(label, Array.isArray(seed.constraints) && seed.constraints.length >= 1, "need >= 1 constraint");
    structural(label, (seed.constraints ?? []).every((c) => c.length >= 5), "each constraint must be >= 5 chars");
    structural(label, Array.isArray(seed.hints) && seed.hints.length >= 2, "need >= 2 hints");
    structural(label, (seed.hints ?? []).every((h) => h.length >= 8), "each hint must be >= 8 chars");
    structural(label, (seed.solution ?? "").length >= 30, "solution must be >= 30 chars");
    structural(label, (seed.walkthrough ?? "").length >= 30, "walkthrough must be >= 30 chars");
    structural(label, Array.isArray(seed.followUps) && seed.followUps.length >= 2, "need >= 2 followUps");
    structural(label, (seed.code ?? "").includes(`def ${seed.entrypoint}(`), `code must define def ${seed.entrypoint}(`);
    structural(label, Array.isArray(seed.visibleTests) && seed.visibleTests.length >= 1, "need >= 1 visible test");
    structural(label, Array.isArray(seed.hiddenTests) && seed.hiddenTests.length >= 1, "need >= 1 hidden test");
    structural(label, (seed.time ?? "").length >= 3, "time complexity must be >= 3 chars");
    structural(label, (seed.space ?? "").length >= 3, "space complexity must be >= 3 chars");

    const testNames = [...(seed.visibleTests ?? []), ...(seed.hiddenTests ?? [])].map((t) => t.name);
    structural(label, new Set(testNames).size === testNames.length, "duplicate test name within problem");

    if (seed.code) {
      const fp = fingerprint(seed.code);
      const twin = codeFingerprints.get(fp);
      if (twin) errors.push(`${label}: solution is structurally identical to ${twin} — make it genuinely different`);
      else codeFingerprints.set(fp, seed.id);
    }
    if (seed.prompt) {
      const fp = fingerprint(seed.prompt);
      const twin = promptFingerprints.get(fp);
      if (twin) errors.push(`${label}: prompt is too similar to ${twin}`);
      else promptFingerprints.set(fp, seed.id);
    }
  }

  // Python correctness — only worth running once structure is sane.
  if (!errors.length) {
    for (const seed of seeds) {
      const failures = runProblemTests({
        label: seed.id,
        code: seed.code,
        entrypoint: seed.entrypoint,
        adapter: seed.adapter ?? "default",
        tests: [...seed.visibleTests, ...seed.hiddenTests]
      });
      errors.push(...failures);
    }
  }

  if (errors.length) {
    console.error(`FAIL ${chapterId}: ${errors.length} problem(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`OK ${chapterId}: ${seeds.length} bonus problems verified (schema + Python).`);
}

void main();
