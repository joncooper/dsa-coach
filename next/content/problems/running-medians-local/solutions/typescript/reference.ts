export function runningMediansLocal(nums: number[]): number[] {
  const seen: number[] = [];
  const medians: number[] = [];
  for (const num of nums) {
    let index = 0;
    while (index < seen.length && seen[index] < num) index += 1;
    seen.splice(index, 0, num);
    const middle = Math.floor(seen.length / 2);
    if (seen.length % 2 === 1) medians.push(seen[middle]);
    else medians.push((seen[middle - 1] + seen[middle]) / 2);
  }
  return medians;
}
