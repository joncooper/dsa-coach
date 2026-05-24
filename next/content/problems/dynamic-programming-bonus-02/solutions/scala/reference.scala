object Solution {
  def countBinaryStrings(n: Int): Int = {
    var endZero = 1; var endOne = 0
    for (_ <- 0 until n) { val nextZero = endZero + endOne; val nextOne = endZero; endZero = nextZero; endOne = nextOne }
    endZero + endOne
  }
}
