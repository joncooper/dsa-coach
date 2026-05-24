import re

def total_inside_gold(input_text):
    line_re = re.compile(r"^(\w+ \w+) containers hold (.+)\.$")
    child_re = re.compile(r"(\d+) (\w+ \w+) containers?")
    contains = {}
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        m = line_re.match(line)
        if not m:
            continue
        parent = m.group(1)
        body = m.group(2)
        if body == "no other containers":
            contains[parent] = []
            continue
        contains[parent] = [(int(c), name) for c, name in child_re.findall(body)]
    memo = {}
    def total(node):
        if node in memo:
            return memo[node]
        result = 0
        for count, child in contains.get(node, []):
            result += count + count * total(child)
        memo[node] = result
        return result
    return total("bright gold")
