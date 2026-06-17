import type { LanguagePack } from "../core/types.js";
import { goRuntimeAvailable } from "../runner/goRuntime.js";
import { SCALA_VERSION, scalaToolchainAvailable } from "../toolchains/localToolchains.js";

export const languagePacks: LanguagePack[] = [
  {
    id: "typescript",
    label: "TypeScript",
    extensions: [".ts"],
    runner: {
      strategy: "host-process",
      installedByDefault: true,
      offlineCapable: true,
      sandboxed: true
    },
    formatter: { command: "prettier --write" },
    lsp: {
      command: "typescript-language-server",
      args: ["--stdio"],
      documentLanguageId: "typescript",
      workspaceFiles: {
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            strict: true,
            noEmit: true,
            lib: ["ES2022"]
          }
        }, null, 2)
      },
      install: {
        kind: "npm",
        packageName: "typescript-language-server",
        command: "bun",
        args: ["add", "typescript-language-server"]
      }
    }
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py"],
    runner: {
      strategy: "browser-worker",
      installedByDefault: true,
      offlineCapable: true,
      sandboxed: true
    },
    formatter: { command: "ruff format" },
    lsp: {
      command: "pyright-langserver",
      args: ["--stdio"],
      documentLanguageId: "python",
      workspaceFiles: {
        "pyrightconfig.json": JSON.stringify({
          typeCheckingMode: "basic",
          reportMissingImports: "none",
          reportMissingModuleSource: "none"
        }, null, 2)
      },
      install: {
        kind: "npm",
        packageName: "pyright",
        command: "bun",
        args: ["add", "pyright"]
      }
    }
  },
  {
    id: "go",
    label: "Go",
    extensions: [".go"],
    runner: {
      strategy: "container",
      installedByDefault: false,
      offlineCapable: true,
      sandboxed: true
    },
    formatter: { command: "gofmt -w" },
    lsp: {
      command: "gopls",
      documentLanguageId: "go",
      workspaceFiles: {
        "go.mod": "module dsa_coach_lsp\n\ngo 1.22\n"
      },
      install: {
        kind: "go",
        packageName: "golang.org/x/tools/gopls",
        command: "go",
        args: ["install", "golang.org/x/tools/gopls@latest"]
      }
    }
  },
  {
    id: "scala",
    label: "Scala",
    extensions: [".scala"],
    runner: {
      strategy: "container",
      installedByDefault: false,
      offlineCapable: true,
      sandboxed: true
    },
    formatter: { command: "scalafmt" },
    lsp: {
      command: "metals",
      documentLanguageId: "scala",
      initializeTimeoutMs: 180000,
      shutdownTimeoutMs: 1500,
      workspaceSourceRoot: "src/main/scala",
      initializationOptions: {
        statusBarProvider: "off",
        isHttpEnabled: false,
        inlayHints: {
          inferredTypes: { enable: false },
          implicitArguments: { enable: false },
          implicitConversions: { enable: false },
          typeParameters: { enable: false },
          hintsInPatternMatch: { enable: false }
        }
      },
      workspaceFiles: {
        "build.sbt": `scalaVersion := "${SCALA_VERSION}"\n`,
        "project/build.properties": "sbt.version=1.10.7\n",
        ".scalafmt.conf": "version = 3.11.1\nrunner.dialect = scala3\n"
      },
      install: {
        kind: "coursier",
        packageName: "metals",
        command: "cs",
        args: ["install", "metals"],
        notes: "Install Coursier first, then run the project LSP setup command."
      }
    }
  }
];

export function installedLanguagePacks(): LanguagePack[] {
  return languagePacks.filter((pack) => pack.runner.installedByDefault);
}

export async function runtimeLanguagePacks(): Promise<LanguagePack[]> {
  return Promise.all(
    languagePacks.map(async (pack) => ({
      ...pack,
      runner: {
        ...pack.runner,
        strategy: pack.id === "python" ? "browser-worker" : "host-process",
        installedByDefault: await runtimeAvailable(pack.id)
      }
    }))
  );
}

async function runtimeAvailable(languageId: string): Promise<boolean> {
  if (languageId === "typescript") return true;
  if (languageId === "python") return true;
  if (languageId === "go") return goRuntimeAvailable();
  if (languageId === "scala") return scalaToolchainAvailable();
  return false;
}
