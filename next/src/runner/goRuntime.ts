import { access } from "node:fs/promises";
import { join } from "node:path";
import { toolchainRoots } from "../runtime/paths.js";
import { commandOutput } from "./processSandbox.js";

export interface GoRuntime {
  command: string;
  goRoot?: string;
  goToolDir?: string;
  processExecPaths: string[];
}

export interface GoRuntimeResolution {
  runtime?: GoRuntime;
  message?: string;
}

export async function resolveGoRuntime(): Promise<GoRuntimeResolution> {
  for (const root of toolchainRoots()) {
    const goRoot = join(root, "go");
    const command = join(goRoot, "bin", "go");
    if (await fileExists(command)) {
      const goToolDir = await commandOutput(command, ["env", "GOTOOLDIR"], 1000);
      return {
        runtime: {
          command,
          goRoot,
          goToolDir,
          processExecPaths: [command, goToolDir].filter((path): path is string => Boolean(path))
        }
      };
    }
  }

  const command = await commandOutput("which", ["go"], 1000);
  if (!command) return { message: "Go is not installed and no bundled Go toolchain was found." };
  const goRoot = await commandOutput(command, ["env", "GOROOT"], 1000);
  const goToolDir = await commandOutput(command, ["env", "GOTOOLDIR"], 1000);
  return {
    runtime: {
      command,
      goRoot,
      goToolDir,
      processExecPaths: [command, goToolDir].filter((path): path is string => Boolean(path))
    }
  };
}

export async function goRuntimeAvailable(): Promise<boolean> {
  return Boolean((await resolveGoRuntime()).runtime);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
