export function parenScore(text: string): number {
  const stack: number[] = [0];
  for (const char of text) {
    if (char === "(") stack.push(0);
    else {
      const inside = stack.pop()!;
      stack[stack.length - 1] += Math.max(1, inside * 2);
    }
  }
  return stack[0];
}
