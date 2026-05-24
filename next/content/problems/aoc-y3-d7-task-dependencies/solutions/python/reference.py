def longest_chain(input_text):
    children = {}
    all_nodes = set()
    for line in input_text.split("\n"):
        line = line.strip()
        if not line.endswith("."):
            continue
        body = line[:-1]
        if " before " not in body:
            continue
        head, tail = body.split(" before ", 1)
        head = head.strip()
        all_nodes.add(head)
        if tail.strip() == "nothing":
            children.setdefault(head, [])
            continue
        kids = [token.strip() for token in tail.split(",") if token.strip()]
        children.setdefault(head, []).extend(kids)
        for kid in kids:
            all_nodes.add(kid)
            children.setdefault(kid, [])
    if not all_nodes:
        return 0
    memo = {}
    def depth(node):
        if node in memo:
            return memo[node]
        kids = children.get(node, [])
        if not kids:
            memo[node] = 1
            return 1
        best = 0
        for kid in kids:
            d = depth(kid)
            if d > best:
                best = d
        memo[node] = 1 + best
        return memo[node]
    return max(depth(node) for node in all_nodes)
