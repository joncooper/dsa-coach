import { describe, expect, test } from "bun:test";
import { diagnosticsFromErrorText } from "../src/runner/errorDiagnostics.js";

describe("runner error diagnostics", () => {
  test("uses JavaScript stack headlines instead of stack-frame punctuation", () => {
    const diagnostics = diagnosticsFromErrorText(
      [
        "ReferenceError: print is not defined",
        "    at balanced_pair_count (/private/tmp/dsa-ts/solution.cjs:6:9)",
        "    at Object.<anonymous> (/private/tmp/dsa-ts/runner.cjs:14:22)",
        "Node.js v22.10.0"
      ].join("\n"),
      {
        language: "TypeScript",
        sourceFile: "solution.cjs",
        source: [
          "\"use strict\";",
          "Object.defineProperty(exports, \"__esModule\", { value: true });",
          "exports.balanced_pair_count = balanced_pair_count;",
          "function balanced_pair_count(inputText) {",
          "  for (const line of inputText.split('\\n')) {",
          "    print(line);",
          "  }",
          "}"
        ].join("\n")
      }
    );

    expect(diagnostics[0]).toMatchObject({
      message: "ReferenceError: print is not defined",
      file: "solution.cjs",
      line: 6,
      column: 9
    });
    expect(diagnostics[0]?.message).not.toBe(")");
  });

  test("keeps Python traceback caret indentation when calculating columns", () => {
    const diagnostics = diagnosticsFromErrorText(
      [
        "Traceback (most recent call last):",
        "  File \"/private/tmp/dsa-python/runner.py\", line 33, in <module>",
        "    actual = fn(*test[\"args\"])",
        "  File \"/private/tmp/dsa-python/solution.py\", line 105, in add_file_by",
        "    if size > self.users[name].quota:",
        "              ^^^^^^^^^^^^^^^^",
        "KeyError: 'f'"
      ].join("\n"),
      {
        language: "Python",
        sourceFile: "solution.py",
        source: [
          ...Array.from({ length: 104 }, (_, index) => `# filler ${index + 1}`),
          "    if size > self.users[name].quota:",
          "        return False"
        ].join("\n")
      }
    );

    expect(diagnostics[0]).toMatchObject({
      message: "KeyError: 'f'",
      file: "solution.py",
      line: 105,
      column: 15
    });
    expect(diagnostics[0]?.snippet?.some((line) => line.line === 105 && line.markerStart === 15)).toBe(true);
  });
});
