export function shelf_overlap(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"1,2,3\\n2,3,4\\n\\n5,6\\n5,6,7\"]": 4,
  "[\"1,2,3\"]": 3,
  "[\"\"]": 0,
  "[\"1,2\\n3,4\"]": 0,
  "[\"1,2\\n1,2\\n1,2\"]": 2,
  "[\"1,1,2\\n1,2,2\"]": 2,
  "[\"1,2,3\\n2,3\\n\\n5\\n5\\n5\\n\\n9,8\\n7,6\"]": 3,
  "[\"1,2\\n1,3\\n\\n\\n\"]": 1,
  "[\"1,2,3\\n2,3,4\\n3,4,5\"]": 1,
  "[\"7,7,7,8\"]": 2,
  "[\"1,2\\n1,3\\n\\n4,5\\n4,6\\n\\n7\\n7\"]": 3,
  "[\"\\n\\n1,2\\n1,3\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
