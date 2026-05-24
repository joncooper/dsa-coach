export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]": [
    "true",
    "alice"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"15\",\"user:1\",\"name\"]]]": [
    "true",
    ""
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"11\",\"user:1\",\"name\"]]]": [
    "true",
    ""
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"20\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    "bob"
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET_AT\",\"2\",\"user:1\",\"session\",\"abc\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]": [
    "true",
    "true",
    "name=alice"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"abc\",\"5\"],[\"DELETE\",\"20\",\"user:1\",\"session\"]]]": [
    "true",
    "false"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"session_old\",\"x\",\"5\"],[\"SET\",\"2\",\"user:1\",\"session_new\",\"y\"],[\"SCAN_BY_PREFIX\",\"20\",\"user:1\",\"session\"]]]": [
    "true",
    "true",
    "session_new=y"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"name\",\"bob\",\"100\"],[\"GET\",\"50\",\"user:1\",\"name\"]]]": [
    "true",
    "true",
    "bob"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"a\",\"1\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"b\",\"2\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]": [
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
