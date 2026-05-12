import { describe, expect, it } from "vitest";
import { deepEqualWithTolerance } from "../src/runner/compare";

describe("deepEqualWithTolerance", () => {
  it("compares nested arrays and objects", () => {
    expect(deepEqualWithTolerance([[1, { x: 2 }]], [[1, { x: 2 }]])).toBe(true);
    expect(deepEqualWithTolerance([[1, { x: 3 }]], [[1, { x: 2 }]])).toBe(false);
  });

  it("allows tiny floating point differences", () => {
    expect(deepEqualWithTolerance(0.1 + 0.2, 0.3)).toBe(true);
  });
});
