object Solution {
  def recursiveDigitSum(n: Int): Int = {
    if (n < 10) n else (n % 10) + recursiveDigitSum(n / 10)
  }
}
