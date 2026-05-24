export function countTreeNodes(values: Array<number | null>): number {
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
  if (!root) return 0;
  let count = 0;
  const queue: Node[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    count += 1;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return count;
}
