package solution

func GenerateParenthesesLocal(n int) []string {
	result := []string{}
	path := []byte{}
	var backtrack func(int, int)
	backtrack = func(opened int, closed int) {
		if len(path) == 2*n { result = append(result, string(path)); return }
		if opened < n { path = append(path, '('); backtrack(opened+1, closed); path = path[:len(path)-1] }
		if closed < opened { path = append(path, ')'); backtrack(opened, closed+1); path = path[:len(path)-1] }
	}
	backtrack(0, 0)
	return result
}
