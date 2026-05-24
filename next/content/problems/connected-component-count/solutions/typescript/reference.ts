export function connectedComponentCount(n: number, edges: number[][]): number {
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [u, v] of edges) {
    if (u === v) continue;
    graph[u].push(v);
    graph[v].push(u);
  }
  const seen = new Set<number>();
  let components = 0;
  for (let node = 0; node < n; node += 1) {
    if (seen.has(node)) continue;
    components += 1;
    const stack = [node];
    seen.add(node);
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const neighbor of graph[current]) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
  }
  return components;
}
