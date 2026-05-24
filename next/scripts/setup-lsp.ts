import { spawn } from "node:child_process";
import { createGunzip } from "node:zlib";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { languagePacks } from "../src/languages/languagePacks.js";
import { resolveLspCommand } from "../src/lsp/manager.js";
import type { LanguagePack } from "../src/core/types.js";

const checkOnly = process.argv.includes("--check");
const projectRoot = resolve(".");
const lspRoot = join(projectRoot, ".runner-cache", "lsp");
const binDir = join(lspRoot, "bin");
const cacheDir = join(lspRoot, "coursier-cache");

await mkdir(binDir, { recursive: true });

for (const pack of languagePacks) {
  if (!pack.lsp) continue;
  const before = await resolveLspCommand(pack.lsp, projectRoot);
  if (before.resolvedCommand) {
    console.log(`${pack.label}: ${before.resolvedCommand}`);
    continue;
  }
  if (checkOnly) {
    console.log(`${pack.label}: missing (${before.message})`);
    continue;
  }

  console.log(`${pack.label}: installing ${pack.lsp.command}`);
  await installLanguageServer(pack);
  const after = await resolveLspCommand(pack.lsp, projectRoot);
  if (!after.resolvedCommand) {
    throw new Error(`${pack.label}: install finished but ${pack.lsp.command} is still unavailable`);
  }
  console.log(`${pack.label}: ${after.resolvedCommand}`);
}

await ensureFormatter("Python formatter", "ruff", async () => {
  await run("uv", ["tool", "install", "ruff"], {
    XDG_DATA_HOME: join(lspRoot, "uv-data"),
    UV_CACHE_DIR: join(lspRoot, "uv-cache"),
    UV_NO_MANAGED_PYTHON: "1"
  });
});

await ensureFormatter("Scala formatter", "scalafmt", async () => {
  const cs = await ensureCoursier();
  await run(cs, ["install", "scalafmt", "--install-dir", binDir], {
    COURSIER_CACHE: cacheDir
  });
});

async function installLanguageServer(pack: LanguagePack): Promise<void> {
  const spec = pack.lsp;
  if (!spec?.install) throw new Error(`${pack.label}: no installer metadata`);

  if (spec.install.kind === "npm") {
    if (!spec.install.command || !spec.install.args?.length) {
      throw new Error(`${pack.label}: npm installer metadata is incomplete`);
    }
    await run(spec.install.command, spec.install.args, {});
    return;
  }

  if (spec.install.kind === "go") {
    const packageName = spec.install.packageName;
    if (!packageName) throw new Error(`${pack.label}: missing Go package name`);
    await run("go", ["install", `${packageName}@latest`], { GOBIN: binDir });
    return;
  }

  if (spec.install.kind === "coursier") {
    const cs = await ensureCoursier();
    await run(cs, ["install", spec.install.packageName ?? spec.command, "--install-dir", binDir], {
      COURSIER_CACHE: cacheDir
    });
    return;
  }

  throw new Error(`${pack.label}: ${spec.install.notes ?? "manual language-server installation required"}`);
}

async function ensureFormatter(label: string, command: string, install: () => Promise<void>): Promise<void> {
  const before = await resolveLspCommand({ command }, projectRoot);
  if (before.resolvedCommand) {
    console.log(`${label}: ${before.resolvedCommand}`);
    return;
  }
  if (checkOnly) {
    console.log(`${label}: missing (${before.message})`);
    return;
  }

  console.log(`${label}: installing ${command}`);
  await install();
  const after = await resolveLspCommand({ command }, projectRoot);
  if (!after.resolvedCommand) {
    throw new Error(`${label}: install finished but ${command} is still unavailable`);
  }
  console.log(`${label}: ${after.resolvedCommand}`);
}

async function ensureCoursier(): Promise<string> {
  const existing = await resolveLspCommand({ command: "cs" }, projectRoot);
  if (existing.resolvedCommand) return existing.resolvedCommand;

  const systemCoursier = await resolveLspCommand({ command: "coursier" }, projectRoot);
  if (systemCoursier.resolvedCommand) return systemCoursier.resolvedCommand;

  const url = coursierLauncherUrl();
  if (!url) throw new Error(`No Coursier launcher is configured for ${process.platform}/${process.arch}`);
  const target = join(binDir, "cs");
  console.log(`Coursier: downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download Coursier: ${response.status} ${response.statusText}`);
  const compressed = Buffer.from(await response.arrayBuffer());
  await writeFile(target, await gunzip(compressed));
  await chmod(target, 0o755);
  return target;
}

function coursierLauncherUrl(): string | undefined {
  if (process.platform === "darwin" && process.arch === "arm64") {
    return "https://github.com/coursier/coursier/releases/latest/download/cs-aarch64-apple-darwin.gz";
  }
  if (process.platform === "darwin" && process.arch === "x64") {
    return "https://github.com/coursier/launchers/raw/master/cs-x86_64-apple-darwin.gz";
  }
  if (process.platform === "linux" && process.arch === "arm64") {
    return "https://github.com/VirtusLab/coursier-m1/releases/latest/download/cs-aarch64-pc-linux.gz";
  }
  if (process.platform === "linux" && process.arch === "x64") {
    return "https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz";
  }
  return undefined;
}

function gunzip(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolvePromise, reject) => {
    const chunks: Buffer[] = [];
    const stream = createGunzip();
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolvePromise(Buffer.concat(chunks)));
    stream.end(buffer);
  });
}

function run(command: string, args: string[], env: Record<string, string>): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: {
        ...process.env,
        PATH: [binDir, join(projectRoot, "node_modules", ".bin"), process.env.PATH ?? ""].join(":"),
        ...env
      },
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}
