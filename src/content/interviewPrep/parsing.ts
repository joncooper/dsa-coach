import { setProblem } from "./_shared";

const parseCsv = setProblem({
  id: "tek-parse-csv-row",
  title: "Parse a Quoted CSV Row",
  difficulty: "medium",
  patterns: ["state machine", "string scan", "tokenization"],
  entrypoint: "parse_csv_row",
  prompt:
    "Implement a single-row CSV parser without using the `csv` module. The input is one line of CSV text. Fields are separated by commas. A field may be wrapped in double quotes; inside a quoted field, commas are literal characters and the two-character sequence `\"\"` represents a single literal `\"`. A field is only considered quoted when its first character is `\"`. Return a list of the parsed field strings.",
  constraints: [
    "Do not use the `csv` module or any other CSV library.",
    "An empty input string yields a single empty field: `[\"\"]`.",
    "Only fields whose first character is `\"` enter quoted mode.",
    "Inside quoted mode, `\"\"` is a literal quote and `\"` followed by anything else closes the field.",
    "The line never contains newline characters."
  ],
  examples: [
    { name: "plain fields", args: ["a,b,c"], expected: ["a", "b", "c"] },
    { name: "embedded comma", args: ["\"a,b\",c"], expected: ["a,b", "c"] }
  ],
  starterCode:
    "def parse_csv_row(line):\n" +
    "    # Parse one CSV row into a list of field strings.\n" +
    "    # Handle quoted fields with embedded commas and \"\" escapes.\n" +
    "    pass\n",
  referenceCode:
    "def parse_csv_row(line):\n" +
    "    fields = []\n" +
    "    current = []\n" +
    "    in_quotes = False\n" +
    "    i = 0\n" +
    "    while i < len(line):\n" +
    "        ch = line[i]\n" +
    "        if in_quotes:\n" +
    "            if ch == '\"':\n" +
    "                if i + 1 < len(line) and line[i + 1] == '\"':\n" +
    "                    current.append('\"')\n" +
    "                    i += 2\n" +
    "                    continue\n" +
    "                in_quotes = False\n" +
    "                i += 1\n" +
    "                continue\n" +
    "            current.append(ch)\n" +
    "            i += 1\n" +
    "        else:\n" +
    "            if ch == '\"' and not current:\n" +
    "                in_quotes = True\n" +
    "                i += 1\n" +
    "            elif ch == ',':\n" +
    "                fields.append(''.join(current))\n" +
    "                current = []\n" +
    "                i += 1\n" +
    "            else:\n" +
    "                current.append(ch)\n" +
    "                i += 1\n" +
    "    fields.append(''.join(current))\n" +
    "    return fields\n",
  solutionCode:
    "def parse_csv_row(line):\n" +
    "    fields = []\n" +
    "    buf = []\n" +
    "    quoted = False\n" +
    "    i = 0\n" +
    "    n = len(line)\n" +
    "    while i < n:\n" +
    "        ch = line[i]\n" +
    "        if quoted:\n" +
    "            if ch == '\"' and i + 1 < n and line[i + 1] == '\"':\n" +
    "                buf.append('\"')\n" +
    "                i += 2\n" +
    "            elif ch == '\"':\n" +
    "                quoted = False\n" +
    "                i += 1\n" +
    "            else:\n" +
    "                buf.append(ch)\n" +
    "                i += 1\n" +
    "        elif ch == ',':\n" +
    "            fields.append(''.join(buf))\n" +
    "            buf = []\n" +
    "            i += 1\n" +
    "        elif ch == '\"' and not buf:\n" +
    "            quoted = True\n" +
    "            i += 1\n" +
    "        else:\n" +
    "            buf.append(ch)\n" +
    "            i += 1\n" +
    "    fields.append(''.join(buf))\n" +
    "    return fields\n",
  visibleTests: [
    { name: "plain fields", args: ["a,b,c"], expected: ["a", "b", "c"] },
    { name: "single field", args: ["hello"], expected: ["hello"] },
    { name: "empty input", args: [""], expected: [""] },
    { name: "embedded comma", args: ["\"a,b\",c"], expected: ["a,b", "c"] },
    { name: "trailing empty field", args: ["a,"], expected: ["a", ""] }
  ],
  hiddenTests: [
    { name: "escaped quotes", args: ["\"he said \"\"hi\"\"\""], expected: ["he said \"hi\""] },
    { name: "two empty fields", args: [","], expected: ["", ""] },
    { name: "mixed quoted and plain", args: ["\"alpha\",beta,\"gamma,delta\""], expected: ["alpha", "beta", "gamma,delta"] },
    { name: "quote not at field start is literal", args: ["a\"b,c"], expected: ["a\"b", "c"] },
    { name: "empty quoted field", args: ["\"\",x"], expected: ["", "x"] },
    { name: "adjacent escaped quotes", args: ["\"a\"\"\"\"b\""], expected: ["a\"\"b"] },
    { name: "three commas yield four empty fields", args: [",,,"], expected: ["", "", "", ""] },
    { name: "leading comma", args: [",a,b"], expected: ["", "a", "b"] },
    { name: "quoted field preserves whitespace", args: ["\" hello \",x"], expected: [" hello ", "x"] },
    { name: "embedded commas across two quoted fields", args: ["\"a,b\",\"c,d,e\""], expected: ["a,b", "c,d,e"] }
  ],
  hints: [
    "Track exactly one boolean: are you currently inside a quoted field?",
    "Inside a quoted field, two consecutive quotes mean one literal quote; a single quote ends the field.",
    "Only enter quoted mode when you see a quote and the current field buffer is still empty."
  ],
  solution:
    "Walk the string with an index and a single `in_quotes` flag. Outside quotes, a comma flushes the current buffer to the field list, a quote at the very start of a field flips you into quoted mode, and every other character is appended. Inside quotes, a doubled quote becomes a literal quote and a single quote closes the field. At the end of input, flush whatever remains in the buffer as the final field, including the empty string for trailing commas or empty input.",
  walkthrough:
    "The trickiest cases are the empty input (which is one empty field, not zero fields) and the `\"\"` escape. The escape is handled by peeking one character ahead while inside quoted mode: a quote followed by a quote consumes both and appends one literal quote, while a quote followed by anything else closes the quoted field.",
  followUps: [
    "How would you extend this to a streaming reader that handles multiple lines including newlines inside quoted fields?",
    "How would you report a structured error when the input is malformed (unterminated quote, junk after closing quote)?",
    "How would you produce the inverse: serializing a list of fields back into a properly-quoted CSV row?"
  ],
  complexity: { time: "O(n) in the length of the line", space: "O(n) for the output fields" }
});

