object Solution {
  def longestBalancedPrefix(text: String): Int = {
    var balance = 0
    var best = 0
    for (index <- text.indices) {
      balance += (if (text.charAt(index) == 'A') 1 else -1)
      if (balance == 0) best = index + 1
    }
    best
  }
}
