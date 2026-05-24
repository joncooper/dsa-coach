export function countDecodings(text: string): number {
  if (text.length === 0 || text[0] === "0") return 0;
  const dp = new Array<number>(text.length + 1).fill(0);
  dp[0] = 1; dp[1] = 1;
  for (let index = 2; index <= text.length; index += 1) {
    const one = Number(text.slice(index - 1, index));
    const two = Number(text.slice(index - 2, index));
    if (one >= 1) dp[index] += dp[index - 1];
    if (two >= 10 && two <= 26) dp[index] += dp[index - 2];
  }
  return dp[text.length];
}
