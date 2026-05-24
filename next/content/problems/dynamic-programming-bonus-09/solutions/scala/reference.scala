object Solution {
  def knapsackMaxValue(weights: Seq[Int], values: Seq[Int], capacity: Int): Int = {
    val dp = Array.fill(capacity + 1)(0)
    for (index <- weights.indices) { val weight = weights(index); val value = values(index); for (cap <- capacity to weight by -1) dp(cap) = math.max(dp(cap), dp(cap - weight) + value) }
    dp(capacity)
  }
}
