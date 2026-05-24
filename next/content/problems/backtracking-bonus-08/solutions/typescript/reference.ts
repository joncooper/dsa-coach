export function keypadLetterWords(digits: string): string[] {
  const mapping: Record<string, string> = { "2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz" };
  if (digits.length === 0 || [...digits].some((digit) => !mapping[digit])) return [];
  const result: string[] = [];
  const letters: string[] = [];
  const backtrack = (index: number) => {
    if (index === digits.length) { result.push(letters.join("")); return; }
    for (const letter of mapping[digits[index]]) {
      letters.push(letter);
      backtrack(index + 1);
      letters.pop();
    }
  };
  backtrack(0);
  return result.sort();
}
