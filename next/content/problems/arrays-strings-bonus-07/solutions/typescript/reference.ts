export function firstUniqueIndex(text: string): number {
  const counts = new Map<string, number>();
  for (const char of text) counts.set(char, (counts.get(char) ?? 0) + 1);
  for (let index = 0; index < text.length; index += 1) {
    if (counts.get(text[index]) === 1) return index;
  }
  return -1;
}
