export function slidingWindowMax(nums: number[], k: number): number[] {
  const deque: number[] = [];
  const result: number[] = [];
  for (let right = 0; right < nums.length; right += 1) {
    while (deque.length > 0 && deque[0] <= right - k) deque.shift();
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[right]) deque.pop();
    deque.push(right);
    if (right >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}
