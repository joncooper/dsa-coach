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

type PairEntry = { sum: number; i: number; j: number };

export function kthSmallestPairSum(a: number[], b: number[], k: number): number {
  if (a.length === 0 || b.length === 0 || k <= 0) return 0;
  const heap = new BinaryHeap<PairEntry>((left, right) => left.sum - right.sum || left.i - right.i || left.j - right.j);
  for (let j = 0; j < Math.min(b.length, k); j += 1) heap.push({ sum: a[0] + b[j], i: 0, j });

  let current = 0;
  for (let count = 0; count < k && heap.size > 0; count += 1) {
    const entry = heap.pop()!;
    current = entry.sum;
    if (entry.i + 1 < a.length) heap.push({ sum: a[entry.i + 1] + b[entry.j], i: entry.i + 1, j: entry.j });
  }
  return current;
}
