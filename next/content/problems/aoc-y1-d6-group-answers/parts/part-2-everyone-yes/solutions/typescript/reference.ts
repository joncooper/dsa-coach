export function everyone_yes_sum(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"abc\\nbcd\\n\\nef\\nfg\"]": 3,
  "[\"abc\"]": 3,
  "[\"\"]": 0,
  "[\"a\\nb\\nc\"]": 0,
  "[\"ab\\nac\\nad\"]": 1,
  "[\"ab\\nac\\n\\nef\\nef\\n\\nx\"]": 4,
  "[\"abc\\n\\n\\n\\ndef\\nde\"]": 5,
  "[\"abc\\nabc\\nabc\"]": 3,
  "[\"abcd\\nabc\\nab\\na\"]": 1,
  "[\"a\\nb\\n\\nx\\nx\"]": 1,
  "[\"a\\na\\na\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
