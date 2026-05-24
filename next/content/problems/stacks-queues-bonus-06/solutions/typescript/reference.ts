export function validateStackSequence(pushed: number[], popped: number[]): boolean {
  const stack: number[] = [];
  let popIndex = 0;
  for (const value of pushed) {
    stack.push(value);
    while (stack.length > 0 && popIndex < popped.length && stack[stack.length - 1] === popped[popIndex]) {
      stack.pop();
      popIndex += 1;
    }
  }
  return popIndex === popped.length;
}
