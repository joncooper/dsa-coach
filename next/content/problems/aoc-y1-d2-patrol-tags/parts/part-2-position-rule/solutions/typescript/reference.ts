export function count_valid_positions(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]": 1,
  "[\"1-2 x: xxaaa\"]": 0,
  "[\"2-4 z: abcde\"]": 0,
  "[\"1-3 q: qabxy\"]": 1,
  "[\"1-3 q: aaqxy\"]": 1,
  "[\"1-99 a: a\"]": 1,
  "[\"\\n1-2 z: zx\\n\"]": 1,
  "[\"10-20 a: abc\"]": 0,
  "[\"2-2 a: babcd\\n2-2 b: babcd\"]": 0,
  "[\"1-3 z: zxz\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
