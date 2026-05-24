def task_order(deps: dict[str, list[str]]) -> list[str] | None:
    adj = {}
    indegree = {}
    def ensure(task):
        adj.setdefault(task, [])
        indegree.setdefault(task, 0)
    for task, prereqs in deps.items():
        ensure(task)
        for prereq in prereqs:
            ensure(prereq)
            adj[prereq].append(task)
            indegree[task] += 1
    ready = sorted([task for task in indegree if indegree[task] == 0])
    order = []
    while ready:
        task = ready.pop(0)
        order.append(task)
        for nxt in adj[task]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                ready.append(nxt); ready.sort()
    return order if len(order) == len(indegree) else None
