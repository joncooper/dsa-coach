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


  def mergeTwoLinkedLists(a: Seq[Int], b: Seq[Int]): Seq[Int] = {
    var left = buildList(a)
    var right = buildList(b)
    val dummy = ListNode(0)
    var tail = dummy

    while (left.nonEmpty && right.nonEmpty) {
      if (left.get.value <= right.get.value) {
        tail.next = left
        left = left.get.next
      } else {
        tail.next = right
        right = right.get.next
      }
      tail = tail.next.get
    }

    tail.next = if (left.nonEmpty) left else right
    listToSeq(dummy.next)
  }
}
