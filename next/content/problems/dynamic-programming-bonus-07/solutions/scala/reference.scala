object Solution {
  def editDistance(source: String, target: String): Int = {
    val dp = Array.fill(source.length + 1, target.length + 1)(0)
    for (i <- 0 to source.length) dp(i)(0) = i
    for (j <- 0 to target.length) dp(0)(j) = j
    for (i <- 1 to source.length; j <- 1 to target.length) dp(i)(j) = if (source(i - 1) == target(j - 1)) dp(i - 1)(j - 1) else 1 + Seq(dp(i - 1)(j), dp(i)(j - 1), dp(i - 1)(j - 1)).min
    dp(source.length)(target.length)
  }
}
