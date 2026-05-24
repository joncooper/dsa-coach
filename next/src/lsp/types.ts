import type { LanguageId } from "../core/types.js";

export interface LspCompletionRequest {
  language: LanguageId;
  problemId: string;
  partId?: string;
  code: string;
  cursor: number;
  timeoutMs?: number;
}

export interface LspDocumentRequest {
  language: LanguageId;
  problemId: string;
  partId?: string;
  code: string;
  timeoutMs?: number;
}

export interface LspPositionRequest extends LspDocumentRequest {
  cursor: number;
}

export type LspFeatureStatus = "ok" | "unavailable" | "timeout" | "error";

export interface LspCompletionResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  items: LspCompletionItem[];
  message?: string;
  server?: LspServerStatus;
}

export interface LspCompletionItem {
  label: string;
  detail?: string;
  documentation?: string;
  kind?: string;
  insertText: string;
  filterText?: string;
  sortText?: string;
  rangeStart: number;
  rangeEnd: number;
  isSnippet?: boolean;
}

export interface LspDiagnosticsResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  diagnostics: LspDiagnostic[];
  message?: string;
  server?: LspServerStatus;
}

export interface LspDiagnostic {
  message: string;
  severity: "error" | "warning" | "info" | "hint";
  source?: string;
  code?: string;
  rangeStart: number;
  rangeEnd: number;
}

export interface LspHoverResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  hover?: LspHover;
  message?: string;
  server?: LspServerStatus;
}

export interface LspHover {
  contents: string;
  rangeStart?: number;
  rangeEnd?: number;
}

export interface LspSignatureHelpResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  help?: LspSignatureHelp;
  message?: string;
  server?: LspServerStatus;
}

export interface LspSignatureHelp {
  activeSignature: number;
  activeParameter: number;
  signatures: LspSignature[];
}

export interface LspSignature {
  label: string;
  documentation?: string;
  parameters: LspSignatureParameter[];
}

export interface LspSignatureParameter {
  label: string;
  documentation?: string;
}

export interface LspFormatResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  code: string;
  edits: LspTextEdit[];
  message?: string;
  server?: LspServerStatus;
}

export interface LspTextEdit {
  rangeStart: number;
  rangeEnd: number;
  newText: string;
}

export interface LspSymbolsResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  symbols: LspDocumentSymbol[];
  message?: string;
  server?: LspServerStatus;
}

export interface LspDocumentSymbol {
  name: string;
  detail?: string;
  kind?: string;
  rangeStart: number;
  rangeEnd: number;
  selectionStart: number;
  selectionEnd: number;
  children?: LspDocumentSymbol[];
}

export interface LspDefinitionResponse {
  language: LanguageId;
  status: LspFeatureStatus;
  definitions: LspDefinition[];
  message?: string;
  server?: LspServerStatus;
}

export interface LspDefinition {
  uri: string;
  rangeStart?: number;
  rangeEnd?: number;
  selectionStart?: number;
  selectionEnd?: number;
  sameDocument: boolean;
}

export interface LspServerStatus {
  language: LanguageId;
  configured: boolean;
  available: boolean;
  state: "disabled" | "missing" | "starting" | "running" | "stopped" | "error";
  command?: string;
  args?: string[];
  resolvedCommand?: string;
  install?: {
    kind: "npm" | "go" | "coursier" | "manual";
    packageName?: string;
    command?: string;
    args?: string[];
    notes?: string;
  };
  message?: string;
  stderr?: string;
}
