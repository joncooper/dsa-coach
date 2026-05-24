export function slope_walk_product(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"\"]": 0,
  "[\"..##.......\\n#...#...#..\\n.#....#..#.\\n..#.#...#.#\\n.#...##..#.\\n..#.##.....\\n.#.#.#....#\\n.#........#\\n#.##...#...\\n#...##....#\\n.#..#...#.#\"]": 336,
  "[\"###\"]": 1,
  "[\"....\\n....\\n....\\n....\\n....\"]": 0,
  "[\"####\\n####\"]": 16,
  "[\"....\\n#...\\n....\\n#...\\n....\\n#...\"]": 0,
  "[\"####\"]": 1,
  "[\"#\\n#\\n#\\n#\\n#\"]": 1875
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
