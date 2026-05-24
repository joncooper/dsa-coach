export function subsetsOfSize(nums: number[], k: number): number[][] {
  const result: number[][] = [];
  const chosen: number[] = [];
  const backtrack = (start: number) => {
    if (chosen.length === k) {
      result.push([...chosen]);
      return;
    }
    for (let index = start; index < nums.length; index += 1) {
      chosen.push(nums[index]);
      backtrack(index + 1);
      chosen.pop();
    }
  };
  if (k >= 0 && k <= nums.length) backtrack(0);
  result.sort(compareNumberArrays);
  return result;
}

function compareNumberArrays(left: number[], right: number[]): number {
  const limit = Math.min(left.length, right.length);
  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}
