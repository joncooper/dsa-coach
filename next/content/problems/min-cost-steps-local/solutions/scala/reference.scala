object Solution {
  def minCostStepsLocal(costs: Seq[Int]): Int = {
    var before = 0; var current = 0
    for (step <- 2 to costs.length) { val next = math.min(current + costs(step - 1), before + costs(step - 2)); before = current; current = next }
    current
  }
}
