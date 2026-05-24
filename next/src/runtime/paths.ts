import { join, resolve } from "node:path";

export function writableCacheRoot(projectRoot = process.cwd()): string {
  return resolve(process.env.DSA_COACH_CACHE_ROOT ?? join(projectRoot, ".runner-cache"));
}

export function bundledCacheRoot(projectRoot = process.cwd()): string | undefined {
  const root = process.env.DSA_COACH_BUNDLED_CACHE_ROOT;
  return root ? resolve(root) : undefined;
}

export function cacheRoots(projectRoot = process.cwd()): string[] {
  return unique([writableCacheRoot(projectRoot), bundledCacheRoot(projectRoot)]);
}

export function lspBinDirs(projectRoot = process.cwd()): string[] {
  return cacheRoots(projectRoot).map((root) => join(root, "lsp", "bin"));
}

export function coursierCacheDirs(projectRoot = process.cwd()): string[] {
  return cacheRoots(projectRoot).map((root) => join(root, "lsp", "coursier-cache"));
}

export function toolchainRoots(projectRoot = process.cwd()): string[] {
  return cacheRoots(projectRoot).map((root) => join(root, "toolchains"));
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
