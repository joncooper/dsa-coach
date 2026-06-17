import react from "@vitejs/plugin-react";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const configDir = dirname(fileURLToPath(import.meta.url));
const nextRoot = resolve(configDir, "../..");
const workspaceRoot = resolve(nextRoot, "..");
const pyodideSourceRoot = firstExisting([
  resolve(nextRoot, "node_modules/pyodide"),
  resolve(workspaceRoot, "node_modules/pyodide")
]);
const pyodideExtraRoot = firstExisting([
  resolve(nextRoot, "vendor/pyodide-extras"),
  resolve(workspaceRoot, "vendor/pyodide-extras")
]);

export default defineConfig({
  root: "apps/web",
  plugins: [react(), pyodideAssetsPlugin()],
  worker: {
    format: "es"
  },
  server: {
    host: "127.0.0.1",
    port: 5174
  },
  preview: {
    host: "127.0.0.1",
    port: 4175
  },
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true
  }
});

function pyodideAssetsPlugin() {
  return {
    name: "dsa-coach-next-pyodide-assets",
    configureServer(server) {
      server.middlewares.use("/pyodide", pyodideMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/pyodide", pyodideMiddleware);
    },
    writeBundle() {
      const destination = resolve(nextRoot, "dist/web/pyodide");
      copyPyodideAssets(destination);
    }
  };
}

function pyodideMiddleware(req, res, next) {
  const pathname = decodeURIComponent((req.url ?? "").split("?")[0] ?? "").replace(/^\/+/, "");
  const source = pyodideAssetPath(pathname);
  if (!source) {
    next();
    return;
  }
  res.statusCode = 200;
  res.setHeader("content-type", pyodideContentType(source));
  res.end(readFileSync(source));
}

function copyPyodideAssets(destination: string) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  for (const root of [pyodideSourceRoot, pyodideExtraRoot]) {
    if (!root) continue;
    for (const name of readdirSync(root)) {
      const source = resolve(root, name);
      if (!statSync(source).isFile()) continue;
      copyFileSync(source, resolve(destination, name));
    }
  }
}

function pyodideAssetPath(pathname: string): string | undefined {
  if (!pathname || pathname.includes("/") || pathname.includes("..")) return undefined;
  for (const root of [pyodideSourceRoot, pyodideExtraRoot]) {
    if (!root) continue;
    const candidate = resolve(root, pathname);
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

function pyodideContentType(path: string): string {
  if (path.endsWith(".js") || path.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".wasm")) return "application/wasm";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".zip") || path.endsWith(".whl")) return "application/zip";
  return "application/octet-stream";
}

function firstExisting(paths: string[]): string | undefined {
  return paths.find((path) => existsSync(path));
}
