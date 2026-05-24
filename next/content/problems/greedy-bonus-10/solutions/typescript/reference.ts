export function largestConcatenation(nums: number[]): string {
  if (nums.length === 0) return "0";
  const pieces = nums.map(String).sort((a, b) => (b + a).localeCompare(a + b));
  const result = pieces.join("");
  return /^0+$/.test(result) ? "0" : result;
}
