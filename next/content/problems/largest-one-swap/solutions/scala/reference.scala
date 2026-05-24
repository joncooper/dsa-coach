object Solution {
  def largestOneSwap(digits: String): String = {
    val chars = digits.toCharArray
    val last = Array.fill(10)(-1)
    for (index <- chars.indices) last(chars(index).asDigit) = index
    for (index <- chars.indices) {
      val current = chars(index).asDigit
      for (digit <- 9 until current by -1) {
        if (last(digit) > index) {
          val swapIndex = last(digit)
          val temp = chars(index); chars(index) = chars(swapIndex); chars(swapIndex) = temp
          return chars.mkString
        }
      }
    }
    digits
  }
}
