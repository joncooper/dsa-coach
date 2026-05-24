def tree_has_path_sum_local(values: list[object], target: int) -> bool:
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
    def has_path(node, remaining):
        if node is None:
            return False
        next_remaining = remaining - node.value
        if node.left is None and node.right is None:
            return next_remaining == 0
        return has_path(node.left, next_remaining) or has_path(node.right, next_remaining)
    return has_path(root, target)
