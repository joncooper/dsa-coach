import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    mdx(),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/pyodide/*",
          dest: "pyodide"
        },
        {
          // Pyodide's npm package only ships the runtime and stdlib;
          // third-party wheels (numpy, sortedcontainers, ...) are fetched
          // from the official CDN by default. We vendor the wheels we
          // actually use (currently sortedcontainers, for the Libraries
          // section) so the app stays offline-first. Add additional wheels
          // to vendor/pyodide-extras/ when new library-section problems
          // depend on them.
          src: "vendor/pyodide-extras/*",
          dest: "pyodide"
        }
      ]
    })
  ],
  worker: {
    format: "es"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"]
  }
});
