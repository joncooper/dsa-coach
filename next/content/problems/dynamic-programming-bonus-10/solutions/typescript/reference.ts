export function longestPalindromeLength(text: string): number {
  let best = 0;
  const expand = (leftStart: number, rightStart: number) => {
    let left = leftStart;
    let right = rightStart;
    while (left >= 0 && right < text.length && text[left] === text[right]) { left -= 1; right += 1; }
    best = Math.max(best, right - left - 1);
  };
  for (let center = 0; center < text.length; center += 1) { expand(center, center); expand(center, center + 1); }
  return best;
}
