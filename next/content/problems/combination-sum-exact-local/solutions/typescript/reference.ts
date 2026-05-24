export function combinationSumExactLocal(nums: number[], target: number): number[][] {
  const ordered = [...nums].sort((a, b) => a - b);
  const result: number[][] = [];
  const path: number[] = [];
  const backtrack = (start: number, remaining: number) => {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    let previous: number | undefined;
    for (let index = start; index < ordered.length; index += 1) {
      const value = ordered[index];
      if (previous !== undefined && value === previous) continue;
      if (value > remaining) break;
      path.push(value);
      backtrack(index + 1, remaining - value);
      path.pop();
      previous = value;
    }
  };
  backtrack(0, target);
  return result;
}
