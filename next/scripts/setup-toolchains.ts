import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { currentScalaDescriptor } from "../src/toolchains/localToolchains.js";

const descriptor = currentScalaDescriptor();

if (!descriptor) {
  throw new Error(`No pinned Scala toolchain is configured for ${process.platform}/${process.arch}`);
}

const toolchainRoot = resolve(".runner-cache/toolchains");
const archivePath = join(toolchainRoot, descriptor.archiveName);
const installDir = join(toolchainRoot, descriptor.directoryName);

if (await scalaInstallPresent()) {
  console.log(`Scala ${descriptor.version} is already installed at ${installDir}`);
  process.exit(0);
}

await mkdir(toolchainRoot, { recursive: true });

if (!(await exists(archivePath))) {
  console.log(`Downloading ${descriptor.archiveUrl}`);
  await download(descriptor.archiveUrl, archivePath);
}

const expectedSha256 = await expectedChecksum();
const actualSha256 = await fileSha256(archivePath);
if (actualSha256 !== expectedSha256) {
  throw new Error(`Checksum mismatch for ${descriptor.archiveName}: expected ${expectedSha256}, got ${actualSha256}`);
}

await rm(installDir, { recursive: true, force: true });
await extract(archivePath, toolchainRoot);
console.log(`Installed Scala ${descriptor.version} at ${installDir}`);

async function scalaInstallPresent(): Promise<boolean> {
  return (await exists(join(installDir, "lib", "scala.jar"))) && (await exists(join(installDir, "lib", "with_compiler.jar")));
}

async function expectedChecksum(): Promise<string> {
  console.log(`Fetching checksum ${descriptor.archiveSha256Url}`);
  const response = await fetch(descriptor.archiveSha256Url);
  if (!response.ok) throw new Error(`Unable to fetch checksum: ${response.status} ${response.statusText}`);
  const text = await response.text();
  const checksum = text.trim().split(/\s+/)[0];
  if (!/^[a-f0-9]{64}$/i.test(checksum)) throw new Error(`Unexpected checksum payload: ${text}`);
  return checksum.toLowerCase();
}

async function download(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status} ${response.statusText}`);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
}

async function fileSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function extract(archive: string, destination: string): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn("tar", ["-xzf", archive, "-C", destination], { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`tar exited with ${code}`));
    });
  });
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
