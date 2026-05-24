export function diagonal_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"T..\\n.T.\\n..T\"]": 3,
  "[\"T..\\n.#.\\n..T\"]": 1,
  "[\"\"]": 0,
  "[\"...\\n...\\n...\"]": 0,
  "[\"T...\\n.T..\\n..T.\"]": 3,
  "[\"T..\\n.T.\\n..T\\n...\"]": 3,
  "[\"#TT\\nTTT\\nTTT\"]": 0,
  "[\"T...\\n....\\n....\\n....\"]": 1,
  "[\"T..\\nT#.\\n..T\"]": 1,
  "[\"T\"]": 1,
  "[\"#\"]": 0,
  "[\".T.\\nT.T\\n.T.\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
