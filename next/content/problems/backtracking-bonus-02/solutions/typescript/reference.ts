export function letterCaseCombinations(text: string): string[] {
  const result: string[] = [];
  const chars: string[] = [];
  const backtrack = (index: number) => {
    if (index === text.length) { result.push(chars.join("")); return; }
    const ch = text[index];
    if (/^[A-Za-z]$/.test(ch)) {
      chars.push(ch.toLowerCase());
      backtrack(index + 1);
      chars.pop();
      chars.push(ch.toUpperCase());
      backtrack(index + 1);
      chars.pop();
    } else {
      chars.push(ch);
      backtrack(index + 1);
      chars.pop();
    }
  };
  backtrack(0);
  return result.sort();
}
