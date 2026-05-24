def tree_max_depth_local(values: list[object]) -> int:
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
    def depth(node):
        if node is None:
            return 0
        return 1 + max(depth(node.left), depth(node.right))
    return depth(root)
