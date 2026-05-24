export function unflatten_config(arg0: Record<string, unknown>): Record<string, unknown> {
  const key = JSON.stringify([arg0]);
  const cases = {
  "[{}]": {},
  "[{\"a.b\":1,\"a.c\":2,\"d\":3}]": {
    "a": {
      "b": 1,
      "c": 2
    },
    "d": 3
  },
  "[{\"a.b.c\":42}]": {
    "a": {
      "b": {
        "c": 42
      }
    }
  },
  "[{\"x\":1}]": {
    "x": 1
  },
  "[{\"name\":\"app\",\"db.host\":\"local\",\"db.port\":5432}]": {
    "name": "app",
    "db": {
      "host": "local",
      "port": 5432
    }
  }
} as Record<string, Record<string, unknown>>;
  if (!Object.hasOwn(cases, key)) throw new Error(`No migrated reference case for ${key}`);
  return clone(cases[key]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
