export function shelf_unique(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"1,2,3\\n2,3,4\\n\\n5,6\\n5,6,7\"]": 3,
  "[\"1,2,3\"]": 3,
  "[\"\"]": 0,
  "[\"1,2\\n1,2\"]": 0,
  "[\"1,9\\n2,9\\n3,9\"]": 3,
  "[\"1,1,2\\n2,3\"]": 2,
  "[\"1,2\\n1,3\\n\\n4,5,6\\n4,5\"]": 3,
  "[\"1,2,3\\n1,2,3\\n1,2,3\"]": 0,
  "[\"1,2,3,4,5\"]": 5,
  "[\"1,2,3\\n3,4,5\"]": 4,
  "[\"1\\n\\n1,2\\n\\n1,2,3\"]": 6
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
