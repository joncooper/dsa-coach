object Solution {
  def countSignAssignments(nums: Seq[Int], target: Int): Int = {
    var count = 0
    def backtrack(index: Int, running: Int): Unit = {
      if (index == nums.length) { if (running == target) count += 1; return }
      backtrack(index + 1, running + nums(index))
      backtrack(index + 1, running - nums(index))
    }
    backtrack(0, 0)
    count
  }
}
