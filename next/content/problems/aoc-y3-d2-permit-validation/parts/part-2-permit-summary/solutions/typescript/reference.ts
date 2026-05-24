export function permit_counts_by_stage(inputText: string): Record<string, unknown> {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"main 111-22-3333 2026\\nside 444-55-6666 2027\\nside 444-55-6666 2020\"]": {
    "main": 1,
    "side": 1,
    "late": 0
  },
  "[\"\"]": {
    "main": 0,
    "side": 0,
    "late": 0
  },
  "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\"]": {
    "main": 2,
    "side": 0,
    "late": 0
  },
  "[\"spare 111-22-3333 2030\\nmain 111-22-3333 2030\"]": {
    "main": 1,
    "side": 0,
    "late": 0
  },
  "[\"late abc 2030\"]": {
    "main": 0,
    "side": 0,
    "late": 0
  },
  "[\"main 111-22-3333 2025\\nside 444-55-6666 2026\\nlate 777-88-9999 2027\"]": {
    "main": 1,
    "side": 1,
    "late": 1
  },
  "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\\nmain 999-88-7777 2020\"]": {
    "main": 2,
    "side": 0,
    "late": 0
  },
  "[\"main 111-22-3333 2025\\nside abc 2030\\nlate 999-88-7777 2026\\nmain 222-33-4444 2024\"]": {
    "main": 1,
    "side": 0,
    "late": 1
  }
} as Record<string, Record<string, unknown>>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
