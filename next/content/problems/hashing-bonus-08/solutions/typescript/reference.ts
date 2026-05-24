export function groupByFirstLetter(words: string[]): Record<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const word of words) {
    if (word.length === 0) continue;
    const key = word[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(word);
  }
  return Object.fromEntries([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)));
}
