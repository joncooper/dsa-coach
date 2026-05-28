type ListNode = {
  value: number;
  next: ListNode | null;
};

function buildList(values: number[]): ListNode | null {
  const dummy: ListNode = { value: 0, next: null };
  let tail = dummy;

  for (const value of values) {
    tail.next = { value, next: null };
    tail = tail.next;
  }

  return dummy.next;
}

function listToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  for (let node = head; node !== null; node = node.next) result.push(node.value);
  return result;
}

function reverseNodes(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null;
  let node = head;

  while (node !== null) {
    const next = node.next;
    node.next = previous;
    previous = node;
    node = next;
  }

  return previous;
}

export function insertAfterIndex(values: number[], index: number, value: number): number[] {
  const head = buildList(values);
  throw new Error("TODO: find the indexed node, insert after it, then return listToArray(head)");
}
