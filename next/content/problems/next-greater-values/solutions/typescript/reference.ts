export function nextGreaterValues(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    while (stack.length > 0 && nums[index] > nums[stack[stack.length - 1]]) {
      result[stack.pop()!] = nums[index];
    }
    stack.push(index);
  }
  return result;
}
