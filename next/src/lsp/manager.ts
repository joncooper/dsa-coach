import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, basename, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ContentGraph, LanguagePack, LanguageServerSpec } from "../core/types.js";
import { languagePacks } from "../languages/languagePacks.js";
import { commandOutput } from "../runner/processSandbox.js";
import { coursierCacheDirs, lspBinDirs, writableCacheRoot } from "../runtime/paths.js";
import { encodeJsonRpcMessage, JsonRpcMessageBuffer, type JsonRpcId, type JsonRpcMessage } from "./protocol.js";
import type {
  LspCompletionItem,
  LspCompletionRequest,
  LspCompletionResponse,
  LspDefinition,
  LspDefinitionResponse,
  LspDiagnostic,
  LspDiagnosticsResponse,
  LspDocumentRequest,
  LspDocumentSymbol,
  LspFeatureStatus,
  LspFormatResponse,
  LspHover,
  LspHoverResponse,
  LspPositionRequest,
  LspServerStatus,
  LspSignature,
  LspSignatureHelp,
  LspSignatureHelpResponse,
  LspSignatureParameter,
  LspSymbolsResponse,
  LspTextEdit
} from "./types.js";

export interface LspManagerOptions {
  graph: ContentGraph;
  projectRoot?: string;
  packs?: LanguagePack[];
}

interface ResolvedLspCommand {
  command: string;
  args: string[];
  resolvedCommand?: string;
  message?: string;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

interface OpenDocument {
  uri: string;
  path: string;
  version: number;
  text: string;
}

interface DiagnosticWaiter {
  resolve: (diagnostics: LspDiagnostic[]) => void;
  timer: NodeJS.Timeout;
}

interface LspPosition {
  line: number;
  character: number;
}

interface LspRange {
  start: LspPosition;
  end: LspPosition;
}

interface RawCompletionItem {
  label?: string;
  kind?: number;
  detail?: string;
  documentation?: string | { kind?: string; value?: string };
  sortText?: string;
  filterText?: string;
  insertText?: string;
  insertTextFormat?: number;
  textEdit?: {
    newText?: string;
    range?: LspRange;
    insert?: LspRange;
    replace?: LspRange;
  };
}

interface RawDiagnostic {
  range?: LspRange;
  severity?: number;
  code?: string | number;
  source?: string;
  message?: string;
}

interface RawTextEdit {
  range?: LspRange;
  newText?: string;
}

interface RawDocumentSymbol {
  name?: string;
  detail?: string;
  kind?: number;
  range?: LspRange;
  selectionRange?: LspRange;
  children?: RawDocumentSymbol[];
}

interface RawSymbolInformation {
  name?: string;
  kind?: number;
  location?: {
    uri?: string;
    range?: LspRange;
  };
}

interface RawSignatureHelp {
  activeSignature?: number;
  activeParameter?: number;
  signatures?: RawSignature[];
}

interface RawSignature {
  label?: string;
  documentation?: string | { kind?: string; value?: string };
  parameters?: RawSignatureParameter[];
}

interface RawSignatureParameter {
  label?: string | [number, number];
  documentation?: string | { kind?: string; value?: string };
}

interface RawLocation {
  uri?: string;
  range?: LspRange;
  targetUri?: string;
  targetRange?: LspRange;
  targetSelectionRange?: LspRange;
}

const DEFAULT_COMPLETION_TIMEOUT_MS = 1500;
const DEFAULT_REQUEST_TIMEOUT_MS = 2000;
const DEFAULT_DIAGNOSTICS_TIMEOUT_MS = 900;
const INITIALIZE_TIMEOUT_MS = 10000;
const MAX_STDERR_BYTES = 24 * 1024;

export class LspManager {
  private readonly graph: ContentGraph;
  private readonly projectRoot: string;
  private readonly packs: LanguagePack[];
  private readonly sessions = new Map<string, LspSession>();

  constructor(options: LspManagerOptions) {
    this.graph = options.graph;
    this.projectRoot = resolve(options.projectRoot ?? process.cwd());
    this.packs = options.packs ?? languagePacks;
  }

  async status(): Promise<LspServerStatus[]> {
    return Promise.all(
      this.packs.map(async (pack) => {
        const session = this.sessions.get(pack.id);
        if (session) return session.status();
        return statusForPack(pack, await resolveLspCommand(pack.lsp, this.projectRoot));
      })
    );
  }

