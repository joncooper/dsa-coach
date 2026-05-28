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

def value_at_index(values: list[int], index: int) -> int | None:
    node = build_list(values)
    position = 0

    while node is not None and position < index:
        node = node.next
        position += 1

    return node.value if position == index and node is not None else None
