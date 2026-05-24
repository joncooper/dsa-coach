object Solution {
  def canFinishLocal(n: Int, prerequisites: Seq[Seq[Int]]): Boolean = {
    val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])
    val indegree = Array.fill(n)(0)
    for (pair <- prerequisites) {
      val course = pair(0); val before = pair(1)
      graph(before).append(course); indegree(course) += 1
    }
    val queue = scala.collection.mutable.Queue.empty[Int]
    for (course <- 0 until n) if (indegree(course) == 0) queue.enqueue(course)
    var seen = 0
    while (queue.nonEmpty) {
      val course = queue.dequeue(); seen += 1
      for (nextCourse <- graph(course)) {
        indegree(nextCourse) -= 1
        if (indegree(nextCourse) == 0) queue.enqueue(nextCourse)
      }
    }
    seen == n
  }
}
