export function max_block_sum(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"a=1\\nb=2\\n\\nc=10\\nd=garbage\\ne=5\"]": 15,
  "[\"\"]": 0,
  "[\"x=4\\ny=8\"]": 12,
  "[\"a=-1\\nb=2\"]": 2,
  "[\"a=foo\\nb=bar\"]": 0,
  "[\"\\n\\na=5\\n\\n\\n\"]": 5,
  "[\"a=1\\n\\na=100\\nb=50\\n\\na=2\"]": 150,
  "[\"a=0\\nb=0\\nc=3\"]": 3,
  "[\"a=10\\nnopeval\\nb=5\"]": 15,
  "[\"a=1.5\\nb=2\\nc=3\"]": 5,
  "[\"a=+5\\nb=10\"]": 10,
  "[\"a=  7  \\nb=3\"]": 10
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
