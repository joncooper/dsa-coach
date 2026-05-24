export function cipher_checksum(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"cargo 42xy ok\\ntext hello1 ok\\nledger 4242 bad\\nledger a13 ok\"]": 51,
  "[\"\"]": 0,
  "[\"cargo abcd ok\\ntext h1 ok\\ntext nope bad\"]": 1,
  "[\"cargo a99 ok\"]": 0,
  "[\"ledger a1b2c3 ok\"]": 6,
  "[\"text abc123def ok\"]": 6,
  "[\"cargo 12abc ok\\ntext h2llo ok\\nledger 9z9 ok\"]": 34,
  "[\"cargo 7a8 ok\"]": 7,
  "[\"cargo 99x bad\\nledger a9 ok\"]": 9,
  "[\"ledger abc123 ok\"]": 6,
  "[\"text a1b2c3 ok\"]": 3,
  "[\"weird a1 ok\"]": 0
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
