import type { Completion, CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { snippetCompletion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { intellisenseReady, requestCompletions, type JediCompletion } from "./intellisenseClient";

const PYTHON_KEYWORDS = [
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
  "del", "elif", "else", "except", "False", "finally", "for", "from", "global",
  "if", "import", "in", "is", "lambda", "None", "nonlocal", "not", "or", "pass",
  "raise", "return", "True", "try", "while", "with", "yield"
];

const PYTHON_BUILTINS = [
  "abs", "all", "any", "ascii", "bin", "bool", "bytearray", "bytes", "callable",
  "chr", "classmethod", "compile", "complex", "delattr", "dict", "dir", "divmod",
  "enumerate", "eval", "exec", "filter", "float", "format", "frozenset", "getattr",
  "globals", "hasattr", "hash", "help", "hex", "id", "input", "int", "isinstance",
  "issubclass", "iter", "len", "list", "locals", "map", "max", "memoryview", "min",
  "next", "object", "oct", "open", "ord", "pow", "print", "property", "range",
  "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod",
  "str", "sum", "super", "tuple", "type", "vars", "zip"
];

const PYTHON_EXCEPTIONS = [
  "Exception", "ArithmeticError", "AssertionError", "AttributeError", "EOFError",
  "FileNotFoundError", "FloatingPointError", "ImportError", "IndexError", "KeyError",
  "KeyboardInterrupt", "LookupError", "MemoryError", "NameError", "NotImplementedError",
  "OSError", "OverflowError", "PermissionError", "RecursionError", "RuntimeError",
  "StopAsyncIteration", "StopIteration", "SyntaxError", "SystemError", "SystemExit",
  "TimeoutError", "TypeError", "UnicodeError", "ValueError", "ZeroDivisionError"
];

type ModuleSpec = {
  module: string;
  functions?: string[];
  classes?: string[];
  constants?: string[];
};

// Symbols from the modules pre-imported by the harness in pyodide.worker.ts.
const STDLIB_MODULES: ModuleSpec[] = [
  {
    module: "collections",
    classes: ["Counter", "deque", "defaultdict", "OrderedDict", "namedtuple", "ChainMap", "UserDict", "UserList", "UserString"]
  },
  {
    module: "heapq",
    functions: ["heappush", "heappop", "heappushpop", "heapify", "heapreplace", "merge", "nlargest", "nsmallest"]
  },
  {
    module: "bisect",
    functions: ["bisect", "bisect_left", "bisect_right", "insort", "insort_left", "insort_right"]
  },
  {
    module: "itertools",
    functions: [
      "accumulate", "chain", "combinations", "combinations_with_replacement", "compress",
      "count", "cycle", "dropwhile", "filterfalse", "groupby", "islice", "pairwise",
      "permutations", "product", "repeat", "starmap", "takewhile", "tee", "zip_longest"
    ]
  },
  {
    module: "functools",
    functions: ["cache", "cached_property", "cmp_to_key", "lru_cache", "partial", "partialmethod", "reduce", "singledispatch", "total_ordering", "wraps"]
  },
  {
    module: "math",
    functions: [
      "ceil", "floor", "trunc", "round", "sqrt", "isqrt", "pow", "exp", "log", "log2",
      "log10", "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "hypot", "gcd", "lcm",
      "factorial", "fabs", "fmod", "isfinite", "isinf", "isnan", "comb", "perm", "copysign"
    ],
    constants: ["pi", "e", "inf", "nan", "tau"]
  },
  {
    module: "re",
    functions: ["match", "search", "findall", "finditer", "split", "sub", "subn", "compile", "escape", "fullmatch"],
    constants: ["IGNORECASE", "MULTILINE", "DOTALL", "ASCII", "VERBOSE"]
  },
  {
    module: "typing",
    classes: [
      "Any", "Callable", "ClassVar", "Dict", "FrozenSet", "Generic", "Iterable", "Iterator",
      "List", "Literal", "Mapping", "MutableMapping", "MutableSequence", "MutableSet", "Optional",
      "Sequence", "Set", "Tuple", "Type", "TypeVar", "Union", "NamedTuple", "Protocol", "Final"
    ]
  }
];

const KEYWORD_COMPLETIONS: Completion[] = PYTHON_KEYWORDS.map((word) => ({
  label: word,
  type: "keyword",
  boost: -10
}));

const BUILTIN_COMPLETIONS: Completion[] = PYTHON_BUILTINS.map((name) => ({
  label: name,
  type: "function"
}));

const EXCEPTION_COMPLETIONS: Completion[] = PYTHON_EXCEPTIONS.map((name) => ({
  label: name,
  type: "class",
  boost: -5
}));

const MODULE_COMPLETIONS: Completion[] = STDLIB_MODULES.map((spec) => ({
  label: spec.module,
  type: "namespace",
  boost: -2
}));

// Flat list of every stdlib symbol surfaced when no module dot prefix is active.
// Each carries a `detail` hinting the source module so the popup is self-explanatory.
const STDLIB_FLAT_COMPLETIONS: Completion[] = STDLIB_MODULES.flatMap((spec) => {
  const out: Completion[] = [];
  for (const fn of spec.functions ?? []) {
    out.push({ label: fn, type: "function", detail: spec.module, boost: -3 });
  }
  for (const cls of spec.classes ?? []) {
    out.push({ label: cls, type: "class", detail: spec.module, boost: -3 });
  }
  for (const constant of spec.constants ?? []) {
    out.push({ label: constant, type: "constant", detail: spec.module, boost: -4 });
  }
  return out;
});

const DEF_SNIPPET = snippetCompletion("def ${name}(${args}):\n    ${body}", {
  label: "def",
  type: "keyword",
  detail: "function definition",
  boost: 5
});

const FOR_SNIPPET = snippetCompletion("for ${item} in ${iterable}:\n    ${body}", {
  label: "for",
  type: "keyword",
  detail: "for loop",
  boost: 5
});

const WHILE_SNIPPET = snippetCompletion("while ${condition}:\n    ${body}", {
  label: "while",
  type: "keyword",
  detail: "while loop",
  boost: 5
});

const IF_SNIPPET = snippetCompletion("if ${condition}:\n    ${body}", {
  label: "if",
  type: "keyword",
  detail: "if statement",
  boost: 5
});

const CLASS_SNIPPET = snippetCompletion("class ${Name}:\n    def __init__(self, ${args}):\n        ${body}", {
  label: "class",
  type: "keyword",
  detail: "class definition",
  boost: 5
});

const SNIPPETS: Completion[] = [DEF_SNIPPET, FOR_SNIPPET, WHILE_SNIPPET, IF_SNIPPET, CLASS_SNIPPET];

const MODULE_INDEX = new Map<string, ModuleSpec>(STDLIB_MODULES.map((spec) => [spec.module, spec]));

const TOP_LEVEL = [
  ...SNIPPETS,
  ...KEYWORD_COMPLETIONS,
  ...BUILTIN_COMPLETIONS,
  ...EXCEPTION_COMPLETIONS,
  ...MODULE_COMPLETIONS,
  ...STDLIB_FLAT_COMPLETIONS
];

function memberCompletions(spec: ModuleSpec): Completion[] {
  const out: Completion[] = [];
  for (const fn of spec.functions ?? []) {
    out.push({ label: fn, type: "function", detail: spec.module });
  }
  for (const cls of spec.classes ?? []) {
    out.push({ label: cls, type: "class", detail: spec.module });
  }
  for (const constant of spec.constants ?? []) {
    out.push({ label: constant, type: "constant", detail: spec.module });
  }
  return out;
}

const MEMBER_LOOKUP = new Map<string, Completion[]>(
  STDLIB_MODULES.map((spec) => [spec.module, memberCompletions(spec)])
);

// Instant, offline member completion for builtin container types. This is
// the fallback while the Jedi language service warms up (and a safety net
// where it never loads). Jedi remains the general/arbitrary path.
interface Method {
  name: string;
  sig: string;
  doc: string;
}

const LIST_METHODS: Method[] = [
  { name: "append", sig: "append(object)", doc: "Append object to the end of the list." },
  { name: "clear", sig: "clear()", doc: "Remove all items from the list." },
  { name: "copy", sig: "copy()", doc: "Return a shallow copy of the list." },
  { name: "count", sig: "count(value)", doc: "Return the number of occurrences of value." },
  { name: "extend", sig: "extend(iterable)", doc: "Extend the list by appending all items from the iterable." },
  { name: "index", sig: "index(value, start=0, stop=...)", doc: "Return first index of value. Raises ValueError if absent." },
  { name: "insert", sig: "insert(index, object)", doc: "Insert object before index." },
  { name: "pop", sig: "pop(index=-1)", doc: "Remove and return item at index (default last)." },
  { name: "remove", sig: "remove(value)", doc: "Remove first occurrence of value." },
  { name: "reverse", sig: "reverse()", doc: "Reverse the list in place." },
  { name: "sort", sig: "sort(key=None, reverse=False)", doc: "Sort the list in place." }
];

const DICT_METHODS: Method[] = [
  { name: "clear", sig: "clear()", doc: "Remove all items." },
  { name: "copy", sig: "copy()", doc: "Return a shallow copy." },
  { name: "fromkeys", sig: "fromkeys(iterable, value=None)", doc: "Create a new dict with keys from iterable." },
  { name: "get", sig: "get(key, default=None)", doc: "Return value for key if present, else default." },
  { name: "items", sig: "items()", doc: "A view of the dict's (key, value) pairs." },
  { name: "keys", sig: "keys()", doc: "A view of the dict's keys." },
  { name: "pop", sig: "pop(key, default=...)", doc: "Remove key and return its value." },
  { name: "popitem", sig: "popitem()", doc: "Remove and return a (key, value) pair (LIFO)." },
  { name: "setdefault", sig: "setdefault(key, default=None)", doc: "Return value for key, inserting default if absent." },
  { name: "update", sig: "update(other)", doc: "Update the dict from another mapping or iterable of pairs." },
  { name: "values", sig: "values()", doc: "A view of the dict's values." }
];

const SET_METHODS: Method[] = [
  { name: "add", sig: "add(elem)", doc: "Add elem to the set." },
  { name: "clear", sig: "clear()", doc: "Remove all elements." },
  { name: "copy", sig: "copy()", doc: "Return a shallow copy." },
  { name: "difference", sig: "difference(*others)", doc: "Return the difference as a new set." },
  { name: "difference_update", sig: "difference_update(*others)", doc: "Remove all elements of other sets." },
  { name: "discard", sig: "discard(elem)", doc: "Remove elem if present (no error if absent)." },
  { name: "intersection", sig: "intersection(*others)", doc: "Return the intersection as a new set." },
  { name: "isdisjoint", sig: "isdisjoint(other)", doc: "True if the set has no elements in common with other." },
  { name: "issubset", sig: "issubset(other)", doc: "True if every element is in other." },
  { name: "issuperset", sig: "issuperset(other)", doc: "True if every element of other is in the set." },
  { name: "pop", sig: "pop()", doc: "Remove and return an arbitrary element." },
  { name: "remove", sig: "remove(elem)", doc: "Remove elem; raises KeyError if absent." },
  { name: "symmetric_difference", sig: "symmetric_difference(other)", doc: "Elements in either set but not both." },
  { name: "union", sig: "union(*others)", doc: "Return the union as a new set." },
  { name: "update", sig: "update(*others)", doc: "Add elements from all others." }
];

const TUPLE_METHODS: Method[] = [
  { name: "count", sig: "count(value)", doc: "Return the number of occurrences of value." },
  { name: "index", sig: "index(value, start=0, stop=...)", doc: "Return first index of value." }
];

const STR_METHODS: Method[] = [
  { name: "count", sig: "count(sub, start=0, end=...)", doc: "Count non-overlapping occurrences of sub." },
  { name: "encode", sig: "encode(encoding='utf-8', errors='strict')", doc: "Encode to bytes." },
  { name: "endswith", sig: "endswith(suffix, start=0, end=...)", doc: "True if the string ends with suffix." },
  { name: "find", sig: "find(sub, start=0, end=...)", doc: "Lowest index of sub, or -1 if not found." },
  { name: "format", sig: "format(*args, **kwargs)", doc: "Format using replacement fields." },
  { name: "index", sig: "index(sub, start=0, end=...)", doc: "Like find but raises ValueError if absent." },
  { name: "isalnum", sig: "isalnum()", doc: "True if all chars are alphanumeric and there is at least one." },
  { name: "isalpha", sig: "isalpha()", doc: "True if all chars are alphabetic and there is at least one." },
  { name: "isdigit", sig: "isdigit()", doc: "True if all chars are digits and there is at least one." },
  { name: "islower", sig: "islower()", doc: "True if all cased chars are lowercase." },
  { name: "isspace", sig: "isspace()", doc: "True if all chars are whitespace and there is at least one." },
  { name: "isupper", sig: "isupper()", doc: "True if all cased chars are uppercase." },
  { name: "join", sig: "join(iterable)", doc: "Concatenate an iterable of strings using this string as separator." },
  { name: "ljust", sig: "ljust(width, fillchar=' ')", doc: "Left-justify in a string of given width." },
  { name: "lower", sig: "lower()", doc: "Return a lowercased copy." },
  { name: "lstrip", sig: "lstrip(chars=None)", doc: "Strip leading characters." },
  { name: "partition", sig: "partition(sep)", doc: "Split at first occurrence of sep into a 3-tuple." },
  { name: "removeprefix", sig: "removeprefix(prefix)", doc: "Return a copy with prefix removed if present." },
  { name: "removesuffix", sig: "removesuffix(suffix)", doc: "Return a copy with suffix removed if present." },
  { name: "replace", sig: "replace(old, new, count=-1)", doc: "Replace occurrences of old with new." },
  { name: "rfind", sig: "rfind(sub, start=0, end=...)", doc: "Highest index of sub, or -1." },
  { name: "rjust", sig: "rjust(width, fillchar=' ')", doc: "Right-justify in a string of given width." },
  { name: "rsplit", sig: "rsplit(sep=None, maxsplit=-1)", doc: "Split from the right." },
  { name: "rstrip", sig: "rstrip(chars=None)", doc: "Strip trailing characters." },
  { name: "split", sig: "split(sep=None, maxsplit=-1)", doc: "Split into a list of substrings." },
  { name: "splitlines", sig: "splitlines(keepends=False)", doc: "Split at line boundaries." },
  { name: "startswith", sig: "startswith(prefix, start=0, end=...)", doc: "True if the string starts with prefix." },
  { name: "strip", sig: "strip(chars=None)", doc: "Strip leading and trailing characters." },
  { name: "title", sig: "title()", doc: "Return a titlecased copy." },
  { name: "upper", sig: "upper()", doc: "Return an uppercased copy." },
  { name: "zfill", sig: "zfill(width)", doc: "Pad numeric string on the left with zeros." }
];

const BUILTIN_METHODS: Record<string, Method[]> = {
  list: LIST_METHODS,
  dict: DICT_METHODS,
  set: SET_METHODS,
  tuple: TUPLE_METHODS,
  str: STR_METHODS
};

function methodCompletions(type: string): Completion[] {
  return (BUILTIN_METHODS[type] ?? []).map((m) => ({
    label: m.name,
    type: "method",
    detail: m.sig.slice(m.sig.indexOf("(")),
    info: `${m.sig}\n\n${m.doc}`,
    boost: 3
  }));
}

const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;

/**
 * Lightweight inference: find the most recent simple assignment to `name`
 * before the cursor and map a builtin container literal/constructor to its
 * type. Conservative — returns null on anything ambiguous so we never show
 * the wrong members.
 */
export function inferBuiltinType(code: string, name: string, before: number): string | null {
  const escaped = name.replace(ESCAPE_RE, "\\$&");
  const re = new RegExp(`(?:^|\\n)[ \\t]*${escaped}[ \\t]*(?::[^=\\n]+)?=[ \\t]*([^\\n=]\\S*|$)`, "g");
  let rhs: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    if (match.index >= before) break;
    rhs = (match[1] ?? "").trim();
  }
  if (rhs === null) return null;
  if (rhs.startsWith("[") || rhs.startsWith("list(")) return "list";
  if (rhs.startsWith('"') || rhs.startsWith("'") || /^[rfb]+["']/.test(rhs) || rhs.startsWith("str(")) return "str";
  if (rhs.startsWith("dict(") || rhs === "{}" || /^\{[^}]*:/.test(rhs)) return "dict";
  if (rhs.startsWith("set(")) return "set";
  if (rhs.startsWith("{") && rhs.includes(",") && !rhs.includes(":")) return "set";
  if (rhs.startsWith("tuple(") || rhs === "()" || /^\([^)]*,/.test(rhs)) return "tuple";
  return null;
}

export const pythonStdlibCompletion: CompletionSource = (context: CompletionContext): CompletionResult | null => {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  // Skip completions inside strings and comments.
  if (nodeBefore.name === "String" || nodeBefore.name === "FormatString" || nodeBefore.name === "Comment") {
    return null;
  }

  const memberMatch = context.matchBefore(/([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)?$/);
  if (memberMatch) {
    const dotIndex = memberMatch.text.lastIndexOf(".");
    const owner = memberMatch.text.slice(0, dotIndex);
    const from = memberMatch.from + dotIndex + 1;
    const members = MEMBER_LOOKUP.get(owner);
    if (members) {
      return { from, options: members, validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/ };
    }
    // Not a known module — while the Jedi service is still warming up,
    // infer a builtin container type from the variable's most recent
    // assignment so member completion is instant. Once Jedi is ready it
    // gives richer, fully-typed signatures, so step aside for it.
    const inferred = intellisenseReady()
      ? null
      : inferBuiltinType(context.state.doc.toString(), owner, context.pos);
    if (inferred) {
      return {
        from,
        options: methodCompletions(inferred),
        validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
      };
    }
    // Let the Jedi source (or CodeMirror's word completion) handle it.
    return null;
  }

  const word = context.matchBefore(/[a-zA-Z_][a-zA-Z0-9_]*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: TOP_LEVEL,
    validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  };
};

function mapJediType(type: string): Completion["type"] {
  switch (type) {
    case "class":
      return "class";
    case "function":
      return "function";
    case "method":
      return "method";
    case "property":
      return "property";
    case "module":
      return "namespace";
    case "keyword":
      return "keyword";
    case "instance":
    case "statement":
    case "param":
      return "variable";
    default:
      return undefined;
  }
}

export const pythonJediCompletion: CompletionSource = async (
  context: CompletionContext
): Promise<CompletionResult | null> => {
  if (!intellisenseReady()) return null;

  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (nodeBefore.name === "String" || nodeBefore.name === "FormatString" || nodeBefore.name === "Comment") {
    return null;
  }

  // Trigger on `.` for member completion, or on word characters (length >= 1) for general completion.
  const dotAccess = context.matchBefore(/\.[a-zA-Z_][a-zA-Z0-9_]*$|\.$/);
  const word = context.matchBefore(/[a-zA-Z_][a-zA-Z0-9_]*/);

  if (!dotAccess && (!word || word.from === word.to) && !context.explicit) {
    return null;
  }

  const from = dotAccess
    ? dotAccess.from + 1
    : word
      ? word.from
      : context.pos;

  const code = context.state.doc.toString();
  const lineObj = context.state.doc.lineAt(context.pos);
  const line = lineObj.number;
  const column = context.pos - lineObj.from;

  let completions: JediCompletion[];
  try {
    completions = await requestCompletions(code, line, column);
  } catch {
    return null;
  }

  if (context.aborted) return null;
  if (!completions.length) return null;

  const options: Completion[] = completions.map((entry) => {
    const option: Completion = {
      label: entry.name,
      type: mapJediType(entry.type),
      boost: 5
    };
    // Prefer the call signature for the inline detail. Strip the leading
    // name so it reads as "insert  (index, object, /)" not duplicated.
    const sig = entry.signature?.trim();
    if (sig) {
      const paren = sig.indexOf("(");
      option.detail = paren >= 0 ? sig.slice(paren) : sig;
    } else if (entry.description) {
      option.detail = entry.description;
    }
    const infoParts = [sig, entry.doc?.trim()].filter(Boolean);
    if (infoParts.length) option.info = infoParts.join("\n\n");
    return option;
  });

  return {
    from,
    options,
    validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  };
};
