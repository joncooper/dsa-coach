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

func MergeTwoLinkedLists(a []int, b []int) []int {
	left := buildList(a)
	right := buildList(b)
	_, _ = left, right
	panic("TODO")
}
