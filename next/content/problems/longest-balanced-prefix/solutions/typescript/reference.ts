export function longestBalancedPrefix(text: string): number {
  let balance = 0;
  let best = 0;
  for (let index = 0; index < text.length; index += 1) {
    balance += text[index] === "A" ? 1 : -1;
    if (balance === 0) best = index + 1;
  }
  return best;
}
