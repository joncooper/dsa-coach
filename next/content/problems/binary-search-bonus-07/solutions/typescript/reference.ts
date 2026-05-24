export function minEatingSpeed(piles: number[], hours: number): number {
  const neededHours = (speed: number) => piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);
  let left = 1;
  let right = Math.max(...piles);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (neededHours(mid) <= hours) right = mid;
    else left = mid + 1;
  }
  return left;
}
