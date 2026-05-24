export function lruCache(capacity: number, operations: string[][]): string[] {
  const cache = new Map<string, string>();
  const out: string[] = [];
  for (const op of operations) {
    if (op[0] === "get") {
      const key = op[1];
      if (!cache.has(key)) out.push("-1");
      else { const value = cache.get(key)!; cache.delete(key); cache.set(key, value); out.push(value); }
    } else {
      const key = op[1];
      const value = op[2];
      if (cache.has(key)) cache.delete(key);
      cache.set(key, value);
      if (cache.size > capacity) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
    }
  }
  return out;
}
