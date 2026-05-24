import { defaultContentRoot, loadContentGraph } from "../content/loadContentGraph.js";
import { createRunnerDaemonServer } from "../daemon/server.js";

const graph = await loadContentGraph();
const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot });

const port = Number(process.env.DSA_COACH_NEXT_PORT ?? 4777);
server.listen(port, "127.0.0.1", () => {
  console.log(`DSA Coach Next runner daemon listening on http://127.0.0.1:${port}`);
});
