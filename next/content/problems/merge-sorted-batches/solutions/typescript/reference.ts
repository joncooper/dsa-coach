export function mergeSortedBatches(batches: number[][]): number[] {
  return batches.flat().sort((a, b) => a - b);
}
