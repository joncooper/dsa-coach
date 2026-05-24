export function jsonEqual(actual: unknown, expected: unknown): boolean {
  if (Object.is(actual, expected)) return true;
  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) < 1e-9;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return actual.length === expected.length && actual.every((value, index) => jsonEqual(value, expected[index]));
  }
  if (isPlainObject(actual) && isPlainObject(expected)) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    return jsonEqual(actualKeys, expectedKeys) && actualKeys.every((key) => jsonEqual(actual[key], expected[key]));
  }
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
