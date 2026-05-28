type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export function treeMinimum(values: Array<number | null>): number | null {
  const root = buildTree(values);
  if (root === null) return null;

  throw new Error("TODO: inspect every node because this is not a search tree");
}

function buildTree(values: Array<number | null>): TreeNode | null {
  if (values.length === 0 || values[0] == null) return null;

  const root: TreeNode = { value: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let index = 1;

  while (index < values.length && queue.length > 0) {
    const node = queue.shift()!;
    const left = values[index++];
    if (left != null) {
      node.left = { value: left, left: null, right: null };
      queue.push(node.left);
    }

    if (index < values.length) {
      const right = values[index++];
      if (right != null) {
        node.right = { value: right, left: null, right: null };
        queue.push(node.right);
      }
    }
  }

  return root;
}
