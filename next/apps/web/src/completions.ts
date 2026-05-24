import type { FunctionSignature, LanguageId, ProblemLanguageSupport, ValueType } from "../../../src/core/types";

export interface CompletionItem {
  label: string;
  insertText: string;
  detail: string;
  kind: "keyword" | "snippet" | "symbol" | "builtin";
  cursorOffset?: number;
}

export interface CompletionResult {
  query: string;
  rangeStart: number;
  rangeEnd: number;
  items: CompletionItem[];
}

export interface CompletionContext {
  language: LanguageId;
  code: string;
  cursor: number;
  signature?: FunctionSignature;
  support?: ProblemLanguageSupport;
  explicit?: boolean;
}

const TOKEN = /[A-Za-z0-9_$]/;

export function getCompletions(context: CompletionContext): CompletionResult | null {
  const range = currentTokenRange(context.code, context.cursor);
  const query = context.code.slice(range.start, range.end);
  if (!context.explicit && query.length < 2) return null;

  const items = [
    ...signatureCompletions(context.language, context.signature, context.support),
    ...parameterCompletions(context.signature),
    ...identifierCompletions(context.code, context.language),
    ...languageCompletions(context.language)
  ];
  const unique = dedupeCompletions(items);
  const filtered = unique
    .filter((item) => !query || item.label !== query || item.insertText !== query)
    .filter((item) => completionMatches(item, query))
    .sort((left, right) => completionRank(left, query) - completionRank(right, query) || left.label.localeCompare(right.label))
    .slice(0, 12);

  if (!filtered.length) return null;
  return {
    query,
    rangeStart: range.start,
    rangeEnd: range.end,
    items: filtered
  };
}

export function applyCompletion(
  code: string,
  rangeStart: number,
  rangeEnd: number,
  item: CompletionItem
): { code: string; cursor: number } {
  const before = code.slice(0, rangeStart);
  const after = code.slice(rangeEnd);
  const cursor = before.length + (item.cursorOffset ?? item.insertText.length);
  return {
    code: `${before}${item.insertText}${after}`,
    cursor
  };
}

function currentTokenRange(code: string, cursor: number): { start: number; end: number } {
  let start = cursor;
  while (start > 0 && TOKEN.test(code[start - 1] ?? "")) start -= 1;
  let end = cursor;
  while (end < code.length && TOKEN.test(code[end] ?? "")) end += 1;
  return { start, end };
}

function signatureCompletions(
  language: LanguageId,
  signature?: FunctionSignature,
  support?: ProblemLanguageSupport
): CompletionItem[] {
  if (!signature || !support) return [];
  const entrypoint = support.entrypoint;
  const callArgs = signature.inputs.map((input) => input.name).join(", ");
  const items: CompletionItem[] = [
    {
      label: entrypoint,
      insertText: `${entrypoint}(${callArgs})`,
      detail: "problem entrypoint",
      kind: "symbol"
    }
  ];

  if (language === "typescript") {
    const params = signature.inputs.map((input) => `${input.name}: ${tsType(input.type)}`).join(", ");
    const header = `export function ${entrypoint}(${params}): ${tsType(signature.output)} {\n  `;
    items.push({
      label: "export function",
      insertText: `${header}\n}`,
      cursorOffset: header.length,
      detail: "problem function",
      kind: "snippet"
    });
  } else if (language === "python") {
    const header = `def ${entrypoint}(${signature.inputs.map((input) => input.name).join(", ")}):\n    `;
    items.push({
      label: "def entrypoint",
      insertText: `${header}pass`,
      cursorOffset: header.length,
      detail: "problem function",
      kind: "snippet"
    });
  } else if (language === "go") {
    const params = signature.inputs.map((input) => `${input.name} ${goType(input.type)}`).join(", ");
    const header = `func ${entrypoint}(${params}) ${goType(signature.output)} {\n\t`;
    items.push({
      label: "func entrypoint",
      insertText: `${header}\n}`,
      cursorOffset: header.length,
      detail: "problem function",
      kind: "snippet"
    });
  } else if (language === "scala") {
    const params = signature.inputs.map((input) => `${input.name}: ${scalaType(input.type)}`).join(", ");
    const header = `object Solution {\n  def ${entrypoint}(${params}): ${scalaType(signature.output)} = {\n    `;
    items.push({
      label: "def entrypoint",
      insertText: `${header}\n  }\n}`,
      cursorOffset: header.length,
      detail: "problem function",
      kind: "snippet"
    });
  }

  return items;
}

function parameterCompletions(signature?: FunctionSignature): CompletionItem[] {
  return signature?.inputs.map((input) => ({
    label: input.name,
    insertText: input.name,
    detail: typeSummary(input.type),
    kind: "symbol" as const
  })) ?? [];
}

function identifierCompletions(code: string, language: LanguageId): CompletionItem[] {
  const reserved = new Set(languageCompletions(language).map((item) => item.label));
  const identifiers = new Set<string>();
  for (const match of code.matchAll(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g)) {
    const value = match[0];
    if (value.length >= 3 && !reserved.has(value)) identifiers.add(value);
  }
  return [...identifiers].slice(0, 80).map((label) => ({
    label,
    insertText: label,
    detail: "local symbol",
    kind: "symbol"
  }));
}

function languageCompletions(language: LanguageId): CompletionItem[] {
  if (language === "python") return pythonCompletions;
  if (language === "go") return goCompletions;
  if (language === "scala") return scalaCompletions;
  return typeScriptCompletions;
}

