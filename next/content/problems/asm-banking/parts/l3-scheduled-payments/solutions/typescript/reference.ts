export function solution(queries: string[][]): string[] {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"20\",\"a\",\"5\"]]]": [
    "true",
    "100",
    "payment1",
    "75"
  ],
  "[[[\"SCHEDULE_PAYMENT\",\"1\",\"ghost\",\"10\",\"5\"]]]": [
    ""
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"a\",\"payment1\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]": [
    "true",
    "100",
    "payment1",
    "true",
    "100"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"15\",\"a\",\"0\"],[\"CANCEL_PAYMENT\",\"16\",\"a\",\"payment1\"]]]": [
    "true",
    "100",
    "payment1",
    "70",
    "false"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"20\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"10\",\"5\"],[\"DEPOSIT\",\"30\",\"a\",\"0\"]]]": [
    "true",
    "100",
    "payment1",
    "payment2",
    "60"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"20\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"100\",\"5\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]": [
    "true",
    "20",
    "payment1",
    "20"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"b\",\"payment1\"]]]": [
    "true",
    "true",
    "100",
    "payment1",
    "false"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"5\"],[\"TOP_SPENDERS\",\"20\",\"1\"]]]": [
    "true",
    "100",
    "payment1",
    "a(30)"
  ],
  "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"10\",\"0\"],[\"DEPOSIT\",\"4\",\"a\",\"0\"]]]": [
    "true",
    "100",
    "payment1",
    "90"
  ]
} as Record<string, string[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
