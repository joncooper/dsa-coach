export function windowAverages(nums: number[], k: number): number[] {
  if (k <= 0 || k > nums.length) return [];
  let total = 0;
  for (let index = 0; index < k; index += 1) total += nums[index];
  const result = [total / k];
  for (let right = k; right < nums.length; right += 1) {
    total += nums[right] - nums[right - k];
    result.push(total / k);
  }
  return result;
}
