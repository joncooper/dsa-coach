object Solution {
  def halveStepCount(n: Int): Int = {
    var value = n
    var steps = 0
    while (value > 0) {
      value = value / 2
      steps += 1
    }
    steps
  }
}
