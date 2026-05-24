export function firstUnique(stream: string[]): string[] {
  const counts = new Map<string, number>();
  const pending: string[] = [];
  const out: string[] = [];
  for (const value of stream) {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);
    if (count === 1) pending.push(value);
    else {
      let index = pending.indexOf(value);
      while (index !== -1) { pending.splice(index, 1); index = pending.indexOf(value); }
    }
    out.push(pending[0] ?? "");
  }
  return out;
}
