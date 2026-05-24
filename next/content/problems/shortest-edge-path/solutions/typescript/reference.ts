export function shortestEdgePath(n: number, edges: number[][], start: number, goal: number): number {
  if (start === goal) return 0;
  const graph = Array.from({ length: n }, () => [] as number[]);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  const queue: Array<[number, number]> = [[start, 0]];
  const seen = new Set<number>([start]);
  for (let index = 0; index < queue.length; index += 1) {
    const [node, distance] = queue[index];
    for (const neighbor of graph[node]) {
      if (neighbor === goal) return distance + 1;
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
  }
  return -1;
}
