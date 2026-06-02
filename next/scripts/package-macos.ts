import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appName = "DSA Coach Next";
const buildMode = process.argv.includes("--release") || process.env.DSA_COACH_BUILD_MODE === "release"
  ? "release"
  : "development";
const bundle = resolve(root, "dist/macos", `${appName}.app`);
const contents = resolve(bundle, "Contents");
const macos = resolve(contents, "MacOS");
const resources = resolve(contents, "Resources");
const executable = resolve(macos, "DSACoachNext");
const runtimeRoot = resolve(resources, "app");
const bundledBin = resolve(resources, "bin");
const moduleCache = resolve(root, ".runner-cache/swift-module-cache");
const appIconSet = resolve(root, "dist/macos", "AppIcon.iconset");
const appIcon = resolve(resources, "AppIcon.icns");

run("bun", ["run", "build"]);

rmSync(bundle, { recursive: true, force: true });
mkdirSync(macos, { recursive: true });
mkdirSync(resources, { recursive: true });
mkdirSync(bundledBin, { recursive: true });
mkdirSync(moduleCache, { recursive: true });

writeFileSync(resolve(contents, "Info.plist"), infoPlist(), "utf8");
writeFileSync(resolve(resources, "app-root"), "app\n", "utf8");
createAppIcon();
copyRuntime();
copyVendoredRuntimes();
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

console.log(`Packaged ${bundle} (${buildMode})`);

function copyRuntime() {
  mkdirSync(runtimeRoot, { recursive: true });
  for (const path of ["package.json", "bun.lock", "src", "content", "dist/web", "node_modules"]) {
    copyPath(path);
  }
  if (existsSync(resolve(root, ".runner-cache/lsp"))) {
    copyPath(".runner-cache/lsp", { dereference: true });
  }
  for (const path of [".runner-cache/toolchains"]) {
    if (existsSync(resolve(root, path))) copyPath(path);
  }
}

function copyPath(relativePath: string, options: { dereference?: boolean } = {}) {
  const source = resolve(root, relativePath);
  const destination = resolve(runtimeRoot, relativePath);
  if (!existsSync(source)) return;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    preserveTimestamps: true,
    dereference: Boolean(options.dereference),
    filter: (path) => !path.includes("/.DS_Store")
  });
}

function copyBundledBun() {
  const source = realpathSync(process.execPath);
  const destination = resolve(bundledBin, "bun");
  const nodeDestination = resolve(bundledBin, "node");
  cpSync(source, destination);
  chmodSync(destination, 0o755);
  rmSync(nodeDestination, { force: true });
  symlinkSync("bun", nodeDestination);
}

function copyVendoredRuntimes() {
  const toolchains = resolve(runtimeRoot, ".runner-cache/toolchains");
  mkdirSync(toolchains, { recursive: true });
  copyPythonRuntime(resolve(toolchains, "python"));
  copyGoRuntime(resolve(toolchains, "go"));
  copyJavaRuntime(resolve(toolchains, "java"));
}

function copyPythonRuntime(destination: string) {
  const python = findPythonRuntime();
  if (!python) {
    throw new Error("Cannot package macOS app: no Python 3.10+ runtime found to vendor");
  }
  copyRuntimeDirectory(python.root, destination, `Python ${python.version}`);
}

function copyGoRuntime(destination: string) {
  const result = spawnSync("go", ["env", "GOROOT"], { encoding: "utf8" });
  const goRoot = result.status === 0 ? result.stdout.trim() : "";
  if (!goRoot || !existsSync(resolve(goRoot, "bin/go"))) {
    throw new Error("Cannot package macOS app: no Go runtime found to vendor");
  }
  const version = spawnSync("go", ["env", "GOVERSION"], { encoding: "utf8" }).stdout.trim() || "unknown";
  copyRuntimeDirectory(goRoot, destination, `Go ${version}`);
}

