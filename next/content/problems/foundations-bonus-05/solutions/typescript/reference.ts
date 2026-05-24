export function countVowels(text: string): number {
  const vowels = new Set(["a", "e", "i", "o", "u"]);
  let count = 0;
  for (const char of text.toLowerCase()) {
    if (vowels.has(char)) count += 1;
  }
  return count;
}
