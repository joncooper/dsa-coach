package solution

func TreeMaxDepthLocal(values []interface{}) int {
	root := buildTree(values)
	var depth func(*Node) int
	depth = func(node *Node) int {
		if node == nil {
			return 0
		}
		left := depth(node.Left)
		right := depth(node.Right)
		if left > right {
			return left + 1
		}
		return right + 1
	}
	return depth(root)
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
