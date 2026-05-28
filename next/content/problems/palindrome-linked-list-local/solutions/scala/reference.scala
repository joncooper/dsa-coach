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


  def palindromeLinkedListLocal(values: Seq[Int]): Boolean = {
    val head = buildList(values)
    var slow = head
    var fast = head

    while (fast.nonEmpty && fast.get.next.nonEmpty) {
      slow = slow.get.next
      fast = fast.get.next.get.next
    }
    if (fast.nonEmpty) slow = slow.get.next

    var right = reverseNodes(slow)
    var left = head
    while (right.nonEmpty) {
      if (left.isEmpty || left.get.value != right.get.value) return false
      left = left.get.next
      right = right.get.next
    }
    true
  }
}
