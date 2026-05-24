export function maxProfitWithCooldown(prices: number[]): number {
  if (prices.length === 0) return 0;
  let hold = -prices[0];
  let sold = 0;
  let rest = 0;
  for (let index = 1; index < prices.length; index += 1) {
    const previousSold = sold;
    sold = hold + prices[index];
    hold = Math.max(hold, rest - prices[index]);
    rest = Math.max(rest, previousSold);
  }
  return Math.max(sold, rest);
}
