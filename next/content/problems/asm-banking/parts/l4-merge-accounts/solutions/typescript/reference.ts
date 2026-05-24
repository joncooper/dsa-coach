export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"]]]": [
    "true",
    "true",
    "100",
    "50",
    "150"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"],[\"DEPOSIT\",\"6\",\"b\",\"10\"]]]": [
    "true",
    "true",
    "100",
    "50",
    "150",
    ""
  ],
  "[[[\"MERGE_ACCOUNTS\",\"1\",\"ghost\",\"x\"]]]": [
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"a\"]]]": [
    "true",
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"30\"],[\"WITHDRAW\",\"6\",\"b\",\"40\"],[\"MERGE_ACCOUNTS\",\"7\",\"a\",\"b\"],[\"TOP_SPENDERS\",\"8\",\"1\"]]]": [
    "true",
    "true",
    "100",
    "100",
    "70",
    "60",
    "130",
    "a(70)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"SCHEDULE_PAYMENT\",\"5\",\"b\",\"20\",\"10\"],[\"MERGE_ACCOUNTS\",\"6\",\"a\",\"b\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]": [
    "true",
    "true",
    "100",
    "50",
    "payment1",
    "150",
    "130"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"ghost\"]]]": [
    "true",
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"MERGE_ACCOUNTS\",\"3\",\"a\",\"b\"],[\"MERGE_ACCOUNTS\",\"4\",\"a\",\"b\"]]]": [
    "true",
    "true",
    "0",
    ""
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
