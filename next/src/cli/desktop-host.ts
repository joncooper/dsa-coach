import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { defaultContentRoot, loadContentGraph } from "../content/loadContentGraph.js";
import { type BuildMode, createRunnerDaemonServer } from "../daemon/server.js";

const port = parsePort(process.argv);
const parentPid = parseParentPid(process.argv);
const staticRoot = resolve(process.env.DSA_COACH_STATIC_ROOT ?? "dist/web");
const userDataRoot = resolve(process.env.DSA_COACH_USER_DATA_DIR ?? ".user-data");
const buildMode = parseBuildMode(process.env.DSA_COACH_BUILD_MODE);
const contentRoot = buildMode === "development"
  ? resolve(process.env.DSA_COACH_CONTENT_ROOT ?? defaultContentRoot)
  : defaultContentRoot;
const runtimeStatusPath = resolve(process.env.DSA_COACH_RUNTIME_STATUS_PATH ?? resolve(userDataRoot, "../runtime.json"));

if (!existsSync(resolve(staticRoot, "index.html"))) {
  console.error(`Built web assets were not found at ${staticRoot}. Run "bun run build" before launching the desktop app.`);
  process.exit(1);
}

const graph = await loadContentGraph(contentRoot);
const server = createRunnerDaemonServer({
  graph,
  contentRoot,
  buildMode,
  staticRoot,
  userDataRoot
});

let closing = false;

server.on("error", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    console.error("Desktop host failed to resolve its local address.");
    process.exit(1);
  }
  const url = `http://127.0.0.1:${address.port}/`;
  console.log(`DSA_COACH_DESKTOP_URL=${url}`);
  void writeRuntimeStatus(url).catch((error) => {
    console.error(`Could not write runtime status: ${error instanceof Error ? error.message : String(error)}`);
  });
});

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
if (parentPid) {
  setInterval(() => {
    try {
      process.kill(parentPid, 0);
    } catch {
      shutdown();
    }
  }, 1000).unref();
}

function parsePort(args: string[]): number {
  const index = args.indexOf("--port");
  if (index === -1) return 0;
  const value = Number(args[index + 1]);
  if (!Number.isInteger(value) || value < 0 || value > 65535) {
    throw new Error(`Invalid --port value: ${args[index + 1] ?? ""}`);
  }
  return value;
}

function parseParentPid(args: string[]): number | undefined {
  const index = args.indexOf("--parent-pid");
  if (index === -1) return undefined;
  const value = Number(args[index + 1]);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid --parent-pid value: ${args[index + 1] ?? ""}`);
  }
  return value;
}

function parseBuildMode(value: string | undefined): BuildMode {
  return value === "release" ? "release" : "development";
}

async function writeRuntimeStatus(baseUrl: string) {
  await mkdir(dirname(runtimeStatusPath), { recursive: true });
  await writeFile(runtimeStatusPath, `${JSON.stringify({
    baseUrl,
    pid: process.pid,
    mode: buildMode,
    contentRoot,
    staticRoot,
    startedAt: new Date().toISOString()
  }, null, 2)}\n`, "utf8");
}

function shutdown() {
  if (closing) return;
  closing = true;
  void unlink(runtimeStatusPath).catch(() => {});
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2500).unref();
}
