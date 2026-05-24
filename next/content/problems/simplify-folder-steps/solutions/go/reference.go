package solution

func SimplifyFolderSteps(steps []string) string {
	stack := []string{}
	for _, step := range steps {
		if step == "." || step == "" {
			continue
		}
		if step == ".." {
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}
		} else {
			stack = append(stack, step)
		}
	}
	path := "/"
	for index, step := range stack {
		if index > 0 {
			path += "/"
		}
		path += step
	}
	return path
}
