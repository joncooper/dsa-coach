export function productExceptSelfLocal(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(1);
  let prefix = 1;
  for (let index = 0; index < nums.length; index += 1) {
    result[index] = prefix;
    prefix *= nums[index];
  }
  let suffix = 1;
  for (let index = nums.length - 1; index >= 0; index -= 1) {
    result[index] *= suffix;
    suffix *= nums[index];
  }
  return result;
}
