export function isListSorted(values: number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] > values[index]) return false;
  }
  return true;
}
