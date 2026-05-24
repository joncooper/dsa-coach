export function subsetsLexicographic(nums: number[]): number[][] {
  const ordered = [...nums].sort((a, b) => a - b);
  const result: number[][] = [];
  const path: number[] = [];
  const backtrack = (start: number) => {
    result.push([...path]);
    for (let index = start; index < ordered.length; index += 1) {
      path.push(ordered[index]);
      backtrack(index + 1);
      path.pop();
    }
  };
  backtrack(0);
  return result;
}
