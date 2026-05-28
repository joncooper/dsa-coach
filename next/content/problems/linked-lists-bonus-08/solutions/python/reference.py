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

def remove_nth_from_end(values: list[int], n: int) -> list[int]:
    head = build_list(values)
    dummy = ListNode(0, head)
    fast = dummy
    slow = dummy

    for _ in range(n):
        if fast is None:
            return list_to_array(head)
        fast = fast.next
    if fast is None:
        return list_to_array(head)

    while fast.next is not None:
        fast = fast.next
        slow = slow.next

    if slow.next is not None:
        slow.next = slow.next.next
    return list_to_array(dummy.next)
