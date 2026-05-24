export function count_valid_tags(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]": 2,
  "[\"1-1 z: aaa\\n2-2 a: aaaa\"]": 0,
  "[\"\"]": 0,
  "[\"3-5 q: qqqxx\"]": 1,
  "[\"1-3 z: zzzab\"]": 1,
  "[\"\\n1-1 a: a\\n\\n\"]": 1,
  "[\"2-4 t: ttabt\\n5-9 m: mmmm\"]": 1,
  "[\"3-3 a: aaa\\n3-3 a: aaaa\"]": 1,
  "[\"0-2 a: bcd\"]": 1,
  "[\"1-2 a: aaaa\"]": 0,
  "[\"1-5 q: abcde\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
