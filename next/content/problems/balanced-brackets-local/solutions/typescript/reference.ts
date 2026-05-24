export function balancedBracketsLocal(text: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const openers = new Set(Object.values(pairs));
  const stack: string[] = [];
  for (const char of text) {
    if (openers.has(char)) stack.push(char);
    else if (char in pairs) {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}
