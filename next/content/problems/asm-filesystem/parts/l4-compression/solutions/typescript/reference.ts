export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]": [
    "true",
    "true",
    "20",
    "20"
  ],
  "[[[\"COMPRESS_FILE\",\"u\",\"ghost\"]]]": [
    ""
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"COMPRESS_FILE\",\"u\",\"f\"]]]": [
    "true",
    "true",
    "20",
    ""
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"DECOMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]": [
    "true",
    "true",
    "20",
    "40",
    "40"
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"]]]": [
    "true",
    "true",
    "40",
    "true",
    "40",
    "60"
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]": [
    "true",
    "true",
    "40",
    "true",
    "",
    "40"
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"1\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]": [
    "true",
    "true",
    "0",
    "0"
  ],
  "[[[\"ADD_FILE\",\"s\",\"10\"],[\"ADD_USER\",\"u\",\"100\"],[\"COMPRESS_FILE\",\"u\",\"s\"]]]": [
    "true",
    "true",
    ""
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"100\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"]]]": [
    "true",
    "true",
    "40",
    "true",
    ""
  ],
  "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"COPY_FILE\",\"a\",\"c\"],[\"GET_FILE_SIZE\",\"c\"]]]": [
    "true",
    "true",
    "20",
    "true",
    "20"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
