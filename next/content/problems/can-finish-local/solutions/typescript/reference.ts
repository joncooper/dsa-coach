export function canFinishLocal(n: number, prerequisites: number[][]): boolean {
  const graph = Array.from({ length: n }, () => [] as number[]);
  const indegree = new Array<number>(n).fill(0);
  for (const [course, before] of prerequisites) {
    graph[before].push(course);
    indegree[course] += 1;
  }
  const queue: number[] = [];
  for (let course = 0; course < n; course += 1) if (indegree[course] === 0) queue.push(course);
  let seen = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const course = queue[index];
    seen += 1;
    for (const nextCourse of graph[course]) {
      indegree[nextCourse] -= 1;
      if (indegree[nextCourse] === 0) queue.push(nextCourse);
    }
  }
  return seen === n;
}