  async complete(request: LspCompletionRequest): Promise<LspCompletionResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      items: await session.complete(request),
      server: session.status()
    }), { items: [] });
  }

  async diagnostics(request: LspDocumentRequest): Promise<LspDiagnosticsResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      diagnostics: await session.diagnostics(request),
      server: session.status()
    }), { diagnostics: [] });
  }

  async hover(request: LspPositionRequest): Promise<LspHoverResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      hover: await session.hover(request),
      server: session.status()
    }), { hover: undefined });
  }

  async signatureHelp(request: LspPositionRequest): Promise<LspSignatureHelpResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      help: await session.signatureHelp(request),
      server: session.status()
    }), { help: undefined });
  }

  async format(request: LspDocumentRequest): Promise<LspFormatResponse> {
    return this.withSession(request.language, async (session) => {
      const formatted = await session.format(request);
      return {
        language: request.language,
        status: "ok",
        ...formatted,
        server: session.status()
      };
    }, { code: request.code, edits: [] });
  }

  async symbols(request: LspDocumentRequest): Promise<LspSymbolsResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      symbols: await session.symbols(request),
      server: session.status()
    }), { symbols: [] });
  }

  async definition(request: LspPositionRequest): Promise<LspDefinitionResponse> {
    return this.withSession(request.language, async (session) => ({
      language: request.language,
      status: "ok",
      definitions: await session.definition(request),
      server: session.status()
    }), { definitions: [] });
  }

  async dispose(): Promise<void> {
    await Promise.all([...this.sessions.values()].map((session) => session.dispose()));
    this.sessions.clear();
  }

  private async withSession<T extends { language: string; status: LspFeatureStatus; message?: string; server?: LspServerStatus }>(
    language: string,
    fn: (session: LspSession) => Promise<T>,
    fallback: Omit<T, "language" | "status" | "message" | "server">
  ): Promise<T> {
    const pack = this.packs.find((candidate) => candidate.id === language);
    if (!pack?.lsp) {
      return {
        language,
        status: "unavailable",
        ...fallback,
        message: `No language server is configured for ${language}`
      } as T;
    }

    const resolvedCommand = await resolveLspCommand(pack.lsp, this.projectRoot);
    if (!resolvedCommand.resolvedCommand) {
      return {
        language,
        status: "unavailable",
        ...fallback,
        message: resolvedCommand.message,
        server: statusForPack(pack, resolvedCommand)
      } as T;
    }

    const session = this.sessionFor(pack, resolvedCommand);
    try {
      return await fn(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        language,
        status: message.toLowerCase().includes("timed out") ? "timeout" : "error",
        ...fallback,
        message,
        server: session.status()
      } as T;
    }
  }

  private sessionFor(pack: LanguagePack, command: ResolvedLspCommand): LspSession {
    const existing = this.sessions.get(pack.id);
    if (existing) return existing;
    const session = new LspSession({
      graph: this.graph,
      pack,
      command,
      projectRoot: this.projectRoot
    });
    this.sessions.set(pack.id, session);
    return session;
  }
}

class LspSession {
  private readonly graph: ContentGraph;
  private readonly pack: LanguagePack;
  private readonly spec: LanguageServerSpec;
  private readonly command: ResolvedLspCommand;
  private readonly projectRoot: string;
  private readonly workspaceRoot: string;
  private readonly documents = new Map<string, OpenDocument>();
  private readonly diagnosticsByUri = new Map<string, LspDiagnostic[]>();
  private readonly diagnosticWaiters = new Map<string, DiagnosticWaiter[]>();
  private readonly pending = new Map<JsonRpcId, PendingRequest>();
  private child: ChildProcessWithoutNullStreams | undefined;
  private nextRequestId = 1;
  private startPromise: Promise<void> | undefined;
  private state: LspServerStatus["state"] = "stopped";
  private message = "";
  private stderr = "";

  constructor(options: {
    graph: ContentGraph;
    pack: LanguagePack;
    command: ResolvedLspCommand;
    projectRoot: string;
  }) {
    if (!options.pack.lsp) throw new Error(`Missing LSP config for ${options.pack.id}`);
    this.graph = options.graph;
    this.pack = options.pack;
    this.spec = options.pack.lsp;
    this.command = options.command;
    this.projectRoot = options.projectRoot;
    this.workspaceRoot = join(writableCacheRoot(this.projectRoot), "lsp-workspaces", this.pack.id);
  }

  status(): LspServerStatus {
    return {
      language: this.pack.id,
      configured: true,
      available: Boolean(this.command.resolvedCommand),
      state: this.state,
      command: this.command.command,
      args: this.command.args,
      resolvedCommand: this.command.resolvedCommand,
      install: this.spec.install,
      message: this.message || this.command.message,
      stderr: this.stderr || undefined
    };
  }

