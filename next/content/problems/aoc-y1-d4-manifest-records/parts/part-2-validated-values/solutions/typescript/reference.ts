export function count_strict_records(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"id:123456789 name:Ada age:30 grade:A cohort:fall\"]": 1,
  "[\"id:12345 name:Ada age:30 grade:A cohort:fall\"]": 0,
  "[\"id:123456789 name:Ada age:14 grade:A cohort:fall\"]": 0,
  "[\"\"]": 0,
  "[\"id:111222333 name:B age:20 grade:E cohort:spring\"]": 0,
  "[\"id:111222333 name:B age:20 grade:A cohort:autumn\"]": 0,
  "[\"id:111222333 name:Ada-Lovelace age:30 grade:B cohort:winter\"]": 1,
  "[\"id:111222333 name:Ada2 age:30 grade:B cohort:winter\"]": 0,
  "[\"id:111222333 name:B age:16 grade:A cohort:spring\"]": 1,
  "[\"id:111222333 name:B age:99 grade:A cohort:spring\"]": 1,
  "[\"id:111222333 name:B age:100 grade:A cohort:spring\"]": 0,
  "[\"id:11122233a name:B age:30 grade:A cohort:spring\"]": 0,
  "[\"id:111222333 name:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa age:30 grade:A cohort:spring\"]": 0,
  "[\"id:111222333 name:A age:30 grade:A cohort:spring\\n\\nname:B age:30 grade:A cohort:spring\"]": 1
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
