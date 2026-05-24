export function buildOrder(dependencies: Record<string, string[]>): string[] | null {
  const tasks: string[] = [];
  const seenTasks = new Set<string>();
  const addTask = (task: string) => { if (!seenTasks.has(task)) { seenTasks.add(task); tasks.push(task); } };
  for (const [task, prereqs] of Object.entries(dependencies)) {
    addTask(task);
    for (const prereq of prereqs) addTask(prereq);
  }
  const graph = new Map<string, string[]>(tasks.map((task) => [task, []]));
  const indegree = new Map<string, number>(tasks.map((task) => [task, 0]));
  for (const [task, prereqs] of Object.entries(dependencies)) {
    for (const prereq of prereqs) {
      graph.get(prereq)!.push(task);
      indegree.set(task, (indegree.get(task) ?? 0) + 1);
    }
  }
  const queue = tasks.filter((task) => indegree.get(task) === 0);
  const order: string[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    const task = queue[index];
    order.push(task);
    for (const nextTask of graph.get(task) ?? []) {
      indegree.set(nextTask, indegree.get(nextTask)! - 1);
      if (indegree.get(nextTask) === 0) queue.push(nextTask);
    }
  }
  return order.length === tasks.length ? order : null;
}