  async complete(request: LspCompletionRequest): Promise<LspCompletionItem[]> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    const position = offsetToPosition(request.code, clamp(request.cursor, 0, request.code.length));
    const result = await this.request(
      "textDocument/completion",
      {
        textDocument: { uri: document.uri },
        position,
        context: { triggerKind: 1 }
      },
      request.timeoutMs ?? DEFAULT_COMPLETION_TIMEOUT_MS
    );
    return normalizeCompletionItems(result, request.code, request.cursor);
  }

  async diagnostics(request: LspDocumentRequest): Promise<LspDiagnostic[]> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    return this.waitForDiagnostics(document.uri, request.timeoutMs ?? DEFAULT_DIAGNOSTICS_TIMEOUT_MS);
  }

  async hover(request: LspPositionRequest): Promise<LspHover | undefined> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    const result = await this.request(
      "textDocument/hover",
      {
        textDocument: { uri: document.uri },
        position: offsetToPosition(request.code, clamp(request.cursor, 0, request.code.length))
      },
      request.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
    );
    return normalizeHover(result, request.code);
  }

  async signatureHelp(request: LspPositionRequest): Promise<LspSignatureHelp | undefined> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    const result = await this.request(
      "textDocument/signatureHelp",
      {
        textDocument: { uri: document.uri },
        position: offsetToPosition(request.code, clamp(request.cursor, 0, request.code.length)),
        context: { triggerKind: 1, isRetrigger: false }
      },
      request.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
    );
    return normalizeSignatureHelp(result);
  }

  async format(request: LspDocumentRequest): Promise<{ code: string; edits: LspTextEdit[] }> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    let lspError = "";
    try {
      const result = await this.request(
        "textDocument/formatting",
        {
          textDocument: { uri: document.uri },
          options: {
            tabSize: this.pack.id === "go" ? 4 : 2,
            insertSpaces: this.pack.id !== "go",
            trimTrailingWhitespace: true,
            insertFinalNewline: true,
            trimFinalNewlines: true
          }
        },
        request.timeoutMs ?? 5000
      );
      const edits = normalizeTextEdits(result, request.code);
      if (edits.length) return { code: applyTextEdits(request.code, edits), edits };
    } catch (error) {
      lspError = error instanceof Error ? error.message : String(error);
    }

    const formatted = await this.formatWithExternalTool(document, request.timeoutMs ?? 5000);
    if (formatted) return formatted;
    if (lspError) throw new Error(lspError);
    return { code: request.code, edits: [] };
  }

  async symbols(request: LspDocumentRequest): Promise<LspDocumentSymbol[]> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    const result = await this.request(
      "textDocument/documentSymbol",
      { textDocument: { uri: document.uri } },
      request.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
    );
    return normalizeDocumentSymbols(result, request.code);
  }

  async definition(request: LspPositionRequest): Promise<LspDefinition[]> {
    await this.ensureStarted();
    const document = await this.upsertDocument(request);
    const result = await this.request(
      "textDocument/definition",
      {
        textDocument: { uri: document.uri },
        position: offsetToPosition(request.code, clamp(request.cursor, 0, request.code.length))
      },
      request.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
    );
    return normalizeDefinitions(result, document, this.documents);
  }

  async dispose(): Promise<void> {
    const child = this.child;
    if (!child) return;
    try {
      if (this.state === "running") {
        await this.request("shutdown", null, this.spec.shutdownTimeoutMs ?? 1000);
        this.notify("exit");
      }
      await waitForChildClose(child, this.spec.shutdownTimeoutMs ?? 1000);
    } catch {
      child.kill("SIGKILL");
      await waitForChildClose(child, 1000).catch(() => undefined);
    } finally {
      this.child = undefined;
      this.state = "stopped";
    }
  }

  private async ensureStarted(): Promise<void> {
    if (this.state === "running") return;
    if (this.state === "error") this.killChild();
    this.startPromise ??= this.start();
    try {
      await this.startPromise;
    } catch (error) {
      this.killChild();
      this.startPromise = undefined;
      this.state = "error";
      this.message = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  private async start(): Promise<void> {
    if (!this.command.resolvedCommand) {
      throw new Error(this.command.message ?? `Missing language server for ${this.pack.id}`);
    }

    this.state = "starting";
    await this.prepareWorkspace();
    const envRoot = join(writableCacheRoot(this.projectRoot), "lsp-env", this.pack.id);
    await mkdir(join(envRoot, "home"), { recursive: true });
    await mkdir(join(envRoot, "tmp"), { recursive: true });
    await mkdir(join(envRoot, "cache"), { recursive: true });

    const child = spawn(this.command.resolvedCommand, this.command.args, {
      cwd: this.workspaceRoot,
      env: {
        ...process.env,
        PATH: [
          dirname(this.command.resolvedCommand),
          join(this.projectRoot, "node_modules", ".bin"),
          ...lspBinDirs(this.projectRoot),
          process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        ].join(":"),
        COURSIER_CACHE: coursierCacheDirs(this.projectRoot)[0],
        XDG_CACHE_HOME: join(envRoot, "cache"),
        JAVA_TOOL_OPTIONS: javaToolOptions(join(envRoot, "home")),
        HOME: join(envRoot, "home"),
        TMPDIR: join(envRoot, "tmp"),
        TMP: join(envRoot, "tmp"),
        TEMP: join(envRoot, "tmp")
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.child = child;
    const messages = new JsonRpcMessageBuffer();
    child.stdout.on("data", (chunk: Buffer) => {
      for (const message of messages.append(chunk)) this.handleMessage(message);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      this.stderr = tail(`${this.stderr}${chunk.toString("utf8")}`, MAX_STDERR_BYTES);
    });
    child.on("error", (error) => this.failPending(error));
    child.on("close", (code, signal) => {
      if (this.state !== "stopped") {
        this.state = code === 0 ? "stopped" : "error";
        this.message = `Language server exited with ${signal ?? code}`;
      }
      this.failPending(new Error(this.message));
      this.child = undefined;
      this.startPromise = undefined;
    });

    const rootUri = pathToFileURL(this.workspaceRoot).toString();
    await this.request(
      "initialize",
      {
        processId: process.pid,
        clientInfo: { name: "dsa-coach-next" },
        rootUri,
        workspaceFolders: [{ uri: rootUri, name: `dsa-coach-${this.pack.id}` }],
        initializationOptions: this.spec.initializationOptions,
        capabilities: {
          textDocument: {
            synchronization: { dynamicRegistration: false, didSave: false },
            publishDiagnostics: {
              relatedInformation: true,
              versionSupport: true,
              codeDescriptionSupport: true,
              dataSupport: true
            },
            completion: {
              dynamicRegistration: false,
              contextSupport: true,
              completionItem: {
                snippetSupport: true,
                documentationFormat: ["markdown", "plaintext"],
                deprecatedSupport: true,
                preselectSupport: true,
                labelDetailsSupport: true
              }
            },
            hover: {
              dynamicRegistration: false,
              contentFormat: ["markdown", "plaintext"]
            },
            signatureHelp: {
              dynamicRegistration: false,
              signatureInformation: {
                documentationFormat: ["markdown", "plaintext"],
                parameterInformation: { labelOffsetSupport: true }
              }
            },
            formatting: {
              dynamicRegistration: false
            },
            documentSymbol: {
              dynamicRegistration: false,
              hierarchicalDocumentSymbolSupport: true,
              symbolKind: { valueSet: Array.from({ length: 26 }, (_, index) => index + 1) }
            },
            definition: {
              dynamicRegistration: false,
              linkSupport: true
            }
          },
          workspace: {
            configuration: true,
            workspaceFolders: true
          }
        }
      },
      this.spec.initializeTimeoutMs ?? INITIALIZE_TIMEOUT_MS
    );
    this.notify("initialized", {});
    this.state = "running";
    this.message = "";
  }

  private async prepareWorkspace(): Promise<void> {
    await mkdir(this.workspaceRoot, { recursive: true });
    for (const [relativePath, contents] of Object.entries(this.spec.workspaceFiles ?? {})) {
      const target = join(this.workspaceRoot, relativePath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, contents, "utf8");
    }
  }

  private async upsertDocument(request: LspDocumentRequest): Promise<OpenDocument> {
    const path = this.documentPath(request);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, request.code, "utf8");
    const uri = pathToFileURL(path).toString();
    const existing = this.documents.get(uri);
    if (!existing) {
      const document = { uri, path, version: 1, text: request.code };
      this.documents.set(uri, document);
      this.diagnosticsByUri.delete(uri);
      this.notify("textDocument/didOpen", {
        textDocument: {
          uri,
          languageId: this.spec.documentLanguageId ?? this.pack.id,
          version: document.version,
          text: request.code
        }
      });
      return document;
    }

    existing.version += 1;
    existing.text = request.code;
    this.diagnosticsByUri.delete(uri);
    this.notify("textDocument/didChange", {
      textDocument: { uri, version: existing.version },
      contentChanges: [{ text: request.code }]
    });
    return existing;
  }

  private async formatWithExternalTool(
    document: OpenDocument,
    timeoutMs: number
  ): Promise<{ code: string; edits: LspTextEdit[] } | undefined> {
    const commandSpec = this.pack.formatter?.command;
    if (!commandSpec) return undefined;
    const [command, ...baseArgs] = commandSpec.split(/\s+/).filter(Boolean);
    if (!command) return undefined;
    const resolved = await resolveToolCommand(command, this.projectRoot);
    if (!resolved) return undefined;
    const before = document.text;
    const envRoot = join(writableCacheRoot(this.projectRoot), "lsp-env", "formatters", this.pack.id);
    await mkdir(join(envRoot, "home"), { recursive: true });
    await mkdir(join(envRoot, "tmp"), { recursive: true });
    await mkdir(join(envRoot, "cache"), { recursive: true });
    const result = await runFormatterProcess({
      command: resolved,
      args: [...baseArgs, document.path],
      cwd: this.workspaceRoot,
      projectRoot: this.projectRoot,
      envRoot,
      timeoutMs
    });
    if (result.exitCode !== 0) {
      throw new Error(result.stderr || `${commandSpec} exited with ${result.exitCode}`);
    }
    const after = await readFile(document.path, "utf8");
    document.text = after;
    const edits = after === before
      ? []
      : [{ rangeStart: 0, rangeEnd: before.length, newText: after }];
    return { code: after, edits };
  }

  private documentPath(request: LspDocumentRequest): string {
    const problem = this.graph.problems.find((candidate) => candidate.id === request.problemId);
    const part = problem?.parts?.find((candidate) => candidate.id === request.partId);
    const support = (part?.languages ?? problem?.languages)?.[request.language];
    const sourcePath = support?.starterPath ?? `solution${this.pack.extensions[0] ?? ".txt"}`;
    if (this.spec.workspaceSourceRoot) {
      return join(this.workspaceRoot, this.spec.workspaceSourceRoot, basename(sourcePath));
    }
    return join(
      this.workspaceRoot,
      "problems",
      safePathSegment(request.problemId),
      safePathSegment(request.partId ?? "base"),
      basename(sourcePath)
    );
  }

  private request(method: string, params: unknown, timeoutMs: number): Promise<unknown> {
    const child = this.child;
    if (!child?.stdin.writable) throw new Error(`Language server for ${this.pack.id} is not writable`);
    const id = this.nextRequestId++;
    const request = { jsonrpc: "2.0" as const, id, method, params };
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.notify("$/cancelRequest", { id });
        reject(new Error(`${method} timed out after ${timeoutMs} ms`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolvePromise, reject, timer });
      child.stdin.write(encodeJsonRpcMessage(request), (error) => {
        if (!error) return;
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      });
    });
  }

  private notify(method: string, params?: unknown): void {
    const child = this.child;
    if (!child?.stdin.writable) return;
    child.stdin.write(encodeJsonRpcMessage({ jsonrpc: "2.0", method, params }));
  }

  private handleMessage(message: JsonRpcMessage): void {
    if ("id" in message && "method" in message) {
      this.respondToServerRequest(message.id, message.method);
      return;
    }
    if ("method" in message) {
      this.handleNotification(message.method, message.params);
      return;
    }
    if (!("id" in message)) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(message.id);
    if ("error" in message && message.error) {
      pending.reject(new Error(message.error.message));
    } else {
      pending.resolve("result" in message ? message.result : undefined);
    }
  }

  private respondToServerRequest(id: JsonRpcId, method: string): void {
    const child = this.child;
    if (!child?.stdin.writable) return;
    const result = method === "workspace/configuration" ? [{}] : null;
    child.stdin.write(encodeJsonRpcMessage({ jsonrpc: "2.0", id, result }));
  }

  private handleNotification(method: string, params: unknown): void {
    if (method !== "textDocument/publishDiagnostics" || !isObject(params)) return;
    const uri = typeof params.uri === "string" ? params.uri : undefined;
    if (!uri) return;
    const document = this.documents.get(uri);
    const diagnostics = normalizeDiagnostics(params.diagnostics, document?.text ?? "");
    this.diagnosticsByUri.set(uri, diagnostics);
    const waiters = this.diagnosticWaiters.get(uri) ?? [];
    this.diagnosticWaiters.delete(uri);
    for (const waiter of waiters) {
      clearTimeout(waiter.timer);
      waiter.resolve(diagnostics);
    }
  }

  private waitForDiagnostics(uri: string, timeoutMs: number): Promise<LspDiagnostic[]> {
    const existing = this.diagnosticsByUri.get(uri);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolvePromise) => {
      const timer = setTimeout(() => {
        const waiters = this.diagnosticWaiters.get(uri)?.filter((waiter) => waiter.timer !== timer) ?? [];
        if (waiters.length) this.diagnosticWaiters.set(uri, waiters);
        else this.diagnosticWaiters.delete(uri);
        resolvePromise(this.diagnosticsByUri.get(uri) ?? []);
      }, timeoutMs);
      const waiters = this.diagnosticWaiters.get(uri) ?? [];
      waiters.push({ resolve: resolvePromise, timer });
      this.diagnosticWaiters.set(uri, waiters);
    });
  }

  private failPending(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  private killChild(): void {
    this.failPending(new Error(this.message || `Language server for ${this.pack.id} stopped`));
    for (const [uri, waiters] of this.diagnosticWaiters) {
      for (const waiter of waiters) {
        clearTimeout(waiter.timer);
        waiter.resolve(this.diagnosticsByUri.get(uri) ?? []);
      }
    }
    this.diagnosticWaiters.clear();
    this.child?.kill("SIGKILL");
    this.child = undefined;
  }
}

