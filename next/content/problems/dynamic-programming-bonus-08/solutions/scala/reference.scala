object Solution {
  def countChange(coins: Seq[Int], amount: Int): Int = {
    val dp = Array.fill(amount + 1)(0)
    dp(0) = 1
    for (coin <- coins; total <- coin to amount) dp(total) += dp(total - coin)
    dp(amount)
  }
}
