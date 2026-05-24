object Solution {
  def nthFibonacci(n: Int): Int = {
    var previous = 0
    var current = 1
    for (_ <- 0 until n) {
      val next = previous + current
      previous = current
      current = next
    }
    previous
  }
}
