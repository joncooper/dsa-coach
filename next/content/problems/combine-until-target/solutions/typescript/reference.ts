export function combineUntilTarget(values: number[], target: number): number {
  const heap = [...values].sort((a, b) => a - b);
  let combines = 0;
  while (heap.length > 0 && heap[0] < target) {
    if (heap.length < 2) return -1;
    const small = heap.shift()!;
    const large = heap.shift()!;
    heap.push(small + 2 * large);
    heap.sort((a, b) => a - b);
    combines += 1;
  }
  return heap.length === 0 ? -1 : combines;
}
