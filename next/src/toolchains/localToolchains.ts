import { access } from "node:fs/promises";
import { join } from "node:path";
import { commandOutput } from "../runner/processSandbox.js";
import { toolchainRoots } from "../runtime/paths.js";

export const SCALA_VERSION = "3.7.4";

export interface ScalaToolchainDescriptor {
  version: string;
  platformId: string;
  archiveName: string;
  archiveUrl: string;
  archiveSha256Url: string;
  directoryName: string;
}

export interface ScalaToolchain {
  descriptor: ScalaToolchainDescriptor;
  home: string;
  java: string;
  classpath: string;
}

export function currentScalaDescriptor(): ScalaToolchainDescriptor | undefined {
  const platformId = scalaPlatformId();
  if (!platformId) return undefined;
  const archiveName = `scala3-${SCALA_VERSION}-${platformId}.tar.gz`;
  const baseUrl = `https://github.com/scala/scala3/releases/download/${SCALA_VERSION}/${archiveName}`;
  return {
    version: SCALA_VERSION,
    platformId,
    archiveName,
    archiveUrl: baseUrl,
    archiveSha256Url: `${baseUrl}.sha256`,
    directoryName: `scala3-${SCALA_VERSION}-${platformId}`
  };
}

export async function resolveScalaToolchain(): Promise<ScalaToolchain | undefined> {
  const descriptor = currentScalaDescriptor();
  if (!descriptor) return undefined;
  const home = await resolveToolchainHome(descriptor);
  if (!home) return undefined;
  const java = await resolveJava();
  if (!java) return undefined;
  const scalaJar = join(home, "lib", "scala.jar");
  const compilerJar = join(home, "lib", "with_compiler.jar");
  return {
    descriptor,
    home,
    java,
    classpath: [scalaJar, compilerJar].join(":")
  };
}

async function resolveToolchainHome(descriptor: ScalaToolchainDescriptor): Promise<string | undefined> {
  for (const root of toolchainRoots()) {
    const home = join(root, descriptor.directoryName);
    const scalaJar = join(home, "lib", "scala.jar");
    const compilerJar = join(home, "lib", "with_compiler.jar");
    if ((await fileExists(scalaJar)) && (await fileExists(compilerJar))) return home;
  }
  return undefined;
}

export async function scalaToolchainAvailable(): Promise<boolean> {
  return Boolean(await resolveScalaToolchain());
}

async function resolveJava(): Promise<string | undefined> {
  for (const root of toolchainRoots()) {
    const bundledJava = join(root, "java", "bin", "java");
    if (await fileExists(bundledJava)) return bundledJava;
  }
  const javaHome = await commandOutput("/usr/libexec/java_home", [], 1000);
  if (javaHome) {
    const javaFromHome = join(javaHome, "bin", "java");
    if (await fileExists(javaFromHome)) return javaFromHome;
  }
  return commandOutput("which", ["java"], 1000);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function scalaPlatformId(): string | undefined {
  if (process.platform === "darwin" && process.arch === "arm64") return "aarch64-apple-darwin";
  if (process.platform === "darwin" && process.arch === "x64") return "x86_64-apple-darwin";
  if (process.platform === "linux" && process.arch === "arm64") return "aarch64-pc-linux";
  if (process.platform === "linux" && process.arch === "x64") return "x86_64-pc-linux";
  return undefined;
}
