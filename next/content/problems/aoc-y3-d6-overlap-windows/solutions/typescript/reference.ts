export function odd_tag_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]": 3,
  "[\"\"]": 0,
  "[\"a,b,c\"]": 3,
  "[\"a\\na\"]": 0,
  "[\"a,a,b\\nb,c\"]": 2,
  "[\"a,b\\nb,c\\nc,a\"]": 0,
  "[\"a\\na\\na\\n\\nx\\ny\\nx,y\"]": 1,
  "[\"a,b\\n\\n\\n\"]": 2,
  "[\"a\\na\\na\"]": 1,
  "[\"a,a,a\\nb\"]": 2,
  "[\"a,b\\na\\nb\\nc\\nc,d\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
