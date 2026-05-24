export function mixedReviewScore(results: Array<[number, boolean]>): number {
  let total = 0;
  for (const [difficulty, passed] of results) {
    if (passed) total += difficulty;
  }
  return total;
}
