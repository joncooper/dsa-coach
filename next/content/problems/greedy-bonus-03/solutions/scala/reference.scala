object Solution {
  def canMakeChange(bills: Seq[Int]): Boolean = {
    var fives = 0; var tens = 0
    for (bill <- bills) {
      if (bill == 5) fives += 1
      else if (bill == 10) { if (fives == 0) return false; fives -= 1; tens += 1 }
      else if (tens > 0 && fives > 0) { tens -= 1; fives -= 1 }
      else if (fives >= 3) fives -= 3
      else return false
    }
    true
  }
}
