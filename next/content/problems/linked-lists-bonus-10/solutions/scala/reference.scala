object Solution {
  case class ListNode(value: Int, var next: Option[ListNode] = None)

  def buildList(values: Seq[Int]): Option[ListNode] = {
    val dummy = ListNode(0)
    var tail = dummy
    for (value <- values) {
      val node = ListNode(value)
      tail.next = Some(node)
      tail = node
    }
    dummy.next
  }

  def listToSeq(head: Option[ListNode]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    var node = head
    while (node.nonEmpty) {
      result.append(node.get.value)
      node = node.get.next
    }
    result.toSeq
  }

  def reverseNodes(head: Option[ListNode]): Option[ListNode] = {
    var previous: Option[ListNode] = None
    var node = head
    while (node.nonEmpty) {
      val next = node.get.next
      node.get.next = previous
      previous = node
      node = next
    }
    previous
  }


  def swapPairs(values: Seq[Int]): Seq[Int] = {
    val head = buildList(values)
    val dummy = ListNode(0, head)
    var previous = dummy

    while (previous.next.nonEmpty && previous.next.get.next.nonEmpty) {
      val first = previous.next.get
      val second = first.next.get
      first.next = second.next
      second.next = Some(first)
      previous.next = Some(second)
      previous = first
    }

    listToSeq(dummy.next)
  }
}
