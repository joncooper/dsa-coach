export function generateParenthesesLocal(n: number): string[] {
  const result: string[] = [];
  const path: string[] = [];
  const backtrack = (opened: number, closed: number) => {
    if (path.length === 2 * n) {
      result.push(path.join(""));
      return;
    }
    if (opened < n) {
      path.push("(");
      backtrack(opened + 1, closed);
      path.pop();
    }
    if (closed < opened) {
      path.push(")");
      backtrack(opened, closed + 1);
      path.pop();
    }
  };
  backtrack(0, 0);
  return result;
}
