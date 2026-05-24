export function minConnectCost(ropes: number[]): number {
  const heap = [...ropes].sort((a, b) => a - b);
  let cost = 0;
  while (heap.length > 1) {
    const merged = heap.shift()! + heap.shift()!;
    cost += merged;
    heap.push(merged);
    heap.sort((a, b) => a - b);
  }
  return cost;
}
