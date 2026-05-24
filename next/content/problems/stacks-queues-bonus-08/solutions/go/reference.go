package solution

func AsteroidCollision(asteroids []int) []int {
	stack := []int{}
	for _, asteroid := range asteroids {
		active := asteroid
		alive := true
		for alive && active < 0 && len(stack) > 0 && stack[len(stack)-1] > 0 {
			top := stack[len(stack)-1]
			if top < -active {
				stack = stack[:len(stack)-1]
			} else if top == -active {
				stack = stack[:len(stack)-1]
				alive = false
			} else {
				alive = false
			}
		}
		if alive {
			stack = append(stack, active)
		}
	}
	return stack
}