const renderTemplate = setProblem({
  id: "tek-render-template",
  title: "Render a `{{name}}` Template",
  difficulty: "easy",
  patterns: ["string scan", "tokenization", "substitution"],
  entrypoint: "render_template",
  prompt:
    "Implement a minimal template renderer. A placeholder has the exact shape `{{name}}` where `name` matches the identifier pattern `[a-zA-Z_][a-zA-Z0-9_]*`. When `name` is a key in `values`, replace the entire `{{name}}` span with `str(values[name])`. When `name` is not present, leave the literal `{{name}}` text in the output unchanged. Any other text — including stray `{` or `{{` that is not followed by a valid identifier and `}}` — must be copied to the output verbatim.",
  constraints: [
    "An identifier is `[a-zA-Z_][a-zA-Z0-9_]*`.",
    "Only `{{identifier}}` is a placeholder; anything else (e.g. `{{1bad}}`, `{ x }`, `{{}}`) is literal text.",
    "Unknown keys leave the placeholder text intact — they are not errors.",
    "Values are stringified with `str(value)` before insertion.",
    "An empty template returns an empty string."
  ],
  examples: [
    { name: "basic substitution", args: ["Hello {{name}}!", { name: "World" }], expected: "Hello World!" },
    { name: "unknown key kept literal", args: ["{{missing}} here", {}], expected: "{{missing}} here" }
  ],
  starterCode:
    "def render_template(template, values):\n" +
    "    # Replace each {{identifier}} with str(values[identifier]).\n" +
    "    # Leave unknown placeholders and malformed spans as literal text.\n" +
    "    pass\n",
  referenceCode:
    "import re\n\n" +
    "def render_template(template, values):\n" +
    "    pattern = re.compile(r\"\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}\")\n" +
    "    def repl(match):\n" +
    "        name = match.group(1)\n" +
    "        if name in values:\n" +
    "            return str(values[name])\n" +
    "        return match.group(0)\n" +
    "    return pattern.sub(repl, template)\n",
  solutionCode:
    "import re\n\n" +
    "_PLACEHOLDER = re.compile(r\"\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}\")\n\n" +
    "def render_template(template, values):\n" +
    "    def replace(match):\n" +
    "        key = match.group(1)\n" +
    "        return str(values[key]) if key in values else match.group(0)\n" +
    "    return _PLACEHOLDER.sub(replace, template)\n",
  visibleTests: [
    { name: "empty template", args: ["", { a: 1 }], expected: "" },
    { name: "no placeholders", args: ["just text", { a: 1 }], expected: "just text" },
    { name: "basic substitution", args: ["Hello {{name}}!", { name: "World" }], expected: "Hello World!" },
    {
      name: "multiple placeholders",
      args: ["{{a}} + {{b}} = {{c}}", { a: 1, b: 2, c: 3 }],
      expected: "1 + 2 = 3"
    },
    { name: "unknown key kept literal", args: ["{{missing}} here", {}], expected: "{{missing}} here" }
  ],
  hiddenTests: [
    { name: "back-to-back placeholders", args: ["{{a}}{{b}}{{a}}", { a: "X", b: "Y" }], expected: "XYX" },
    { name: "numeric value stringified", args: ["value: {{n}}", { n: 42 }], expected: "value: 42" },
    {
      name: "malformed spans are literal",
      args: ["{x} { y } {{!}} {{1bad}} {{}}", {}],
      expected: "{x} { y } {{!}} {{1bad}} {{}}"
    },
    {
      name: "mixed known and unknown",
      args: ["{{a}}/{{b}}/{{c}}", { a: "X", c: "Z" }],
      expected: "X/{{b}}/Z"
    },
    {
      name: "underscore and digits in name",
      args: ["{{first_name_1}}", { first_name_1: "Ada" }],
      expected: "Ada"
    },
    {
      name: "triple braces leave outer brace literal",
      args: ["{{{a}}}", { a: "X" }],
      expected: "{X}"
    },
    {
      name: "spaces inside braces invalidate placeholder",
      args: ["{{ name }}", { name: "Ada" }],
      expected: "{{ name }}"
    },
    {
      name: "empty string value substitutes empty",
      args: ["hello {{name}}!", { name: "" }],
      expected: "hello !"
    },
    {
      name: "list value stringified via str",
      args: ["items: {{x}}", { x: [1, 2, 3] }],
      expected: "items: [1, 2, 3]"
    },
    {
      name: "single brace pair is literal",
      args: ["{a} {b}", { a: "X", b: "Y" }],
      expected: "{a} {b}"
    },
    {
      name: "unclosed placeholder is literal",
      args: ["start {{name end", { name: "Ada" }],
      expected: "start {{name end"
    }
  ],
  hints: [
    "A regex that matches `{{` then a valid identifier then `}}` lets you scan in one pass.",
    "Use a substitution callback so unknown keys can return the literal match unchanged.",
    "The identifier rules disqualify names that start with a digit or contain punctuation."
  ],
  solution:
    "Compile one regex that matches the full placeholder span `{{identifier}}`. Use `re.sub` with a callback: when the captured name is in `values`, return `str(values[name])`; otherwise return the entire matched span unchanged. Everything not matched by the regex is already copied verbatim by `sub`.",
  walkthrough:
    "The callback approach is what makes the \"leave unknown keys literal\" rule trivial. The regex's strict identifier shape ensures malformed spans like `{{1bad}}` or `{{}}` are skipped entirely, so they survive in the output without special handling.",
  followUps: [
    "How would you extend this to support dotted paths like `{{user.name}}` walking a nested dict?",
    "How would you support default values like `{{name|Anonymous}}` if the key is missing?",
    "How would you precompile the template into a list of segments for repeated rendering?"
  ],
  complexity: { time: "O(n) in the template length", space: "O(n) for the output" }
});

