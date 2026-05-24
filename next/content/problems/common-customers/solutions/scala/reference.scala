object Solution {
  def commonCustomers(morning: Seq[Int], evening: Seq[Int]): Int = {
    morning.toSet.intersect(evening.toSet).size
  }
}
