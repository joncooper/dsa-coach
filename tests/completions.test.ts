import { describe, expect, it } from "vitest";
import { inferBuiltinType } from "../src/runner/pythonCompletions";

// `before` is the cursor offset; assignments at or after it are ignored.
function infer(code: string, name: string): string | null {
  return inferBuiltinType(code, name, code.length);
}

describe("inferBuiltinType", () => {
  it("infers list from a literal or constructor", () => {
    expect(infer("position = []\nposition.", "position")).toBe("list");
    expect(infer("xs = [1, 2, 3]\nxs.", "xs")).toBe("list");
    expect(infer("xs = list()\nxs.", "xs")).toBe("list");
  });

  it("infers str from quotes and constructors", () => {
    expect(infer('s = ""\ns.', "s")).toBe("str");
    expect(infer("s = 'hi'\ns.", "s")).toBe("str");
    expect(infer('s = f"{x}"\ns.', "s")).toBe("str");
    expect(infer("s = str(x)\ns.", "s")).toBe("str");
  });

  it("infers dict vs set", () => {
    expect(infer("d = {}\nd.", "d")).toBe("dict");
    expect(infer("d = {'a': 1}\nd.", "d")).toBe("dict");
    expect(infer("d = dict()\nd.", "d")).toBe("dict");
    expect(infer("st = set()\nst.", "st")).toBe("set");
    expect(infer("st = {1, 2, 3}\nst.", "st")).toBe("set");
  });

  it("infers tuple", () => {
    expect(infer("t = ()\nt.", "t")).toBe("tuple");
    expect(infer("t = (1, 2)\nt.", "t")).toBe("tuple");
    expect(infer("t = tuple(xs)\nt.", "t")).toBe("tuple");
  });

  it("uses the most recent assignment", () => {
    expect(infer("v = []\nv = ''\nv.", "v")).toBe("str");
  });

  it("ignores assignments at or after the cursor", () => {
    const code = "before.\nposition = []";
    expect(inferBuiltinType(code, "position", 0)).toBeNull();
  });

  it("returns null on ambiguous or unknown right-hand sides", () => {
    expect(infer("x = compute()\nx.", "x")).toBeNull();
    expect(infer("x = a + b\nx.", "x")).toBeNull();
    expect(infer("x.", "x")).toBeNull();
    expect(infer("y = []\nx.", "x")).toBeNull();
  });

  it("respects type annotations on the assignment line", () => {
    expect(infer("buf: list = []\nbuf.", "buf")).toBe("list");
  });

  it("does not confuse a prefix-similar variable name", () => {
    expect(infer("positions = ''\nposition = []\nposition.", "position")).toBe("list");
  });
});
