import java.time.LocalDate
import scala.collection.mutable

object Solution {
  private val cadenceOrder = Map("DAILY" -> 0, "WEEKLY" -> 1, "MONTHLY" -> 2)

  def recurringTransactions(transactions: Seq[Seq[String]]): Seq[Seq[String]] = {
    val groups = mutable.Map[(String, String, String), mutable.ArrayBuffer[LocalDate]]()
    for (row <- transactions) {
      val key = (row(1), row(2), row(3))
      groups.getOrElseUpdate(key, mutable.ArrayBuffer[LocalDate]()) += LocalDate.parse(row(0))
    }

    groups.toSeq.flatMap { case ((merchant, amount, currency), dates) =>
      val cadence = bestCadence(dates.distinct.sortBy(_.toEpochDay).toVector)
      if (cadence == "") None else Some(Seq(merchant, amount, currency, cadence))
    }.sortBy(row => (row(0), row(1), row(2)))
  }

  private def bestCadence(dates: Seq[LocalDate]): String = {
    val candidates = Seq(
      "DAILY" -> longestStreak(dates, (a, b) => b == a.plusDays(1)),
      "WEEKLY" -> longestStreak(dates, (a, b) => b == a.plusDays(7)),
      "MONTHLY" -> longestStreak(dates, isNextMonth)
    ).filter(_._2 >= 3)

    if (candidates.isEmpty) "" else candidates.maxBy { case (name, length) => (length, -cadenceOrder(name)) }._1
  }

  private def longestStreak(dates: Seq[LocalDate], follows: (LocalDate, LocalDate) => Boolean): Int = {
    if (dates.isEmpty) return 0
    var best = 1
    var current = 1
    for (index <- 1 until dates.length) {
      if (follows(dates(index - 1), dates(index))) current += 1
      else current = 1
      best = math.max(best, current)
    }
    best
  }

  private def isNextMonth(prev: LocalDate, curr: LocalDate): Boolean = {
    val next = prev.plusMonths(1)
    curr.getYear == next.getYear &&
      curr.getMonthValue == next.getMonthValue &&
      (curr.getDayOfMonth == prev.getDayOfMonth || (isMonthEnd(prev) && isMonthEnd(curr)))
  }

  private def isMonthEnd(day: LocalDate): Boolean = day.getDayOfMonth == day.lengthOfMonth()
}
