import re

def count_dependents_on_paste(input_text):
    line_re = re.compile(r"^(\w+) requires (.+)\.$")
    ing_re = re.compile(r"(\d+) (\w+)")
    children = {}
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        m = line_re.match(line)
        if not m:
            continue
        result = m.group(1)
        body = m.group(2)
        if body == "nothing":
            children[result] = []
        else:
            children[result] = [name for _, name in ing_re.findall(body)]
    parents = {}
    for parent, kids in children.items():
        for kid in kids:
            parents.setdefault(kid, []).append(parent)
    visited = set()
    stack = list(parents.get("binding_paste", []))
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        stack.extend(parents.get(node, []))
    return len(visited)
