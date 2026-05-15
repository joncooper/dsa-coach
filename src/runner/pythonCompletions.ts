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
    const members = MEMBER_LOOKUP.get(owner);
    if (members) {
      return {
        from: memberMatch.from + dotIndex + 1,
        options: members,
        validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
      };
    }
    // Not one of our known modules — let CodeMirror's default word completion handle it.
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
    if (entry.description) option.detail = entry.description;
    return option;
  });

  return {
    from,
    options,
    validFor: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  };
};
