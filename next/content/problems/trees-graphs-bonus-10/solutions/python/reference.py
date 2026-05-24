def has_route(graph: dict[str, list[str]], source: str, target: str) -> bool:
    if source == target:
        return True
    seen = {source}
    stack = [source]
    while stack:
        node = stack.pop()
        for neighbor in graph.get(node, []):
            if neighbor == target:
                return True
            if neighbor not in seen:
                seen.add(neighbor)
                stack.append(neighbor)
    return False
