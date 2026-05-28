import { describe, expect, test } from "bun:test";
import { diagnosticsFromErrorText } from "../src/runner/errorDiagnostics.js";

describe("runner error diagnostics", () => {
  test("uses JavaScript stack headlines instead of stack-frame punctuation", () => {
    const diagnostics = diagnosticsFromErrorText(
      [
        "ReferenceError: print is not defined",
        "    at balanced_pair_count (/private/tmp/dsa-ts/solution.cjs:6:9)",
        "    at Object.<anonymous> (/private/tmp/dsa-ts/runner.cjs:14:22)"
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
});
