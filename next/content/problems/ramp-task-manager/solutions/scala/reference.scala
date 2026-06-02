import scala.collection.mutable

object Solution {
  private case class Task(id: String, var name: String, var priority: Int, order: Int)
  private case class User(id: String, quota: Int)
  private case class Assignment(taskId: String, userId: String, start: Int, finish: Int, var completedAt: Option[Int] = None)

  def taskManager(operations: Seq[Seq[String]]): Seq[String] = {
    val tasks = mutable.Map[String, Task]()
    val users = mutable.Map[String, User]()
    val assignments = mutable.ArrayBuffer[Assignment]()
    val out = mutable.ArrayBuffer[String]()

    for (op <- operations) {
      val kind = op(0)
      val timestamp = op(1).toInt

      kind match {
        case "ADD" =>
          val id = s"task_${tasks.size + 1}"
          tasks(id) = Task(id, op(2), op(3).toInt, tasks.size)
          out += id
        case "UPDATE" =>
          tasks.get(op(2)) match {
            case None => out += "false"
            case Some(task) =>
              task.name = op(3)
              task.priority = op(4).toInt
              out += "true"
          }
        case "GET" =>
          out += tasks.get(op(2)).map(task => s"${task.name}|${task.priority}").getOrElse("")
        case "SEARCH" =>
          val limit = math.max(0, op(3).toInt)
          out += joinTaskIds(sortTasks(tasks.values.filter(_.name.contains(op(2))).toSeq).take(limit))
        case "ADD_USER" =>
          val userId = op(2)
          if (users.contains(userId)) out += "false"
          else {
            users(userId) = User(userId, op(3).toInt)
            out += "true"
          }
        case "ASSIGN" =>
          val taskId = op(2)
          val userId = op(3)
          val finish = op(4).toInt
          users.get(userId) match {
            case None => out += "false"
            case Some(user) if !tasks.contains(taskId) || finish <= timestamp => out += "false"
            case Some(user) =>
              val activeCount = assignments.count(item => item.userId == userId && isActive(item, timestamp))
              if (activeCount >= user.quota) out += "false"
              else {
                assignments += Assignment(taskId, userId, timestamp, finish)
                out += "true"
              }
          }
        case "COMPLETE" =>
          assignments.find(item => item.taskId == op(2) && item.userId == op(3) && isActive(item, timestamp)) match {
            case None => out += "false"
            case Some(item) =>
              item.completedAt = Some(timestamp)
              out += "true"
          }
        case "USER_TASKS" =>
          val activeTasks = assignments
            .filter(item => item.userId == op(2) && isActive(item, timestamp))
            .flatMap(item => tasks.get(item.taskId))
            .toSeq
          out += joinTaskIds(sortTasks(activeTasks))
        case "OVERDUE" =>
          out += assignments
            .filter(item => item.userId == op(2) && item.completedAt.isEmpty && item.finish <= timestamp)
            .map(_.taskId)
            .mkString(",")
        case _ =>
          out += ""
      }
    }

    out.toSeq
  }

  private def sortTasks(tasks: Seq[Task]): Seq[Task] = tasks.sortBy(task => (-task.priority, task.order))

  private def joinTaskIds(tasks: Seq[Task]): String = tasks.map(_.id).mkString(",")

  private def isActive(item: Assignment, timestamp: Int): Boolean = {
    item.start <= timestamp && timestamp < item.finish && item.completedAt.isEmpty
  }
}
