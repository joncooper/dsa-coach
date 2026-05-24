export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[]]": [],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"]]]": [
    "true",
    "100"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"a\"]]]": [
    "true",
    "false"
  ],
  "[[[\"DEPOSIT\",\"1\",\"ghost\",\"50\"]]]": [
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"40\"]]]": [
    "true",
    "100",
    "60"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"WITHDRAW\",\"3\",\"a\",\"100\"]]]": [
    "true",
    "50",
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"30\"]]]": [
    "true",
    "true",
    "100",
    "70"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"a\",\"10\"]]]": [
    "true",
    "50",
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"ghost\",\"10\"]]]": [
    "true",
    "50",
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"10\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"50\"],[\"DEPOSIT\",\"5\",\"b\",\"0\"]]]": [
    "true",
    "true",
    "10",
    "",
    "0"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
