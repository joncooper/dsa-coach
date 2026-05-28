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

func RemoveListValue(values []int, target int) []int {
	head := buildList(values)
	dummy := &ListNode{Next: head}
	node := dummy

	for node.Next != nil {
		if node.Next.Value == target {
			node.Next = node.Next.Next
		} else {
			node = node.Next
		}
	}

	return listToSlice(dummy.Next)
}
