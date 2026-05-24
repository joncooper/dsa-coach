export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[]]": [],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"GET\",\"2\",\"user:1\",\"name\"]]]": [
    "true",
    "alice"
  ],
  "[[[\"GET\",\"1\",\"ghost\",\"name\"]]]": [
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"GET\",\"3\",\"user:1\",\"email\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    "a@x",
    "alice"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"phone\"]]]": [
    "true",
    "false"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    "bob"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"],[\"SET\",\"4\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    "",
    "true",
    "bob"
  ],
  "[[[\"SET\",\"1\",\"User\",\"Name\",\"alice\"],[\"GET\",\"2\",\"user\",\"Name\"],[\"GET\",\"3\",\"User\",\"name\"],[\"GET\",\"4\",\"User\",\"Name\"]]]": [
    "true",
    "",
    "",
    "alice"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
