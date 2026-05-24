export function longestWithFlips(bits: number[], k: number): number {
  let left = 0;
  let zeroes = 0;
  let best = 0;
  for (let right = 0; right < bits.length; right += 1) {
    if (bits[right] === 0) zeroes += 1;
    while (zeroes > k) {
      if (bits[left] === 0) zeroes -= 1;
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
