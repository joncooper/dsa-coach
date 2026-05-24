object Solution {
  def searchMatrix(matrix: Seq[Seq[Int]], target: Int): Boolean = {
    if (matrix.isEmpty || matrix.head.isEmpty) return false
    val rows = matrix.length; val cols = matrix.head.length
    var left = 0; var right = rows * cols - 1
    while (left <= right) { val mid = (left + right) / 2; val value = matrix(mid / cols)(mid % cols); if (value == target) return true; if (value < target) left = mid + 1 else right = mid - 1 }
    false
  }
}
