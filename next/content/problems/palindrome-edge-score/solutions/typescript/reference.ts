export function palindromeEdgeScore(text: string): number {
  let left = 0;
  let right = text.length - 1;
  let score = 0;
  while (left < right && text[left] === text[right]) {
    score += 1;
    left += 1;
    right -= 1;
  }
  return score;
}
