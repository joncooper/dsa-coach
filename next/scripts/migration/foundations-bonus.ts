import type { FunctionSignature } from "../../src/core/types.js";

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

export const foundationsBonusCurated: Record<string, CuratedProblem> = {
  "foundations-bonus-01": {
    signature: {
      name: "runningMaximum",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("running_maximum", "nums: list[int]", "list[int]", "raise NotImplementedError", [
        "result = []",
        "best = None",
        "for num in nums:",
        "    best = num if best is None else max(best, num)",
        "    result.append(best)",
        "return result"
      ]),
      typescript: ts("runningMaximum", "nums: number[]", "number[]", [
        "const result: number[] = [];",
        "let best: number | undefined;",
        "for (const num of nums) {",
        "  best = best === undefined ? num : Math.max(best, num);",
        "  result.push(best);",
        "}",
        "return result;"
      ]),
      go: go("RunningMaximum", "nums []int", "[]int", [
        "result := []int{}",
        "best := 0",
        "for index, num := range nums {",
        "\tif index == 0 || num > best {",
        "\t\tbest = num",
        "\t}",
        "\tresult = append(result, best)",
        "}",
        "return result"
      ]),
      scala: scala("runningMaximum", "nums: Seq[Int]", "Seq[Int]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "var best: Option[Int] = None",
        "for (num <- nums) {",
        "  best = Some(best.fold(num)(current => math.max(current, num)))",
        "  result.append(best.get)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "foundations-bonus-02": {
    signature: {
      name: "isSortedAscending",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "boolean" }
    },
    languages: {
      python: py("is_sorted_ascending", "nums: list[int]", "bool", "raise NotImplementedError", [
        "for index in range(1, len(nums)):",
        "    if nums[index] < nums[index - 1]:",
        "        return False",
        "return True"
      ]),
      typescript: ts("isSortedAscending", "nums: number[]", "boolean", [
        "for (let index = 1; index < nums.length; index += 1) {",
        "  if (nums[index] < nums[index - 1]) return false;",
        "}",
        "return true;"
      ]),
      go: go("IsSortedAscending", "nums []int", "bool", [
        "for index := 1; index < len(nums); index++ {",
        "\tif nums[index] < nums[index-1] {",
        "\t\treturn false",
        "\t}",
        "}",
        "return true"
      ]),
      scala: scala("isSortedAscending", "nums: Seq[Int]", "Boolean", [
        "for (index <- 1 until nums.length) {",
        "  if (nums(index) < nums(index - 1)) return false",
        "}",
        "true"
      ])
    }
  },
  "foundations-bonus-03": {
    signature: {
      name: "secondLargest",
      inputs: [{ name: "values", type: arrayOfNumbers() }],
      output: { type: "number", nullable: true }
    },
    languages: {
      python: py("second_largest", "values: list[int]", "int | None", "raise NotImplementedError", [
        "largest = None",
        "second = None",
        "for value in values:",
        "    if largest is None or value > largest:",
        "        if largest is not None and value != largest:",
        "            second = largest",
        "        largest = value",
        "    elif value != largest and (second is None or value > second):",
        "        second = value",
        "return second"
      ]),
      typescript: ts("secondLargest", "values: number[]", "number | null", [
        "let largest: number | null = null;",
        "let second: number | null = null;",
        "for (const value of values) {",
        "  if (largest === null || value > largest) {",
        "    if (largest !== null && value !== largest) second = largest;",
        "    largest = value;",
        "  } else if (value !== largest && (second === null || value > second)) {",
        "    second = value;",
        "  }",
        "}",
        "return second;"
      ]),
      go: go("SecondLargest", "values []int", "*int", [
        "largest := 0",
        "second := 0",
        "hasLargest := false",
        "hasSecond := false",
        "for _, value := range values {",
        "\tif !hasLargest || value > largest {",
        "\t\tif hasLargest && value != largest {",
        "\t\t\tsecond = largest",
        "\t\t\thasSecond = true",
        "\t\t}",
        "\t\tlargest = value",
        "\t\thasLargest = true",
        "\t} else if value != largest && (!hasSecond || value > second) {",
        "\t\tsecond = value",
        "\t\thasSecond = true",
        "\t}",
        "}",
        "if !hasSecond {",
        "\treturn nil",
        "}",
        "return &second"
      ]),
      scala: scala("secondLargest", "values: Seq[Int]", "Option[Int]", [
        "var largest: Option[Int] = None",
        "var second: Option[Int] = None",
        "for (value <- values) {",
        "  if (largest.isEmpty || value > largest.get) {",
        "    if (largest.nonEmpty && value != largest.get) second = largest",
        "    largest = Some(value)",
        "  } else if (value != largest.get && (second.isEmpty || value > second.get)) {",
        "    second = Some(value)",
        "  }",
        "}",
        "second"
      ])
    }
  },
  "foundations-bonus-04": simpleNumber("factorial", "n", [
    "if (n <= 1) return 1;",
    "return n * factorial(n - 1);"
  ], [
    "if n <= 1:",
    "    return 1",
    "return n * factorial(n - 1)"
  ], [
    "if n <= 1 {",
    "\treturn 1",
    "}",
    "return n * Factorial(n-1)"
  ], [
    "if (n <= 1) 1 else n * factorial(n - 1)"
  ], "Factorial"),
  "foundations-bonus-05": {
    signature: {
      name: "countVowels",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "number" }
    },
    languages: {
      python: py("count_vowels", "text: str", "int", "raise NotImplementedError", [
        "vowels = set(\"aeiou\")",
        "count = 0",
        "for char in text.lower():",
        "    if char in vowels:",
        "        count += 1",
        "return count"
      ]),
      typescript: ts("countVowels", "text: string", "number", [
        "const vowels = new Set([\"a\", \"e\", \"i\", \"o\", \"u\"]);",
        "let count = 0;",
        "for (const char of text.toLowerCase()) {",
        "  if (vowels.has(char)) count += 1;",
        "}",
        "return count;"
      ]),
      go: goWithImport("CountVowels", "text string", "int", "\"strings\"", [
        "vowels := map[rune]bool{'a': true, 'e': true, 'i': true, 'o': true, 'u': true}",
        "count := 0",
        "for _, char := range strings.ToLower(text) {",
        "\tif vowels[char] {",
        "\t\tcount++",
        "\t}",
        "}",
        "return count"
      ]),
      scala: scala("countVowels", "text: String", "Int", [
        "val vowels = Set('a', 'e', 'i', 'o', 'u')",
        "text.toLowerCase.count(vowels.contains)"
      ])
    }
  },
  "foundations-bonus-06": {
    signature: {
      name: "gcd",
      inputs: [
        { name: "a", type: { type: "number" } },
        { name: "b", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("gcd", "a: int, b: int", "int", "raise NotImplementedError", [
        "if b == 0:",
        "    return a",
        "return gcd(b, a % b)"
      ]),
      typescript: ts("gcd", "a: number, b: number", "number", [
        "if (b === 0) return a;",
        "return gcd(b, a % b);"
      ]),
      go: go("GCD", "a int, b int", "int", [
        "if b == 0 {",
        "\treturn a",
        "}",
        "return GCD(b, a%b)"
      ]),
      scala: scala("gcd", "a: Int, b: Int", "Int", [
        "if (b == 0) a else gcd(b, a % b)"
      ])
    }
  },
  "foundations-bonus-07": {
    signature: {
      name: "firstNegativeIndex",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("first_negative_index", "nums: list[int]", "int", "raise NotImplementedError", [
        "for index, num in enumerate(nums):",
        "    if num < 0:",
        "        return index",
        "return -1"
      ]),
      typescript: ts("firstNegativeIndex", "nums: number[]", "number", [
        "for (let index = 0; index < nums.length; index += 1) {",
        "  if (nums[index] < 0) return index;",
        "}",
        "return -1;"
      ]),
      go: go("FirstNegativeIndex", "nums []int", "int", [
        "for index, num := range nums {",
        "\tif num < 0 {",
        "\t\treturn index",
        "\t}",
        "}",
        "return -1"
      ]),
      scala: scala("firstNegativeIndex", "nums: Seq[Int]", "Int", [
        "nums.indexWhere(_ < 0)"
      ])
    }
  },
  "foundations-bonus-08": {
    signature: {
      name: "sumEvenIndices",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("sum_even_indices", "nums: list[int]", "int", "raise NotImplementedError", [
        "total = 0",
        "for index in range(0, len(nums), 2):",
        "    total += nums[index]",
        "return total"
      ]),
      typescript: ts("sumEvenIndices", "nums: number[]", "number", [
        "let total = 0;",
        "for (let index = 0; index < nums.length; index += 2) {",
        "  total += nums[index];",
        "}",
        "return total;"
      ]),
      go: go("SumEvenIndices", "nums []int", "int", [
        "total := 0",
        "for index := 0; index < len(nums); index += 2 {",
        "\ttotal += nums[index]",
        "}",
        "return total"
      ]),
      scala: scala("sumEvenIndices", "nums: Seq[Int]", "Int", [
        "(0 until nums.length by 2).map(index => nums(index)).sum"
      ])
    }
  },
  "foundations-bonus-09": {
    signature: {
      name: "countDistinct",
      inputs: [{ name: "values", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("count_distinct", "values: list[int]", "int", "raise NotImplementedError", [
        "return len(set(values))"
      ]),
      typescript: ts("countDistinct", "values: number[]", "number", [
        "return new Set(values).size;"
      ]),
      go: go("CountDistinct", "values []int", "int", [
        "seen := map[int]bool{}",
        "for _, value := range values {",
        "\tseen[value] = true",
        "}",
        "return len(seen)"
      ]),
      scala: scala("countDistinct", "values: Seq[Int]", "Int", [
        "values.toSet.size"
      ])
    }
  },
  "foundations-bonus-10": simpleNumber("nthFibonacci", "n", [
    "let previous = 0;",
    "let current = 1;",
    "for (let index = 0; index < n; index += 1) {",
    "  const next = previous + current;",
    "  previous = current;",
    "  current = next;",
    "}",
    "return previous;"
  ], [
    "previous = 0",
    "current = 1",
    "for _ in range(n):",
    "    previous, current = current, previous + current",
    "return previous"
  ], [
    "previous := 0",
    "current := 1",
    "for index := 0; index < n; index++ {",
    "\tnext := previous + current",
    "\tprevious = current",
    "\tcurrent = next",
    "}",
    "return previous"
  ], [
    "var previous = 0",
    "var current = 1",
    "for (_ <- 0 until n) {",
    "  val next = previous + current",
    "  previous = current",
    "  current = next",
    "}",
    "previous"
  ], "NthFibonacci"),
  "foundations-bonus-11": {
    signature: {
      name: "pivotIndex",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("pivot_index", "nums: list[int]", "int", "raise NotImplementedError", [
        "total = sum(nums)",
        "left = 0",
        "for index, num in enumerate(nums):",
        "    if left == total - left - num:",
        "        return index",
        "    left += num",
        "return -1"
      ]),
      typescript: ts("pivotIndex", "nums: number[]", "number", [
        "const total = nums.reduce((sum, num) => sum + num, 0);",
        "let left = 0;",
        "for (let index = 0; index < nums.length; index += 1) {",
        "  if (left === total - left - nums[index]) return index;",
        "  left += nums[index];",
        "}",
        "return -1;"
      ]),
      go: go("PivotIndex", "nums []int", "int", [
        "total := 0",
        "for _, num := range nums {",
        "\ttotal += num",
        "}",
        "left := 0",
        "for index, num := range nums {",
        "\tif left == total-left-num {",
        "\t\treturn index",
        "\t}",
        "\tleft += num",
        "}",
        "return -1"
      ]),
      scala: scala("pivotIndex", "nums: Seq[Int]", "Int", [
        "val total = nums.sum",
        "var left = 0",
        "for ((num, index) <- nums.zipWithIndex) {",
        "  if (left == total - left - num) return index",
        "  left += num",
        "}",
        "-1"
      ])
    }
  },
  "foundations-bonus-12": simpleNumber("collatzSteps", "n", [
    "let value = n;",
    "let steps = 0;",
    "while (value !== 1) {",
    "  value = value % 2 === 0 ? value / 2 : value * 3 + 1;",
    "  steps += 1;",
    "}",
    "return steps;"
  ], [
    "steps = 0",
    "while n != 1:",
    "    if n % 2 == 0:",
    "        n //= 2",
    "    else:",
    "        n = n * 3 + 1",
    "    steps += 1",
    "return steps"
  ], [
    "steps := 0",
    "for n != 1 {",
    "\tif n%2 == 0 {",
    "\t\tn /= 2",
    "\t} else {",
    "\t\tn = n*3 + 1",
    "\t}",
    "\tsteps++",
    "}",
    "return steps"
  ], [
    "var value = n",
    "var steps = 0",
    "while (value != 1) {",
    "  value = if (value % 2 == 0) value / 2 else value * 3 + 1",
    "  steps += 1",
    "}",
    "steps"
  ], "CollatzSteps")
};

function simpleNumber(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName = upperFirst(tsName)
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: { type: "number" } }],
      output: { type: "number" }
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: int`, "int", "raise NotImplementedError", pyBody),
      typescript: ts(tsName, `${argName}: number`, "number", tsBody),
      go: go(goName, `${argName} int`, "int", goBody),
      scala: scala(tsName, `${argName}: Int`, "Int", scalaBody)
    }
  };
}

function py(name: string, args: string, returnType: string, starterBody: string, referenceBody: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "py",
    starter: `def ${name}(${args}) -> ${returnType}:\n    ${starterBody}\n`,
    reference: `def ${name}(${args}) -> ${returnType}:\n${indent(referenceBody, "    ")}\n`
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

function go(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
  };
}

function goWithImport(name: string, args: string, returnType: string, importPath: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nimport ${importPath}\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
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

function arrayOfNumbers() {
  return { type: "array" as const, items: { type: "number" as const } };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function upperFirst(value: string): string {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
