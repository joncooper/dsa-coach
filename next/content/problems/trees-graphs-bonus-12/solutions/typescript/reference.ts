export function hasCycle(graph: Record<string, string[]>): boolean {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(node: string): boolean {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const neighbor of graph[node] ?? []) if (dfs(neighbor)) return true;
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  for (const node of Object.keys(graph)) if (dfs(node)) return true;
  return false;
}
