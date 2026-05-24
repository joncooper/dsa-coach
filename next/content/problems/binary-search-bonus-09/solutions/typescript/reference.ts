export function cubeRootFloor(n: number): number {
  let left = 0;
  let right = n;
  let answer = 0;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (mid * mid * mid <= n) { answer = mid; left = mid + 1; }
    else right = mid - 1;
  }
  return answer;
}
