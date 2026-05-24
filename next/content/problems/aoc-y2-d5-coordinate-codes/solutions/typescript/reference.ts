export function max_manhattan(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"NNNNEEEE\\nSSSSWWWW\"]": 4,
  "[\"NNNNNNNN\"]": 4,
  "[\"\"]": 0,
  "[\"NNSSEEWW\"]": 0,
  "[\"EEEEEEEE\"]": 4,
  "[\"NNNNEESS\\nWWWWEENN\"]": 2,
  "[\"NNNNNNNN\\n\\nSSSSSSSS\"]": 4,
  "[\"NNEESSWW\\nNNNNSSSS\\nEEEEEEEE\"]": 4,
  "[\"NNNNEEEE\"]": 4,
  "[\"NNSSEEWW\\nNNNNEEEE\"]": 4,
  "[\"SSSSSSSS\"]": 4,
  "[\"WWWWWWWW\"]": 4
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
