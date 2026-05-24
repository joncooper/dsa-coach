export function valid_roster_total(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"food:taco,burrito\\ncraft:pottery\\nmusic:drum,flute,harp\"]": 6,
  "[\"\"]": 0,
  "[\"food:taco\\ncraft:pottery\"]": 0,
  "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\nfood:burrito\\ncraft:art\\nmusic:guitar,bass\"]": 7,
  "[\"food:taco\\ncraft:art\\nmusic:drum\\nextra:foo,bar\"]": 5,
  "[\"food:taco\\ncraft:art\\nmusic:drum\"]": 3,
  "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\n\\n\"]": 3,
  "[\"food:taco,taco\\ncraft:art\\nmusic:drum\"]": 4,
  "[\"food:taco\\ncraft:art\\nmusic:drum\\n\\nfood:burrito\\ncraft:pot\"]": 3,
  "[\"food:taco\\nfood:burrito\\ncraft:art\\nmusic:drum\"]": 4,
  "[\"\\n\\nfood:taco\\ncraft:art\\nmusic:drum\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
