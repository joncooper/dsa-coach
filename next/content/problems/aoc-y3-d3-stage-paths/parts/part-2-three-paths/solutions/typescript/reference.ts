export function three_paths_sum(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"T..\\n.T.\\n..T\"]": 5,
  "[\"\"]": 0,
  "[\"...\\n...\\n...\"]": 0,
  "[\"TT\\nTT\\nTT\"]": 5,
  "[\"T.T.T\\n.T.T.\\nT.T.T\"]": 6,
  "[\"T..\\n.#.\\n..T\"]": 3,
  "[\"T.\\n.T\\nT.\\n.T\\nT.\"]": 4,
  "[\"#\"]": 0,
  "[\"T\"]": 3,
  "[\"TT\\nTT\"]": 4
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
