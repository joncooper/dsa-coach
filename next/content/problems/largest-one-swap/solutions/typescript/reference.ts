export function largestOneSwap(digits: string): string {
  const chars = digits.split("");
  const last = new Array<number>(10).fill(-1);
  for (let index = 0; index < chars.length; index += 1) last[Number(chars[index])] = index;
  for (let index = 0; index < chars.length; index += 1) {
    const current = Number(chars[index]);
    for (let digit = 9; digit > current; digit -= 1) {
      if (last[digit] > index) {
        const swapIndex = last[digit];
        [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
        return chars.join("");
      }
    }
  }
  return digits;
}
