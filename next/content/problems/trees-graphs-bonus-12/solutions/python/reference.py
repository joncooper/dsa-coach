def has_cycle(graph: dict[str, list[str]]) -> bool:
    visiting = set()
    visited = set()
    def dfs(node):
        if node in visiting:
            return True
        if node in visited:
            return False
        visiting.add(node)
        for neighbor in graph.get(node, []):
            if dfs(neighbor):
                return True
        visiting.remove(node)
        visited.add(node)
        return False
    for node in graph:
        if dfs(node):
            return True
    return False
