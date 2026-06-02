import { resolve } from "node:path";
import { defaultContentRoot, loadContentGraph } from "../content/loadContentGraph.js";
import { type BuildMode, createRunnerDaemonServer } from "../daemon/server.js";

const buildMode: BuildMode = process.env.DSA_COACH_BUILD_MODE === "release" ? "release" : "development";
const contentRoot = resolve(buildMode === "development"
  ? (process.env.DSA_COACH_CONTENT_ROOT ?? defaultContentRoot)
  : defaultContentRoot);
const graph = await loadContentGraph(contentRoot);
const server = createRunnerDaemonServer({
  graph,
  contentRoot,
  buildMode,
  userDataRoot: process.env.DSA_COACH_USER_DATA_DIR
});

const port = Number(process.env.DSA_COACH_NEXT_PORT ?? 4777);
server.listen(port, "127.0.0.1", () => {
  console.log(`DSA Coach Next runner daemon listening on http://127.0.0.1:${port}`);
});
