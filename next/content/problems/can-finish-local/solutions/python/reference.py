def can_finish_local(n: int, prerequisites: list[list[int]]) -> bool:
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for course, before in prerequisites:
        graph[before].append(course)
        indegree[course] += 1
    queue = [course for course in range(n) if indegree[course] == 0]
    seen = 0
    for course in queue:
        seen += 1
        for next_course in graph[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)
    return seen == n
