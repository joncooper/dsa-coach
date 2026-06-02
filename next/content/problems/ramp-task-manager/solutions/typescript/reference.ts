type Task = {
  id: string;
  name: string;
  priority: number;
  order: number;
};

type User = {
  id: string;
  quota: number;
};

type Assignment = {
  taskId: string;
  userId: string;
  start: number;
  finish: number;
  completedAt: number | null;
};

export function taskManager(operations: string[][]): string[] {
  const tasks = new Map<string, Task>();
  const users = new Map<string, User>();
  const assignments: Assignment[] = [];
  const out: string[] = [];

  for (const op of operations) {
    const kind = op[0];
    const timestamp = Number(op[1]);

    if (kind === "ADD") {
      const id = `task_${tasks.size + 1}`;
      tasks.set(id, { id, name: op[2], priority: Number(op[3]), order: tasks.size });
      out.push(id);
    } else if (kind === "UPDATE") {
      const task = tasks.get(op[2]);
      if (!task) out.push("false");
      else {
        task.name = op[3];
        task.priority = Number(op[4]);
        out.push("true");
      }
    } else if (kind === "GET") {
      const task = tasks.get(op[2]);
      out.push(task ? `${task.name}|${task.priority}` : "");
    } else if (kind === "SEARCH") {
      const limit = Math.max(0, Number(op[3]));
      const matches = [...tasks.values()].filter((task) => task.name.includes(op[2]));
      out.push(joinTaskIds(sortTasks(matches).slice(0, limit)));
    } else if (kind === "ADD_USER") {
      const userId = op[2];
      if (users.has(userId)) out.push("false");
      else {
        users.set(userId, { id: userId, quota: Number(op[3]) });
        out.push("true");
      }
    } else if (kind === "ASSIGN") {
      const taskId = op[2];
      const userId = op[3];
      const finish = Number(op[4]);
      const user = users.get(userId);
      if (!tasks.has(taskId) || !user || finish <= timestamp) {
        out.push("false");
        continue;
      }
      const activeCount = assignments.filter((assignment) => assignment.userId === userId && isActive(assignment, timestamp)).length;
      if (activeCount >= user.quota) out.push("false");
      else {
        assignments.push({ taskId, userId, start: timestamp, finish, completedAt: null });
        out.push("true");
      }
    } else if (kind === "COMPLETE") {
      const assignment = assignments.find((item) => item.taskId === op[2] && item.userId === op[3] && isActive(item, timestamp));
      if (!assignment) out.push("false");
      else {
        assignment.completedAt = timestamp;
        out.push("true");
      }
    } else if (kind === "USER_TASKS") {
      const userId = op[2];
      const activeTasks = assignments
        .filter((assignment) => assignment.userId === userId && isActive(assignment, timestamp))
        .map((assignment) => tasks.get(assignment.taskId))
        .filter((task): task is Task => Boolean(task));
      out.push(joinTaskIds(sortTasks(activeTasks)));
    } else if (kind === "OVERDUE") {
      const userId = op[2];
      out.push(assignments
        .filter((assignment) => assignment.userId === userId && assignment.completedAt === null && assignment.finish <= timestamp)
        .map((assignment) => assignment.taskId)
        .join(","));
    } else {
      out.push("");
    }
  }

  return out;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priority - a.priority || a.order - b.order);
}

function joinTaskIds(tasks: Task[]): string {
  return tasks.map((task) => task.id).join(",");
}

function isActive(assignment: Assignment, timestamp: number): boolean {
  return assignment.start <= timestamp && timestamp < assignment.finish && assignment.completedAt === null;
}
