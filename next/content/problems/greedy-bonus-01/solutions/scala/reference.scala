object Solution {
  def fewestCoins(coins: Seq[Int], amount: Int): Int = {
    var remaining = amount
    var count = 0
    for (coin <- coins.sorted(Ordering.Int.reverse)) { count += remaining / coin; remaining = remaining % coin }
    count
  }
}