const resolvePath = setProblem({
  id: "tek-resolve-path",
  title: "Canonicalize a Unix Path",
  difficulty: "easy",
  patterns: ["stack", "string scan", "normalization"],
  entrypoint: "resolve_path",
  prompt:
    "Given an absolute Unix path, return its canonical form. Collapse repeated slashes, remove `.` segments, and resolve `..` segments by popping the previous real segment (no-op when already at the root). The result must start with `/` and must not have a trailing slash unless the result is the root `/`. Single-segment names that happen to contain dots beyond `.` or `..` (for example `...` or `..foo`) are ordinary directory names.",
  constraints: [
    "The input always starts with `/`.",
    "Segments are separated by `/`; consecutive slashes collapse.",
    "`.` is the current directory and is skipped.",
    "`..` pops the previous segment; at the root it is a no-op.",
    "Only the exact tokens `.` and `..` are special — names like `...` or `..foo` are real directories."
  ],
  examples: [
    { name: "trailing slash dropped", args: ["/home/"], expected: "/home" },
    { name: "double-dot pops", args: ["/a/b/c/../../d"], expected: "/a/d" }
  ],
  starterCode:
    "def resolve_path(path):\n" +
    "    # Return the canonical form of an absolute Unix path.\n" +
    "    pass\n",
  referenceCode:
    "def resolve_path(path):\n" +
    "    stack = []\n" +
    "    for part in path.split(\"/\"):\n" +
    "        if part == \"\" or part == \".\":\n" +
    "            continue\n" +
    "        if part == \"..\":\n" +
    "            if stack:\n" +
    "                stack.pop()\n" +
    "            continue\n" +
    "        stack.append(part)\n" +
    "    return \"/\" + \"/\".join(stack)\n",
  solutionCode:
    "def resolve_path(path):\n" +
    "    parts = []\n" +
    "    for segment in path.split(\"/\"):\n" +
    "        if not segment or segment == \".\":\n" +
    "            continue\n" +
    "        if segment == \"..\":\n" +
    "            if parts:\n" +
    "                parts.pop()\n" +
    "        else:\n" +
    "            parts.append(segment)\n" +
    "    return \"/\" + \"/\".join(parts)\n",
  visibleTests: [
    { name: "root stays root", args: ["/"], expected: "/" },
    { name: "single level", args: ["/home"], expected: "/home" },
    { name: "trailing slash dropped", args: ["/home/"], expected: "/home" },
    { name: "double-dot pops", args: ["/a/b/c/../../d"], expected: "/a/d" },
    { name: "double slash collapses", args: ["/home//user"], expected: "/home/user" }
  ],
  hiddenTests: [
    { name: "dot skipped", args: ["/home/./user"], expected: "/home/user" },
    { name: "pop past root no-op", args: ["/.."], expected: "/" },
    { name: "triple dot is a directory", args: ["/a/.../b"], expected: "/a/.../b" },
    { name: "many mixed", args: ["/a//b/./c/"], expected: "/a/b/c" },
    { name: "only dots and slashes", args: ["/./../."], expected: "/" },
    { name: "pop past root multiple times", args: ["/../../../"], expected: "/" },
    { name: "single dot dir then pop", args: ["/foo/."], expected: "/foo" },
    { name: "name starting with double-dot is literal", args: ["/..foo/bar"], expected: "/..foo/bar" },
    { name: "name ending with double-dot is literal", args: ["/foo../bar"], expected: "/foo../bar" },
    { name: "every slash collapsed", args: ["//////"], expected: "/" },
    { name: "alternating climb", args: ["/a/../b/../c/../d"], expected: "/d" },
    { name: "deep climb then descend", args: ["/a/b/c/d/../../../e"], expected: "/a/e" },
    { name: "dot files preserved", args: ["/home/.config/app"], expected: "/home/.config/app" }
  ],
  hints: [
    "Split on `/` and treat each non-empty piece as a single segment.",
    "Use a stack to push real names and pop on `..`; only the two exact tokens are special.",
    "The final path is `\"/\" + \"/\".join(stack)`, which handles both the root case and the no-trailing-slash rule."
  ],
  solution:
    "Split the input on `/` and walk the parts. Skip empty strings (the result of leading, trailing, or doubled slashes) and the literal `.`. For `..`, pop the stack if non-empty. For every other part, push it. Join the stack with `/` and prefix one slash to produce the canonical path. The empty-stack case naturally produces `/`.",
  walkthrough:
    "A stack is the right shape because `..` operates on the most recent real directory, never deeper. Treating empty strings the same as `.` is the trick that makes `//` and trailing slash both vanish without any extra code. Names like `...` are not popped because the equality check is exact.",
  followUps: [
    "How would you adapt this to relative paths (no leading slash)?",
    "How would you also report whether the input had any non-canonical features (collapsing happened)?",
    "How would you preserve a leading `//` per the POSIX implementation-defined rule?"
  ],
  complexity: { time: "O(n) in the path length", space: "O(n) for the segment stack" }
});

