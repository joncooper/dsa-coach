import re

def binding_paste_cost(input_text):
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
            children[result] = [(int(c), name) for c, name in ing_re.findall(body)]
    if "final_product" not in children:
        return 0
    memo = {}
    def cost(node):
        if node == "binding_paste":
            return 1
        if node in memo:
            return memo[node]
        total = 0
        for amount, child in children.get(node, []):
            total += amount * cost(child)
        memo[node] = total
        return total
    return cost("final_product")
