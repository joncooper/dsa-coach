import { once } from "node:events";
import { describe, expect, test } from "bun:test";
import { defaultContentRoot, loadContentGraph } from "../src/content/loadContentGraph.js";
import { createRunnerDaemonServer } from "../src/daemon/server.js";

describe("runner daemon API", () => {
  test("serves catalog, source, and run endpoints", async () => {
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const catalog = await fetch(`${base}/catalog`).then((res) => res.json() as Promise<{ problems: unknown[] }>);
      expect(catalog.problems).toHaveLength(graph.problems.length);

      const lspStatus = await fetch(`${base}/lsp/status`).then((res) => res.json() as Promise<{ language: string; configured: boolean }[]>);
      expect(lspStatus.find((status) => status.language === "typescript")?.configured).toBe(true);

      const source = await fetch(
        `${base}/source?problemId=sum-positive-readings&language=typescript&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      expect(source.code).toContain("sumPositiveReadings");

      const result = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          problemId: "sum-positive-readings",
          code: source.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string; tests: unknown[] }>);
      expect(result.status).toBe("passed");
      expect(result.tests).toHaveLength(graph.problems[0].tests.length);

      const partSource = await fetch(
        `${base}/source?problemId=aoc-y1-d1-elevation-pairs&partId=part-2-triples&language=typescript&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      expect(partSource.code).toContain("elevation_triples");

      const partResult = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          problemId: "aoc-y1-d1-elevation-pairs",
          partId: "part-2-triples",
          code: partSource.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string }>);
      expect(partResult.status).toBe("passed");
    } finally {
      server.close();
    }
  });
});