function copyJavaRuntime(destination: string) {
  const result = spawnSync("/usr/libexec/java_home", [], { encoding: "utf8" });
  const javaHome = result.status === 0 ? result.stdout.trim() : "";
  if (!javaHome || !existsSync(resolve(javaHome, "bin/java"))) {
    throw new Error("Cannot package macOS app: no Java runtime found to vendor");
  }
  copyRuntimeDirectory(javaHome, destination, "Java");
}

function copyRuntimeDirectory(source: string, destination: string, label: string) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, {
    recursive: true,
    preserveTimestamps: true,
    dereference: false,
    filter: (path) => !path.includes("/.DS_Store")
  });
  console.log(`Vendored ${label} runtime from ${source}`);
}

function findPythonRuntime(): { root: string; version: string } | undefined {
  const candidates = [
    process.env.DSA_COACH_PYTHON,
    `${process.env.HOME ?? ""}/.local/bin/python3`,
    "/opt/homebrew/bin/python3",
    "/usr/local/bin/python3",
    "python3"
  ].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["-c", [
      "import json, os, sys",
      "print(json.dumps({",
      "  'realExecutable': os.path.realpath(sys.executable),",
      "  'version': [sys.version_info.major, sys.version_info.minor, sys.version_info.micro]",
      "}))"
    ].join("\n")], { encoding: "utf8" });
    if (probe.status !== 0) continue;
    try {
      const payload = JSON.parse(probe.stdout.trim().split(/\n/).at(-1) ?? "{}");
      const version = payload.version as [number, number, number] | undefined;
      const realExecutable = payload.realExecutable as string | undefined;
      if (!version || !realExecutable) continue;
      if (version[0] < 3 || (version[0] === 3 && version[1] < 10)) continue;
      return {
        root: dirname(dirname(realExecutable)),
        version: version.join(".")
      };
    } catch {
      continue;
    }
  }
  return undefined;
}

function createAppIcon() {
  rmSync(appIconSet, { recursive: true, force: true });
  run(
    "swift",
    ["scripts/generate-macos-icon.swift", appIconSet],
    {
      CLANG_MODULE_CACHE_PATH: moduleCache,
      SWIFT_MODULE_CACHE_PATH: moduleCache
    }
  );
  writeIcnsFromIconset(appIconSet, appIcon);
  rmSync(appIconSet, { recursive: true, force: true });
}

function writeIcnsFromIconset(iconset: string, output: string) {
  const entries: [type: string, file: string][] = [
    ["icp4", "icon_16x16.png"],
    ["ic11", "icon_16x16@2x.png"],
    ["icp5", "icon_32x32.png"],
    ["ic12", "icon_32x32@2x.png"],
    ["ic07", "icon_128x128.png"],
    ["ic13", "icon_128x128@2x.png"],
    ["ic08", "icon_256x256.png"],
    ["ic14", "icon_256x256@2x.png"],
    ["ic09", "icon_512x512.png"],
    ["ic10", "icon_512x512@2x.png"]
  ];
  const chunks = entries.map(([type, file]) => {
    const data = readFileSync(resolve(iconset, file));
    const header = Buffer.alloc(8);
    header.write(type, 0, 4, "ascii");
    header.writeUInt32BE(data.length + 8, 4);
    return Buffer.concat([header, data]);
  });
  const size = 8 + chunks.reduce((total, chunk) => total + chunk.length, 0);
  const header = Buffer.alloc(8);
  header.write("icns", 0, 4, "ascii");
  header.writeUInt32BE(size, 4);
  writeFileSync(output, Buffer.concat([header, ...chunks], size));
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
  const developmentContentRoot = buildMode === "development" ? realpathSync(resolve(root, "content")) : "";
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
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleName</key>
  <string>DSA Coach Next</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>DSACoachBuildMode</key>
  <string>${buildMode}</string>
  <key>DSACoachDevelopmentContentRoot</key>
  <string>${plistEscape(developmentContentRoot)}</string>
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

function plistEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