export async function resolveLspCommand(
  spec: LanguageServerSpec | undefined,
  projectRoot = process.cwd()
): Promise<ResolvedLspCommand> {
  if (!spec) return { command: "", args: [], message: "No language server configured" };
  const args = spec.args ?? [];
  if (spec.command.includes("/")) {
    return (await executableExists(spec.command))
      ? { command: spec.command, args, resolvedCommand: spec.command }
      : { command: spec.command, args, message: `${spec.command} does not exist` };
  }

  for (const candidate of localExecutableCandidates(spec.command, projectRoot)) {
    if (await executableExists(candidate)) {
      return { command: spec.command, args, resolvedCommand: candidate };
    }
  }

  const systemPath = await commandOutput("which", [spec.command], 1000);
  if (systemPath) return { command: spec.command, args, resolvedCommand: systemPath };
  return {
    command: spec.command,
    args,
    message: `${spec.command} is not installed; run the LSP setup command or add it to PATH`
  };
}

async function resolveToolCommand(command: string, projectRoot: string): Promise<string | undefined> {
  if (command.includes("/")) return (await executableExists(command)) ? command : undefined;
  for (const candidate of localExecutableCandidates(command, projectRoot)) {
    if (await executableExists(candidate)) return candidate;
  }
  return commandOutput("which", [command], 1000);
}

