export function longestUniqueSubstring(text: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < text.length; right += 1) {
    const char = text[right];
    const previous = lastSeen.get(char);
    if (previous !== undefined && previous >= left) left = previous + 1;
    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
