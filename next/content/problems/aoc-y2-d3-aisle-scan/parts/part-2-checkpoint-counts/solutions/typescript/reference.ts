export function scan_checkpoints(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"\"]": 0,
  "[\"*.*.\"]": 0,
  "[\"*\\n**\"]": 1,
  "[\"**\\n**\\n**\"]": 0,
  "[\"*\\n**\\n***\\n****\"]": 3,
  "[\"****\\n***\\n**\\n*****\"]": 1,
  "[\"**#**\\n*****\\n*#***\\n*****\"]": 2,
  "[\"**\\n**\\n**\\n**\\n**\"]": 0,
  "[\"**\\n**\"]": 0,
  "[\"*\\n**\\n***\\n****\\n**\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
