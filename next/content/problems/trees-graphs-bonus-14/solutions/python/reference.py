def build_order(dependencies: dict[str, list[str]]) -> list[str] | None:
    tasks = []
    seen_tasks = set()
    def add_task(task):
        if task not in seen_tasks:
            seen_tasks.add(task)
            tasks.append(task)
    for task, prereqs in dependencies.items():
        add_task(task)
        for prereq in prereqs:
            add_task(prereq)
    graph = {task: [] for task in tasks}
    indegree = {task: 0 for task in tasks}
    for task, prereqs in dependencies.items():
        for prereq in prereqs:
            graph[prereq].append(task)
            indegree[task] += 1
    queue = [task for task in tasks if indegree[task] == 0]
    order = []
    for task in queue:
        order.append(task)
        for next_task in graph[task]:
            indegree[next_task] -= 1
            if indegree[next_task] == 0:
                queue.append(next_task)
    return order if len(order) == len(tasks) else None
