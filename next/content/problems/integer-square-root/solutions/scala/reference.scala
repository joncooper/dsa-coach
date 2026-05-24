object Solution {
  def integerSquareRoot(n: Int): Int = {
    var left = 0; var right = n; var answer = 0
    while (left <= right) { val mid = left + (right - left) / 2; if (mid.toLong * mid.toLong <= n.toLong) { answer = mid; left = mid + 1 } else right = mid - 1 }
    answer
  }
}
