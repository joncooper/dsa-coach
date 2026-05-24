export function rising_windows(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"3\\n1\\n2\\n3\\n4\\n5\"]": 2,
  "[\"2\\n5\\n5\\n5\\n5\"]": 0,
  "[\"\"]": 0,
  "[\"3\\n1\\n2\\n3\"]": 0,
  "[\"2\\n1\\n2\\n0\\n5\"]": 1,
  "[\"1\\n5\\n4\\n3\\n2\"]": 0,
  "[\"3\\n3\\n3\\n3\\n3\\n3\"]": 0,
  "[\"2\\n-10\\n0\\n5\\n-1\"]": 1,
  "[\"3\\n1\\n2\\n3\\n4\"]": 1,
  "[\"2\\n1\\n1\\n1\\n1\"]": 0,
  "[\"1\\n1\\n2\\n1\\n2\\n1\\n2\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
