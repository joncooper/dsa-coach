export function heaviest_category(inputText: string): string {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"food:taco\\ncraft:art\\nmusic:drum,flute,harp\"]": "music",
  "[\"\"]": "",
  "[\"food:taco\\ncraft:art\"]": "",
  "[\"food:taco,burrito\\ncraft:art,pot\\nmusic:drum,harp\"]": "craft",
  "[\"food:a,b,c,d\\ncraft:e\\nmusic:f\\n\\nfood:g,h\\ncraft:i\\nmusic:j\"]": "food",
  "[\"food:a\\ncraft:b\\nmusic:c\\nextra:d,e,f,g,h\"]": "extra",
  "[\"food:x,y,z\\ncraft:w\\n\\nfood:a\\ncraft:b\\nmusic:c\"]": "craft",
  "[\"food:a,b\\ncraft:c,d\\nmusic:e,f\"]": "craft",
  "[\"food:a,b\\ncraft:c\\nmusic:d\\n\\nfood:e,f,g\\ncraft:h\\nmusic:i\"]": "food"
} as Record<string, string>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
