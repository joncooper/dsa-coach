export function charFrequencyTable(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const char of text) counts[char] = (counts[char] ?? 0) + 1;
  return counts;
}
