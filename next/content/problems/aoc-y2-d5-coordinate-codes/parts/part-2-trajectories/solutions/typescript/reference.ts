export function max_step_distance(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"\"]": 0,
  "[\"NNNNNNNN\"]": 4,
  "[\"NNNNSSSS\"]": 2,
  "[\"NNEESSWW\\nNNNNSSSS\"]": 2,
  "[\"NNNNNNSS\"]": 3,
  "[\"EEEEWWWW\"]": 2,
  "[\"NNSSEEWW\"]": 1,
  "[\"NNNNEEEE\"]": 4,
  "[\"NNSSEEWW\\nNNNNNNNN\"]": 4,
  "[\"NNEEEESS\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
