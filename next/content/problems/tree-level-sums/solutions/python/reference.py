def tree_level_sums(values: list[object]) -> list[int]:
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
        return []
    queue = [root]
    sums = []
    while queue:
        total = 0
        next_level = []
        for node in queue:
            total += node.value
            if node.left is not None:
                next_level.append(node.left)
            if node.right is not None:
                next_level.append(node.right)
        sums.append(total)
        queue = next_level
    return sums
