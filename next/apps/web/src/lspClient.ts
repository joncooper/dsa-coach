import type {
  LspCompletionRequest,
  LspCompletionResponse,
  LspDefinitionResponse,
  LspDiagnosticsResponse,
  LspDocumentRequest,
  LspFormatResponse,
  LspHoverResponse,
  LspPositionRequest,
  LspSignatureHelpResponse,
  LspSymbolsResponse
} from "../../../src/lsp/types";

const API_BASE = import.meta.env.VITE_DSA_DAEMON_URL ?? "http://127.0.0.1:4777";

export async function getLspCompletions(
  request: LspCompletionRequest,
  timeoutMs: number
): Promise<LspCompletionResponse | null> {
  return postLsp<LspCompletionResponse>("/lsp/completions", request, timeoutMs);
}

export async function getLspDiagnostics(
  request: LspDocumentRequest,
  timeoutMs: number
): Promise<LspDiagnosticsResponse | null> {
  return postLsp<LspDiagnosticsResponse>("/lsp/diagnostics", request, timeoutMs);
}

export async function getLspHover(
  request: LspPositionRequest,
  timeoutMs: number
): Promise<LspHoverResponse | null> {
  return postLsp<LspHoverResponse>("/lsp/hover", request, timeoutMs);
}

export async function getLspSignatureHelp(
  request: LspPositionRequest,
  timeoutMs: number
): Promise<LspSignatureHelpResponse | null> {
  return postLsp<LspSignatureHelpResponse>("/lsp/signature-help", request, timeoutMs);
}

export async function formatWithLsp(
  request: LspDocumentRequest,
  timeoutMs: number
): Promise<LspFormatResponse | null> {
  return postLsp<LspFormatResponse>("/lsp/format", request, timeoutMs);
}

export async function getLspSymbols(
  request: LspDocumentRequest,
  timeoutMs: number
): Promise<LspSymbolsResponse | null> {
  return postLsp<LspSymbolsResponse>("/lsp/symbols", request, timeoutMs);
}

export async function getLspDefinition(
  request: LspPositionRequest,
  timeoutMs: number
): Promise<LspDefinitionResponse | null> {
  return postLsp<LspDefinitionResponse>("/lsp/definition", request, timeoutMs);
}

async function postLsp<T>(path: string, request: unknown, timeoutMs: number): Promise<T | null> {
  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: abort.signal
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
