export function countSignAssignments(nums: number[], target: number): number {
  let count = 0;
  const backtrack = (index: number, running: number) => {
    if (index === nums.length) {
      if (running === target) count += 1;
      return;
    }
    backtrack(index + 1, running + nums[index]);
    backtrack(index + 1, running - nums[index]);
  };
  backtrack(0, 0);
  return count;
}
