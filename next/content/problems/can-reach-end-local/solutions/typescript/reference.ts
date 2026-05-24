export function canReachEndLocal(jumps: number[]): boolean {
  let farthest = 0;
  for (let index = 0; index < jumps.length; index += 1) {
    if (index > farthest) return false;
    farthest = Math.max(farthest, index + jumps[index]);
  }
  return true;
}
