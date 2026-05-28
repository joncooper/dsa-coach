class ListNode:
    def __init__(self, value: int, next: "ListNode | None" = None):
        self.value = value
        self.next = next

def build_list(values: list[int]) -> ListNode | None:
    dummy = ListNode(0)
    tail = dummy
    for value in values:
        tail.next = ListNode(value)
        tail = tail.next
    return dummy.next

def list_to_array(head: ListNode | None) -> list[int]:
    result = []
    node = head
    while node is not None:
        result.append(node.value)
        node = node.next
    return result

def reverse_nodes(head: ListNode | None) -> ListNode | None:
    previous = None
    node = head
    while node is not None:
        next_node = node.next
        node.next = previous
        previous = node
        node = next_node
    return previous

def max_list_value(values: list[int]) -> int | None:
    head = build_list(values)
    if head is None:
        return None

    best = head.value
    node = head.next
    while node is not None:
        best = max(best, node.value)
        node = node.next
    return best
