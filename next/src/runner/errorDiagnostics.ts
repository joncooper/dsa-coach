import type { RunDiagnostic } from "../core/types.js";

export interface DiagnosticContext {
  language: string;
  sourceFile: string;
  source: string;
}

export function diagnosticsFromErrorText(text: string | undefined, context: DiagnosticContext, fallbackMessage?: string): RunDiagnostic[] {
  const normalized = (text ?? "").replace(/\r\n/g, "\n");
  const diagnostics: RunDiagnostic[] = [];
  const seen = new Set<string>();
  const filePattern = escapeRegExp(context.sourceFile);

  const add = (diagnostic: RunDiagnostic) => {
    const key = `${diagnostic.file ?? ""}:${diagnostic.line ?? ""}:${diagnostic.column ?? ""}:${diagnostic.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    diagnostics.push(diagnostic);
  };

  const directPatterns: RegExp[] = [
    new RegExp(`(?:^|.*[/\\\\])?(${filePattern})\\((\\d+),(\\d+)\\):\\s*(?:error\\s+)?(?:TS\\d+:\\s*)?(.+)$`),
    new RegExp(`(?:^|.*[/\\\\])?(${filePattern}):(\\d+):(\\d+):\\s*(.+)$`),
    new RegExp(`(?:^|.*[/\\\\])?(${filePattern}):(\\d+):\\s*(.+)$`)
  ];

  for (const lineText of normalized.split("\n")) {
    const trimmed = lineText.trim();
    if (!trimmed || /^at\s/.test(trimmed)) continue;
    for (const pattern of directPatterns) {
      const match = pattern.exec(trimmed);
      if (!match) continue;
      const hasColumn = match.length === 5;
      const line = Number(match[2]);
      const column = hasColumn ? Number(match[3]) : undefined;
      const message = cleanMessage(hasColumn ? match[4] : match[3]);
      if (!message || /^[)\]]+$/.test(message)) continue;
      add(locationDiagnostic(message, context, line, column));
    }
  }

  const jsStackPattern = new RegExp(`(?:^|\\n)\\s*at\\s+(?:[^\\n(]*\\()?[^\\n()]*${filePattern}:(\\d+):(\\d+)\\)?`, "g");
  const stackMessage = errorSummary(normalized, fallbackMessage);
  for (const match of normalized.matchAll(jsStackPattern)) {
    if (!stackMessage) continue;
    add(locationDiagnostic(stackMessage, context, Number(match[1]), Number(match[2])));
  }

  const pythonPattern = new RegExp(`File "([^"]*${filePattern})", line (\\d+)(?:, [^\\n]+)?\\n(?:([^\\n]+)\\n)?(?:(\\s*\\^+)\\n)?`, "g");
  for (const match of normalized.matchAll(pythonPattern)) {
    const line = Number(match[2]);
    const sourceLine = match[3]?.trimEnd();
    const caretLine = match[4];
    const sourceColumn = sourceLine ? sourceLine.search(/\S|$/) + 1 : undefined;
    const caretColumn = caretLine?.indexOf("^");
    const column = caretColumn !== undefined && caretColumn >= 0 ? caretColumn + 1 : sourceColumn;
    const length = caretLine ? Math.max(1, caretLine.trim().length) : 1;
    add(locationDiagnostic(errorSummary(normalized, fallbackMessage), context, line, column, length));
  }

  if (!diagnostics.length) {
    const message = errorSummary(normalized, fallbackMessage);
    if (message) {
      diagnostics.push({
        message,
        severity: "error",
        source: context.language,
        file: context.sourceFile
      });
    }
  }

  return diagnostics;
}

export function locationDiagnostic(message: string, context: DiagnosticContext, line: number, column?: number, length = 1): RunDiagnostic {
  return {
    message,
    severity: "error",
    source: context.language,
    file: context.sourceFile,
    line,
    column,
    snippet: snippetForSource(context.source, line, column, length)
  };
}

export function formatDiagnosticsForStderr(diagnostics: RunDiagnostic[]): string {
  return diagnostics.map((diagnostic) => {
    const location = diagnostic.line ? `${diagnostic.file ?? "solution"}:${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ""}` : diagnostic.file ?? "solution";
    const code = diagnostic.code ? ` ${diagnostic.code}` : "";
    return `${location}${code}: ${diagnostic.message}`;
  }).join("\n");
}

function snippetForSource(source: string, line: number, column?: number, length = 1): RunDiagnostic["snippet"] {
  if (line < 1) return undefined;
  const lines = source.split(/\r?\n/);
  const index = line - 1;
  if (index < 0 || index >= lines.length) return undefined;
  const start = Math.max(0, index - 1);
  const end = Math.min(lines.length - 1, index + 1);
  const snippet = [];
  for (let current = start; current <= end; current += 1) {
    snippet.push({
      line: current + 1,
      text: lines[current],
      markerStart: current === index && column ? Math.max(1, column) : undefined,
      markerLength: current === index && column ? Math.max(1, length) : undefined
    });
  }
  return snippet;
}

function errorSummary(text: string, fallback?: string): string {
  const preferred = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) =>
      line &&
      !line.startsWith("at ") &&
      !line.startsWith("File ") &&
      !line.startsWith("^") &&
      !/^Node\.js v\d+/.test(line) &&
      !/^\d+\s*\|/.test(line)
    );
  return cleanMessage(preferred[preferred.length - 1] ?? fallback ?? "");
}

function cleanMessage(value: string | undefined): string {
  return (value ?? "").replace(/\s+$/g, "").replace(/^error\s+/, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
