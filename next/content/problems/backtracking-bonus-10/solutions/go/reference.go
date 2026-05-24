package solution

func CountSignAssignments(nums []int, target int) int {
	count := 0
	var backtrack func(int, int)
	backtrack = func(index int, running int) {
		if index == len(nums) { if running == target { count++ }; return }
		backtrack(index+1, running+nums[index])
		backtrack(index+1, running-nums[index])
	}
	backtrack(0, 0)
	return count
}
