def schedule_finish(input_text):
    children = {}
    nodes = set()
    for line in input_text.split("\n"):
        line = line.strip()
        if not line.endswith(".") or " before " not in line:
            continue
        head, tail = line[:-1].split(" before ", 1)
        head = head.strip()
        nodes.add(head)
        if tail.strip() == "nothing":
            children.setdefault(head, [])
            continue
        kids = [token.strip() for token in tail.split(",") if token.strip()]
        children.setdefault(head, []).extend(kids)
        for kid in kids:
            nodes.add(kid)
            children.setdefault(kid, [])
    if not nodes:
        return 0
    parents = {node: set() for node in nodes}
    for parent, kids in children.items():
        for kid in kids:
            parents[kid].add(parent)
    start = {}
    def resolve(node):
        if node in start:
            return start[node]
        if not parents[node]:
            start[node] = 0
            return 0
        best = max(resolve(parent) for parent in parents[node])
        start[node] = best + 1
        return start[node]
    return max(resolve(node) for node in nodes) + 1
