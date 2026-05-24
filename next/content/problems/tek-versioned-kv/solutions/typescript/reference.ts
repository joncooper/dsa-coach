export function versionedKv(operations: unknown[][]): unknown[] {
  const history = new Map<string, number[]>();
  const table = new Map<string, unknown>();
  const out: unknown[] = [];
  for (const op of operations) {
    if (op[0] === "SET") {
      const key = String(op[1]);
      const value = op[2];
      const ts = Number(op[3]);
      const stamps = history.get(key) ?? [];
      if (!stamps.includes(ts)) { stamps.push(ts); stamps.sort((a, b) => a - b); }
      history.set(key, stamps);
      table.set(`${key}\u0000${ts}`, value);
    } else {
      const key = String(op[1]);
      const ts = Number(op[2]);
      const stamps = history.get(key) ?? [];
      let answer: unknown = null;
      for (const stamp of stamps) if (stamp <= ts) answer = table.get(`${key}\u0000${stamp}`);
      out.push(answer ?? null);
    }
  }
  return out;
}
