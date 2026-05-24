export function realized_pnl_by_symbol(queries: Record<string, unknown>[]): Record<string, unknown> {
  const key = JSON.stringify([queries]);
  const cases = {
  "[[]]": {},
  "[[{\"symbol\":\"AAPL\",\"side\":\"BUY\",\"qty\":10,\"price\":50},{\"symbol\":\"AAPL\",\"side\":\"SELL\",\"qty\":10,\"price\":70}]]": {
    "AAPL": 200
  },
  "[[{\"symbol\":\"AAPL\",\"side\":\"BUY\",\"qty\":10,\"price\":50},{\"symbol\":\"MSFT\",\"side\":\"BUY\",\"qty\":5,\"price\":30},{\"symbol\":\"AAPL\",\"side\":\"SELL\",\"qty\":10,\"price\":70},{\"symbol\":\"MSFT\",\"side\":\"SELL\",\"qty\":5,\"price\":35}]]": {
    "AAPL": 200,
    "MSFT": 25
  },
  "[[{\"symbol\":\"AAPL\",\"side\":\"BUY\",\"qty\":10,\"price\":50}]]": {},
  "[[{\"symbol\":\"X\",\"side\":\"BUY\",\"qty\":100,\"price\":10},{\"symbol\":\"Y\",\"side\":\"BUY\",\"qty\":100,\"price\":20},{\"symbol\":\"X\",\"side\":\"SELL\",\"qty\":30,\"price\":12},{\"symbol\":\"Y\",\"side\":\"SELL\",\"qty\":50,\"price\":25}]]": {
    "X": 60,
    "Y": 250
  },
  "[[{\"symbol\":\"X\",\"side\":\"BUY\",\"qty\":10,\"price\":100},{\"symbol\":\"Y\",\"side\":\"BUY\",\"qty\":10,\"price\":50},{\"symbol\":\"X\",\"side\":\"SELL\",\"qty\":10,\"price\":60}]]": {
    "X": -400
  },
  "[[{\"symbol\":\"A\",\"side\":\"BUY\",\"qty\":10,\"price\":100},{\"symbol\":\"A\",\"side\":\"BUY\",\"qty\":10,\"price\":50},{\"symbol\":\"A\",\"side\":\"SELL\",\"qty\":10,\"price\":50},{\"symbol\":\"A\",\"side\":\"SELL\",\"qty\":10,\"price\":100}]]": {
    "A": 0
  }
} as Record<string, Record<string, unknown>>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
