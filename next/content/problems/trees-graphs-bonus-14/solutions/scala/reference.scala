object Solution {
  def buildOrder(dependencies: Map[String, Seq[String]]): Any = {
    val tasks = scala.collection.mutable.ArrayBuffer.empty[String]
    val seenTasks = scala.collection.mutable.Set.empty[String]
    def addTask(task: String): Unit = if (!seenTasks.contains(task)) { seenTasks.add(task); tasks.append(task) }
    for ((task, prereqs) <- dependencies) { addTask(task); prereqs.foreach(addTask) }
    val graph = tasks.map(task => task -> scala.collection.mutable.ArrayBuffer.empty[String]).toMap
    val indegree = scala.collection.mutable.Map.from(tasks.map(task => task -> 0))
    for ((task, prereqs) <- dependencies; prereq <- prereqs) { graph(prereq).append(task); indegree(task) += 1 }
    val queue = scala.collection.mutable.Queue.from(tasks.filter(task => indegree(task) == 0))
    val order = scala.collection.mutable.ArrayBuffer.empty[String]
    while (queue.nonEmpty) {
      val task = queue.dequeue(); order.append(task)
      for (nextTask <- graph(task)) { indegree(nextTask) -= 1; if (indegree(nextTask) == 0) queue.enqueue(nextTask) }
    }
    if (order.length == tasks.length) order.toSeq else null
  }
}
