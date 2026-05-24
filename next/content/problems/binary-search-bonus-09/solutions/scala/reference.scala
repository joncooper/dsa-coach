object Solution {
  def cubeRootFloor(n: Int): Int = {
    var left = 0; var right = n; var answer = 0
    while (left <= right) { val mid = left + (right - left) / 2; val cube = mid.toLong * mid.toLong * mid.toLong; if (cube <= n.toLong) { answer = mid; left = mid + 1 } else right = mid - 1 }
    answer
  }
}
