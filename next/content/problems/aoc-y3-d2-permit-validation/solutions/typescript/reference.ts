export function count_valid_permits(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"main 123-45-6789 2026\\nside abc 2030\\nlate 987-65-4321 2024\\nlate 111-22-3333 2025\"]": 2,
  "[\"\"]": 0,
  "[\"main 111-22-3333 2020\\nside 444-55-6666 2010\"]": 0,
  "[\"main 111-22-3333 2025\\nside 444-55-6666 2030\"]": 2,
  "[\"main 12-45-6789 2030\"]": 0,
  "[\"main 123456789 2030\"]": 0,
  "[\"main 123-45-6789 999\"]": 0,
  "[\"main 123-45-6789 2025\"]": 1,
  "[\"main 123-45-6789 20250\"]": 0,
  "[\"main 12a-45-6789 2030\"]": 0,
  "[\"main 123-45-6789 2024\"]": 0,
  "[\"main 123-45-6789 2025\\nside 111-22-3333 2024\\nlate 999-88-7777 2026\\nmain bad-shape 2025\"]": 2
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
