object Solution {
  def collatzSteps(n: Int): Int = {
    var value = n
    var steps = 0
    while (value != 1) {
      value = if (value % 2 == 0) value / 2 else value * 3 + 1
      steps += 1
    }
    steps
  }
}
