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

func IsListSorted(values []int) bool {
	node := buildList(values)

	for node != nil && node.Next != nil {
		if node.Value > node.Next.Value {
			return false
		}
		node = node.Next
	}

	return true
}
