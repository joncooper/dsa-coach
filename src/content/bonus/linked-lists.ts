import type { BonusSeed } from "./types";

/**
 * Linked Lists bonus problems. Concepts: ListNode traversal, dummy heads,
 * fast and slow pointers, merging, and in-place pointer rewiring. Each problem
 * drills one of those patterns with a task distinct from the guided set
 * (List Sum, Remove List Value, Middle List Value, Merge Two Linked Lists,
 * Palindrome Linked List Local) and structurally distinct from the others.
 */
export const bonus: BonusSeed[] = [
  {
    id: "linked-lists-bonus-01",
    chapterId: "linked-lists",
    title: "Count List Length",
    difficulty: "warmup",
    patterns: ["linked-lists", "traversal", "iteration"],
    entrypoint: "list_length",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, return how many nodes it contains. An empty list has length zero.",
    constraints: [
      "The list may be empty; return 0 in that case.",
      "Node values do not affect the answer — only the count of nodes.",
      "Use a single traversal, not repeated scans."
    ],
    hints: [
      "Walk the list with a moving pointer that starts at the head.",
      "Increment a counter once per node, and stop when the pointer becomes None."
    ],
    solution:
      "Walk a pointer from the head to the end, incrementing a counter for every node visited, then return the counter.",
    walkthrough:
      "Each node is visited exactly once before the pointer steps to its next field. When the pointer reaches None the traversal is finished, so the counter holds the total node count.",
    followUps: [
      "How would you detect that the list is longer than some limit without counting all of it?",
      "How would the count change if the list contained a cycle?"
    ],
    code: `def list_length(head):
    count = 0
    curr = head
    while curr is not None:
        count += 1
        curr = curr.next
    return count
`,
    visibleTests: [
      { name: "three nodes", args: [[4, 1, 7]], expected: 3 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hiddenTests: [
      { name: "single", args: [[9]], expected: 1 },
      { name: "two nodes", args: [[1, 2]], expected: 2 },
      { name: "all equal", args: [[5, 5, 5, 5]], expected: 4 },
      { name: "with negatives", args: [[-3, 0, -1, 8]], expected: 4 },
      { name: "long list", args: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: 10 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-02",
    chapterId: "linked-lists",
    title: "Node Value At Index",
    difficulty: "warmup",
    patterns: ["linked-lists", "traversal", "indexing"],
    entrypoint: "value_at_index",
    signature: "head, index",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list and a zero-based index, return the value stored at that index. If the index is out of range, return None.",
    constraints: [
      "The index is a non-negative integer.",
      "Return None when the index is greater than or equal to the list length.",
      "An empty list has no valid index, so always return None for it."
    ],
    hints: [
      "Step a pointer forward while counting down the index toward zero.",
      "If the pointer becomes None before the index runs out, the index was out of range."
    ],
    solution:
      "Advance a pointer index times. If the pointer is still a real node, return its value; if it fell off the end, return None.",
    walkthrough:
      "Each step moves the pointer one node and consumes one unit of the index. Reaching None early means the list was too short, which is exactly the out-of-range case.",
    followUps: [
      "How would you support negative indices that count from the end?",
      "Why can a linked list not match an array's constant-time indexing?"
    ],
    code: `def value_at_index(head, index):
    curr = head
    while index > 0 and curr is not None:
        curr = curr.next
        index -= 1
    if curr is None:
        return None
    return curr.val
`,
    visibleTests: [
      { name: "middle index", args: [[10, 20, 30, 40], 2], expected: 30 },
      { name: "index too large", args: [[1, 2], 5], expected: null }
    ],
    hiddenTests: [
      { name: "first index", args: [[7, 8, 9], 0], expected: 7 },
      { name: "last index", args: [[7, 8, 9], 2], expected: 9 },
      { name: "empty list", args: [[], 0], expected: null },
      { name: "single node hit", args: [[42], 0], expected: 42 },
      { name: "single node miss", args: [[42], 1], expected: null },
      { name: "one past end", args: [[1, 2, 3], 3], expected: null }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-03",
    chapterId: "linked-lists",
    title: "Maximum List Value",
    difficulty: "warmup",
    patterns: ["linked-lists", "traversal", "running state"],
    entrypoint: "max_list_value",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list of integers, return the largest value in the list. Return None if the list is empty.",
    constraints: [
      "The list may be empty; return None then.",
      "Values may be negative.",
      "Solve it in one traversal without collecting the values into another structure."
    ],
    hints: [
      "Carry a single running value: the largest seen so far.",
      "Seed the running value from the first node so negative-only lists still work."
    ],
    solution:
      "Traverse the list while keeping the maximum value seen so far, starting from the head node's value, and return it at the end.",
    walkthrough:
      "The state is one number. Each node updates it with a comparison, so after the single pass the running value is the maximum. Seeding from the first node avoids any wrong baseline like zero.",
    followUps: [
      "How would you also return the position of the maximum value?",
      "What changes if you need both the minimum and the maximum in one pass?"
    ],
    code: `def max_list_value(head):
    if head is None:
        return None
    best = head.val
    curr = head.next
    while curr is not None:
        if curr.val > best:
            best = curr.val
        curr = curr.next
    return best
`,
    visibleTests: [
      { name: "peak in middle", args: [[3, 9, 2, 7]], expected: 9 },
      { name: "empty", args: [[]], expected: null }
    ],
    hiddenTests: [
      { name: "single", args: [[5]], expected: 5 },
      { name: "two nodes", args: [[1, 2]], expected: 2 },
      { name: "all negative", args: [[-5, -2, -9]], expected: -2 },
      { name: "all equal", args: [[4, 4, 4]], expected: 4 },
      { name: "max at head", args: [[10, 1, 2, 3]], expected: 10 },
      { name: "max at tail", args: [[1, 2, 3, 10]], expected: 10 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-04",
    chapterId: "linked-lists",
    title: "Reverse Linked List",
    difficulty: "easy",
    patterns: ["linked-lists", "in-place updates", "pointer rewiring"],
    entrypoint: "reverse_list",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, reverse it in place and return the head of the reversed list.",
    constraints: [
      "An empty list reverses to an empty list.",
      "Reverse by rewiring next pointers; do not allocate new nodes.",
      "A single-node list is unchanged."
    ],
    hints: [
      "Track three things: the previous node, the current node, and the next node.",
      "Before flipping the current node's next pointer, save where it pointed so you do not lose the rest of the list."
    ],
    solution:
      "Walk the list with previous and current pointers. For each node, remember its successor, point the node back at previous, then advance both pointers; previous ends as the new head.",
    walkthrough:
      "Each step reverses exactly one link. Saving the successor first prevents losing the unvisited tail. When current reaches None, previous points at the old last node, which is now the head.",
    followUps: [
      "How would you reverse only the first k nodes of the list?",
      "How does a recursive reversal differ in its space usage?"
    ],
    code: `def reverse_list(head):
    prev = None
    curr = head
    while curr is not None:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
`,
    visibleTests: [
      { name: "four nodes", args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
      { name: "empty", args: [[]], expected: [] }
    ],
    hiddenTests: [
      { name: "single", args: [[7]], expected: [7] },
      { name: "two nodes", args: [[1, 2]], expected: [2, 1] },
      { name: "all equal", args: [[5, 5, 5]], expected: [5, 5, 5] },
      { name: "with negatives", args: [[-1, 2, -3]], expected: [-3, 2, -1] },
      { name: "already palindromic", args: [[1, 2, 1]], expected: [1, 2, 1] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-05",
    chapterId: "linked-lists",
    title: "Insert After Index",
    difficulty: "easy",
    patterns: ["linked-lists", "dummy head", "pointer rewiring"],
    entrypoint: "insert_after_index",
    signature: "head, index, value",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, insert a new node holding `value` immediately after the node at the given zero-based index, and return the head. If the index is out of range, return the list unchanged.",
    constraints: [
      "The index is a non-negative integer.",
      "If the index is greater than or equal to the list length, make no change.",
      "Inserting after the last valid index appends a new tail node."
    ],
    hints: [
      "A dummy node before the head lets you treat every position uniformly while you walk.",
      "Stop at the node at `index`, then splice the new node between it and its current successor."
    ],
    solution:
      "Use a dummy head and step to the node at `index`. If that node exists, create a new node whose next is the node's successor, then point the node at the new node.",
    walkthrough:
      "Walking from a dummy head reaches the target node by stepping forward index plus one times. The splice is two pointer assignments, and a missing target node means the index was out of range so the list is returned untouched.",
    followUps: [
      "How would you change this to insert before the given index instead?",
      "Why does inserting into a linked list avoid the shifting that an array insert requires?"
    ],
    code: `def insert_after_index(head, index, value):
    dummy = ListNode(0, head)
    curr = dummy
    steps = index + 1
    while steps > 0 and curr is not None:
        curr = curr.next
        steps -= 1
    if curr is not None:
        curr.next = ListNode(value, curr.next)
    return dummy.next
`,
    visibleTests: [
      { name: "insert in middle", args: [[1, 2, 4], 1, 3], expected: [1, 2, 3, 4] },
      { name: "index out of range", args: [[1, 2], 5, 9], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "insert after head", args: [[1, 3], 0, 2], expected: [1, 2, 3] },
      { name: "append at tail", args: [[1, 2, 3], 2, 4], expected: [1, 2, 3, 4] },
      { name: "empty list", args: [[], 0, 5], expected: [] },
      { name: "single node insert", args: [[7], 0, 8], expected: [7, 8] },
      { name: "single node out of range", args: [[7], 1, 8], expected: [7] },
      { name: "insert negative value", args: [[5, 5], 0, -1], expected: [5, -1, 5] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-06",
    chapterId: "linked-lists",
    title: "Remove Duplicates From Sorted List",
    difficulty: "easy",
    patterns: ["linked-lists", "in-place updates", "pointer rewiring"],
    entrypoint: "dedup_sorted_list",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a sorted singly linked list, remove the nodes so each value appears only once, keeping one node per value, and return the head.",
    constraints: [
      "The input list is sorted in non-decreasing order.",
      "Keep the first node of each run of equal values and drop the rest.",
      "An empty list and a single-node list need no change."
    ],
    hints: [
      "Because the list is sorted, all copies of a value sit next to each other.",
      "Compare each node with its successor; when they are equal, skip the successor by rewiring next."
    ],
    solution:
      "Walk one pointer through the list. Whenever a node's value equals its successor's value, unlink the successor; otherwise advance the pointer.",
    walkthrough:
      "Sortedness guarantees duplicates are adjacent, so comparing neighbours is enough. Skipping the successor without advancing handles a run of three or more equal values, and a distinct neighbour moves the pointer on.",
    followUps: [
      "How would you instead delete every value that appears more than once entirely?",
      "What approach would you need if the list were not sorted?"
    ],
    code: `def dedup_sorted_list(head):
    curr = head
    while curr is not None and curr.next is not None:
        if curr.val == curr.next.val:
            curr.next = curr.next.next
        else:
            curr = curr.next
    return head
`,
    visibleTests: [
      { name: "runs collapse", args: [[1, 1, 2, 3, 3]], expected: [1, 2, 3] },
      { name: "already unique", args: [[1, 2, 3]], expected: [1, 2, 3] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[5]], expected: [5] },
      { name: "all equal", args: [[4, 4, 4, 4]], expected: [4] },
      { name: "two equal", args: [[7, 7]], expected: [7] },
      { name: "duplicate at tail", args: [[1, 2, 2]], expected: [1, 2] },
      { name: "with negatives", args: [[-2, -2, -1, 0, 0]], expected: [-2, -1, 0] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-07",
    chapterId: "linked-lists",
    title: "Is List Sorted Ascending",
    difficulty: "easy",
    patterns: ["linked-lists", "traversal", "pairwise comparison"],
    entrypoint: "is_list_sorted",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, return True if its values are in non-decreasing order (equal neighbours are allowed) and False otherwise.",
    constraints: [
      "An empty list and a single-node list count as sorted.",
      "Equal adjacent values do not break the order.",
      "Return False as soon as a violation is found."
    ],
    hints: [
      "Compare each node's value with the value of the node right after it.",
      "The first time a node's value exceeds its successor's value, the list is not sorted."
    ],
    solution:
      "Traverse adjacent node pairs; if any node's value is strictly greater than its successor's, return False, otherwise return True after the pass.",
    walkthrough:
      "Sortedness is a property of every adjacent pair, so one walk over pairs decides it. Returning early on the first descending step avoids scanning the rest of the list.",
    followUps: [
      "How would you check for strictly increasing order instead?",
      "How would you report the value at the first place the order breaks?"
    ],
    code: `def is_list_sorted(head):
    curr = head
    while curr is not None and curr.next is not None:
        if curr.val > curr.next.val:
            return False
        curr = curr.next
    return True
`,
    visibleTests: [
      { name: "sorted with duplicates", args: [[1, 2, 2, 5]], expected: true },
      { name: "out of order", args: [[1, 3, 2]], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: true },
      { name: "single", args: [[7]], expected: true },
      { name: "two ascending", args: [[1, 2]], expected: true },
      { name: "two descending", args: [[2, 1]], expected: false },
      { name: "all equal", args: [[5, 5, 5]], expected: true },
      { name: "drop at end", args: [[1, 2, 3, 0]], expected: false },
      { name: "negatives sorted", args: [[-4, -1, 0, 3]], expected: true }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-08",
    chapterId: "linked-lists",
    title: "Remove Nth Node From End",
    difficulty: "medium",
    patterns: ["linked-lists", "fast and slow pointers", "dummy head"],
    entrypoint: "remove_nth_from_end",
    signature: "head, n",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, remove the n-th node counting from the end of the list and return the head.",
    constraints: [
      "n is at least 1 and never larger than the list length.",
      "n equal to the list length removes the head node.",
      "Aim for a single traversal of the list."
    ],
    hints: [
      "Send one pointer n nodes ahead, then move both pointers together.",
      "A dummy head makes removing the original head node need no special case."
    ],
    solution:
      "Place a lead pointer n steps ahead of a trailing pointer that starts at a dummy head. Advance both until the lead reaches the end; the trailing pointer then sits just before the node to unlink.",
    walkthrough:
      "Keeping a fixed gap of n between the two pointers means that when the lead pointer falls off the end, the trailing pointer is exactly one node before the target. Rewiring past it removes the n-th node from the end in one pass.",
    followUps: [
      "How would you handle the case where n could exceed the list length?",
      "Why does the dummy head simplify removing the first node?"
    ],
    code: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    lead = dummy
    for _ in range(n):
        lead = lead.next
    trail = dummy
    while lead.next is not None:
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next
    return dummy.next
`,
    visibleTests: [
      { name: "remove middle", args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { name: "remove last", args: [[1, 2, 3], 1], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "remove head", args: [[1, 2, 3], 3], expected: [2, 3] },
      { name: "single node", args: [[9], 1], expected: [] },
      { name: "two nodes remove head", args: [[1, 2], 2], expected: [2] },
      { name: "two nodes remove tail", args: [[1, 2], 1], expected: [1] },
      { name: "remove first of many", args: [[5, 6, 7, 8], 4], expected: [6, 7, 8] },
      { name: "with negatives", args: [[-1, -2, -3, -4], 3], expected: [-1, -3, -4] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-09",
    chapterId: "linked-lists",
    title: "Odd Even Node Grouping",
    difficulty: "medium",
    patterns: ["linked-lists", "in-place updates", "pointer rewiring"],
    entrypoint: "odd_even_list",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, group all nodes at odd positions together followed by all nodes at even positions, and return the head. Positions are one-based, so the first node is odd. Preserve the relative order within each group.",
    constraints: [
      "Group by node position, not by node value.",
      "An empty list and a single-node list are returned unchanged.",
      "Rewire existing nodes; do not allocate new ones."
    ],
    hints: [
      "Build two chains as you walk: one for odd-position nodes, one for even-position nodes.",
      "After the walk, attach the head of the even chain onto the tail of the odd chain."
    ],
    solution:
      "Maintain an odd tail and an even tail while traversing. Each iteration links the next two nodes onto their respective chains, then joins the even chain after the odd chain.",
    walkthrough:
      "Advancing both tails by one node per iteration splits the list by position in a single pass. Saving the even chain's head before the loop lets the odd tail point at it once the split is complete.",
    followUps: [
      "How would you instead split the list into one chain of even values and one of odd values?",
      "Why is the relative order inside each group preserved by this approach?"
    ],
    code: `def odd_even_list(head):
    if head is None or head.next is None:
        return head
    odd = head
    even = head.next
    even_head = even
    while even is not None and even.next is not None:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head
`,
    visibleTests: [
      { name: "six nodes", args: [[1, 2, 3, 4, 5, 6]], expected: [1, 3, 5, 2, 4, 6] },
      { name: "five nodes", args: [[1, 2, 3, 4, 5]], expected: [1, 3, 5, 2, 4] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[7]], expected: [7] },
      { name: "two nodes", args: [[1, 2]], expected: [1, 2] },
      { name: "three nodes", args: [[1, 2, 3]], expected: [1, 3, 2] },
      { name: "four nodes", args: [[10, 20, 30, 40]], expected: [10, 30, 20, 40] },
      { name: "all equal", args: [[5, 5, 5, 5, 5]], expected: [5, 5, 5, 5, 5] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "linked-lists-bonus-10",
    chapterId: "linked-lists",
    title: "Swap Nodes In Pairs",
    difficulty: "medium",
    patterns: ["linked-lists", "in-place updates", "dummy head"],
    entrypoint: "swap_pairs",
    signature: "head",
    adapter: "linked-list",
    prompt:
      "Given the head of a singly linked list, swap every two adjacent nodes and return the head. Swap the nodes themselves by rewiring pointers, not by changing values. If the list has an odd number of nodes, the final node stays in place.",
    constraints: [
      "An empty list and a single-node list are returned unchanged.",
      "A lone final node in an odd-length list keeps its position.",
      "Swap nodes by relinking next pointers; do not just swap stored values."
    ],
    hints: [
      "A dummy node before the head gives the first pair something stable to attach to.",
      "For each pair, the node before it must end up pointing at the second node of the pair."
    ],
    solution:
      "Walk with a pointer that sits before each pair. While two more nodes exist, relink so the second node precedes the first, then move the pointer two nodes forward.",
    walkthrough:
      "Each iteration rewires three links to flip one pair, and the before-pointer advances past the swapped pair so the next iteration starts fresh. A pair with fewer than two nodes left ends the loop, leaving any odd tail untouched.",
    followUps: [
      "How would you generalise this to reverse the list in groups of k nodes?",
      "Why is swapping nodes by relinking preferred over swapping their stored values?"
    ],
    code: `def swap_pairs(head):
    dummy = ListNode(0, head)
    before = dummy
    while before.next is not None and before.next.next is not None:
        first = before.next
        second = first.next
        first.next = second.next
        second.next = first
        before.next = second
        before = first
    return dummy.next
`,
    visibleTests: [
      { name: "four nodes", args: [[1, 2, 3, 4]], expected: [2, 1, 4, 3] },
      { name: "odd tail", args: [[1, 2, 3]], expected: [2, 1, 3] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[7]], expected: [7] },
      { name: "two nodes", args: [[1, 2]], expected: [2, 1] },
      { name: "five nodes", args: [[1, 2, 3, 4, 5]], expected: [2, 1, 4, 3, 5] },
      { name: "six nodes", args: [[1, 2, 3, 4, 5, 6]], expected: [2, 1, 4, 3, 6, 5] },
      { name: "with negatives", args: [[-1, -2, -3, -4]], expected: [-2, -1, -4, -3] }
    ],
    time: "O(n)",
    space: "O(1)"
  }
];
