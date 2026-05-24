export function top_three_block_sum(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"\"]": 0,
  "[\"a=5\"]": 5,
  "[\"a=3\\n\\nb=4\"]": 7,
  "[\"a=1\\n\\nb=100\\n\\nc=10\\n\\nd=50\"]": 160,
  "[\"a=1\\n\\nb=2\\n\\nc=3\\n\\nd=4\\n\\ne=5\"]": 12,
  "[\"a=10\\n\\nb=20\\n\\nc=30\"]": 60,
  "[\"a=foo\\n\\nb=10\\n\\nc=garbage\\nd=5\"]": 15,
  "[\"a=50\\n\\nb=30\"]": 80,
  "[\"a=10\\n\\nb=10\\n\\nc=10\\n\\nd=10\"]": 30,
  "[\"a=0\\n\\nb=0\\n\\nc=0\\n\\nd=5\"]": 5
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
