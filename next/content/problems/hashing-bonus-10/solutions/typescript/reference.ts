export function longestBalancedPrefix(bits: number[]): number {
  const firstSeen = new Map<number, number>([[0, -1]]);
  let balance = 0;
  let best = 0;
  for (let index = 0; index < bits.length; index += 1) {
    balance += bits[index] === 1 ? 1 : -1;
    if (firstSeen.has(balance)) {
      best = Math.max(best, index - firstSeen.get(balance)!);
    } else {
      firstSeen.set(balance, index);
    }
  }
  return best;
}
