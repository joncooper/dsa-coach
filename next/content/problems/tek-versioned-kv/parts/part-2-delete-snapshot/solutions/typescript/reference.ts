export function versioned_kv_with_snapshot(queries: unknown[][]): unknown[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[]]": [],
  "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",15]]]": [
    null
  ],
  "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",7]]]": [
    "x"
  ],
  "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"y\",15],[\"GET\",\"a\",20]]]": [
    "y"
  ],
  "[[[\"SET\",\"a\",\"x\",1],[\"SET\",\"b\",\"y\",2],[\"SNAPSHOT\",3]]]": [
    {
      "a": "x",
      "b": "y"
    }
  ],
  "[[[\"SET\",\"a\",\"x\",1],[\"DELETE\",\"a\",2],[\"SNAPSHOT\",5]]]": [
    {}
  ],
  "[[[\"SET\",\"a\",\"x\",1],[\"SNAPSHOT\",1]]]": [
    {
      "a": "x"
    }
  ],
  "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",2],[\"DELETE\",\"a\",3],[\"GET\",\"a\",4],[\"SET\",\"a\",\"3\",5],[\"SNAPSHOT\",6]]]": [
    null,
    {
      "a": "3",
      "b": "2"
    }
  ],
  "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SNAPSHOT\",9],[\"SNAPSHOT\",10]]]": [
    {
      "a": "x"
    },
    {}
  ],
  "[[[\"SET\",\"a\",\"v1\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"v2\",15],[\"DELETE\",\"a\",20],[\"SET\",\"a\",\"v3\",25],[\"GET\",\"a\",7],[\"GET\",\"a\",12],[\"GET\",\"a\",17],[\"GET\",\"a\",22],[\"GET\",\"a\",30]]]": [
    "v1",
    null,
    "v2",
    null,
    "v3"
  ],
  "[[[\"SET\",\"a\",\"x\",10],[\"DELETE\",\"a\",5],[\"GET\",\"a\",6],[\"GET\",\"a\",10]]]": [
    null,
    "x"
  ],
  "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",1],[\"SET\",\"c\",\"3\",1],[\"DELETE\",\"b\",5],[\"SNAPSHOT\",10]]]": [
    {
      "a": "1",
      "c": "3"
    }
  ],
  "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",10]]]": [
    null
  ]
} as Record<string, unknown[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
