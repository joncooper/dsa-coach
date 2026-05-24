import re

def count_containers_holding_gold(input_text):
    contains = {}
    line_re = re.compile(r"^(\w+ \w+) containers hold (.+)\.$")
    child_re = re.compile(r"(\d+) (\w+ \w+) containers?")
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        match = line_re.match(line)
        if not match:
            continue
        parent = match.group(1)
        body = match.group(2)
        children = []
        if body != "no other containers":
            for count_str, name in child_re.findall(body):
                children.append((int(count_str), name))
        contains[parent] = children
    parents = {}
    for parent, children in contains.items():
        for _, child in children:
            parents.setdefault(child, []).append(parent)
    visited = set()
    stack = list(parents.get("bright gold", []))
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        stack.extend(parents.get(node, []))
    return len(visited)
