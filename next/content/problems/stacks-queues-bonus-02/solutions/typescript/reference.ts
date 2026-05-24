export function movingAverages(nums: number[], window: number): number[] {
  const queue: number[] = [];
  let total = 0;
  const averages: number[] = [];
  for (const num of nums) {
    queue.push(num);
    total += num;
    if (queue.length > window) total -= queue.shift()!;
    averages.push(total / queue.length);
  }
  return averages;
}
