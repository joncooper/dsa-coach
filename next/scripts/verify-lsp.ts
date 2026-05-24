import { loadContentGraph } from "../src/content/loadContentGraph.js";
import { LspManager } from "../src/lsp/manager.js";

interface LspSmokeCase {
  language: string;
  code: string;
  completionCode: string;
  completionMarker: string;
  hoverMarker: string;
  signatureMarker: string;
  definitionMarker: string;
}

const cases: LspSmokeCase[] = [
  {
    language: "typescript",
    code: `function helper(value: number): number {
  return value + 1;
}

export function sumPositiveReadings(readings: number[]): number {
  const value = helper(1);
  return Math.max(value, readings.length);
}
`,
    completionCode: `function helper(value: number): number {
  return value + 1
}

export function sumPositiveReadings(readings: number[]): number {
  const value = helper(1)
  return Math.
}
`,
    completionMarker: "Math.",
    hoverMarker: "helper(1)",
    signatureMarker: "helper(",
    definitionMarker: "helper(1)"
  },
  {
    language: "python",
    code: `import math

def helper(value: int) -> int:
    return value + 1

def sum_positive_readings(readings):
    value = helper(1)
    return math.floor(value)
`,
    completionCode: `import math

def helper(value: int) -> int:
    return value + 1

def sum_positive_readings(readings):
    value = helper(1)
    return math.
`,
    completionMarker: "math.",
    hoverMarker: "helper(1)",
    signatureMarker: "helper(",
    definitionMarker: "helper(1)"
  },
  {
    language: "go",
    code: `package solution

import "strings"

func helper(value int) int {
	return value + 1
}

func SumPositiveReadings(readings []int) int {
	value := helper(1)
	value += strings.Count("abc", "a")
	return value
}
`,
    completionCode: `package solution

import "strings"

func helper(value int) int {
	return value + 1
}

func SumPositiveReadings(readings []int) int {
	value := helper(1)
	strings.
	return value
}
`,
    completionMarker: "strings.",
    hoverMarker: "helper(1)",
    signatureMarker: "helper(",
    definitionMarker: "helper(1)"
  },
  {
    language: "scala",
    code: `object Solution {
  def helper(value: Int): Int = value + 1

  def sumPositiveReadings(readings: List[Int]): Int = {
    val value = helper(1)
    List(1, 2, 3).sum + value
  }
}
`,
    completionCode: `object Solution {
  def helper(value: Int): Int = value + 1

  def sumPositiveReadings(readings: List[Int]): Int = {
    val value = helper(1)
    List(1, 2, 3).
  }
}
`,
    completionMarker: "List(1, 2, 3).",
    hoverMarker: "helper(1)",
    signatureMarker: "helper(",
    definitionMarker: "helper(1)"
  }
];

const languageArg = process.argv.find((arg) => arg.startsWith("--languages="));
const requestedLanguages = languageArg
  ? new Set(languageArg.replace("--languages=", "").split(",").map((value) => value.trim()).filter(Boolean))
  : undefined;
const selectedCases = requestedLanguages
  ? cases.filter((smoke) => requestedLanguages.has(smoke.language))
  : cases;

if (!selectedCases.length) {
  throw new Error(`No LSP smoke cases matched ${languageArg}`);
}

const graph = await loadContentGraph();
const manager = new LspManager({ graph });
const failures: string[] = [];

try {
  for (const smoke of selectedCases) {
    console.log(`Checking ${smoke.language}`);
    const completion = await manager.complete({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.completionCode,
      cursor: cursorAfter(smoke.completionCode, smoke.completionMarker),
      timeoutMs: 30000
    });
    console.log(`  completion: ${completion.status} (${completion.items.length})`);
    if (completion.status !== "ok" || completion.items.length === 0) {
      failures.push(`${smoke.language}: completion failed (${completion.status}) ${completion.message ?? ""}`);
    }

    const diagnostics = await manager.diagnostics({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      timeoutMs: 5000
    });
    console.log(`  diagnostics: ${diagnostics.status} (${diagnostics.diagnostics.length})`);
    if (diagnostics.status !== "ok") {
      failures.push(`${smoke.language}: diagnostics failed (${diagnostics.status}) ${diagnostics.message ?? ""}`);
    }

    const hover = await manager.hover({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      cursor: cursorAt(smoke.code, smoke.hoverMarker),
      timeoutMs: 5000
    });
    console.log(`  hover: ${hover.status}${hover.hover ? " (content)" : ""}`);
    if (hover.status !== "ok") {
      failures.push(`${smoke.language}: hover failed (${hover.status}) ${hover.message ?? ""}`);
    }

    const signature = await manager.signatureHelp({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      cursor: cursorAfter(smoke.code, smoke.signatureMarker),
      timeoutMs: 5000
    });
    console.log(`  signature help: ${signature.status}${signature.help ? ` (${signature.help.signatures.length})` : ""}`);
    if (signature.status !== "ok") {
      failures.push(`${smoke.language}: signature help failed (${signature.status}) ${signature.message ?? ""}`);
    }

    const format = await manager.format({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      timeoutMs: 10000
    });
    console.log(`  format: ${format.status} (${format.edits.length})`);
    if (format.status !== "ok") {
      failures.push(`${smoke.language}: formatting failed (${format.status}) ${format.message ?? ""}`);
    }

    const symbols = await manager.symbols({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      timeoutMs: 10000
    });
    console.log(`  symbols: ${symbols.status} (${symbols.symbols.length})`);
    if (symbols.status !== "ok" || symbols.symbols.length === 0) {
      failures.push(`${smoke.language}: symbols failed (${symbols.status}) ${symbols.message ?? ""}`);
    }

    const definition = await manager.definition({
      language: smoke.language,
      problemId: "sum-positive-readings",
      code: smoke.code,
      cursor: cursorAt(smoke.code, smoke.definitionMarker),
      timeoutMs: 10000
    });
    console.log(`  definition: ${definition.status} (${definition.definitions.length})`);
    if (definition.status !== "ok") {
      failures.push(`${smoke.language}: definition failed (${definition.status}) ${definition.message ?? ""}`);
    }
  }
} finally {
  await manager.dispose();
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`LSP verification passed for ${selectedCases.length} languages`);

function cursorAfter(code: string, marker: string): number {
  const index = code.indexOf(marker);
  if (index < 0) throw new Error(`Missing marker ${marker}`);
  return index + marker.length;
}

function cursorAt(code: string, marker: string): number {
  const index = code.indexOf(marker);
  if (index < 0) throw new Error(`Missing marker ${marker}`);
  return index;
}
