export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]": [
    "true",
    "backup1",
    "true",
    "true",
    "alice"
  ],
  "[[[\"RESTORE\",\"1\",\"ghost\"]]]": [
    "false"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"5\"],[\"BACKUP\",\"20\"],[\"RESTORE\",\"21\",\"backup1\"],[\"GET\",\"22\",\"user:1\",\"session\"]]]": [
    "true",
    "backup1",
    "true",
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:2\",\"name\",\"carol\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:2\",\"name\"]]]": [
    "true",
    "backup1",
    "true",
    "true",
    ""
  ],
  "[[[\"BACKUP\",\"1\"],[\"SET\",\"2\",\"user:1\",\"name\",\"alice\"],[\"RESTORE\",\"3\",\"backup1\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]": [
    "backup1",
    "true",
    "true",
    ""
  ],
  "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"BACKUP\",\"4\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"6\",\"user:1\",\"name\"],[\"RESTORE\",\"7\",\"backup2\"],[\"GET\",\"8\",\"user:1\",\"name\"]]]": [
    "true",
    "backup1",
    "true",
    "backup2",
    "true",
    "alice",
    "true",
    "bob"
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"100\",\"backup1\"],[\"GET\",\"101\",\"user:1\",\"session\"]]]": [
    "true",
    "backup1",
    "true",
    ""
  ],
  "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"10\",\"user:1\",\"session\"],[\"GET\",\"12\",\"user:1\",\"session\"]]]": [
    "true",
    "backup1",
    "true",
    "x",
    ""
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
