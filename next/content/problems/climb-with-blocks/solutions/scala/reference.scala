object Solution {
  def climbWithBlocks(n: Int, blocks: Seq[Int]): Int = {
    val dp = Array.fill(n + 1)(0)
    dp(0) = 1
    for (stair <- 1 to n; block <- blocks) if (stair >= block) dp(stair) += dp(stair - block)
    dp(n)
  }
}
