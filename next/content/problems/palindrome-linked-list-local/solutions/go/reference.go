package solution

type ListNode struct {
	Value int
	Next  *ListNode
}

func buildList(values []int) *ListNode {
	dummy := &ListNode{}
	tail := dummy
	for _, value := range values {
		tail.Next = &ListNode{Value: value}
		tail = tail.Next
	}
	return dummy.Next
}

func listToSlice(head *ListNode) []int {
	result := []int{}
	for node := head; node != nil; node = node.Next {
		result = append(result, node.Value)
	}
	return result
}

func reverseNodes(head *ListNode) *ListNode {
	var previous *ListNode
	node := head
	for node != nil {
		next := node.Next
		node.Next = previous
		previous = node
		node = next
	}
	return previous
}

func PalindromeLinkedListLocal(values []int) bool {
	head := buildList(values)
	slow := head
	fast := head

	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	if fast != nil {
		slow = slow.Next
	}

	right := reverseNodes(slow)
	left := head
	for right != nil {
		if left == nil || left.Value != right.Value {
			return false
		}
		left = left.Next
		right = right.Next
	}
	return true
}
