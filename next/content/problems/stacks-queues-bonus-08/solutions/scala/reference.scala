object Solution {
  def asteroidCollision(asteroids: Seq[Int]): Seq[Int] = {
    val stack = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (asteroid <- asteroids) {
      var alive = true
      while (alive && asteroid < 0 && stack.nonEmpty && stack.last > 0) {
        val top = stack.last
        if (top < -asteroid) stack.remove(stack.length - 1)
        else if (top == -asteroid) {
          stack.remove(stack.length - 1)
          alive = false
        } else alive = false
      }
      if (alive) stack.append(asteroid)
    }
    stack.toSeq
  }
}
