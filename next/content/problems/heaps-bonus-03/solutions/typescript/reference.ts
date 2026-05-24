export function lastStoneWeight(stones: number[]): number {
  const heap = [...stones].sort((a, b) => a - b);
  while (heap.length > 1) {
    const y = heap.pop()!;
    const x = heap.pop()!;
    if (x !== y) heap.push(y - x);
    heap.sort((a, b) => a - b);
  }
  return heap[0] ?? 0;
}
