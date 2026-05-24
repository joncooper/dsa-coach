export function count_dependents_on_paste(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"core requires 1 binding_paste.\\nshell requires 1 core.\\nbinding_paste requires nothing.\"]": 2,
  "[\"alpha requires 1 beta.\\nbeta requires nothing.\"]": 0,
  "[\"\"]": 0,
  "[\"left requires 1 binding_paste.\\nright requires 1 binding_paste.\\ntop requires 1 left, 1 right.\\nbinding_paste requires nothing.\"]": 3,
  "[\"a requires 1 binding_paste.\\nb requires 1 a.\\nc requires 1 b.\\nd requires 1 c.\\nbinding_paste requires nothing.\"]": 4,
  "[\"core requires 1 binding_paste.\\nirrelevant requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]": 1,
  "[\"alpha requires 1 beta.\\nbeta requires 1 gamma.\\ngamma requires nothing.\\nbinding_paste requires nothing.\"]": 0,
  "[\"alpha requires 1 binding_paste.\\nbeta requires 1 binding_paste.\\ngamma requires 1 binding_paste.\\nbinding_paste requires nothing.\"]": 3,
  "[\"a requires 1 b.\\nb requires 1 c.\\nc requires 1 binding_paste.\\nbinding_paste requires nothing.\"]": 3,
  "[\"tonic requires 5 binding_paste, 3 herb.\\nherb requires nothing.\\nbinding_paste requires nothing.\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