function runFormatterProcess(options: {
  command: string;
  args: string[];
  cwd: string;
  projectRoot: string;
  envRoot: string;
  timeoutMs: number;
}): Promise<{ exitCode: number | null; stderr: string }> {
  return new Promise((resolvePromise) => {
    const child = spawn(options.command, options.args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        PATH: [
          dirname(options.command),
          join(options.projectRoot, "node_modules", ".bin"),
          ...lspBinDirs(options.projectRoot),
          process.env.PATH ?? "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        ].join(":"),
        COURSIER_CACHE: coursierCacheDirs(options.projectRoot)[0],
        XDG_CACHE_HOME: join(options.envRoot, "cache"),
        JAVA_TOOL_OPTIONS: javaToolOptions(join(options.envRoot, "home")),
        HOME: join(options.envRoot, "home"),
        TMPDIR: join(options.envRoot, "tmp"),
        TMP: join(options.envRoot, "tmp"),
        TEMP: join(options.envRoot, "tmp")
      },
      stdio: ["ignore", "ignore", "pipe"]
    });
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), options.timeoutMs);
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = tail(`${stderr}${chunk.toString("utf8")}`, MAX_STDERR_BYTES);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolvePromise({ exitCode: null, stderr: error.message });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolvePromise({ exitCode, stderr });
    });
  });
}

