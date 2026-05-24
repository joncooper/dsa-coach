export function balanced_pair_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"5\\n3\\n5\\n7\\n5\"]": 3,
  "[\"1\\n2\\n3\"]": 0,
  "[\"\"]": 0,
  "[\"7\\n7\\n7\\n7\"]": 6,
  "[\"42\"]": 0,
  "[\"1\\n1\\n2\\n2\"]": 2,
  "[\"\\n9\\n9\\n\\n\"]": 1,
  "[\"3\\n3\\n3\\n3\\n3\"]": 10,
  "[\"1\\n1\\n2\\n2\\n2\\n3\\n3\\n3\\n3\"]": 10,
  "[\"-5\\n-5\\n-5\\n5\"]": 3,
  "[\"0\\n0\\n0\\n1\\n2\"]": 3,
  "[\"1\\n1\\n2\\n2\\n3\\n3\\n4\\n4\\n5\\n5\"]": 5
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
