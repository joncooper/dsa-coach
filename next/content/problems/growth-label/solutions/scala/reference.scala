object Solution {
  def growthLabel(operations: Seq[Int]): String = {
    if (operations.length < 2) return "unknown"
    var total = 0.0
    for (index <- 0 until operations.length - 1) { if (operations(index) == 0) return "unknown"; total += operations(index + 1).toDouble / operations(index).toDouble }
    val average = total / (operations.length - 1)
    if (average >= 0.75 && average <= 1.35) "constant"
    else if (average >= 1.55 && average <= 2.45) "linear"
    else if (average >= 3.1 && average <= 5.0) "quadratic"
    else "unknown"
  }
}