function waitForChildClose(child: ChildProcessWithoutNullStreams, timeoutMs: number): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      child.off("close", onClose);
      reject(new Error(`Process did not exit after ${timeoutMs} ms`));
    }, timeoutMs);
    function onClose() {
      clearTimeout(timer);
      resolvePromise();
    }
    child.once("close", onClose);
  });
}

function javaToolOptions(home: string): string {
  const existing = process.env.JAVA_TOOL_OPTIONS?.trim();
  const option = `-Duser.home=${home}`;
  return existing ? `${existing} ${option}` : option;
}

function statusForPack(pack: LanguagePack, command: ResolvedLspCommand): LspServerStatus {
  return {
    language: pack.id,
    configured: Boolean(pack.lsp),
    available: Boolean(command.resolvedCommand),
    state: command.resolvedCommand ? "stopped" : "missing",
    command: command.command || pack.lsp?.command,
    args: command.args.length ? command.args : pack.lsp?.args,
    resolvedCommand: command.resolvedCommand,
    install: pack.lsp?.install,
    message: command.message
  };
}

function localExecutableCandidates(command: string, projectRoot: string): string[] {
  const suffixes = process.platform === "win32" ? ["", ".cmd", ".exe"] : [""];
  return [
    ...suffixes.map((suffix) => join(projectRoot, "node_modules", ".bin", `${command}${suffix}`)),
    ...lspBinDirs(projectRoot).flatMap((dir) => suffixes.map((suffix) => join(dir, `${command}${suffix}`)))
  ];
}

async function executableExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function normalizeCompletionItems(result: unknown, code: string, cursor: number): LspCompletionItem[] {
  const items = Array.isArray(result)
    ? result
    : isObject(result) && Array.isArray(result.items)
      ? result.items
      : [];
  const fallbackRange = wordRangeAt(code, cursor);
  return items.flatMap((raw): LspCompletionItem[] => {
    if (!isObject(raw) || typeof raw.label !== "string") return [];
    const textEdit = isObject(raw.textEdit) ? raw.textEdit : undefined;
    const textEditRange = lspRangeFromTextEdit(textEdit);
    const newText = typeof textEdit?.newText === "string" ? textEdit.newText : undefined;
    const insertText = newText ?? (typeof raw.insertText === "string" ? raw.insertText : raw.label);
    const range = textEditRange
      ? {
        start: positionToOffset(code, textEditRange.start),
        end: positionToOffset(code, textEditRange.end)
      }
      : fallbackRange;

    return [{
      label: raw.label,
      detail: typeof raw.detail === "string" ? raw.detail : undefined,
      documentation: documentationToString(raw.documentation),
      kind: completionKindLabel(typeof raw.kind === "number" ? raw.kind : undefined),
      insertText,
      filterText: typeof raw.filterText === "string" ? raw.filterText : undefined,
      sortText: typeof raw.sortText === "string" ? raw.sortText : undefined,
      rangeStart: range.start,
      rangeEnd: range.end,
      isSnippet: raw.insertTextFormat === 2
    }];
  });
}

function normalizeDiagnostics(result: unknown, code: string): LspDiagnostic[] {
  if (!Array.isArray(result)) return [];
  return result.flatMap((raw): LspDiagnostic[] => {
    if (!isObject(raw) || !isLspRange(raw.range) || typeof raw.message !== "string") return [];
    return [{
      message: raw.message,
      severity: diagnosticSeverity(typeof raw.severity === "number" ? raw.severity : undefined),
      source: typeof raw.source === "string" ? raw.source : undefined,
      code: typeof raw.code === "string" || typeof raw.code === "number" ? String(raw.code) : undefined,
      rangeStart: positionToOffset(code, raw.range.start),
      rangeEnd: positionToOffset(code, raw.range.end)
    }];
  });
}

