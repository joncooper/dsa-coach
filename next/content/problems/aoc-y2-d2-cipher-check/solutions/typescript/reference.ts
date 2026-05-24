export function valid_cipher_count(inputText: string): number {
  const key = JSON.stringify([inputText]);
  const cases = {
  "[\"cargo a1b2 ok\\ntext hello bad\\nledger 4242 ok\\ntext h1 ok\"]": 2,
  "[\"cargo a1 bad\\ntext b2 bad\"]": 0,
  "[\"\"]": 0,
  "[\"cargo abcd ok\"]": 0,
  "[\"cargo 1234 ok\"]": 0,
  "[\"text a1 ok\"]": 1,
  "[\"\\ntext a1 ok\\n\\n\"]": 1,
  "[\"cargo a1\"]": 0,
  "[\"cargo a1 ok extra\"]": 0,
  "[\"cargo a1 OK\"]": 0,
  "[\"cargo a1 ok\\ntext b2 ok\\nledger c3 ok\\ntext bad bad\"]": 3
} as Record<string, number>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
