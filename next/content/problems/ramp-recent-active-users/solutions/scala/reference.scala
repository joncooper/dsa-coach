object Solution {
  def recentActiveUsers(timestamps: Seq[Int], users: Seq[String], window: Int): Seq[Int] = {
    var left = 0
    val countsByUser = scala.collection.mutable.Map.empty[String, Int]
    val results = scala.collection.mutable.ArrayBuffer.empty[Int]

    for (right <- timestamps.indices) {
      val timestamp = timestamps(right)
      val user = users(right)
      countsByUser.update(user, countsByUser.getOrElse(user, 0) + 1)

      while (timestamps(left) < timestamp - window) {
        val oldUser = users(left)
        val nextCount = countsByUser(oldUser) - 1
        if (nextCount == 0) countsByUser.remove(oldUser)
        else countsByUser.update(oldUser, nextCount)
        left += 1
      }

      results.append(countsByUser.size)
    }

    results.toSeq
  }
}
