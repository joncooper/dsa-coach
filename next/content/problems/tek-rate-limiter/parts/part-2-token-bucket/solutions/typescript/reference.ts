export function token_bucket_rate_limited(arg0: unknown[][], arg1: number, arg2: number): boolean[] {
  const key = JSON.stringify([arg0, arg1, arg2]);
  const cases = {
  "[[],5,10]": [],
  "[[[0,\"a\"],[0,\"a\"],[0,\"a\"]],2,1]": [
    true,
    true,
    false
  ],
  "[[[0,\"a\"],[0,\"a\"],[1,\"a\"]],2,1]": [
    true,
    true,
    true
  ],
  "[[[0,\"a\"],[0,\"b\"]],1,10]": [
    true,
    true
  ],
  "[[[0,\"a\"],[0,\"a\"],[1,\"a\"],[2,\"a\"]],1,2]": [
    true,
    false,
    false,
    true
  ],
  "[[[0,\"a\"],[0,\"a\"],[0,\"a\"],[3,\"a\"],[3,\"a\"]],2,2]": [
    true,
    true,
    false,
    true,
    false
  ],
  "[[[0,\"a\"],[10,\"a\"]],5,1]": [
    true,
    true
  ],
  "[[[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"]],3,1]": [
    true,
    true,
    true,
    false
  ],
  "[[[0,\"a\"],[4,\"a\"],[6,\"a\"],[7,\"a\"]],1,3]": [
    true,
    true,
    true,
    false
  ],
  "[[[0,\"a\"],[0,\"a\"],[100,\"a\"],[100,\"a\"],[100,\"a\"]],2,1]": [
    true,
    true,
    true,
    true,
    false
  ],
  "[[[0,\"a\"],[0,\"a\"],[0,\"b\"],[0,\"b\"],[0,\"a\"],[0,\"b\"]],2,5]": [
    true,
    true,
    true,
    true,
    false,
    false
  ]
} as Record<string, boolean[]>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
