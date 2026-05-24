import { describe, expect, test } from "bun:test";
import type { FunctionSignature, ProblemLanguageSupport } from "../src/core/types";
import { getCompletions } from "../apps/web/src/completions";

const signature: FunctionSignature = {
  name: "sumPositiveReadings",
  inputs: [
    { name: "readings", type: { type: "array", items: { type: "number" } } }
  ],
  output: { type: "number" }
};

const support: ProblemLanguageSupport = {
  entrypoint: "sumPositiveReadings",
  starterPath: "",
  referencePath: ""
};

describe("editor completions", () => {
  test("offers problem symbols and TypeScript snippets", () => {
    const result = getCompletions({
      language: "typescript",
      code: "sum",
      cursor: 3,
      signature,
      support
    });
    expect(result?.items.map((item) => item.label)).toContain("sumPositiveReadings");
  });

  test("offers parameter symbols across languages", () => {
    for (const language of ["typescript", "python", "go", "scala"]) {
      const result = getCompletions({
        language,
        code: "rea",
        cursor: 3,
        signature,
        support
      });
      expect(result?.items.map((item) => item.label)).toContain("readings");
    }
  });

  test("requires an explicit request for empty-token completions", () => {
    expect(getCompletions({ language: "python", code: "", cursor: 0, signature, support })).toBeNull();
    expect(getCompletions({ language: "python", code: "", cursor: 0, signature, support, explicit: true })?.items.length).toBeGreaterThan(0);
  });
});
