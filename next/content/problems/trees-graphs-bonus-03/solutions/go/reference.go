package solution

func TreeMinimum(values []interface{}) interface{} {
	root := buildTree(values)
	if root == nil { return nil }
	best := root.Value
	stack := []*Node{root}
	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if node.Value < best { best = node.Value }
		if node.Left != nil { stack = append(stack, node.Left) }
		if node.Right != nil { stack = append(stack, node.Right) }
	}
	return best
}

type Node struct {
	Value int
	Left *Node
	Right *Node
}

func buildTree(values []interface{}) *Node {
	if len(values) == 0 || values[0] == nil {
		return nil
	}
	root := &Node{Value: asInt(values[0])}
	queue := []*Node{root}
	index := 1
	for index < len(values) && len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		left := values[index]
		index++
		if left != nil {
			node.Left = &Node{Value: asInt(left)}
			queue = append(queue, node.Left)
		}
		if index < len(values) {
			right := values[index]
			index++
			if right != nil {
				node.Right = &Node{Value: asInt(right)}
				queue = append(queue, node.Right)
			}
		}
	}
	return root
}

func asInt(value interface{}) int {
	switch typed := value.(type) {
	case int:
		return typed
	case float64:
		return int(typed)
	default:
		return 0
	}
}
