export function canFormWord(word: string, letters: string[]): boolean {
  const counts = new Map<string, number>();
  for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  for (const char of word) {
    const available = counts.get(char) ?? 0;
    if (available === 0) return false;
    counts.set(char, available - 1);
  }
  return true;
}
