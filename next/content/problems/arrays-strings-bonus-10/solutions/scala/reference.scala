object Solution {
  def diagonalSum(matrix: Seq[Seq[Int]]): Int = {
    var total = 0
    val n = matrix.length
    for (index <- 0 until n) {
      total += matrix(index)(index)
      val other = n - 1 - index
      if (other != index) total += matrix(index)(other)
    }
    total
  }
}