function normalizeHover(result: unknown, code: string): LspHover | undefined {
  if (!isObject(result)) return undefined;
  const contents = markedStringToText(result.contents);
  if (!contents.trim()) return undefined;
  const range = isLspRange(result.range) ? result.range : undefined;
  return {
    contents,
    rangeStart: range ? positionToOffset(code, range.start) : undefined,
    rangeEnd: range ? positionToOffset(code, range.end) : undefined
  };
}

function normalizeSignatureHelp(result: unknown): LspSignatureHelp | undefined {
  if (!isObject(result) || !Array.isArray(result.signatures) || result.signatures.length === 0) return undefined;
  const signatures = result.signatures.flatMap((raw): LspSignature[] => {
    if (!isObject(raw) || typeof raw.label !== "string") return [];
    const signatureLabel = raw.label;
    return [{
      label: signatureLabel,
      documentation: documentationToString(raw.documentation),
      parameters: Array.isArray(raw.parameters)
        ? raw.parameters.flatMap((param): LspSignatureParameter[] => {
          if (!isObject(param)) return [];
          return [{
            label: signatureParameterLabel(param.label, signatureLabel),
            documentation: documentationToString(param.documentation)
          }];
        })
        : []
    }];
  });
  if (!signatures.length) return undefined;
  return {
    signatures,
    activeSignature: clamp(typeof result.activeSignature === "number" ? result.activeSignature : 0, 0, signatures.length - 1),
    activeParameter: Math.max(0, typeof result.activeParameter === "number" ? result.activeParameter : 0)
  };
}

function normalizeTextEdits(result: unknown, code: string): LspTextEdit[] {
  if (!Array.isArray(result)) return [];
  return result.flatMap((raw): LspTextEdit[] => {
    if (!isObject(raw) || !isLspRange(raw.range) || typeof raw.newText !== "string") return [];
    return [{
      rangeStart: positionToOffset(code, raw.range.start),
      rangeEnd: positionToOffset(code, raw.range.end),
      newText: raw.newText
    }];
  });
}

function applyTextEdits(code: string, edits: LspTextEdit[]): string {
  return [...edits]
    .sort((left, right) => right.rangeStart - left.rangeStart)
    .reduce((current, edit) => `${current.slice(0, edit.rangeStart)}${edit.newText}${current.slice(edit.rangeEnd)}`, code);
}

function normalizeDocumentSymbols(result: unknown, code: string): LspDocumentSymbol[] {
  if (!Array.isArray(result)) return [];
  return result.flatMap((raw): LspDocumentSymbol[] => {
    if (!isObject(raw)) return [];
    if (isLspRange(raw.range) && isLspRange(raw.selectionRange)) {
      return normalizeHierarchicalSymbol(raw, code);
    }
    if (isObject(raw.location) && isLspRange(raw.location.range)) {
      return normalizeFlatSymbol(raw, code);
    }
    return [];
  });
}

function normalizeHierarchicalSymbol(raw: Record<string, unknown>, code: string): LspDocumentSymbol[] {
  if (typeof raw.name !== "string" || !isLspRange(raw.range) || !isLspRange(raw.selectionRange)) return [];
  return [{
    name: raw.name,
    detail: typeof raw.detail === "string" ? raw.detail : undefined,
    kind: symbolKindLabel(typeof raw.kind === "number" ? raw.kind : undefined),
    rangeStart: positionToOffset(code, raw.range.start),
    rangeEnd: positionToOffset(code, raw.range.end),
    selectionStart: positionToOffset(code, raw.selectionRange.start),
    selectionEnd: positionToOffset(code, raw.selectionRange.end),
    children: Array.isArray(raw.children)
      ? raw.children.flatMap((child) => isObject(child) ? normalizeHierarchicalSymbol(child, code) : [])
      : undefined
  }];
}

function normalizeFlatSymbol(raw: Record<string, unknown>, code: string): LspDocumentSymbol[] {
  if (typeof raw.name !== "string" || !isObject(raw.location) || !isLspRange(raw.location.range)) return [];
  const range = raw.location.range;
  return [{
    name: raw.name,
    kind: symbolKindLabel(typeof raw.kind === "number" ? raw.kind : undefined),
    rangeStart: positionToOffset(code, range.start),
    rangeEnd: positionToOffset(code, range.end),
    selectionStart: positionToOffset(code, range.start),
    selectionEnd: positionToOffset(code, range.end)
  }];
}

