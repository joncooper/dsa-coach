from dataclasses import dataclass


@dataclass
class Task:
    task_id: str
    name: str
    priority: int
    order: int


@dataclass
class User:
    user_id: str
    quota: int


@dataclass
class Assignment:
    task_id: str
    user_id: str
    start: int
    finish: int
    completed_at: int | None = None


def task_manager(operations: list[list[str]]) -> list[str]:
    tasks: dict[str, Task] = {}
    users: dict[str, User] = {}
    assignments: list[Assignment] = []
    out: list[str] = []

    for op in operations:
        kind = op[0]
        timestamp = int(op[1])

        if kind == "ADD":
            task_id = f"task_{len(tasks) + 1}"
            tasks[task_id] = Task(task_id, op[2], int(op[3]), len(tasks))
            out.append(task_id)
        elif kind == "UPDATE":
            task = tasks.get(op[2])
            if task is None:
                out.append("false")
            else:
                task.name = op[3]
                task.priority = int(op[4])
                out.append("true")
        elif kind == "GET":
            task = tasks.get(op[2])
            out.append("" if task is None else f"{task.name}|{task.priority}")
        elif kind == "SEARCH":
            limit = int(op[3])
            matches = [task for task in tasks.values() if op[2] in task.name]
            out.append(join_task_ids(sorted_tasks(matches)[: max(0, limit)]))
        elif kind == "ADD_USER":
            user_id = op[2]
            if user_id in users:
                out.append("false")
            else:
                users[user_id] = User(user_id, int(op[3]))
                out.append("true")
        elif kind == "ASSIGN":
            task_id, user_id, finish = op[2], op[3], int(op[4])
            if task_id not in tasks or user_id not in users or finish <= timestamp:
                out.append("false")
                continue
            active_count = sum(1 for assignment in assignments if is_active(assignment, timestamp) and assignment.user_id == user_id)
            if active_count >= users[user_id].quota:
                out.append("false")
            else:
                assignments.append(Assignment(task_id, user_id, timestamp, finish))
                out.append("true")
        elif kind == "COMPLETE":
            assignment = find_active_assignment(assignments, op[2], op[3], timestamp)
            if assignment is None:
                out.append("false")
            else:
                assignment.completed_at = timestamp
                out.append("true")
        elif kind == "USER_TASKS":
            user_id = op[2]
            active_tasks = [
                tasks[assignment.task_id]
                for assignment in assignments
                if assignment.user_id == user_id and is_active(assignment, timestamp) and assignment.task_id in tasks
            ]
            out.append(join_task_ids(sorted_tasks(active_tasks)))
        elif kind == "OVERDUE":
            user_id = op[2]
            overdue = [
                assignment.task_id
                for assignment in assignments
                if assignment.user_id == user_id and assignment.completed_at is None and assignment.finish <= timestamp
            ]
            out.append(",".join(overdue))
        else:
            out.append("")

    return out


def sorted_tasks(tasks: list[Task]) -> list[Task]:
    return sorted(tasks, key=lambda task: (-task.priority, task.order))


def join_task_ids(tasks: list[Task]) -> str:
    return ",".join(task.task_id for task in tasks)


def is_active(assignment: Assignment, timestamp: int) -> bool:
    return assignment.start <= timestamp < assignment.finish and assignment.completed_at is None


def find_active_assignment(assignments: list[Assignment], task_id: str, user_id: str, timestamp: int) -> Assignment | None:
    for assignment in assignments:
        if assignment.task_id == task_id and assignment.user_id == user_id and is_active(assignment, timestamp):
            return assignment
    return None
