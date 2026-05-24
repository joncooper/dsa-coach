export function anagramBucketSizes(words: string[]): number[] {
  const buckets = new Map<string, number>();
  for (const word of words) {
    const key = [...word].sort().join("");
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.values()].sort((left, right) => left - right);
}
