export function hasRoute(graph: Record<string, string[]>, source: string, target: string): boolean {
  if (source === target) return true;
  const seen = new Set<string>([source]);
  const stack = [source];
  while (stack.length > 0) {
    const node = stack.pop()!;
    for (const neighbor of graph[node] ?? []) {
      if (neighbor === target) return true;
      if (!seen.has(neighbor)) { seen.add(neighbor); stack.push(neighbor); }
    }
  }
  return false;
}
