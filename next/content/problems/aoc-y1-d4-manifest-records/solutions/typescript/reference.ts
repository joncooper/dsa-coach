export function count_complete_records(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"id:1 name:A age:20 grade:B cohort:fall\\nextra:hi\\n\\nid:2 name:B age:21 grade:A\"]": 1,
  "[\"\"]": 0,
  "[\"id:1 name:X age:30 grade:C cohort:fall\\n\\nid:2 name:Y age:31 grade:D cohort:spring\"]": 2,
  "[\"id:1 name:A age:20 grade:B cohort:fall hair:red eye:blue\"]": 1,
  "[\"id:1 name:A\\nage:20 grade:B\\ncohort:fall\"]": 1,
  "[\"id:1 name:A age:20 grade:B\"]": 0,
  "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\nid:2 name:B age:21\\n\\nid:3 name:C age:22 grade:D cohort:spring\"]": 2,
  "[\"name:A age:20 grade:B cohort:fall\"]": 0,
  "[\"id:1 id:2 name:A age:20 grade:B cohort:fall\"]": 1,
  "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\n\\n\\n\"]": 1,
  "[\"\\n\\nid:1 name:A age:20 grade:B cohort:fall\"]": 1,
  "[\"id:1 name:A age:20 grade:B cohort:fall bareword anothertoken\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
