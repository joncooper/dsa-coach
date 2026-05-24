export function maxNonAdjacentLocal(nums: number[]): number {
  let skip = 0;
  let take = 0;
  for (const num of nums) {
    const nextTake = skip + num;
    skip = Math.max(skip, take);
    take = nextTake;
  }
  return Math.max(skip, take, 0);
}
