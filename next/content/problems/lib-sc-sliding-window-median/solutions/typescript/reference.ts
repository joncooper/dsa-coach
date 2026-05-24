export function slidingWindowMedian(nums: number[], k: number): number[] {
  if (nums.length === 0 || k <= 0 || k > nums.length) return [];
  const window = [...nums.slice(0, k)].sort((a, b) => a - b);
  const out: number[] = [];
  for (let index = 0; index <= nums.length - k; index += 1) {
    out.push(k % 2 === 1 ? window[Math.floor(k / 2)] : (window[k / 2 - 1] + window[k / 2]) / 2);
    if (index + k < nums.length) {
      removeOne(window, nums[index]);
      insertSorted(window, nums[index + k]);
    }
  }
  return out;
}

function insertSorted(values: number[], value: number) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (values[mid] < value) left = mid + 1;
    else right = mid;
  }
  values.splice(left, 0, value);
}

function removeOne(values: number[], value: number) {
  const index = values.indexOf(value);
  if (index !== -1) values.splice(index, 1);
}
