export function mostFrequentCharacter(text: string): string | null {
  if (text.length === 0) return null;
  const counts = new Map<string, number>();
  for (const char of text) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  let best = text[0];
  for (const char of text) {
    if ((counts.get(char) ?? 0) > (counts.get(best) ?? 0)) best = char;
  }
  return best;
}
