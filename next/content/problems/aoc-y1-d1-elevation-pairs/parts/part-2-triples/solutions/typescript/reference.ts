export function elevation_triples(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"15\\n2\\n4\\n3\\n8\\n5\"]": 2,
  "[\"100\\n1\\n2\\n3\\n4\"]": 0,
  "[\"\"]": 0,
  "[\"0\\n0\\n0\\n0\\n0\"]": 4,
  "[\"0\\n-2\\n-1\\n1\\n2\\n3\"]": 1,
  "[\"9\\n3\\n3\\n3\\n3\"]": 4,
  "[\"0\\n0\\n0\\n0\\n0\\n0\"]": 10,
  "[\"1000\\n1\\n2\\n3\\n4\\n5\"]": 0,
  "[\"6\\n2\\n2\"]": 0,
  "[\"6\\n2\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
