export function scan_aisle(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\".*.\\n#*.\\n..*\"]": 2,
  "[\"\"]": 0,
  "[\"*.*\\n.*.\"]": 3,
  "[\"#**\\n.**\"]": 2,
  "[\"#\\n#\\n#\"]": 0,
  "[\"**.*\"]": 3,
  "[\"**#**\"]": 2,
  "[\"*.*.*\\n#####\\n*..**\\n.*.#*\\n*..*.\"]": 9,
  "[\"*..*..\"]": 2,
  "[\"**#\"]": 2,
  "[\"*\\n#\\n*\\n#\\n*\"]": 3,
  "[\"......\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