function normalizeDefinitions(
  result: unknown,
  currentDocument: OpenDocument,
  documents: Map<string, OpenDocument>
): LspDefinition[] {
  const locations = Array.isArray(result) ? result : result ? [result] : [];
  return locations.flatMap((raw): LspDefinition[] => {
    if (!isObject(raw)) return [];
    const uri = typeof raw.targetUri === "string"
      ? raw.targetUri
      : typeof raw.uri === "string"
        ? raw.uri
        : undefined;
    if (!uri) return [];
    const range = isLspRange(raw.targetRange)
      ? raw.targetRange
      : isLspRange(raw.range)
        ? raw.range
        : undefined;
    const selectionRange = isLspRange(raw.targetSelectionRange) ? raw.targetSelectionRange : range;
    const targetDocument = uri === currentDocument.uri ? currentDocument : documents.get(uri);
    return [{
      uri,
      sameDocument: uri === currentDocument.uri,
      rangeStart: range && targetDocument ? positionToOffset(targetDocument.text, range.start) : undefined,
      rangeEnd: range && targetDocument ? positionToOffset(targetDocument.text, range.end) : undefined,
      selectionStart: selectionRange && targetDocument ? positionToOffset(targetDocument.text, selectionRange.start) : undefined,
      selectionEnd: selectionRange && targetDocument ? positionToOffset(targetDocument.text, selectionRange.end) : undefined
    }];
  });
}

function markedStringToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(markedStringToText).filter(Boolean).join("\n\n");
  if (isObject(value)) {
    if (typeof value.value === "string") return value.value;
    if (typeof value.language === "string" && typeof value.value === "string") return value.value;
  }
  return "";
}

function signatureParameterLabel(value: unknown, signatureLabel: string): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    return signatureLabel.slice(value[0], value[1]);
  }
  return "";
}

function lspRangeFromTextEdit(textEdit: Record<string, unknown> | undefined): LspRange | undefined {
  if (!textEdit) return undefined;
  if (isLspRange(textEdit.range)) return textEdit.range;
  if (isLspRange(textEdit.replace)) return textEdit.replace;
  if (isLspRange(textEdit.insert)) return textEdit.insert;
  return undefined;
}

function isLspRange(value: unknown): value is LspRange {
  return isObject(value) && isLspPosition(value.start) && isLspPosition(value.end);
}

function isLspPosition(value: unknown): value is LspPosition {
  return isObject(value)
    && typeof value.line === "number"
    && typeof value.character === "number";
}

function documentationToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isObject(value) && typeof value.value === "string") return value.value;
  return undefined;
}

function offsetToPosition(code: string, offset: number): LspPosition {
  let line = 0;
  let lineStart = 0;
  for (let index = 0; index < offset; index += 1) {
    if (code.charCodeAt(index) === 10) {
      line += 1;
      lineStart = index + 1;
    }
  }
  return { line, character: offset - lineStart };
}

function positionToOffset(code: string, position: LspPosition): number {
  let line = 0;
  let lineStart = 0;
  while (line < position.line) {
    const nextBreak = code.indexOf("\n", lineStart);
    if (nextBreak < 0) return code.length;
    line += 1;
    lineStart = nextBreak + 1;
  }
  const lineEnd = code.indexOf("\n", lineStart);
  const max = lineEnd < 0 ? code.length : lineEnd;
  return clamp(lineStart + position.character, lineStart, max);
}

function wordRangeAt(code: string, cursor: number): { start: number; end: number } {
  const safeCursor = clamp(cursor, 0, code.length);
  let start = safeCursor;
  let end = safeCursor;
  while (start > 0 && isWordChar(code[start - 1])) start -= 1;
  while (end < code.length && isWordChar(code[end])) end += 1;
  return { start, end };
}

function isWordChar(value: string | undefined): boolean {
  return Boolean(value && /[A-Za-z0-9_$]/.test(value));
}

function safePathSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}

function completionKindLabel(kind: number | undefined): string | undefined {
  if (kind === undefined) return undefined;
  return [
    "text",
    "method",
    "function",
    "constructor",
    "field",
    "variable",
    "class",
    "interface",
    "module",
    "property",
    "unit",
    "value",
    "enum",
    "keyword",
    "snippet",
    "color",
    "file",
    "reference",
    "folder",
    "enumMember",
    "constant",
    "struct",
    "event",
    "operator",
    "typeParameter"
  ][kind - 1];
}

function diagnosticSeverity(severity: number | undefined): LspDiagnostic["severity"] {
  if (severity === 1) return "error";
  if (severity === 2) return "warning";
  if (severity === 3) return "info";
  if (severity === 4) return "hint";
  return "info";
}

function symbolKindLabel(kind: number | undefined): string | undefined {
  if (kind === undefined) return undefined;
  return [
    "file",
    "module",
    "namespace",
    "package",
    "class",
    "method",
    "property",
    "field",
    "constructor",
    "enum",
    "interface",
    "function",
    "variable",
    "constant",
    "string",
    "number",
    "boolean",
    "array",
    "object",
    "key",
    "null",
    "enumMember",
    "struct",
    "event",
    "operator",
    "typeParameter"
  ][kind - 1];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tail(value: string, maxBytes: number): string {
  const buffer = Buffer.from(value, "utf8");
  if (buffer.byteLength <= maxBytes) return value;
  return buffer.subarray(buffer.byteLength - maxBytes).toString("utf8");
}
