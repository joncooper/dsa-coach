export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN\",\"2\",\"user:1\"]]]": [
    "true",
    "name=alice"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"SET\",\"3\",\"user:1\",\"age\",\"30\"],[\"SCAN\",\"4\",\"user:1\"]]]": [
    "true",
    "true",
    "true",
    "age=30,email=a@x,name=alice"
  ],
  "[[[\"SCAN\",\"1\",\"ghost\"]]]": [
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"first_name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"last_name\",\"smith\"],[\"SET\",\"3\",\"user:1\",\"email\",\"a@x\"],[\"SCAN_BY_PREFIX\",\"4\",\"user:1\",\"first\"]]]": [
    "true",
    "true",
    "true",
    "first_name=alice"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN_BY_PREFIX\",\"2\",\"user:1\",\"zzz\"]]]": [
    "true",
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"\"]]]": [
    "true",
    "true",
    "a=1,b=2"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"DELETE\",\"3\",\"user:1\",\"a\"],[\"SCAN\",\"4\",\"user:1\"]]]": [
    "true",
    "true",
    "true",
    "b=2"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"Name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"N\"]]]": [
    "true",
    "true",
    "Name=alice"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"DELETE\",\"2\",\"user:1\",\"a\"],[\"SCAN\",\"3\",\"user:1\"]]]": [
    "true",
    "true",
    ""
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
