export function reverseQueue(items: unknown[]): unknown[] {
  const stack = [...items];
  const result: unknown[] = [];
  while (stack.length > 0) result.push(stack.pop());
  return result;
}
