class BinaryHeap<T> {
  private values: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.values.length;
  }

  peek(): T | undefined {
    return this.values[0];
  }

  push(value: T): void {
    this.values.push(value);
    this.bubbleUp(this.values.length - 1);
  }

  pop(): T | undefined {
    if (this.values.length === 0) return undefined;
    const top = this.values[0];
    const last = this.values.pop()!;
    if (this.values.length > 0) {
      this.values[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.values[index], this.values[parent]) >= 0) break;
      [this.values[index], this.values[parent]] = [this.values[parent], this.values[index]];
      index = parent;
    }
  }

  private sinkDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let best = index;
      if (left < this.values.length && this.compare(this.values[left], this.values[best]) < 0) best = left;
      if (right < this.values.length && this.compare(this.values[right], this.values[best]) < 0) best = right;
      if (best === index) break;
      [this.values[index], this.values[best]] = [this.values[best], this.values[index]];
      index = best;
    }
  }
}

type RowEntry = { strength: number; index: number };

export function kWeakestRows(grid: number[][], k: number): number[] {
  const heap = new BinaryHeap<RowEntry>((a, b) => a.strength - b.strength || a.index - b.index);
  for (let index = 0; index < grid.length; index += 1) {
    const strength = grid[index].reduce((sum, value) => sum + value, 0);
    heap.push({ strength, index });
  }

  const result: number[] = [];
  const limit = Math.min(k, grid.length);
  for (let count = 0; count < limit; count += 1) result.push(heap.pop()!.index);
  return result;
}
