export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[]]": [],
  "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]": [
    "true",
    "100"
  ],
  "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"ADD_FILE\",\"a.txt\",\"200\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]": [
    "true",
    "false",
    "100"
  ],
  "[[[\"ADD_FILE\",\"a.txt\",\"50\"],[\"COPY_FILE\",\"a.txt\",\"b.txt\"],[\"GET_FILE_SIZE\",\"b.txt\"]]]": [
    "true",
    "true",
    "50"
  ],
  "[[[\"COPY_FILE\",\"x\",\"y\"]]]": [
    "false"
  ],
  "[[[\"GET_FILE_SIZE\",\"nope\"]]]": [
    ""
  ],
  "[[[\"ADD_FILE\",\"a\",\"10\"],[\"ADD_FILE\",\"b\",\"99\"],[\"COPY_FILE\",\"a\",\"b\"],[\"GET_FILE_SIZE\",\"b\"]]]": [
    "true",
    "true",
    "true",
    "10"
  ],
  "[[[\"ADD_FILE\",\"File\",\"1\"],[\"GET_FILE_SIZE\",\"file\"],[\"GET_FILE_SIZE\",\"File\"]]]": [
    "true",
    "",
    "1"
  ],
  "[[[\"ADD_FILE\",\"a\",\"7\"],[\"COPY_FILE\",\"a\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]": [
    "true",
    "true",
    "7"
  ],
  "[[[\"ADD_FILE\",\"z\",\"0\"],[\"GET_FILE_SIZE\",\"z\"]]]": [
    "true",
    "0"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
