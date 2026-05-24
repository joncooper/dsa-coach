object Solution {
  def runningMediansLocal(nums: Seq[Int]): Seq[Double] = {
    val seen = scala.collection.mutable.ArrayBuffer.empty[Int]
    val medians = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (num <- nums) {
      val index = seen.indexWhere(_ >= num) match { case -1 => seen.length; case found => found }
      seen.insert(index, num)
      val middle = seen.length / 2
      if (seen.length % 2 == 1) medians.append(seen(middle).toDouble)
      else medians.append((seen(middle - 1) + seen(middle)).toDouble / 2.0)
    }
    medians.toSeq
  }
}
