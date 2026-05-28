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


  def oddEvenList(values: Seq[Int]): Seq[Int] = {
    val head = buildList(values)
    if (head.isEmpty || head.get.next.isEmpty) return listToSeq(head)

    var odd = head.get
    var even = head.get.next
    val evenHead = even

    while (even.nonEmpty && even.get.next.nonEmpty) {
      odd.next = even.get.next
      odd = odd.next.get
      even.get.next = odd.next
      even = even.get.next
    }

    odd.next = evenHead
    listToSeq(head)
  }
}
