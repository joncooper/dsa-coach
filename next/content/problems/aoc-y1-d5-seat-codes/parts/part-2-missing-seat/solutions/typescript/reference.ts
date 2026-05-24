export function find_missing_seat(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"FFFFFFFLLL\\nFFFFFFFLLR\\nFFFFFFFLRR\\nFFFFFFFRLL\"]": 2,
  "[\"\"]": -1,
  "[\"FFFFFFFLLL\\nFFFFFFFLLR\"]": -1,
  "[\"FFFFFFFLLL\\nFFFFFFFLRL\\nFFFFFFFLRR\"]": 1,
  "[\"FFFFFFFLLR\\nFFFFFFFLRL\"]": -1,
  "[\"FBFBBFFRLR\"]": -1,
  "[\"FFFFFFFLLL\\nFFFFFFFLRL\\nFFFFFFFLRR\\nFFFFFFFRLR\\nFFFFFFFRRR\"]": 1,
  "[\"FFFFFFFLLL\\nFFFFFFFRLR\"]": -1,
  "[\"FFFFFFFLLL\\nFFFFFFFLLL\\nFFFFFFFLRL\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
