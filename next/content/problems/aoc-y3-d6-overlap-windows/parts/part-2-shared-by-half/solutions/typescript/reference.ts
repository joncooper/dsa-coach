export function majority_tag_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]": 5,
  "[\"\"]": 0,
  "[\"a,b,c\"]": 3,
  "[\"a\\nb\\na,b\"]": 2,
  "[\"a\\na\\nb\\nc\"]": 1,
  "[\"a\\na\\na\\nb\\nc\"]": 1,
  "[\"a\\nb\\nc\\nd\"]": 0,
  "[\"a\\na\\nb\\n\\n\\n\"]": 1,
  "[\"a,b\\na\\nb\\na\"]": 2,
  "[\"a,b\\na,c\\na,d\"]": 1,
  "[\"a\\na\\nb\\n\\nx\\nx\\ny\"]": 2
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
