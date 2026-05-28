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

func RemoveNthFromEnd(values []int, n int) []int {
	head := buildList(values)
	dummy := &ListNode{Next: head}
	fast := dummy
	slow := dummy

	for step := 0; step < n && fast != nil; step++ {
		fast = fast.Next
	}
	if fast == nil {
		return listToSlice(head)
	}

	for fast.Next != nil {
		fast = fast.Next
		slow = slow.Next
	}

	if slow.Next != nil {
		slow.Next = slow.Next.Next
	}
	return listToSlice(dummy.Next)
}
