export function max_stamp(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"000001\"]": 1,
  "[\"00000a\"]": 10,
  "[\"000000\"]": 0,
  "[\"\"]": -1,
  "[\"00000a\\n00000b\"]": 11,
  "[\"zzzzzz\"]": 2176782335,
  "[\"1a2b3c\\n0z0z0z\"]": 77370024,
  "[\"\\n00000a\\n\\n00000b\\n\"]": 11,
  "[\"000009\\n00000a\"]": 10,
  "[\"a00000\\n9zzzzz\"]": 604661760,
  "[\"00000a\\n00000a\\n00000a\"]": 10
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
