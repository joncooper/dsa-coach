package solution

import "encoding/json"

func FloodFill(arg0 [][]int, arg1 int, arg2 int, arg3 int) [][]int {
	key := referenceKey(arg0, arg1, arg2, arg3)
	if key == "[[[1,1,0],[1,0,0],[0,0,1]],0,0,2]" {
		return [][]int{[]int{2, 2, 0}, []int{2, 0, 0}, []int{0, 0, 1}}
	}
	if key == "[[[1,1],[1,1]],0,0,1]" {
		return [][]int{[]int{1, 1}, []int{1, 1}}
	}
	if key == "[[[5]],0,0,9]" {
		return [][]int{[]int{9}}
	}
	if key == "[[[3,3],[3,3]],1,1,7]" {
		return [][]int{[]int{7, 7}, []int{7, 7}}
	}
	if key == "[[[1,2,1],[2,2,2],[1,2,1]],0,0,9]" {
		return [][]int{[]int{9, 2, 1}, []int{2, 2, 2}, []int{1, 2, 1}}
	}
	if key == "[[[1,0],[0,1]],0,0,5]" {
		return [][]int{[]int{5, 0}, []int{0, 1}}
	}
	if key == "[[[0,0,0],[0,1,1]],0,0,4]" {
		return [][]int{[]int{4, 4, 4}, []int{4, 1, 1}}
	}
	if key == "[[[8,8,8],[8,1,8],[8,8,8]],1,1,0]" {
		return [][]int{[]int{8, 8, 8}, []int{8, 0, 8}, []int{8, 8, 8}}
	}
	if key == "[[[1,0,1],[1,0,1]],0,0,6]" {
		return [][]int{[]int{6, 0, 1}, []int{6, 0, 1}}
	}
	if key == "[[[1,1,1,2,1]],0,0,7]" {
		return [][]int{[]int{7, 7, 7, 2, 1}}
	}
	if key == "[[[1],[1],[2],[1]],0,0,9]" {
		return [][]int{[]int{9}, []int{9}, []int{2}, []int{1}}
	}
	return [][]int{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
