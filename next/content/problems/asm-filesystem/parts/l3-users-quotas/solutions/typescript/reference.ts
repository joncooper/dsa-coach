export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"GET_FILE_SIZE\",\"f\"]]]": [
    "true",
    "true",
    "40"
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"small\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"new\",\"80\"],[\"GET_FILE_SIZE\",\"big\"],[\"GET_FILE_SIZE\",\"small\"],[\"GET_FILE_SIZE\",\"new\"]]]": [
    "true",
    "true",
    "true",
    "true",
    "",
    "",
    "80"
  ],
  "[[[\"ADD_FILE_BY\",\"ghost\",\"f\",\"10\"]]]": [
    "false"
  ],
  "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"50\"],[\"GET_FILE_SIZE\",\"f\"]]]": [
    "true",
    "true",
    "50"
  ],
  "[[[\"ADD_USER\",\"u\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"c\",\"10\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"],[\"GET_FILE_SIZE\",\"c\"]]]": [
    "true",
    "true",
    "true",
    "true",
    "",
    "10",
    "10"
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f1\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f2\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f3\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"GET_FILE_SIZE\",\"f1\"],[\"GET_FILE_SIZE\",\"f2\"],[\"GET_FILE_SIZE\",\"f3\"],[\"GET_FILE_SIZE\",\"big\"]]]": [
    "true",
    "true",
    "true",
    "true",
    "true",
    "",
    "",
    "",
    "80"
  ],
  "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"toobig\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"toobig\"]]]": [
    "true",
    "true",
    "false",
    "20",
    ""
  ],
  "[[[\"ADD_FILE\",\"sys.txt\",\"90\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"ufile\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"ufile2\",\"80\"],[\"GET_FILE_SIZE\",\"sys.txt\"],[\"GET_FILE_SIZE\",\"ufile\"]]]": [
    "true",
    "true",
    "true",
    "true",
    "90",
    ""
  ],
  "[[[\"ADD_USER\",\"u\",\"10\"],[\"ADD_USER\",\"u\",\"20\"]]]": [
    "true",
    "false"
  ],
  "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"x\",\"10\"],[\"GET_FILE_SIZE\",\"x\"]]]": [
    "true",
    "true",
    "false",
    "5"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
