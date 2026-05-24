export function fewestCoins(coins: number[], amount: number): number {
  let remaining = amount;
  let count = 0;
  for (const coin of [...coins].sort((a, b) => b - a)) {
    count += Math.floor(remaining / coin);
    remaining %= coin;
  }
  return count;
}
