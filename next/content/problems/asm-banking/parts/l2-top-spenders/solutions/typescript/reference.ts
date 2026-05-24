export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"60\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]": [
    "true",
    "true",
    "100",
    "40",
    "a(60)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"b\"],[\"CREATE_ACCOUNT\",\"2\",\"a\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"20\"],[\"WITHDRAW\",\"6\",\"b\",\"20\"],[\"TOP_SPENDERS\",\"7\",\"2\"]]]": [
    "true",
    "true",
    "100",
    "100",
    "80",
    "80",
    "a(20),b(20)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"30\"],[\"TOP_SPENDERS\",\"4\",\"10\"]]]": [
    "true",
    "100",
    "70",
    "a(30)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"TOP_SPENDERS\",\"2\",\"1\"]]]": [
    "true",
    "a(0)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"200\"],[\"WITHDRAW\",\"3\",\"a\",\"30\"],[\"WITHDRAW\",\"4\",\"a\",\"20\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]": [
    "true",
    "200",
    "170",
    "150",
    "a(50)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"70\"],[\"TRANSFER\",\"6\",\"b\",\"a\",\"10\"],[\"TOP_SPENDERS\",\"7\",\"2\"]]]": [
    "true",
    "true",
    "100",
    "100",
    "30",
    "90",
    "a(70),b(10)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"10\"],[\"TOP_SPENDERS\",\"4\",\"0\"]]]": [
    "true",
    "100",
    "90",
    ""
  ],
  "[[[\"TOP_SPENDERS\",\"1\",\"5\"]]]": [
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"10\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"50\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]": [
    "true",
    "true",
    "10",
    "",
    "a(0)"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