const evalExpression = setProblem({
  id: "tek-eval-expression",
  title: "Evaluate an Arithmetic Expression",
  difficulty: "medium",
  patterns: ["tokenizer", "recursive descent", "operator precedence"],
  entrypoint: "evaluate",
  prompt:
    "Evaluate a string arithmetic expression and return the integer result. The expression contains non-negative integer literals, the binary operators `+ - * /`, parentheses, and arbitrary spaces. Standard precedence applies: `*` and `/` bind tighter than `+` and `-`, operators of equal precedence are left-associative, and parentheses override precedence. Division truncates toward zero. You may assume the input is well-formed and never divides by zero.",
  constraints: [
    "The expression is non-empty and well-formed.",
    "Integer literals are non-negative and use ASCII digits 0-9; there is no unary minus.",
    "Only the binary operators + - * / and parentheses appear.",
    "Division truncates toward zero, so a negative intermediate like (1-8)/2 is -3.",
    "Whitespace is ASCII space characters only (no tabs or newlines) and may appear anywhere between tokens."
  ],
  examples: [
    { name: "precedence", args: ["2+3*4"], expected: 14 },
    { name: "parens override", args: ["(2+3)*4"], expected: 20 }
  ],
  starterCode:
    "def evaluate(expr):\n" +
    "    # Tokenize, then parse with precedence (recursive descent works well).\n" +
    "    pass\n",
  referenceCode: `def evaluate(expr):
    tokens = []
    i = 0
    while i < len(expr):
        c = expr[i]
        if c == " ":
            i += 1
            continue
        if c.isdigit():
            j = i
            while j < len(expr) and expr[j].isdigit():
                j += 1
            tokens.append(int(expr[i:j]))
            i = j
        else:
            tokens.append(c)
            i += 1

    pos = 0

    def trunc_div(a, b):
        q = abs(a) // abs(b)
        return q if (a < 0) == (b < 0) else -q

    def parse_expr():
        nonlocal pos
        value = parse_term()
        while pos < len(tokens) and tokens[pos] in ("+", "-"):
            op = tokens[pos]
            pos += 1
            rhs = parse_term()
            value = value + rhs if op == "+" else value - rhs
        return value

    def parse_term():
        nonlocal pos
        value = parse_factor()
        while pos < len(tokens) and tokens[pos] in ("*", "/"):
            op = tokens[pos]
            pos += 1
            rhs = parse_factor()
            value = value * rhs if op == "*" else trunc_div(value, rhs)
        return value

    def parse_factor():
        nonlocal pos
        tok = tokens[pos]
        if tok == "(":
            pos += 1
            value = parse_expr()
            pos += 1
            return value
        pos += 1
        return tok

    return parse_expr()
`,
  solutionCode: `def evaluate(expr):
    tokens = []
    n = len(expr)
    i = 0
    while i < n:
        c = expr[i]
        if c == " ":
            i += 1
        elif c.isdigit():
            num = 0
            while i < n and expr[i].isdigit():
                num = num * 10 + int(expr[i])
                i += 1
            tokens.append(num)
        else:
            tokens.append(c)
            i += 1

    idx = 0

    def expr_p():
        nonlocal idx
        acc = term_p()
        while idx < len(tokens) and tokens[idx] in ("+", "-"):
            op = tokens[idx]
            idx += 1
            rhs = term_p()
            acc = acc + rhs if op == "+" else acc - rhs
        return acc

    def term_p():
        nonlocal idx
        acc = factor_p()
        while idx < len(tokens) and tokens[idx] in ("*", "/"):
            op = tokens[idx]
            idx += 1
            rhs = factor_p()
            if op == "*":
                acc = acc * rhs
            else:
                q = abs(acc) // abs(rhs)
                acc = q if (acc < 0) == (rhs < 0) else -q
        return acc

    def factor_p():
        nonlocal idx
        t = tokens[idx]
        if t == "(":
            idx += 1
            v = expr_p()
            idx += 1
            return v
        idx += 1
        return t

    return expr_p()
`,
  visibleTests: [
    { name: "single literal", args: ["7"], expected: 7 },
    { name: "precedence", args: ["2+3*4"], expected: 14 },
    { name: "parens override", args: ["(2+3)*4"], expected: 20 },
    { name: "surrounding spaces", args: [" 1 + 2 "], expected: 3 }
  ],
  hiddenTests: [
    { name: "left associative subtraction", args: ["100-20-30"], expected: 50 },
    { name: "left associative division", args: ["8/2/2"], expected: 2 },
    { name: "integer truncation", args: ["10/3"], expected: 3 },
    { name: "nested parens", args: ["2*(3+(4-1))"], expected: 12 },
    { name: "deep right nesting", args: ["(1+(2+(3+4)))"], expected: 10 },
    { name: "mixed precedence chain", args: ["2+2*2-2"], expected: 4 },
    { name: "spaces between every token", args: ["3 * ( 4 + 5 )"], expected: 27 },
    { name: "multi digit literals", args: ["12*12+1"], expected: 145 },
    { name: "negative numerator truncates toward zero", args: ["(1-8)/2"], expected: -3 },
    { name: "negative divisor truncates toward zero", args: ["8/(2-5)"], expected: -2 },
    { name: "negative intermediate odd division", args: ["(1-8)/3"], expected: -2 }
  ],
  hints: [
    "Tokenize first: walk the string once, accumulating consecutive digits into one integer token and emitting each operator or paren as its own token.",
    "Three mutually-recursive parsers map cleanly to the grammar: expression handles + and -, term handles * and /, factor handles a literal or a parenthesized expression.",
    "Track the current token index in an enclosing scope (a `nonlocal` cursor) so each parser advances the shared position."
  ],
  solution:
    "Split the work into a tokenizer and a recursive-descent parser. The tokenizer collapses digit runs into integer tokens and passes operators/parens through. The parser encodes precedence as a grammar: expr := term (('+'|'-') term)*, term := factor (('*'|'/') factor)*, factor := number | '(' expr ')'. A shared cursor advances as each level consumes its tokens, and left-associativity falls out of the while-loops.",
  walkthrough:
    "Precedence is not solved with special-casing — it is solved by structure. Lower-precedence operators live in the outer grammar rule and higher-precedence ones in the inner rule, so the call stack itself enforces that multiplication binds tighter than addition. Left-associativity comes from folding into an accumulator inside each loop rather than recursing on the right. The parenthesized case simply re-enters the top rule, which is why nesting works to any depth.",
  followUps: [
    "How would you add a unary minus so `-(3+4)` and `2--3` parse correctly?",
    "How would you return the parse tree instead of the value, so the same code can also pretty-print the expression?"
  ],
  complexity: { time: "O(n) over the token stream", space: "O(d) for parser recursion depth d" }
});

export const parsingProblems = [parseCsv, renderTemplate, resolvePath, evalExpression];
