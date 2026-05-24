export function palindromeLinkedListLocal(values: number[]): boolean {
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    if (values[left] !== values[right]) return false;
    left += 1;
    right -= 1;
  }
  return true;
}
