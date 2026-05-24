object Solution {
  def coinChangeMinLocal(coins: Seq[Int], amount: Int): Int = {
    val impossible = amount + 1
    val dp = Array.fill(amount + 1)(impossible)
    dp(0) = 0
    for (total <- 1 to amount; coin <- coins) if (total >= coin) dp(total) = math.min(dp(total), dp(total - coin) + 1)
    if (dp(amount) == impossible) -1 else dp(amount)
  }
}
