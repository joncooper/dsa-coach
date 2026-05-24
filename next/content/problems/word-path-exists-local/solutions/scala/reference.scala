object Solution {
  def wordPathExistsLocal(board: Seq[Seq[String]], word: String): Boolean = {
    if (word.isEmpty) return true
    if (board.isEmpty || board.head.isEmpty) return false
    val rows = board.length; val cols = board.head.length
    if (word.length > rows * cols) return false
    val visited = Array.fill(rows, cols)(false)
    def dfs(row: Int, col: Int, index: Int): Boolean = {
      if (index == word.length) return true
      if (row < 0 || row >= rows || col < 0 || col >= cols) return false
      if (visited(row)(col) || board(row)(col) != word(index).toString) return false
      visited(row)(col) = true
      val found = dfs(row + 1, col, index + 1) || dfs(row - 1, col, index + 1) || dfs(row, col + 1, index + 1) || dfs(row, col - 1, index + 1)
      visited(row)(col) = false
      found
    }
    board.indices.exists(row => board(row).indices.exists(col => dfs(row, col, 0)))
  }
}
