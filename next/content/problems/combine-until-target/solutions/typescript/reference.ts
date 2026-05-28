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

export function combineUntilTarget(values: number[], target: number): number {
  const heap = new BinaryHeap<number>((a, b) => a - b);
  for (const value of values) heap.push(value);

  let combines = 0;
  while (heap.size > 0 && heap.peek()! < target) {
    if (heap.size < 2) return -1;
    const small = heap.pop()!;
    const large = heap.pop()!;
    heap.push(small + 2 * large);
    combines += 1;
  }
  return heap.size === 0 ? -1 : combines;
}
