object Solution {
  def countDecodings(text: String): Int = {
    if (text.isEmpty || text.head == '0') return 0
    val dp = Array.fill(text.length + 1)(0)
    dp(0) = 1; dp(1) = 1
    for (index <- 2 to text.length) { val one = text.substring(index - 1, index).toInt; val two = text.substring(index - 2, index).toInt; if (one >= 1) dp(index) += dp(index - 1); if (two >= 10 && two <= 26) dp(index) += dp(index - 2) }
    dp(text.length)
  }
}
