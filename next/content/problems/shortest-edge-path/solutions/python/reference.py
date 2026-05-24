def shortest_edge_path(n: int, edges: list[list[int]], start: int, goal: int) -> int:
    if start == goal:
        return 0
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    queue = [(start, 0)]
    seen = {start}
    for node, distance in queue:
        for neighbor in graph[node]:
            if neighbor == goal:
                return distance + 1
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append((neighbor, distance + 1))
    return -1
