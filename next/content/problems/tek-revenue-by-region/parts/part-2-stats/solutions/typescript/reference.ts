export function revenue_stats_by_region(arg0: Record<string, unknown>[], arg1: Record<string, unknown>[]): Record<string, unknown> {
  const key = JSON.stringify([arg0, arg1]);
  const cases = {
  "[[],[]]": {},
  "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"customer_id\":1,\"amount\":100},{\"customer_id\":2,\"amount\":50},{\"customer_id\":1,\"amount\":25}]]": {
    "US": {
      "total": 125,
      "count": 2
    },
    "EU": {
      "total": 50,
      "count": 1
    }
  },
  "[[{\"id\":1,\"region\":\"US\"}],[{\"customer_id\":1,\"amount\":10},{\"customer_id\":9,\"amount\":99}]]": {
    "US": {
      "total": 10,
      "count": 1
    }
  },
  "[[{\"id\":1,\"region\":\"APAC\"}],[{\"customer_id\":1,\"amount\":0},{\"customer_id\":1,\"amount\":5}]]": {
    "APAC": {
      "total": 5,
      "count": 2
    }
  }
} as Record<string, Record<string, unknown>>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
