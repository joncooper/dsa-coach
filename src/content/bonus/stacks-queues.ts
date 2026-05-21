import type { BonusSeed } from "./types";

/**
 * Stacks & Queues bonus problems. Concepts: stacks, queues, monotonic stacks,
 * simulation, and streaming. Each problem drills one LIFO/FIFO idea cleanly and
 * is distinct from the guided set (Balanced Brackets Local, Warmer Day Waits,
 * Simplify Folder Steps, Recent Event Counts, Next Greater Values) and from
 * every other problem here.
 */
export const bonus: BonusSeed[] = [
  {
    id: "stacks-queues-bonus-01",
    chapterId: "stacks-queues",
    title: "Reverse A Queue With A Stack",
    difficulty: "warmup",
    patterns: ["stacks-queues", "stack", "queue"],
    entrypoint: "reverse_queue",
    signature: "items",
    prompt:
      "You are handed the items of a queue in front-to-back order. Return them in back-to-front order, using a stack to do the reversal.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "Items keep their values; only their order is reversed.",
      "Push every item onto a stack, then pop the stack empty."
    ],
    hints: [
      "A stack hands items back in the opposite order they were pushed.",
      "Push the whole queue first, then pop until the stack is empty, collecting as you go."
    ],
    solution:
      "Push every queued item onto a stack in order, then repeatedly pop the stack and append each popped item; the last item pushed comes out first.",
    walkthrough:
      "A stack is last-in first-out, so feeding a front-to-back sequence in and draining it out yields the exact reverse. The push phase and the pop phase are each a single linear pass.",
    followUps: [
      "How would you reverse only the first k items and leave the rest in place?",
      "Could you reverse the queue using a second queue instead of a stack?"
    ],
    code: `def reverse_queue(items):
    stack = []
    for item in items:
        stack.append(item)
    out = []
    while stack:
        out.append(stack.pop())
    return out
`,
    visibleTests: [
      { name: "four items", args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
      { name: "strings", args: [["a", "b", "c"]], expected: ["c", "b", "a"] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[7]], expected: [7] },
      { name: "all equal", args: [[5, 5, 5]], expected: [5, 5, 5] },
      { name: "all negative", args: [[-1, -2, -3]], expected: [-3, -2, -1] },
      { name: "two items", args: [[8, 9]], expected: [9, 8] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-02",
    chapterId: "stacks-queues",
    title: "Streaming Moving Average",
    difficulty: "warmup",
    patterns: ["stacks-queues", "queue", "streaming"],
    entrypoint: "moving_averages",
    signature: "nums, window",
    prompt:
      "Numbers arrive one at a time. After each arrival, report the average of the most recent `window` numbers (or of all numbers seen so far, if fewer than `window` have arrived). Return the list of averages, one per arrival.",
    constraints: [
      "The input stream may be empty; return an empty list then.",
      "`window` is a positive integer.",
      "Keep the running sum in step with the window so each report is O(1)."
    ],
    hints: [
      "Hold the recent numbers in a queue and a running sum alongside it.",
      "When the queue grows past `window`, drop its oldest number from both the queue and the sum."
    ],
    solution:
      "Maintain a queue of recent values and their running sum. On each arrival, enqueue the value and add it; if the queue exceeds the window, dequeue the oldest and subtract it. Report sum divided by the current queue length.",
    walkthrough:
      "The queue holds exactly the values inside the window, and the running sum mirrors it, so the average is one division. Eviction of the oldest value keeps both structures bounded by the window size.",
    followUps: [
      "How would you also report the maximum within each window?",
      "What changes if old values should expire by timestamp rather than by count?"
    ],
    code: `def moving_averages(nums, window):
    recent = deque()
    total = 0
    out = []
    for value in nums:
        recent.append(value)
        total += value
        if len(recent) > window:
            total -= recent.popleft()
        out.append(total / len(recent))
    return out
`,
    visibleTests: [
      { name: "window of three", args: [[1, 2, 3, 4, 5], 3], expected: [1.0, 1.5, 2.0, 3.0, 4.0] },
      { name: "window larger than stream", args: [[10], 5], expected: [10.0] }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 2], expected: [] },
      { name: "window of one", args: [[4, 8, 2], 1], expected: [4.0, 8.0, 2.0] },
      { name: "all equal", args: [[4, 4, 4, 4], 2], expected: [4.0, 4.0, 4.0, 4.0] },
      { name: "negatives cancel", args: [[2, -2, 2, -2], 2], expected: [2.0, 0.0, 0.0, 0.0] },
      { name: "single value", args: [[6], 3], expected: [6.0] }
    ],
    time: "O(n)",
    space: "O(k)"
  },
  {
    id: "stacks-queues-bonus-03",
    chapterId: "stacks-queues",
    title: "Collapse Adjacent Duplicates",
    difficulty: "easy",
    patterns: ["stacks-queues", "stack"],
    entrypoint: "collapse_duplicates",
    signature: "text",
    prompt:
      "Repeatedly remove any two adjacent equal characters from the string. Removals can expose new adjacent pairs, which are also removed. Return the final string once no adjacent pair remains.",
    constraints: [
      "The string may be empty; return an empty string then.",
      "A removal may expose a new pair that must also be removed.",
      "The final string has no two equal characters next to each other."
    ],
    hints: [
      "Scan left to right and keep finished characters on a stack.",
      "If the next character equals the top of the stack, pop instead of pushing — that cancels the pair."
    ],
    solution:
      "Walk the string pushing each character onto a stack, but when the incoming character equals the stack top, pop the top instead of pushing. Join the leftover stack into the answer.",
    walkthrough:
      "The stack top is always the last surviving character, so comparing against it detects a cancellable pair. Popping exposes the previous survivor, which naturally handles chains revealed by earlier removals in one pass.",
    followUps: [
      "How would you remove runs of exactly k equal characters instead of pairs?",
      "Could you return how many characters were removed in total?"
    ],
    code: `def collapse_duplicates(text):
    stack = []
    for ch in text:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)
`,
    visibleTests: [
      { name: "single collapse", args: ["abbaca"], expected: "ca" },
      { name: "no duplicates", args: ["abc"], expected: "abc" }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: "" },
      { name: "single", args: ["a"], expected: "a" },
      { name: "all cancel", args: ["aaaa"], expected: "" },
      { name: "chain reaction", args: ["aabccba"], expected: "a" },
      { name: "odd run", args: ["aaa"], expected: "a" }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-04",
    chapterId: "stacks-queues",
    title: "Score Of Nested Parentheses",
    difficulty: "easy",
    patterns: ["stacks-queues", "stack"],
    entrypoint: "paren_score",
    signature: "text",
    prompt:
      "A balanced parenthesis string is scored by these rules: '()' is worth 1, two strings side by side add their scores, and a string wrapped in one pair of parentheses is worth double its inside. Return the total score.",
    constraints: [
      "The input is a non-empty, fully balanced parenthesis string.",
      "An empty pair '()' contributes exactly 1.",
      "Wrapping a non-empty string in a pair doubles its score."
    ],
    hints: [
      "Keep a stack of partial scores, one entry per currently open pair, starting with one outer entry.",
      "On '(' push a fresh 0; on ')' pop the inside score and add max(2 * inside, 1) to the new top."
    ],
    solution:
      "Use a stack of running scores. Pushing 0 on '(' starts a new nesting level; on ')' pop that level's score and fold max(2 * inside, 1) into the level below. The lone remaining entry is the answer.",
    walkthrough:
      "Each stack entry accumulates the score of one open group. Closing a group decides between 1 (it was empty) and double its inside, then merges that into the enclosing group, so siblings sum and wrappers double exactly as specified.",
    followUps: [
      "How would you adapt this if a wrapped string tripled instead of doubled?",
      "How could you compute the deepest nesting level in the same pass?"
    ],
    code: `def paren_score(text):
    stack = [0]
    for ch in text:
        if ch == "(":
            stack.append(0)
        else:
            inside = stack.pop()
            stack[-1] += max(2 * inside, 1)
    return stack[0]
`,
    visibleTests: [
      { name: "single pair", args: ["()"], expected: 1 },
      { name: "wrapped once", args: ["(())"], expected: 2 }
    ],
    hiddenTests: [
      { name: "two siblings", args: ["()()"], expected: 2 },
      { name: "deep nest", args: ["((()))"], expected: 4 },
      { name: "mixed nest and siblings", args: ["(()(()))"], expected: 6 },
      { name: "siblings inside wrap", args: ["(()())"], expected: 4 },
      { name: "nested then sibling", args: ["(())()"], expected: 3 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-05",
    chapterId: "stacks-queues",
    title: "Min-Tracking Stack",
    difficulty: "easy",
    patterns: ["stacks-queues", "stack", "simulation"],
    entrypoint: "min_stack_ops",
    signature: "ops",
    prompt:
      "Simulate a stack that also reports its smallest value in constant time. Each operation is a list: ['push', v] adds a value, ['pop'] removes the top, and ['min'] asks for the current minimum. Return the list of answers, one per 'min' operation, in order.",
    constraints: [
      "The operation list may be empty; return an empty list then.",
      "'pop' and 'min' are only ever issued when the stack is non-empty.",
      "Each 'min' must be answered in O(1) time, not by scanning the stack."
    ],
    hints: [
      "Keep a second stack that holds, at each level, the minimum of the main stack up to that level.",
      "On push, store min(value, previous tracked minimum); on pop, discard the top of both stacks."
    ],
    solution:
      "Maintain a values stack and a parallel mins stack. Each push records the smaller of the new value and the current tracked minimum; each pop drops the top of both. A 'min' query reads the top of the mins stack.",
    walkthrough:
      "The mins stack stores a prefix minimum per depth, so it always describes the same elements as the values stack. Because each level carries its own minimum, popping restores the previous minimum without any rescan.",
    followUps: [
      "How would you also support a constant-time maximum query?",
      "Could you store only the differences from the running minimum to save space?"
    ],
    code: `def min_stack_ops(ops):
    values = []
    mins = []
    out = []
    for op in ops:
        kind = op[0]
        if kind == "push":
            value = op[1]
            values.append(value)
            mins.append(value if not mins else min(mins[-1], value))
        elif kind == "pop":
            values.pop()
            mins.pop()
        else:
            out.append(mins[-1])
    return out
`,
    visibleTests: [
      {
        name: "min tracks across push and pop",
        args: [[["push", 3], ["push", 1], ["min"], ["push", 2], ["min"], ["pop"], ["min"]]],
        expected: [1, 1, 1]
      },
      { name: "single value", args: [[["push", 5], ["min"], ["pop"]]], expected: [5] }
    ],
    hiddenTests: [
      { name: "no queries", args: [[["push", 9], ["push", 2], ["pop"]]], expected: [] },
      { name: "empty", args: [[]], expected: [] },
      { name: "negatives", args: [[["push", -1], ["push", -3], ["min"]]], expected: [-3] },
      {
        name: "min rises after pop",
        args: [[["push", 4], ["push", 1], ["pop"], ["min"]]],
        expected: [4]
      },
      {
        name: "reset by full drain",
        args: [[["push", 2], ["pop"], ["push", 9], ["min"]]],
        expected: [9]
      }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-06",
    chapterId: "stacks-queues",
    title: "Validate A Stack Sequence",
    difficulty: "easy",
    patterns: ["stacks-queues", "stack", "simulation"],
    entrypoint: "validate_stack_sequence",
    signature: "pushed, popped",
    prompt:
      "Given a `pushed` order and a `popped` order of the same distinct values, decide whether one stack could produce that pop order if values are pushed strictly in the `pushed` order, with pops allowed at any time. Return True or False.",
    constraints: [
      "Both lists contain the same distinct values and have equal length.",
      "Both lists may be empty; an empty sequence is valid.",
      "Values must be pushed in exactly the given `pushed` order."
    ],
    hints: [
      "Replay the process: push the next value, then pop greedily while the stack top matches the next value to be popped.",
      "If you consume the entire `popped` list, the sequence is achievable."
    ],
    solution:
      "Simulate with a real stack and an index into `popped`. Push each value, then while the stack top equals the awaited popped value, pop it and advance the index. The sequence is valid exactly when the index reaches the end.",
    walkthrough:
      "Greedy popping is safe: a value at the stack top that is needed next must be removed now, since anything pushed later sits above it. If the simulation drains every awaited pop, the order is reproducible; otherwise it is not.",
    followUps: [
      "How would you also return the moment a mismatch first becomes unavoidable?",
      "What changes if values are allowed to repeat?"
    ],
    code: `def validate_stack_sequence(pushed, popped):
    stack = []
    index = 0
    for value in pushed:
        stack.append(value)
        while stack and index < len(popped) and stack[-1] == popped[index]:
            stack.pop()
            index += 1
    return index == len(popped)
`,
    visibleTests: [
      { name: "valid order", args: [[1, 2, 3, 4, 5], [4, 5, 3, 2, 1]], expected: true },
      { name: "invalid order", args: [[1, 2, 3], [3, 1, 2]], expected: false }
    ],
    hiddenTests: [
      { name: "both empty", args: [[], []], expected: true },
      { name: "single value", args: [[1], [1]], expected: true },
      { name: "full reverse", args: [[1, 2, 3], [3, 2, 1]], expected: true },
      { name: "buried value", args: [[0, 1, 2, 3], [3, 2, 0, 1]], expected: false },
      { name: "interleaved valid", args: [[1, 2], [2, 1]], expected: true }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-07",
    chapterId: "stacks-queues",
    title: "Hot Potato Survivor",
    difficulty: "easy",
    patterns: ["stacks-queues", "queue", "simulation"],
    entrypoint: "hot_potato",
    signature: "players, passes",
    prompt:
      "Players stand in a circle holding a potato. The potato is passed `passes` times, then whoever holds it is eliminated. Passing and elimination repeat until one player remains. Return the surviving player.",
    constraints: [
      "The `players` list has at least one player; values may be names or numbers.",
      "`passes` is a non-negative integer; zero means the current holder is eliminated immediately.",
      "Play continues until exactly one player is left."
    ],
    hints: [
      "Model the circle as a queue; passing the potato is moving the front player to the back.",
      "After `passes` moves, remove the front player; repeat while more than one player remains."
    ],
    solution:
      "Load the players into a queue. To pass, dequeue the front player and enqueue them at the back. After `passes` such moves, dequeue and discard the holder. Repeat until one player remains and return them.",
    walkthrough:
      "A queue captures the circular order: rotating the front to the back models a pass, and a dequeue without re-enqueue models an elimination. Each round shortens the queue by one, so it terminates with the single survivor.",
    followUps: [
      "How would you return the full elimination order instead of just the survivor?",
      "What if the number of passes changed every round?"
    ],
    code: `def hot_potato(players, passes):
    circle = deque(players)
    while len(circle) > 1:
        for _ in range(passes):
            circle.append(circle.popleft())
        circle.popleft()
    return circle[0]
`,
    visibleTests: [
      { name: "five players two passes", args: [[1, 2, 3, 4, 5], 2], expected: 4 },
      { name: "names one pass", args: [["a", "b", "c", "d"], 1], expected: "a" }
    ],
    hiddenTests: [
      { name: "single player", args: [[7], 3], expected: 7 },
      { name: "zero passes pair", args: [[1, 2], 0], expected: 2 },
      { name: "zero passes trio", args: [[1, 2, 3], 0], expected: 3 },
      { name: "two players one pass", args: [[1, 2], 1], expected: 1 },
      { name: "three players five passes", args: [[1, 2, 3], 5], expected: 1 }
    ],
    time: "O(n * passes)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-08",
    chapterId: "stacks-queues",
    title: "Asteroid Collision",
    difficulty: "medium",
    patterns: ["stacks-queues", "stack", "simulation"],
    entrypoint: "asteroid_collision",
    signature: "asteroids",
    prompt:
      "A row of asteroids moves along a line; each value's magnitude is its size and its sign is its direction (positive moves right, negative moves left). When a right-mover meets a left-mover they collide: the smaller one is destroyed, or both are destroyed if equal. Asteroids moving the same way never collide. Return the row after all collisions settle.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "A collision happens only between a right-mover immediately followed by a left-mover.",
      "Equal-size opposing asteroids destroy each other; equal direction never collides."
    ],
    hints: [
      "Scan left to right keeping survivors on a stack; a new left-mover may collide with positive asteroids on top.",
      "Resolve repeatedly: a left-mover keeps destroying smaller positive tops, ties destroy both, and a larger positive top destroys the left-mover."
    ],
    solution:
      "Process asteroids left to right with a stack of survivors. For an incoming left-mover, while the stack top is a right-mover, compare magnitudes: pop a smaller top and continue, destroy both on a tie, or stop the incoming one against a larger top. Push the incoming asteroid if it survives.",
    walkthrough:
      "Only a positive top can collide with an incoming negative asteroid, so the stack top is the sole collision candidate. Looping the comparison lets one survivor punch through several smaller asteroids, and same-direction pairs are simply pushed without conflict.",
    followUps: [
      "How would you report how many asteroids were destroyed?",
      "What changes if a collision merged the two sizes instead of destroying one?"
    ],
    code: `def asteroid_collision(asteroids):
    stack = []
    for asteroid in asteroids:
        alive = True
        while alive and asteroid < 0 and stack and stack[-1] > 0:
            if stack[-1] < -asteroid:
                stack.pop()
                continue
            if stack[-1] == -asteroid:
                stack.pop()
            alive = False
        if alive:
            stack.append(asteroid)
    return stack
`,
    visibleTests: [
      { name: "small one destroyed", args: [[5, 10, -5]], expected: [5, 10] },
      { name: "equal pair destroyed", args: [[8, -8]], expected: [] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[-1]], expected: [-1] },
      { name: "no collisions", args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
      { name: "punch through", args: [[10, 2, -5]], expected: [10] },
      { name: "left-mover survives chain", args: [[1, -2, -2, -2]], expected: [-2, -2, -2] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-09",
    chapterId: "stacks-queues",
    title: "Decode Nested Repeats",
    difficulty: "medium",
    patterns: ["stacks-queues", "stack"],
    entrypoint: "decode_string",
    signature: "s",
    prompt:
      "A string is encoded with the rule k[inner], meaning the substring `inner` is repeated k times. Encodings may nest, as in 3[a2[c]]. Decode the string and return the expanded text.",
    constraints: [
      "The encoding is always well formed and fully balanced.",
      "Repeat counts are positive integers and may have more than one digit.",
      "Bracket groups may be nested to any depth."
    ],
    hints: [
      "Keep two stacks: one for repeat counts and one for the text built before each '[' was opened.",
      "On ']' pop a count and a saved prefix, then set the current text to prefix plus current repeated count times."
    ],
    solution:
      "Scan character by character. Build the current count from digits; on '[' push the count and the text-so-far and reset both; on ']' pop the saved prefix and count and rebuild the current text as prefix plus current repeated. Plain letters extend the current text.",
    walkthrough:
      "Each '[' opens a nested level whose surrounding context — the multiplier and the text already built — is parked on the stacks. Closing the bracket resolves that one level by repeating its inner text and stitching it back onto the parked prefix, so arbitrary nesting unwinds correctly.",
    followUps: [
      "How would you detect a malformed encoding with mismatched brackets?",
      "How could you report the decoded length without building the whole string?"
    ],
    code: `def decode_string(s):
    count_stack = []
    text_stack = []
    current = ""
    count = 0
    for ch in s:
        if ch.isdigit():
            count = count * 10 + int(ch)
        elif ch == "[":
            count_stack.append(count)
            text_stack.append(current)
            count = 0
            current = ""
        elif ch == "]":
            repeat = count_stack.pop()
            current = text_stack.pop() + current * repeat
        else:
            current += ch
    return current
`,
    visibleTests: [
      { name: "simple repeat", args: ["3[a]"], expected: "aaa" },
      { name: "nested repeat", args: ["3[a2[c]]"], expected: "accaccacc" }
    ],
    hiddenTests: [
      { name: "no encoding", args: ["abc"], expected: "abc" },
      { name: "empty", args: [""], expected: "" },
      { name: "two groups", args: ["2[a]3[b]"], expected: "aabbb" },
      { name: "multi digit count", args: ["10[z]"], expected: "zzzzzzzzzz" },
      { name: "multi char inner", args: ["2[ab]"], expected: "abab" }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "stacks-queues-bonus-10",
    chapterId: "stacks-queues",
    title: "Sliding Window Maximum",
    difficulty: "medium",
    patterns: ["stacks-queues", "monotonic deque", "queue"],
    entrypoint: "sliding_window_max",
    signature: "nums, k",
    prompt:
      "Given a list of integers and a window size k, return the maximum of every contiguous window of length k as the window slides from left to right.",
    constraints: [
      "k is a positive integer no larger than the length of the list.",
      "If the list has n elements, the result has n - k + 1 values.",
      "Aim for one pass — re-scanning each window is too slow."
    ],
    hints: [
      "Keep a deque of indices whose values are in decreasing order; the front is always the current window's maximum.",
      "Before adding an index, pop smaller-or-equal values from the back; drop the front index once it falls outside the window."
    ],
    solution:
      "Maintain a deque of indices ordered so their values decrease from front to back. For each element, pop back indices with values not exceeding it, append the current index, evict the front if it left the window, and once the first full window is reached record the value at the front index.",
    walkthrough:
      "The deque is a monotonic queue: smaller values can never be the maximum while a later larger value is in range, so they are discarded. The front index therefore always holds the window's maximum, and each index enters and leaves the deque once, giving linear time.",
    followUps: [
      "How would you return the minimum of each window instead?",
      "What changes if you need the index of each window's maximum?"
    ],
    code: `def sliding_window_max(nums, k):
    window = deque()
    out = []
    for i, value in enumerate(nums):
        while window and nums[window[-1]] <= value:
            window.pop()
        window.append(i)
        if window[0] <= i - k:
            window.popleft()
        if i >= k - 1:
            out.append(nums[window[0]])
    return out
`,
    visibleTests: [
      { name: "mixed values", args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { name: "window of one", args: [[4, 8, 2], 1], expected: [4, 8, 2] }
    ],
    hiddenTests: [
      { name: "single window covers all", args: [[1, 2, 3, 4, 5], 5], expected: [5] },
      { name: "all equal", args: [[4, 4, 4, 4], 2], expected: [4, 4, 4] },
      { name: "single element", args: [[7], 1], expected: [7] },
      { name: "strictly decreasing", args: [[9, 8, 7, 6], 2], expected: [9, 8, 7] },
      { name: "all negative", args: [[-1, -3, -5], 2], expected: [-1, -3] }
    ],
    time: "O(n)",
    space: "O(k)"
  }
];
