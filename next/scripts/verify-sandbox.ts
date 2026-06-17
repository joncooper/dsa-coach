import { unlink } from "node:fs/promises";
import { loadContentGraph } from "../src/content/loadContentGraph.js";
import { runtimeLanguagePacks } from "../src/languages/languagePacks.js";
import { LocalRunner } from "../src/runner/localRunner.js";
import { sandboxAvailable } from "../src/runner/processSandbox.js";

const escapePath = "/tmp/dsa-coach-sandbox-escape";
const graph = await loadContentGraph();
const problem = graph.problems.find((candidate) => candidate.id === "sum-positive-readings");
if (!problem) throw new Error("Missing sum-positive-readings");

if (!(await sandboxAvailable())) {
  throw new Error("macOS sandbox-exec is not available from this process");
}

const packs = await runtimeLanguagePacks();
const available = new Map(packs.map((pack) => [pack.id, pack.runner.strategy !== "browser-worker" && pack.runner.installedByDefault]));
const runner = new LocalRunner(graph);
const checks = [
  ...languageChecks("typescript", available.get("typescript"), typescriptChecks()),
  ...languageChecks("python", available.get("python"), pythonChecks()),
  ...languageChecks("go", available.get("go"), goChecks()),
  ...languageChecks("scala", available.get("scala"), scalaChecks())
];

const failures: unknown[] = [];
for (const check of checks) {
  await unlink(escapePath).catch(() => undefined);
  const result = await runner.run({
    language: check.language,
    problemId: problem.id,
    code: check.code,
    includeHidden: false,
    timeoutMs: 5000
  });
  const escaped = await fileExists(escapePath);
  if (result.status !== "passed" || escaped) {
    failures.push({
      language: check.language,
      name: check.name,
      status: result.status,
      escaped,
      stderr: result.stderr,
      firstFailed: result.tests.find((test) => !test.passed)
    });
  }
}

console.log(JSON.stringify({ checked: checks.length, failures: failures.length }, null, 2));
if (failures.length) {
  console.log(JSON.stringify(failures, null, 2));
  process.exit(1);
}

function languageChecks(language: string, isAvailable: boolean | undefined, checks: Array<{ name: string; code: string }>) {
  if (!isAvailable) {
    console.log(`skipping ${language}: runner toolchain is not available`);
    return [];
  }
  return checks.map((check) => ({ ...check, language }));
}

function typescriptChecks() {
  const base = "function expected(readings: number[]): number { return readings.filter((value) => value > 0).reduce((sum, value) => sum + value, 0); }";
  return [
    {
      name: "typescript blocks writes outside workdir",
      code: `import fs from "node:fs";
${base}
export function sumPositiveReadings(readings: number[]): number {
  try { fs.writeFileSync(${JSON.stringify(escapePath)}, "bad"); return 999; }
  catch { return expected(readings); }
}
`
    },
    {
      name: "typescript blocks subprocesses",
      code: `import childProcess from "node:child_process";
${base}
export function sumPositiveReadings(readings: number[]): number {
  try { childProcess.execFileSync("/bin/echo", ["bad"]); return 999; }
  catch { return expected(readings); }
}
`
    }
  ];
}

function pythonChecks() {
  const expected = "def expected(readings):\n    return sum(value for value in readings if value > 0)\n";
  return [
    {
      name: "python blocks writes outside workdir",
      code: `${expected}
def sum_positive_readings(readings):
    try:
        open(${JSON.stringify(escapePath)}, "w").write("bad")
        return 999
    except Exception:
        return expected(readings)
`
    },
    {
      name: "python blocks subprocesses",
      code: `${expected}
def sum_positive_readings(readings):
    try:
        import subprocess
        subprocess.check_output(["/bin/echo", "bad"])
        return 999
    except Exception:
        return expected(readings)
`
    },
    {
      name: "python blocks sockets",
      code: `${expected}
def sum_positive_readings(readings):
    try:
        import socket
        sock = socket.socket()
        sock.bind(("127.0.0.1", 0))
        sock.close()
        return 999
    except Exception:
        return expected(readings)
`
    }
  ];
}

function goChecks() {
  const expected = `func expected(readings []int) int {
\ttotal := 0
\tfor _, value := range readings {
\t\tif value > 0 {
\t\t\ttotal += value
\t\t}
\t}
\treturn total
}
`;
  return [
    {
      name: "go blocks writes outside workdir",
      code: `package solution

import "os"

${expected}
func SumPositiveReadings(readings []int) int {
\tif err := os.WriteFile(${JSON.stringify(escapePath)}, []byte("bad"), 0600); err == nil {
\t\treturn 999
\t}
\treturn expected(readings)
}
`
    },
    {
      name: "go blocks subprocesses",
      code: `package solution

import "os/exec"

${expected}
func SumPositiveReadings(readings []int) int {
\tif err := exec.Command("/bin/echo", "bad").Run(); err == nil {
\t\treturn 999
\t}
\treturn expected(readings)
}
`
    },
    {
      name: "go blocks sockets",
      code: `package solution

import "net"

${expected}
func SumPositiveReadings(readings []int) int {
\tlistener, err := net.Listen("tcp", "127.0.0.1:0")
\tif err == nil {
\t\tlistener.Close()
\t\treturn 999
\t}
\treturn expected(readings)
}
`
    }
  ];
}

function scalaChecks() {
  const expected = `  private def expected(readings: Seq[Int]): Int = readings.filter(_ > 0).sum
`;
  return [
    {
      name: "scala blocks writes outside workdir",
      code: `object Solution {
${expected}
  def sumPositiveReadings(readings: Seq[Int]): Int = {
    try {
      java.nio.file.Files.writeString(java.nio.file.Path.of(${JSON.stringify(escapePath)}), "bad")
      999
    } catch {
      case _: Throwable => expected(readings)
    }
  }
}
`
    },
    {
      name: "scala blocks subprocesses",
      code: `object Solution {
${expected}
  def sumPositiveReadings(readings: Seq[Int]): Int = {
    try {
      new ProcessBuilder("/bin/echo", "bad").start().waitFor()
      999
    } catch {
      case _: Throwable => expected(readings)
    }
  }
}
`
    },
    {
      name: "scala blocks sockets",
      code: `object Solution {
${expected}
  def sumPositiveReadings(readings: Seq[Int]): Int = {
    try {
      val socket = new java.net.ServerSocket(0)
      socket.close()
      999
    } catch {
      case _: Throwable => expected(readings)
    }
  }
}
`
    }
  ];
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await unlink(path);
    return true;
  } catch {
    return false;
  }
}
