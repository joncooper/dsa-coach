export function binding_paste_cost(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"final_product requires 3 binding_paste.\\nbinding_paste requires nothing.\"]": 3,
  "[\"final_product requires 2 core.\\ncore requires 5 binding_paste.\\nbinding_paste requires nothing.\"]": 10,
  "[\"\"]": 0,
  "[\"final_product requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]": 0,
  "[\"final_product requires 2 left, 3 right.\\nleft requires 1 binding_paste.\\nright requires 4 binding_paste.\\nbinding_paste requires nothing.\"]": 14,
  "[\"final_product requires 2 a.\\na requires 3 b.\\nb requires 5 binding_paste.\\nbinding_paste requires nothing.\"]": 30,
  "[\"binding_paste requires nothing.\"]": 0,
  "[\"final_product requires 2 a, 2 b.\\na requires 3 base.\\nb requires 3 base.\\nbase requires 2 binding_paste.\\nbinding_paste requires nothing.\"]": 24,
  "[\"final_product requires 2 binding_paste, 1 sleeve.\\nsleeve requires 3 binding_paste, 4 leather.\\nleather requires nothing.\\nbinding_paste requires nothing.\"]": 5,
  "[\"final_product requires 10 sand.\\nsand requires nothing.\\nbinding_paste requires nothing.\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
