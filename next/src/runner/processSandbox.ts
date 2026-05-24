import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface SandboxProcessResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  sandboxed: boolean;
}

export interface SandboxProcessOptions {
  command: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
  env?: Record<string, string>;
  maxOutputBytes?: number;
  sandbox?: boolean;
  writePaths?: string[];
  processExecPaths?: string[];
  allowProcessFork?: boolean;
  allowAnyProcessExec?: boolean;
}

let sandboxAvailability: Promise<boolean> | undefined;

export async function withSandboxWorkdir<T>(prefix: string, fn: (workdir: string) => Promise<T>): Promise<T> {
  const workdir = await mkdtemp(join(tmpdir(), prefix));
  try {
    await mkdir(join(workdir, "home"), { recursive: true });
    await mkdir(join(workdir, "tmp"), { recursive: true });
    return await fn(workdir);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

export async function commandExists(command: string): Promise<boolean> {
  const result = await runPlainProcess({
    command: "which",
    args: [command],
    cwd: process.cwd(),
    timeoutMs: 1000,
    maxOutputBytes: 4096
  });
  return result.exitCode === 0;
}

export async function commandOutput(command: string, args: string[], timeoutMs = 1000): Promise<string | undefined> {
  const result = await runPlainProcess({
    command,
    args,
    cwd: process.cwd(),
    timeoutMs,
    maxOutputBytes: 64 * 1024
  });
  return result.exitCode === 0 ? result.stdout.trim() : undefined;
}

export async function sandboxAvailable(): Promise<boolean> {
  sandboxAvailability ??= probeSandboxAvailable();
  return sandboxAvailability;
}

async function probeSandboxAvailable(): Promise<boolean> {
  if (process.platform !== "darwin") return false;
  try {
    await access("/usr/bin/sandbox-exec");
  } catch {
    return false;
  }
  const result = await runPlainProcess({
    command: "/usr/bin/sandbox-exec",
    args: ["-p", "(version 1)\n(allow default)", "/usr/bin/true"],
    cwd: process.cwd(),
    timeoutMs: 1000,
    maxOutputBytes: 4096
  });
  return result.exitCode === 0;
}

export async function runSandboxedProcess(options: SandboxProcessOptions): Promise<SandboxProcessResult> {
  if (options.sandbox === false || !(await sandboxAvailable())) {
    return runPlainProcess(options);
  }

  const realCwd = await realpath(options.cwd);
  const writePaths = [realCwd, ...await Promise.all((options.writePaths ?? []).map((path) => realpath(path)))];
  const executablePaths = await resolveExecutablePaths(options.command);
  const extraProcessExecPaths = (await Promise.all(
    (options.processExecPaths ?? []).map(async (path) => [path, await realpath(path)])
  )).flat();
  const processExecPaths = [
    ...executablePaths,
    ...extraProcessExecPaths
  ];
  const processExecRules = await Promise.all(processExecPaths.map(processExecRule));
  const profilePath = join(options.cwd, "sandbox.sb");
  await writeFile(
    profilePath,
    macosSandboxProfile(writePaths, processExecRules, {
      allowProcessFork: Boolean(options.allowProcessFork),
      allowAnyProcessExec: Boolean(options.allowAnyProcessExec)
    }),
    "utf8"
  );
  const result = await runPlainProcess({
    ...options,
    command: "/usr/bin/sandbox-exec",
    args: ["-f", profilePath, options.command, ...options.args]
  });
  return { ...result, sandboxed: true };
}

async function resolveExecutablePaths(command: string): Promise<string[]> {
  if (command.includes("/")) return unique([command, await realpath(command)]);
  const path = await commandOutput("which", [command]);
  if (!path) throw new Error(`Unable to resolve executable ${command}`);
  return unique([path, await realpath(path)]);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

async function runPlainProcess(options: SandboxProcessOptions): Promise<SandboxProcessResult> {
  return new Promise((resolve) => {
    const maxOutputBytes = options.maxOutputBytes ?? 1024 * 1024;
    const env = {
      PATH: process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: join(options.cwd, "home"),
      TMPDIR: join(options.cwd, "tmp"),
      TEMP: join(options.cwd, "tmp"),
      TMP: join(options.cwd, "tmp"),
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      ...options.env
    };
    const child = spawn(options.command, options.args, {
      cwd: options.cwd,
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let outputBytes = 0;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, options.timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= maxOutputBytes) stdout += chunk.toString("utf8");
      else child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= maxOutputBytes) stderr += chunk.toString("utf8");
      else child.kill("SIGKILL");
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: null,
        signal: null,
        stdout,
        stderr: error.message,
        timedOut,
        sandboxed: false
      });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode,
        signal,
        stdout,
        stderr,
        timedOut,
        sandboxed: false
      });
    });
  });
}

async function processExecRule(path: string): Promise<string> {
  const info = await stat(path);
  return info.isDirectory()
    ? `(subpath "${escapeSandboxPath(path)}")`
    : `(literal "${escapeSandboxPath(path)}")`;
}

function macosSandboxProfile(
  writePaths: string[],
  processExecRules: string[],
  options: { allowProcessFork: boolean; allowAnyProcessExec: boolean }
): string {
  const writeRules = writePaths.map((path) => `(subpath "${escapeSandboxPath(path)}")`).join(" ");
  const processExecRule = options.allowAnyProcessExec
    ? "(allow process-exec)"
    : `(allow process-exec ${processExecRules.join(" ")})`;
  const processForkRule = options.allowProcessFork ? "(allow process-fork)" : "";
  return `(version 1)
(deny default)
${processExecRule}
${processForkRule}
(allow signal)
(allow sysctl-read)
(allow mach-lookup)
(allow file-read*)
(allow file-write* ${writeRules})
(allow file-write* (literal "/dev/null"))
(deny network*)
`;
}

function escapeSandboxPath(path: string): string {
  return path.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
