export function topKWords(text: string, k: number): Array<[string, number]> {
  if (k <= 0) return [];
  const counts = new Map<string, number>();
  for (const match of text.toLowerCase().matchAll(/[a-z]+/g)) counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k).map(([word, count]) => [word, count]);
}
