export function minStackOps(ops: Array<[string, number?]>): number[] {
  const stack: number[] = [];
  const mins: number[] = [];
  const answers: number[] = [];
  for (const op of ops) {
    if (op[0] === "push") {
      const value = op[1] ?? 0;
      stack.push(value);
      mins.push(mins.length === 0 ? value : Math.min(value, mins[mins.length - 1]));
    } else if (op[0] === "pop") {
      if (stack.length > 0) {
        stack.pop();
        mins.pop();
      }
    } else if (op[0] === "min" && mins.length > 0) {
      answers.push(mins[mins.length - 1]);
    }
  }
  return answers;
}
