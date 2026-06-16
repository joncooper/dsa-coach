import scala.collection.mutable
import scala.util.Try

object Solution {
  private val CellPattern = "^[A-Z](?:[1-9][0-9]?|100)$".r

  def spreadsheetCells(operations: Seq[Seq[String]]): Seq[String] = {
    val cells = mutable.Map[String, String]()
    val results = mutable.ArrayBuffer[String]()

    def isCell(term: String): Boolean = CellPattern.pattern.matcher(term).matches

    def refs(raw: String): Seq[String] = {
      if (!raw.startsWith("=")) Seq.empty
      else raw.drop(1).split("\\+").toSeq.filter(isCell)
    }

    def hasCycle(start: String): Boolean = {
      val visiting = mutable.Set[String]()
      val visited = mutable.Set[String]()

      def dfs(cell: String): Boolean = {
        if (visiting.contains(cell)) true
        else if (visited.contains(cell)) false
        else {
          visiting += cell
          val cycle = refs(cells.getOrElse(cell, "0")).exists(dfs)
          visiting -= cell
          visited += cell
          cycle
        }
      }

      dfs(start)
    }

    def toInt(value: String): Int = Try(value.toInt).getOrElse(0)

    def evaluateCell(cell: String, visiting: mutable.Set[String]): (String, Boolean) = {
      if (visiting.contains(cell)) {
        ("", true)
      } else {
        val raw = cells.getOrElse(cell, "0")
        if (!raw.startsWith("=")) {
          (raw, false)
        } else {
          visiting += cell
          var total = 0
          var cycle = false

          for (term <- raw.drop(1).split("\\+") if !cycle) {
            if (isCell(term)) {
              val (value, foundCycle) = evaluateCell(term, visiting)
              if (foundCycle) cycle = true
              else total += toInt(value)
            } else {
              total += toInt(term)
            }
          }

          visiting -= cell
          if (cycle) ("", true) else (total.toString, false)
        }
      }
    }

    for (op <- operations) {
      op(0) match {
        case "SET" =>
          val cell = op(1)
          val raw = op(2)
          val old = cells.get(cell)
          cells(cell) = raw

          if (raw.startsWith("=") && hasCycle(cell)) {
            old match {
              case Some(value) => cells(cell) = value
              case None => cells -= cell
            }
            results += "CYCLE"
          } else {
            results += ""
          }
        case "GET" =>
          val (value, cycle) = evaluateCell(op(1), mutable.Set[String]())
          results += (if (cycle) "CYCLE" else value)
        case _ =>
          results += ""
      }
    }

    results.toSeq
  }
}
