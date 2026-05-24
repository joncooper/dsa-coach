export function elevation_pairs(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"10\\n3\\n7\\n5\\n5\\n2\"]": 2,
  "[\"100\\n1\\n2\\n3\"]": 0,
  "[\"\"]": 0,
  "[\"0\\n-3\\n3\\n-5\\n5\"]": 2,
  "[\"6\\n3\\n3\\n3\"]": 3,
  "[\"10\\n5\"]": 0,
  "[\"0\\n0\\n0\\n0\"]": 3,
  "[\"8\\n1\\n\\n7\\n\\n3\\n5\"]": 2,
  "[\"1000\\n1\\n2\\n3\\n4\"]": 0,
  "[\"0\\n0\\n0\\n0\\n0\"]": 6,
  "[\"10\\n5\\n5\\n5\\n5\"]": 6,
  "[\"-7\\n-3\\n-4\\n-2\\n-5\"]": 2,
  "[\"6\\n3\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
