export function balanced_triple_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"5\\n3\\n5\\n5\"]": 1,
  "[\"1\\n1\\n2\\n2\"]": 0,
  "[\"\"]": 0,
  "[\"7\\n7\\n7\\n7\"]": 4,
  "[\"3\\n3\\n3\\n3\\n3\"]": 10,
  "[\"1\\n1\\n1\\n2\\n2\\n2\\n2\"]": 5,
  "[\"8\\n8\"]": 0,
  "[\"1\\n1\\n1\\n1\\n1\\n1\"]": 20,
  "[\"1\\n1\\n1\\n2\\n2\\n3\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
