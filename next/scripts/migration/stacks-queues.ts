import type { FunctionSignature, ValueType } from "../../src/core/types.js";

type LanguageId = "python" | "typescript" | "go" | "scala";

interface LanguageFiles {
  entrypoint: string;
  extension: string;
  starter: string;
  reference: string;
}

interface CuratedProblem {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
}

export const stacksQueuesCurated: Record<string, CuratedProblem> = {
  "balanced-brackets-local": {
    signature: {
      name: "balancedBracketsLocal",
      inputs: [{ name: "text", type: stringType() }],
      output: booleanType()
    },
    languages: {
      python: py("balanced_brackets_local", "text: str", "bool", [
        "pairs = {')': '(', ']': '[', '}': '{'}",
        "openers = set(pairs.values())",
        "stack = []",
        "for char in text:",
        "    if char in openers:",
        "        stack.append(char)",
        "    elif char in pairs:",
        "        if not stack or stack[-1] != pairs[char]:",
        "            return False",
        "        stack.pop()",
        "return not stack"
      ]),
      typescript: ts("balancedBracketsLocal", "text: string", "boolean", [
        "const pairs: Record<string, string> = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };",
        "const openers = new Set(Object.values(pairs));",
        "const stack: string[] = [];",
        "for (const char of text) {",
        "  if (openers.has(char)) stack.push(char);",
        "  else if (char in pairs) {",
        "    if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) return false;",
        "    stack.pop();",
        "  }",
        "}",
        "return stack.length === 0;"
      ]),
      go: go("BalancedBracketsLocal", "text string", "bool", [
        "pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}",
        "openers := map[rune]bool{'(': true, '[': true, '{': true}",
        "stack := []rune{}",
        "for _, char := range text {",
        "\tif openers[char] {",
        "\t\tstack = append(stack, char)",
        "\t} else if opener, ok := pairs[char]; ok {",
        "\t\tif len(stack) == 0 || stack[len(stack)-1] != opener {",
        "\t\t\treturn false",
        "\t\t}",
        "\t\tstack = stack[:len(stack)-1]",
        "\t}",
        "}",
        "return len(stack) == 0"
      ]),
      scala: scala("balancedBracketsLocal", "text: String", "Boolean", [
        "val pairs = Map(')' -> '(', ']' -> '[', '}' -> '{')",
        "val openers = pairs.values.toSet",
        "val stack = scala.collection.mutable.ArrayBuffer.empty[Char]",
        "for (char <- text) {",
        "  if (openers.contains(char)) stack.append(char)",
        "  else if (pairs.contains(char)) {",
        "    if (stack.isEmpty || stack.last != pairs(char)) return false",
        "    stack.remove(stack.length - 1)",
        "  }",
        "}",
        "stack.isEmpty"
      ])
    }
  },
  "warmer-day-waits": arrayNumberArray("warmerDayWaits", "temperatures", [
    "const waits = new Array<number>(temperatures.length).fill(0);",
    "const stack: number[] = [];",
    "for (let day = 0; day < temperatures.length; day += 1) {",
    "  while (stack.length > 0 && temperatures[day] > temperatures[stack[stack.length - 1]]) {",
    "    const previous = stack.pop()!;",
    "    waits[previous] = day - previous;",
    "  }",
    "  stack.push(day);",
    "}",
    "return waits;"
  ], [
    "waits = [0] * len(temperatures)",
    "stack = []",
    "for day, temperature in enumerate(temperatures):",
    "    while stack and temperature > temperatures[stack[-1]]:",
    "        previous = stack.pop()",
    "        waits[previous] = day - previous",
    "    stack.append(day)",
    "return waits"
  ], [
    "waits := make([]int, len(temperatures))",
    "stack := []int{}",
    "for day, temperature := range temperatures {",
    "\tfor len(stack) > 0 && temperature > temperatures[stack[len(stack)-1]] {",
    "\t\tprevious := stack[len(stack)-1]",
    "\t\tstack = stack[:len(stack)-1]",
    "\t\twaits[previous] = day - previous",
    "\t}",
    "\tstack = append(stack, day)",
    "}",
    "return waits"
  ], [
    "val waits = Array.fill(temperatures.length)(0)",
    "val stack = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "for (day <- temperatures.indices) {",
    "  while (stack.nonEmpty && temperatures(day) > temperatures(stack.last)) {",
    "    val previous = stack.remove(stack.length - 1)",
    "    waits(previous) = day - previous",
    "  }",
    "  stack.append(day)",
    "}",
    "waits.toSeq"
  ], "WarmerDayWaits"),
  "simplify-folder-steps": {
    signature: {
      name: "simplifyFolderSteps",
      inputs: [{ name: "steps", type: arrayOf(stringType()) }],
      output: stringType()
    },
    languages: {
      python: py("simplify_folder_steps", "steps: list[str]", "str", [
        "stack = []",
        "for step in steps:",
        "    if step == '.' or step == '':",
        "        continue",
        "    if step == '..':",
        "        if stack:",
        "            stack.pop()",
        "    else:",
        "        stack.append(step)",
        "return '/' + '/'.join(stack)"
      ]),
      typescript: ts("simplifyFolderSteps", "steps: string[]", "string", [
        "const stack: string[] = [];",
        "for (const step of steps) {",
        "  if (step === \".\" || step === \"\") continue;",
        "  if (step === \"..\") {",
        "    if (stack.length > 0) stack.pop();",
        "  } else {",
        "    stack.push(step);",
        "  }",
        "}",
        "return `/${stack.join(\"/\")}`;"
      ]),
      go: go("SimplifyFolderSteps", "steps []string", "string", [
        "stack := []string{}",
        "for _, step := range steps {",
        "\tif step == \".\" || step == \"\" {",
        "\t\tcontinue",
        "\t}",
        "\tif step == \"..\" {",
        "\t\tif len(stack) > 0 {",
        "\t\t\tstack = stack[:len(stack)-1]",
        "\t\t}",
        "\t} else {",
        "\t\tstack = append(stack, step)",
        "\t}",
        "}",
        "path := \"/\"",
        "for index, step := range stack {",
        "\tif index > 0 {",
        "\t\tpath += \"/\"",
        "\t}",
        "\tpath += step",
        "}",
        "return path"
      ]),
      scala: scala("simplifyFolderSteps", "steps: Seq[String]", "String", [
        "val stack = scala.collection.mutable.ArrayBuffer.empty[String]",
        "for (step <- steps) {",
        "  if (step == \".\" || step == \"\") {",
        "  } else if (step == \"..\") {",
        "    if (stack.nonEmpty) stack.remove(stack.length - 1)",
        "  } else {",
        "    stack.append(step)",
        "  }",
        "}",
        "\"/\" + stack.mkString(\"/\")"
      ])
    }
  },
  "recent-event-counts": {
    signature: {
      name: "recentEventCounts",
      inputs: [
        { name: "timestamps", type: arrayOf(numberType()) },
        { name: "window", type: numberType() }
      ],
      output: arrayOf(numberType())
    },
    languages: {
      python: py("recent_event_counts", "timestamps: list[int], window: int", "list[int]", [
        "left = 0",
        "counts = []",
        "for right, timestamp in enumerate(timestamps):",
        "    while timestamps[left] < timestamp - window:",
        "        left += 1",
        "    counts.append(right - left + 1)",
        "return counts"
      ]),
      typescript: ts("recentEventCounts", "timestamps: number[], window: number", "number[]", [
        "let left = 0;",
        "const counts: number[] = [];",
        "for (let right = 0; right < timestamps.length; right += 1) {",
        "  const timestamp = timestamps[right];",
        "  while (timestamps[left] < timestamp - window) left += 1;",
        "  counts.push(right - left + 1);",
        "}",
        "return counts;"
      ]),
      go: go("RecentEventCounts", "timestamps []int, window int", "[]int", [
        "left := 0",
        "counts := []int{}",
        "for right, timestamp := range timestamps {",
        "\tfor timestamps[left] < timestamp-window {",
        "\t\tleft++",
        "\t}",
        "\tcounts = append(counts, right-left+1)",
        "}",
        "return counts"
      ]),
      scala: scala("recentEventCounts", "timestamps: Seq[Int], window: Int", "Seq[Int]", [
        "var left = 0",
        "val counts = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "for (right <- timestamps.indices) {",
        "  val timestamp = timestamps(right)",
        "  while (timestamps(left) < timestamp - window) left += 1",
        "  counts.append(right - left + 1)",
        "}",
        "counts.toSeq"
      ])
    }
  },
  "next-greater-values": arrayNumberArray("nextGreaterValues", "nums", [
    "const result = new Array<number>(nums.length).fill(-1);",
    "const stack: number[] = [];",
    "for (let index = 0; index < nums.length; index += 1) {",
    "  while (stack.length > 0 && nums[index] > nums[stack[stack.length - 1]]) {",
    "    result[stack.pop()!] = nums[index];",
    "  }",
    "  stack.push(index);",
    "}",
    "return result;"
  ], [
    "result = [-1] * len(nums)",
    "stack = []",
    "for index, num in enumerate(nums):",
    "    while stack and num > nums[stack[-1]]:",
    "        result[stack.pop()] = num",
    "    stack.append(index)",
    "return result"
  ], [
    "result := make([]int, len(nums))",
    "for index := range result {",
    "\tresult[index] = -1",
    "}",
    "stack := []int{}",
    "for index, num := range nums {",
    "\tfor len(stack) > 0 && num > nums[stack[len(stack)-1]] {",
    "\t\tprevious := stack[len(stack)-1]",
    "\t\tstack = stack[:len(stack)-1]",
    "\t\tresult[previous] = num",
    "\t}",
    "\tstack = append(stack, index)",
    "}",
    "return result"
  ], [
    "val result = Array.fill(nums.length)(-1)",
    "val stack = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "for (index <- nums.indices) {",
    "  while (stack.nonEmpty && nums(index) > nums(stack.last)) {",
    "    result(stack.remove(stack.length - 1)) = nums(index)",
    "  }",
    "  stack.append(index)",
    "}",
    "result.toSeq"
  ], "NextGreaterValues"),
  "stacks-queues-bonus-01": {
    signature: {
      name: "reverseQueue",
      inputs: [{ name: "items", type: arrayOf(anyType()) }],
      output: arrayOf(anyType())
    },
    languages: {
      python: py("reverse_queue", "items: list[object]", "list[object]", [
        "stack = []",
        "for item in items:",
        "    stack.append(item)",
        "result = []",
        "while stack:",
        "    result.append(stack.pop())",
        "return result"
      ]),
      typescript: ts("reverseQueue", "items: unknown[]", "unknown[]", [
        "const stack = [...items];",
        "const result: unknown[] = [];",
        "while (stack.length > 0) result.push(stack.pop());",
        "return result;"
      ]),
      go: go("ReverseQueue", "items []interface{}", "[]interface{}", [
        "result := make([]interface{}, 0, len(items))",
        "for index := len(items) - 1; index >= 0; index-- {",
        "\tresult = append(result, items[index])",
        "}",
        "return result"
      ]),
      scala: scala("reverseQueue", "items: Seq[Any]", "Seq[Any]", [
        "items.reverse"
      ])
    }
  },
  "stacks-queues-bonus-02": {
    signature: {
      name: "movingAverages",
      inputs: [
        { name: "nums", type: arrayOf(numberType()) },
        { name: "window", type: numberType() }
      ],
      output: arrayOf(numberType())
    },
    languages: {
      python: py("moving_averages", "nums: list[int], window: int", "list[float]", [
        "queue = []",
        "total = 0",
        "averages = []",
        "for num in nums:",
        "    queue.append(num)",
        "    total += num",
        "    if len(queue) > window:",
        "        total -= queue.pop(0)",
        "    averages.append(total / len(queue))",
        "return averages"
      ]),
      typescript: ts("movingAverages", "nums: number[], window: number", "number[]", [
        "const queue: number[] = [];",
        "let total = 0;",
        "const averages: number[] = [];",
        "for (const num of nums) {",
        "  queue.push(num);",
        "  total += num;",
        "  if (queue.length > window) total -= queue.shift()!;",
        "  averages.push(total / queue.length);",
        "}",
        "return averages;"
      ]),
      go: go("MovingAverages", "nums []int, window int", "[]float64", [
        "queue := []int{}",
        "total := 0",
        "averages := []float64{}",
        "for _, num := range nums {",
        "\tqueue = append(queue, num)",
        "\ttotal += num",
        "\tif len(queue) > window {",
        "\t\ttotal -= queue[0]",
        "\t\tqueue = queue[1:]",
        "\t}",
        "\taverages = append(averages, float64(total)/float64(len(queue)))",
        "}",
        "return averages"
      ]),
      scala: scala("movingAverages", "nums: Seq[Int], window: Int", "Seq[Double]", [
        "val queue = scala.collection.mutable.Queue.empty[Int]",
        "var total = 0",
        "val averages = scala.collection.mutable.ArrayBuffer.empty[Double]",
        "for (num <- nums) {",
        "  queue.enqueue(num)",
        "  total += num",
        "  if (queue.length > window) total -= queue.dequeue()",
        "  averages.append(total.toDouble / queue.length)",
        "}",
        "averages.toSeq"
      ])
    }
  },
  "stacks-queues-bonus-03": stringString("collapseDuplicates", "text", [
    "const stack: string[] = [];",
    "for (const char of text) {",
    "  if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();",
    "  else stack.push(char);",
    "}",
    "return stack.join(\"\");"
  ], [
    "stack = []",
    "for char in text:",
    "    if stack and stack[-1] == char:",
    "        stack.pop()",
    "    else:",
    "        stack.append(char)",
    "return ''.join(stack)"
  ], [
    "stack := []rune{}",
    "for _, char := range text {",
    "\tif len(stack) > 0 && stack[len(stack)-1] == char {",
    "\t\tstack = stack[:len(stack)-1]",
    "\t} else {",
    "\t\tstack = append(stack, char)",
    "\t}",
    "}",
    "return string(stack)"
  ], [
    "val stack = scala.collection.mutable.ArrayBuffer.empty[Char]",
    "for (char <- text) {",
    "  if (stack.nonEmpty && stack.last == char) stack.remove(stack.length - 1)",
    "  else stack.append(char)",
    "}",
    "stack.mkString"
  ], "CollapseDuplicates"),
  "stacks-queues-bonus-04": stringNumber("parenScore", "text", [
    "const stack: number[] = [0];",
    "for (const char of text) {",
    "  if (char === \"(\") stack.push(0);",
    "  else {",
    "    const inside = stack.pop()!;",
    "    stack[stack.length - 1] += Math.max(1, inside * 2);",
    "  }",
    "}",
    "return stack[0];"
  ], [
    "stack = [0]",
    "for char in text:",
    "    if char == '(':",
    "        stack.append(0)",
    "    else:",
    "        inside = stack.pop()",
    "        stack[-1] += max(1, inside * 2)",
    "return stack[0]"
  ], [
    "stack := []int{0}",
    "for _, char := range text {",
    "\tif char == '(' {",
    "\t\tstack = append(stack, 0)",
    "\t} else {",
    "\t\tinside := stack[len(stack)-1]",
    "\t\tstack = stack[:len(stack)-1]",
    "\t\tvalue := inside * 2",
    "\t\tif value < 1 {",
    "\t\t\tvalue = 1",
    "\t\t}",
    "\t\tstack[len(stack)-1] += value",
    "\t}",
    "}",
    "return stack[0]"
  ], [
    "val stack = scala.collection.mutable.ArrayBuffer(0)",
    "for (char <- text) {",
    "  if (char == '(') stack.append(0)",
    "  else {",
    "    val inside = stack.remove(stack.length - 1)",
    "    stack(stack.length - 1) += math.max(1, inside * 2)",
    "  }",
    "}",
    "stack.head"
  ], "ParenScore"),
  "stacks-queues-bonus-05": {
    signature: {
      name: "minStackOps",
      inputs: [{ name: "ops", type: arrayOf(arrayOf(anyType())) }],
      output: arrayOf(numberType())
    },
    languages: {
      python: py("min_stack_ops", "ops: list[list[object]]", "list[int]", [
        "stack = []",
        "mins = []",
        "answers = []",
        "for op in ops:",
        "    if op[0] == 'push':",
        "        value = int(op[1])",
        "        stack.append(value)",
        "        mins.append(value if not mins else min(value, mins[-1]))",
        "    elif op[0] == 'pop':",
        "        if stack:",
        "            stack.pop()",
        "            mins.pop()",
        "    elif op[0] == 'min' and mins:",
        "        answers.append(mins[-1])",
        "return answers"
      ]),
      typescript: ts("minStackOps", "ops: Array<[string, number?]>", "number[]", [
        "const stack: number[] = [];",
        "const mins: number[] = [];",
        "const answers: number[] = [];",
        "for (const op of ops) {",
        "  if (op[0] === \"push\") {",
        "    const value = op[1] ?? 0;",
        "    stack.push(value);",
        "    mins.push(mins.length === 0 ? value : Math.min(value, mins[mins.length - 1]));",
        "  } else if (op[0] === \"pop\") {",
        "    if (stack.length > 0) {",
        "      stack.pop();",
        "      mins.pop();",
        "    }",
        "  } else if (op[0] === \"min\" && mins.length > 0) {",
        "    answers.push(mins[mins.length - 1]);",
        "  }",
        "}",
        "return answers;"
      ]),
      go: go("MinStackOps", "ops [][]interface{}", "[]int", [
        "stack := []int{}",
        "mins := []int{}",
        "answers := []int{}",
        "for _, op := range ops {",
        "\tname := op[0].(string)",
        "\tif name == \"push\" {",
        "\t\tvalue := asInt(op[1])",
        "\t\tstack = append(stack, value)",
        "\t\tif len(mins) == 0 || value < mins[len(mins)-1] {",
        "\t\t\tmins = append(mins, value)",
        "\t\t} else {",
        "\t\t\tmins = append(mins, mins[len(mins)-1])",
        "\t\t}",
        "\t} else if name == \"pop\" {",
        "\t\tif len(stack) > 0 {",
        "\t\t\tstack = stack[:len(stack)-1]",
        "\t\t\tmins = mins[:len(mins)-1]",
        "\t\t}",
        "\t} else if name == \"min\" && len(mins) > 0 {",
        "\t\tanswers = append(answers, mins[len(mins)-1])",
        "\t}",
        "}",
        "return answers"
      ], [goAsIntHelper()]),
      scala: scala("minStackOps", "ops: Seq[Seq[Any]]", "Seq[Int]", [
        "val stack = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "val mins = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "val answers = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "for (op <- ops) {",
        "  op.head.asInstanceOf[String] match {",
        "    case \"push\" =>",
        "      val value = op(1).asInstanceOf[Int]",
        "      stack.append(value)",
        "      mins.append(if (mins.isEmpty) value else math.min(value, mins.last))",
        "    case \"pop\" =>",
        "      if (stack.nonEmpty) {",
        "        stack.remove(stack.length - 1)",
        "        mins.remove(mins.length - 1)",
        "      }",
        "    case \"min\" =>",
        "      if (mins.nonEmpty) answers.append(mins.last)",
        "    case _ =>",
        "  }",
        "}",
        "answers.toSeq"
      ])
    }
  },
  "stacks-queues-bonus-06": {
    signature: {
      name: "validateStackSequence",
      inputs: [
        { name: "pushed", type: arrayOf(numberType()) },
        { name: "popped", type: arrayOf(numberType()) }
      ],
      output: booleanType()
    },
    languages: {
      python: py("validate_stack_sequence", "pushed: list[int], popped: list[int]", "bool", [
        "stack = []",
        "pop_index = 0",
        "for value in pushed:",
        "    stack.append(value)",
        "    while stack and pop_index < len(popped) and stack[-1] == popped[pop_index]:",
        "        stack.pop()",
        "        pop_index += 1",
        "return pop_index == len(popped)"
      ]),
      typescript: ts("validateStackSequence", "pushed: number[], popped: number[]", "boolean", [
        "const stack: number[] = [];",
        "let popIndex = 0;",
        "for (const value of pushed) {",
        "  stack.push(value);",
        "  while (stack.length > 0 && popIndex < popped.length && stack[stack.length - 1] === popped[popIndex]) {",
        "    stack.pop();",
        "    popIndex += 1;",
        "  }",
        "}",
        "return popIndex === popped.length;"
      ]),
      go: go("ValidateStackSequence", "pushed []int, popped []int", "bool", [
        "stack := []int{}",
        "popIndex := 0",
        "for _, value := range pushed {",
        "\tstack = append(stack, value)",
        "\tfor len(stack) > 0 && popIndex < len(popped) && stack[len(stack)-1] == popped[popIndex] {",
        "\t\tstack = stack[:len(stack)-1]",
        "\t\tpopIndex++",
        "\t}",
        "}",
        "return popIndex == len(popped)"
      ]),
      scala: scala("validateStackSequence", "pushed: Seq[Int], popped: Seq[Int]", "Boolean", [
        "val stack = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "var popIndex = 0",
        "for (value <- pushed) {",
        "  stack.append(value)",
        "  while (stack.nonEmpty && popIndex < popped.length && stack.last == popped(popIndex)) {",
        "    stack.remove(stack.length - 1)",
        "    popIndex += 1",
        "  }",
        "}",
        "popIndex == popped.length"
      ])
    }
  },
  "stacks-queues-bonus-07": {
    signature: {
      name: "hotPotato",
      inputs: [
        { name: "players", type: arrayOf(anyType()) },
        { name: "passes", type: numberType() }
      ],
      output: anyType()
    },
    languages: {
      python: py("hot_potato", "players: list[object], passes: int", "object", [
        "queue = list(players)",
        "while len(queue) > 1:",
        "    for _ in range(passes):",
        "        queue.append(queue.pop(0))",
        "    queue.pop(0)",
        "return queue[0]"
      ]),
      typescript: ts("hotPotato", "players: unknown[], passes: number", "unknown", [
        "const queue = [...players];",
        "while (queue.length > 1) {",
        "  for (let count = 0; count < passes; count += 1) queue.push(queue.shift());",
        "  queue.shift();",
        "}",
        "return queue[0];"
      ]),
      go: go("HotPotato", "players []interface{}, passes int", "interface{}", [
        "queue := append([]interface{}{}, players...)",
        "for len(queue) > 1 {",
        "\tfor count := 0; count < passes; count++ {",
        "\t\tfront := queue[0]",
        "\t\tqueue = queue[1:]",
        "\t\tqueue = append(queue, front)",
        "\t}",
        "\tqueue = queue[1:]",
        "}",
        "return queue[0]"
      ]),
      scala: scala("hotPotato", "players: Seq[Any], passes: Int", "Any", [
        "val queue = scala.collection.mutable.Queue(players: _*)",
        "while (queue.length > 1) {",
        "  for (_ <- 0 until passes) queue.enqueue(queue.dequeue())",
        "  queue.dequeue()",
        "}",
        "queue.front"
      ])
    }
  },
  "stacks-queues-bonus-08": arrayNumberArray("asteroidCollision", "asteroids", [
    "const stack: number[] = [];",
    "for (const asteroid of asteroids) {",
    "  let active = asteroid;",
    "  let alive = true;",
    "  while (alive && active < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {",
    "    const top = stack[stack.length - 1];",
    "    if (top < -active) stack.pop();",
    "    else if (top === -active) {",
    "      stack.pop();",
    "      alive = false;",
    "    } else {",
    "      alive = false;",
    "    }",
    "  }",
    "  if (alive) stack.push(active);",
    "}",
    "return stack;"
  ], [
    "stack = []",
    "for asteroid in asteroids:",
    "    active = asteroid",
    "    alive = True",
    "    while alive and active < 0 and stack and stack[-1] > 0:",
    "        top = stack[-1]",
    "        if top < -active:",
    "            stack.pop()",
    "        elif top == -active:",
    "            stack.pop()",
    "            alive = False",
    "        else:",
    "            alive = False",
    "    if alive:",
    "        stack.append(active)",
    "return stack"
  ], [
    "stack := []int{}",
    "for _, asteroid := range asteroids {",
    "\tactive := asteroid",
    "\talive := true",
    "\tfor alive && active < 0 && len(stack) > 0 && stack[len(stack)-1] > 0 {",
    "\t\ttop := stack[len(stack)-1]",
    "\t\tif top < -active {",
    "\t\t\tstack = stack[:len(stack)-1]",
    "\t\t} else if top == -active {",
    "\t\t\tstack = stack[:len(stack)-1]",
    "\t\t\talive = false",
    "\t\t} else {",
    "\t\t\talive = false",
    "\t\t}",
    "\t}",
    "\tif alive {",
    "\t\tstack = append(stack, active)",
    "\t}",
    "}",
    "return stack"
  ], [
    "val stack = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "for (asteroid <- asteroids) {",
    "  var alive = true",
    "  while (alive && asteroid < 0 && stack.nonEmpty && stack.last > 0) {",
    "    val top = stack.last",
    "    if (top < -asteroid) stack.remove(stack.length - 1)",
    "    else if (top == -asteroid) {",
    "      stack.remove(stack.length - 1)",
    "      alive = false",
    "    } else alive = false",
    "  }",
    "  if (alive) stack.append(asteroid)",
    "}",
    "stack.toSeq"
  ], "AsteroidCollision"),
  "stacks-queues-bonus-09": stringString("decodeString", "text", [
    "const counts: number[] = [];",
    "const pieces: string[] = [];",
    "let current = \"\";",
    "let count = 0;",
    "for (const char of text) {",
    "  if (/\\d/.test(char)) count = count * 10 + Number(char);",
    "  else if (char === \"[\") {",
    "    counts.push(count);",
    "    pieces.push(current);",
    "    current = \"\";",
    "    count = 0;",
    "  } else if (char === \"]\") {",
    "    const repeat = counts.pop()!;",
    "    current = pieces.pop()! + current.repeat(repeat);",
    "  } else {",
    "    current += char;",
    "  }",
    "}",
    "return current;"
  ], [
    "counts = []",
    "pieces = []",
    "current = ''",
    "count = 0",
    "for char in text:",
    "    if char.isdigit():",
    "        count = count * 10 + int(char)",
    "    elif char == '[':",
    "        counts.append(count)",
    "        pieces.append(current)",
    "        current = ''",
    "        count = 0",
    "    elif char == ']':",
    "        repeat = counts.pop()",
    "        current = pieces.pop() + current * repeat",
    "    else:",
    "        current += char",
    "return current"
  ], [
    "counts := []int{}",
    "pieces := []string{}",
    "current := \"\"",
    "count := 0",
    "for _, char := range text {",
    "\tif char >= '0' && char <= '9' {",
    "\t\tcount = count*10 + int(char-'0')",
    "\t} else if char == '[' {",
    "\t\tcounts = append(counts, count)",
    "\t\tpieces = append(pieces, current)",
    "\t\tcurrent = \"\"",
    "\t\tcount = 0",
    "\t} else if char == ']' {",
    "\t\trepeat := counts[len(counts)-1]",
    "\t\tcounts = counts[:len(counts)-1]",
    "\t\tprefix := pieces[len(pieces)-1]",
    "\t\tpieces = pieces[:len(pieces)-1]",
    "\t\tcurrent = prefix + repeatString(current, repeat)",
    "\t} else {",
    "\t\tcurrent += string(char)",
    "\t}",
    "}",
    "return current"
  ], [
    "val counts = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "val pieces = scala.collection.mutable.ArrayBuffer.empty[String]",
    "var current = \"\"",
    "var count = 0",
    "for (char <- text) {",
    "  if (char.isDigit) count = count * 10 + char.asDigit",
    "  else if (char == '[') {",
    "    counts.append(count)",
    "    pieces.append(current)",
    "    current = \"\"",
    "    count = 0",
    "  } else if (char == ']') {",
    "    val repeat = counts.remove(counts.length - 1)",
    "    current = pieces.remove(pieces.length - 1) + current * repeat",
    "  } else current += char",
    "}",
    "current"
  ], "DecodeString", [goRepeatStringHelper()]),
  "stacks-queues-bonus-10": {
    signature: {
      name: "slidingWindowMax",
      inputs: [
        { name: "nums", type: arrayOf(numberType()) },
        { name: "k", type: numberType() }
      ],
      output: arrayOf(numberType())
    },
    languages: {
      python: py("sliding_window_max", "nums: list[int], k: int", "list[int]", [
        "deque = []",
        "result = []",
        "for right, num in enumerate(nums):",
        "    while deque and deque[0] <= right - k:",
        "        deque.pop(0)",
        "    while deque and nums[deque[-1]] <= num:",
        "        deque.pop()",
        "    deque.append(right)",
        "    if right >= k - 1:",
        "        result.append(nums[deque[0]])",
        "return result"
      ]),
      typescript: ts("slidingWindowMax", "nums: number[], k: number", "number[]", [
        "const deque: number[] = [];",
        "const result: number[] = [];",
        "for (let right = 0; right < nums.length; right += 1) {",
        "  while (deque.length > 0 && deque[0] <= right - k) deque.shift();",
        "  while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[right]) deque.pop();",
        "  deque.push(right);",
        "  if (right >= k - 1) result.push(nums[deque[0]]);",
        "}",
        "return result;"
      ]),
      go: go("SlidingWindowMax", "nums []int, k int", "[]int", [
        "deque := []int{}",
        "result := []int{}",
        "for right, num := range nums {",
        "\tfor len(deque) > 0 && deque[0] <= right-k {",
        "\t\tdeque = deque[1:]",
        "\t}",
        "\tfor len(deque) > 0 && nums[deque[len(deque)-1]] <= num {",
        "\t\tdeque = deque[:len(deque)-1]",
        "\t}",
        "\tdeque = append(deque, right)",
        "\tif right >= k-1 {",
        "\t\tresult = append(result, nums[deque[0]])",
        "\t}",
        "}",
        "return result"
      ]),
      scala: scala("slidingWindowMax", "nums: Seq[Int], k: Int", "Seq[Int]", [
        "val deque = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "for (right <- nums.indices) {",
        "  while (deque.nonEmpty && deque.head <= right - k) deque.remove(0)",
        "  while (deque.nonEmpty && nums(deque.last) <= nums(right)) deque.remove(deque.length - 1)",
        "  deque.append(right)",
        "  if (right >= k - 1) result.append(nums(deque.head))",
        "}",
        "result.toSeq"
      ])
    }
  }
};

function arrayNumberArray(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: arrayOf(numberType()) }],
      output: arrayOf(numberType())
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[]", tsBody),
      go: go(goName, `${argName} []int`, "[]int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Int]", scalaBody)
    }
  };
}

function stringString(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string,
  goHelpers: string[] = []
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: stringType() }],
      output: stringType()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: str`, "str", pyBody),
      typescript: ts(tsName, `${argName}: string`, "string", tsBody),
      go: go(goName, `${argName} string`, "string", goBody, goHelpers),
      scala: scala(tsName, `${argName}: String`, "String", scalaBody)
    }
  };
}

function stringNumber(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: stringType() }],
      output: numberType()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: str`, "int", pyBody),
      typescript: ts(tsName, `${argName}: string`, "number", tsBody),
      go: go(goName, `${argName} string`, "int", goBody),
      scala: scala(tsName, `${argName}: String`, "Int", scalaBody)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "py",
    starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`,
    reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n`
  };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "ts",
    starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`,
    reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n`
  };
}

function go(name: string, args: string, returnType: string, body: string[], helpers: string[] = []): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n${helpers.length ? `\n${helpers.join("\n\n")}\n` : ""}`
  };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n`
  };
}

function goAsIntHelper(): string {
  return `func asInt(value interface{}) int {
\tswitch typed := value.(type) {
\tcase int:
\t\treturn typed
\tcase float64:
\t\treturn int(typed)
\tdefault:
\t\treturn 0
\t}
}`;
}

function goRepeatStringHelper(): string {
  return `func repeatString(value string, count int) string {
\tresult := ""
\tfor index := 0; index < count; index++ {
\t\tresult += value
\t}
\treturn result
}`;
}

function anyType(): ValueType {
  return { type: "any" };
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function booleanType(): ValueType {
  return { type: "boolean" };
}

function numberType(): ValueType {
  return { type: "number" };
}

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}
