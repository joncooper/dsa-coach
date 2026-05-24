object Solution {
  def maxProfitWithCooldown(prices: Seq[Int]): Int = {
    if (prices.isEmpty) return 0
    var hold = -prices.head; var sold = 0; var rest = 0
    for (price <- prices.tail) { val previousSold = sold; sold = hold + price; hold = math.max(hold, rest - price); rest = math.max(rest, previousSold) }
    math.max(sold, rest)
  }
}
