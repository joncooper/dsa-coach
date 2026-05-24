import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appName = "DSA Coach Next";
const bundle = resolve(root, "dist/macos", `${appName}.app`);
const contents = resolve(bundle, "Contents");
const macos = resolve(contents, "MacOS");
const resources = resolve(contents, "Resources");
const executable = resolve(macos, "DSACoachNext");
const runtimeRoot = resolve(resources, "app");
const bundledBin = resolve(resources, "bin");
const moduleCache = resolve(root, ".runner-cache/swift-module-cache");

run("bun", ["run", "build"]);

rmSync(bundle, { recursive: true, force: true });
mkdirSync(macos, { recursive: true });
mkdirSync(resources, { recursive: true });
mkdirSync(bundledBin, { recursive: true });
mkdirSync(moduleCache, { recursive: true });

writeFileSync(resolve(contents, "Info.plist"), infoPlist(), "utf8");
writeFileSync(resolve(resources, "app-root"), "app\n", "utf8");
copyRuntime();
copyBundledBun();

run(
  "swiftc",
  [
    "desktop/macos/DSACoachNext.swift",
    "-parse-as-library",
    "-o",
    executable,
    "-framework",
    "Cocoa",
    "-framework",
    "WebKit"
  ],
  {
    CLANG_MODULE_CACHE_PATH: moduleCache,
    SWIFT_MODULE_CACHE_PATH: moduleCache
  }
);

console.log(`Packaged ${bundle}`);

function copyRuntime() {
  mkdirSync(runtimeRoot, { recursive: true });
  for (const path of ["package.json", "bun.lock", "src", "content", "dist/web", "node_modules"]) {
    copyPath(path);
  }
  for (const path of [".runner-cache/lsp", ".runner-cache/toolchains"]) {
    if (existsSync(resolve(root, path))) copyPath(path);
  }
}

function copyPath(relativePath: string) {
  const source = resolve(root, relativePath);
  const destination = resolve(runtimeRoot, relativePath);
  if (!existsSync(source)) return;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    preserveTimestamps: true,
    dereference: false,
    filter: (path) => !path.includes("/.DS_Store")
  });
}

function copyBundledBun() {
  const source = realpathSync(process.execPath);
  const destination = resolve(bundledBin, "bun");
  cpSync(source, destination);
  chmodSync(destination, 0o755);
}

function run(command: string, args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      ...env
    }
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function infoPlist(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>DSACoachNext</string>
  <key>CFBundleIdentifier</key>
  <string>local.dsa-coach.next</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>DSA Coach Next</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
  </dict>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
`;
}
