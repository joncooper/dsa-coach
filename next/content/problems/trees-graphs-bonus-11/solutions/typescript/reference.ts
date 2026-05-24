export function countReachable(graph: Record<string, string[]>, source: string): number {
  const seen = new Set<string>([source]);
  const queue = [source];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    for (const neighbor of graph[node] ?? []) {
      if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }
    }
  }
  return seen.size;
}
