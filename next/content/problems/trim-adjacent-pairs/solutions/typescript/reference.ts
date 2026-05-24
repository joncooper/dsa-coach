export function trimAdjacentPairs(text: string): string {
  const stack: string[] = [];
  for (const char of text) {
    if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
    else stack.push(char);
  }
  return stack.join("");
}
