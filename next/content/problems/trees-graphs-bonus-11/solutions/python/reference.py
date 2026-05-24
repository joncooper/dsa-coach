def count_reachable(graph: dict[str, list[str]], source: str) -> int:
    seen = {source}
    queue = [source]
    for node in queue:
        for neighbor in graph.get(node, []):
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    return len(seen)
