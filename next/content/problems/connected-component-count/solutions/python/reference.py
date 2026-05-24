def connected_component_count(n: int, edges: list[list[int]]) -> int:
    graph = [[] for _ in range(n)]
    for u, v in edges:
        if u == v:
            continue
        graph[u].append(v)
        graph[v].append(u)
    seen = set()
    components = 0
    for node in range(n):
        if node in seen:
            continue
        components += 1
        stack = [node]
        seen.add(node)
        while stack:
            current = stack.pop()
            for neighbor in graph[current]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)
    return components
