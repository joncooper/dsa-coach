object Solution {
  def longestCommonSubsequence(a: String, b: String): Int = {
    val dp = Array.fill(a.length + 1, b.length + 1)(0)
    for (i <- 1 to a.length; j <- 1 to b.length) dp(i)(j) = if (a(i - 1) == b(j - 1)) dp(i - 1)(j - 1) + 1 else math.max(dp(i - 1)(j), dp(i)(j - 1))
    dp(a.length)(b.length)
  }
}
