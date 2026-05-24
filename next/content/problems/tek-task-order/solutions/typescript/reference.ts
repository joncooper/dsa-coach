export function taskOrder(deps: Record<string, string[]>): string[] | null {
  const adj = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  const ensure = (task: string) => { if (!adj.has(task)) adj.set(task, []); if (!indegree.has(task)) indegree.set(task, 0); };
  for (const [task, prereqs] of Object.entries(deps)) {
    ensure(task);
    for (const prereq of prereqs) { ensure(prereq); adj.get(prereq)!.push(task); indegree.set(task, (indegree.get(task) ?? 0) + 1); }
  }
  const ready = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([task]) => task).sort();
  const order: string[] = [];
  while (ready.length > 0) {
    const task = ready.shift()!;
    order.push(task);
    for (const next of adj.get(task) ?? []) {
      const degree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, degree);
      if (degree === 0) { ready.push(next); ready.sort(); }
    }
  }
  return order.length === indegree.size ? order : null;
}
