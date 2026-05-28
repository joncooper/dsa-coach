import { homedir } from "node:os";
import { join } from "node:path";
import { toolchainRoots } from "../runtime/paths.js";
import { commandOutput } from "./processSandbox.js";

export interface PythonRuntime {
  command: string;
  versionLabel: string;
  processExecPaths: string[];
  allowProcessFork: boolean;
}

export interface PythonRuntimeResolution {
  runtime?: PythonRuntime;
  message?: string;
}

interface PythonProbe {
  executable?: string;
  realExecutable?: string;
  version?: [number, number, number];
}

const PYTHON_PROBE = [
  "import json, os, sys",
  "print(json.dumps({",
  "  'executable': sys.executable,",
  "  'realExecutable': os.path.realpath(sys.executable),",
  "  'version': [sys.version_info.major, sys.version_info.minor, sys.version_info.micro]",
  "}))"
].join("\n");

const MINIMUM_PYTHON: [major: number, minor: number] = [3, 10];

export async function resolvePythonRuntime(): Promise<PythonRuntimeResolution> {
  const rejected: string[] = [];
  for (const command of pythonCandidates()) {
    const probeText = await commandOutput(command, ["-c", PYTHON_PROBE], 1500);
    if (!probeText) continue;
    const probe = parseProbe(probeText);
    if (!probe?.version) continue;
    const [major, minor, micro] = probe.version;
    const versionLabel = `${major}.${minor}.${micro}`;
    if (!supportedPythonVersion(major, minor)) {
      rejected.push(`${command} is Python ${versionLabel}`);
      continue;
    }
    const processExecPaths = unique([
      probe.executable,
      probe.realExecutable,
      ...pythonFrameworkExecPaths(command),
      ...pythonFrameworkExecPaths(probe.executable),
      ...pythonFrameworkExecPaths(probe.realExecutable)
    ].filter((path): path is string => Boolean(path)));
    return {
      runtime: {
        command,
        versionLabel,
        processExecPaths,
        allowProcessFork: processExecPaths.some((path) => path.includes("/Python.framework/Versions/"))
      }
    };
  }
  const detail = rejected.length ? ` Found only unsupported runtimes: ${rejected.join("; ")}.` : "";
  return { message: `Python 3.10 or newer is required.${detail}` };
}

function pythonCandidates(): string[] {
  const home = homedir();
  return unique([
    process.env.DSA_COACH_PYTHON,
    ...toolchainRoots().flatMap((root) => [
      join(root, "python", "bin", "python3"),
      join(root, "python", "bin", "python3.14"),
      join(root, "python", "bin", "python3.13"),
      join(root, "python", "bin", "python3.12"),
      join(root, "python", "bin", "python3.11"),
      join(root, "python", "bin", "python3.10")
    ]),
    `${home}/.local/bin/python3`,
    `${home}/.local/bin/python3.14`,
    `${home}/.local/bin/python3.13`,
    `${home}/.local/bin/python3.12`,
    `${home}/.local/bin/python3.11`,
    `${home}/.local/bin/python3.10`,
    `${home}/.pyenv/shims/python3`,
    "/opt/homebrew/bin/python3",
    "/opt/homebrew/bin/python3.14",
    "/opt/homebrew/bin/python3.13",
    "/opt/homebrew/bin/python3.12",
    "/opt/homebrew/bin/python3.11",
    "/opt/homebrew/bin/python3.10",
    "/usr/local/bin/python3",
    "/usr/local/bin/python3.14",
    "/usr/local/bin/python3.13",
    "/usr/local/bin/python3.12",
    "/usr/local/bin/python3.11",
    "/usr/local/bin/python3.10",
    "python3",
    "python3.14",
    "python3.13",
    "python3.12",
    "python3.11",
    "python3.10",
    "/usr/bin/python3"
  ].filter((path): path is string => Boolean(path)));
}

function parseProbe(probeText: string): PythonProbe | undefined {
  try {
    return JSON.parse(probeText.split("\n").filter(Boolean).at(-1) ?? "");
  } catch {
    return undefined;
  }
}

function supportedPythonVersion(major: number, minor: number): boolean {
  return major > MINIMUM_PYTHON[0] || (major === MINIMUM_PYTHON[0] && minor >= MINIMUM_PYTHON[1]);
}

function pythonFrameworkExecPaths(path: string | undefined): string[] {
  if (!path) return [];
  const marker = "/Python.framework/Versions/";
  const index = path.indexOf(marker);
  if (index === -1) return [];
  const rest = path.slice(index + marker.length);
  const version = rest.split("/")[0];
  return [`${path.slice(0, index)}${marker}${version}`];
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
