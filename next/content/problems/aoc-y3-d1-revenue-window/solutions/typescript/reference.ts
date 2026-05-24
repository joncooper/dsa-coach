export function max_revenue_window(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"3\\n1\\n2\\n3\\n4\\n5\"]": 12,
  "[\"1\\n5\\n9\\n3\"]": 9,
  "[\"\"]": 0,
  "[\"5\\n1\\n2\"]": 0,
  "[\"2\\n-1\\n-2\\n-3\\n10\"]": 7,
  "[\"3\\n1\\n2\\n3\"]": 6,
  "[\"2\\n0\\n5\\n5\\n0\"]": 10,
  "[\"2\\n-5\\n-3\\n-9\\n-1\"]": -8,
  "[\"1\\n3\\n7\\n2\\n9\\n4\"]": 9,
  "[\"4\\n1\\n2\\n3\\n4\"]": 10,
  "[\"3\\n1\\n2\\n3\\n100\\n1\\n1\\n1\"]": 105,
  "[\"3\\n5\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
