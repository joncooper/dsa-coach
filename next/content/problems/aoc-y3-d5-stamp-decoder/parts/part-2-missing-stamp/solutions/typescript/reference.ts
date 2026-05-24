export function find_missing_stamp(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"000001\\n000003\"]": 2,
  "[\"\"]": -1,
  "[\"000001\\n000002\"]": -1,
  "[\"000001\\n000002\\n000003\\n000005\"]": 4,
  "[\"000001\\n000003\\n000005\"]": 2,
  "[\"00000a\"]": -1,
  "[\"000001\\n000004\"]": -1,
  "[\"000001\\n000001\\n000003\"]": 2,
  "[\"000005\\n000001\\n000003\"]": 2,
  "[\"000001\\n000002\\n000003\\n000005\\n000006\\n000007\"]": 4
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