const typeScriptCompletions: CompletionItem[] = [
  item("const", "const value = ", "constant declaration", "keyword"),
  item("let", "let value = ", "variable declaration", "keyword"),
  item("return", "return ", "return value", "keyword"),
  item("if", "if () {\n  \n}", "conditional", "snippet", 4),
  item("for of", "for (const item of items) {\n  \n}", "iterate values", "snippet", 11),
  item("for index", "for (let index = 0; index < items.length; index += 1) {\n  \n}", "counted loop", "snippet", 9),
  item("Map", "new Map()", "key-value map", "builtin"),
  item("Set", "new Set()", "unique values", "builtin"),
  item("Array.from", "Array.from()", "array from iterable", "builtin"),
  item("Math.max", "Math.max()", "maximum value", "builtin"),
  item("JSON.stringify", "JSON.stringify()", "serialize value", "builtin")
];

const pythonCompletions: CompletionItem[] = [
  item("def", "def name():\n    ", "function definition", "snippet", 4),
  item("return", "return ", "return value", "keyword"),
  item("if", "if condition:\n    ", "conditional", "snippet", 3),
  item("elif", "elif condition:\n    ", "conditional branch", "snippet", 5),
  item("else", "else:\n    ", "fallback branch", "snippet"),
  item("for", "for item in items:\n    ", "iterate values", "snippet", 4),
  item("while", "while condition:\n    ", "loop while true", "snippet", 6),
  item("len", "len()", "length", "builtin"),
  item("range", "range()", "integer range", "builtin"),
  item("enumerate", "enumerate()", "index and value", "builtin"),
  item("defaultdict", "defaultdict(int)", "default dictionary", "builtin"),
  item("deque", "deque()", "double-ended queue", "builtin")
];

const goCompletions: CompletionItem[] = [
  item("func", "func name() {\n\t\n}", "function definition", "snippet", 5),
  item("return", "return ", "return value", "keyword"),
  item("if", "if condition {\n\t\n}", "conditional", "snippet", 3),
  item("else", "else {\n\t\n}", "fallback branch", "snippet"),
  item("for range", "for _, value := range values {\n\t\n}", "iterate values", "snippet", 15),
  item("for index", "for index := 0; index < len(values); index++ {\n\t\n}", "counted loop", "snippet", 4),
  item("make", "make()", "allocate map/slice", "builtin"),
  item("append", "append()", "append to slice", "builtin"),
  item("len", "len()", "length", "builtin"),
  item("map", "map[string]int{}", "map literal", "builtin"),
  item("[]int", "[]int{}", "integer slice", "builtin")
];

const scalaCompletions: CompletionItem[] = [
  item("def", "def name(): Int = {\n  \n}", "function definition", "snippet", 4),
  item("val", "val value = ", "immutable value", "keyword"),
  item("var", "var value = ", "mutable value", "keyword"),
  item("return", "return ", "return value", "keyword"),
  item("if", "if condition then\n  \nelse\n  ", "conditional", "snippet", 3),
  item("for", "for value <- values do\n  ", "iterate values", "snippet", 4),
  item("match", "value match {\n  case _ => \n}", "pattern match", "snippet", 0),
  item("Seq", "Seq()", "sequence", "builtin"),
  item("Map", "Map()", "map", "builtin"),
  item("Set", "Set()", "set", "builtin"),
  item("ArrayBuffer", "scala.collection.mutable.ArrayBuffer.empty[Int]", "mutable buffer", "builtin"),
  item("Option", "Option()", "optional value", "builtin"),
  item("Some", "Some()", "present optional value", "builtin"),
  item("None", "None", "empty optional value", "builtin")
];

function item(
  label: string,
  insertText: string,
  detail: string,
  kind: CompletionItem["kind"],
  cursorOffset?: number
): CompletionItem {
  return { label, insertText, detail, kind, cursorOffset };
}

function completionMatches(item: CompletionItem, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return item.label.toLowerCase().includes(needle) || item.insertText.toLowerCase().startsWith(needle);
}

function completionRank(item: CompletionItem, query: string): number {
  if (!query) return kindRank(item.kind);
  const label = item.label.toLowerCase();
  const needle = query.toLowerCase();
  if (label === needle) return 0;
  if (label.startsWith(needle)) return 1 + kindRank(item.kind);
  return 10 + kindRank(item.kind);
}

function kindRank(kind: CompletionItem["kind"]): number {
  if (kind === "symbol") return 0;
  if (kind === "snippet") return 1;
  if (kind === "keyword") return 2;
  return 3;
}

function dedupeCompletions(items: CompletionItem[]): CompletionItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}:${item.insertText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tsType(type: ValueType): string {
  if (type.type === "array") return `${tsType(type.items ?? { type: "any" })}[]`;
  if (type.type === "object") return "Record<string, unknown>";
  if (type.type === "number") return "number";
  if (type.type === "boolean") return "boolean";
  if (type.type === "string") return "string";
  return "unknown";
}

function goType(type: ValueType): string {
  if (type.type === "array") return `[]${goType(type.items ?? { type: "any" })}`;
  if (type.type === "object") return "map[string]any";
  if (type.type === "number") return "int";
  if (type.type === "boolean") return "bool";
  if (type.type === "string") return "string";
  return "any";
}

function scalaType(type: ValueType): string {
  if (type.type === "array") return `Seq[${scalaType(type.items ?? { type: "any" })}]`;
  if (type.type === "object") return "Map[String, Any]";
  if (type.type === "number") return "Int";
  if (type.type === "boolean") return "Boolean";
  if (type.type === "string") return "String";
  return "Any";
}

function typeSummary(type: ValueType): string {
  const base = type.type === "array" ? `${typeSummary(type.items ?? { type: "any" })}[]` : type.type;
  return type.nullable ? `${base} | null` : base;
}
