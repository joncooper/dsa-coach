def tree_minimum(values: list[object]) -> int | None:
    class Node:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None
    def build_tree(items):
        if not items or items[0] is None:
            return None
        root = Node(items[0])
        queue = [root]
        index = 1
        while index < len(items) and queue:
            node = queue.pop(0)
            left = items[index]
            index += 1
            if left is not None:
                node.left = Node(left)
                queue.append(node.left)
            if index < len(items):
                right = items[index]
                index += 1
                if right is not None:
                    node.right = Node(right)
                    queue.append(node.right)
        return root
    root = build_tree(values)
    if root is None:
        return None
    best = root.value
    stack = [root]
    while stack:
        node = stack.pop()
        best = min(best, node.value)
        if node.left is not None:
            stack.append(node.left)
        if node.right is not None:
            stack.append(node.right)
    return best
