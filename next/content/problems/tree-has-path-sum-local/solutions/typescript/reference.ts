export function treeHasPathSumLocal(values: Array<number | null>, target: number): boolean {
  type Node = { value: number; left: Node | null; right: Node | null };
  function buildTree(items: Array<number | null>): Node | null {
    if (items.length === 0 || items[0] == null) return null;
    const root: Node = { value: items[0], left: null, right: null };
    const queue: Node[] = [root];
    let index = 1;
    while (index < items.length && queue.length > 0) {
      const node = queue.shift()!;
      const left = items[index++];
      if (left != null) {
        node.left = { value: left, left: null, right: null };
        queue.push(node.left);
      }
      if (index < items.length) {
        const right = items[index++];
        if (right != null) {
          node.right = { value: right, left: null, right: null };
          queue.push(node.right);
        }
      }
    }
    return root;
  }
  const root = buildTree(values);
  function hasPath(node: Node | null, remaining: number): boolean {
    if (!node) return false;
    const nextRemaining = remaining - node.value;
    if (!node.left && !node.right) return nextRemaining === 0;
    return hasPath(node.left, nextRemaining) || hasPath(node.right, nextRemaining);
  }
  return hasPath(root, target);
}
