object Solution {
  def assignSnacks(appetites: Seq[Int], snacks: Seq[Int]): Int = {
    val needs = appetites.sorted
    var child = 0
    for (snack <- snacks.sorted) if (child < needs.length && snack >= needs(child)) child += 1
    child
  }
}
