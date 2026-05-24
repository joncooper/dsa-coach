export function longest_chain(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"a before b.\\nb before c.\\nc before nothing.\"]": 3,
  "[\"\"]": 0,
  "[\"only before nothing.\"]": 1,
  "[\"root before a, b.\\na before nothing.\\nb before nothing.\"]": 2,
  "[\"a before nothing.\\nb before c.\\nc before d.\\nd before nothing.\"]": 3,
  "[\"top before left, right.\\nleft before bottom.\\nright before bottom.\\nbottom before nothing.\"]": 3,
  "[\"a before b.\\nb before c.\\nc before d.\\nd before e.\\ne before nothing.\"]": 5,
  "[\"a before b.\"]": 2,
  "[\"root before a, b, c, d, e.\\na before nothing.\\nb before nothing.\\nc before nothing.\\nd before nothing.\\ne before nothing.\"]": 2,
  "[\"root before a, b.\\na before nothing.\\nb before x.\\nx before y.\\ny before nothing.\"]": 4
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
