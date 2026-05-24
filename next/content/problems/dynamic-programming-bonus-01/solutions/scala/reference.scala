object Solution {
  def tribonacci(n: Int): Int = {
    if (n == 0) return 0
    if (n <= 2) return 1
    var a = 0; var b = 1; var c = 1
    for (_ <- 3 to n) { val next = a + b + c; a = b; b = c; c = next }
    c
  }
}
