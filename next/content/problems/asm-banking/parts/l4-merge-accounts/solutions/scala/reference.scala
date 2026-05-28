object Solution {
  private case class Payment(var account: String, amount: Int, execAt: Int, seq: Int, var status: String = "pending")

  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val balances = scala.collection.mutable.Map.empty[String, Int]
    val spent = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
    val payments = scala.collection.mutable.Map.empty[String, Payment]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    var scheduleSeq = 0

    def renderTop(count: Int): String =
      if (count <= 0 || balances.isEmpty) ""
      else balances.keys.toSeq.map(name => name -> spent(name)).sortBy { case (name, total) => (-total, name) }.take(count).map { case (name, total) => s"$name($total)" }.mkString(",")

    def spend(account: String, amount: Int): Unit = spent(account) = spent(account) + amount

    def fireDue(timestamp: Int): Unit = {
      val due = payments.values.filter(payment => payment.status == "pending" && payment.execAt <= timestamp).toSeq.sortBy(payment => (payment.execAt, payment.seq))
      for (payment <- due) balances.get(payment.account) match {
        case Some(balance) if balance >= payment.amount =>
          balances(payment.account) = balance - payment.amount
          spend(payment.account, payment.amount)
          payment.status = "fired"
        case _ => payment.status = "cancelled"
      }
    }

    for (query <- queries) {
      val timestamp = query(1).toInt
      fireDue(timestamp)
      query.head match {
        case "CREATE_ACCOUNT" =>
          val account = query(2)
          if (balances.contains(account)) out += "false"
          else {
            balances(account) = 0
            spent(account) = 0
            out += "true"
          }
        case "DEPOSIT" =>
          balances.get(query(2)) match {
            case Some(balance) =>
              balances(query(2)) = balance + query(3).toInt
              out += balances(query(2)).toString
            case None => out += ""
          }
        case "WITHDRAW" =>
          val account = query(2)
          val amount = query(3).toInt
          balances.get(account) match {
            case Some(balance) if balance >= amount =>
              balances(account) = balance - amount
              spend(account, amount)
              out += balances(account).toString
            case _ => out += ""
          }
        case "TRANSFER" =>
          val source = query(2)
          val target = query(3)
          val amount = query(4).toInt
          (balances.get(source), balances.get(target)) match {
            case (Some(sourceBalance), Some(targetBalance)) if source != target && sourceBalance >= amount =>
              balances(source) = sourceBalance - amount
              balances(target) = targetBalance + amount
              spend(source, amount)
              out += balances(source).toString
            case _ => out += ""
          }
        case "TOP_SPENDERS" => out += renderTop(query(2).toInt)
        case "SCHEDULE_PAYMENT" =>
          val account = query(2)
          if (!balances.contains(account)) out += ""
          else {
            scheduleSeq += 1
            val id = s"payment$scheduleSeq"
            payments(id) = Payment(account, query(3).toInt, timestamp + query(4).toInt, scheduleSeq)
            out += id
          }
        case "CANCEL_PAYMENT" =>
          payments.get(query(3)) match {
            case Some(payment) if payment.status == "pending" && payment.account == query(2) =>
              payment.status = "cancelled"
              out += "true"
            case _ => out += "false"
          }
        case "MERGE_ACCOUNTS" =>
          val primary = query(2)
          val secondary = query(3)
          (balances.get(primary), balances.get(secondary)) match {
            case (Some(primaryBalance), Some(secondaryBalance)) if primary != secondary =>
              balances(primary) = primaryBalance + secondaryBalance
              spent(primary) = spent(primary) + spent(secondary)
              for (payment <- payments.values if payment.status == "pending" && payment.account == secondary) payment.account = primary
              balances.remove(secondary)
              spent.remove(secondary)
              out += balances(primary).toString
            case _ => out += ""
          }
        case _ => out += ""
      }
    }

    out.toSeq
  }
}
