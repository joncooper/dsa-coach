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

export const linkedListsCurated: Record<string, CuratedProblem> = {
  "list-sum": arrayNumberNumber("listSum", "values", [
    "let total = 0;",
    "for (const value of values) total += value;",
    "return total;"
  ], [
    "total = 0",
    "for value in values:",
    "    total += value",
    "return total"
  ], [
    "total := 0",
    "for _, value := range values {",
    "\ttotal += value",
    "}",
    "return total"
  ], [
    "values.sum"
  ], "ListSum"),
  "remove-list-value": {
    signature: {
      name: "removeListValue",
      inputs: [
        { name: "values", type: numberArray() },
        { name: "target", type: numberType() }
      ],
      output: nullable(numberArray())
    },
    languages: {
      python: py("remove_list_value", "values: list[int], target: int", "list[int] | None", [
        "result = [value for value in values if value != target]",
        "if len(values) == 1 and not result:",
        "    return None",
        "return result"
      ]),
      typescript: ts("removeListValue", "values: number[], target: number", "number[] | null", [
        "const result = values.filter((value) => value !== target);",
        "if (values.length === 1 && result.length === 0) return null;",
        "return result;"
      ]),
      go: go("RemoveListValue", "values []int, target int", "interface{}", [
        "result := []int{}",
        "for _, value := range values {",
        "\tif value != target {",
        "\t\tresult = append(result, value)",
        "\t}",
        "}",
        "if len(values) == 1 && len(result) == 0 {",
        "\treturn nil",
        "}",
        "return result"
      ]),
      scala: scala("removeListValue", "values: Seq[Int], target: Int", "Any", [
        "val result = values.filter(_ != target)",
        "if (values.length == 1 && result.isEmpty) null else result"
      ])
    }
  },
  "middle-list-value": nullableArrayNumber("middleListValue", "values", [
    "if (values.length === 0) return null;",
    "return values[Math.floor(values.length / 2)];"
  ], [
    "if not values:",
    "    return None",
    "return values[len(values) // 2]"
  ], [
    "if len(values) == 0 {",
    "\treturn nil",
    "}",
    "return values[len(values)/2]"
  ], [
    "if (values.isEmpty) null else values(values.length / 2)"
  ], "MiddleListValue"),
  "merge-two-linked-lists": {
    signature: {
      name: "mergeTwoLinkedLists",
      inputs: [
        { name: "a", type: numberArray() },
        { name: "b", type: numberArray() }
      ],
      output: numberArray()
    },
    languages: {
      python: py("merge_two_linked_lists", "a: list[int], b: list[int]", "list[int]", [
        "left = 0",
        "right = 0",
        "merged = []",
        "while left < len(a) and right < len(b):",
        "    if a[left] <= b[right]:",
        "        merged.append(a[left])",
        "        left += 1",
        "    else:",
        "        merged.append(b[right])",
        "        right += 1",
        "merged.extend(a[left:])",
        "merged.extend(b[right:])",
        "return merged"
      ]),
      typescript: ts("mergeTwoLinkedLists", "a: number[], b: number[]", "number[]", [
        "let left = 0;",
        "let right = 0;",
        "const merged: number[] = [];",
        "while (left < a.length && right < b.length) {",
        "  if (a[left] <= b[right]) {",
        "    merged.push(a[left]);",
        "    left += 1;",
        "  } else {",
        "    merged.push(b[right]);",
        "    right += 1;",
        "  }",
        "}",
        "return merged.concat(a.slice(left), b.slice(right));"
      ]),
      go: go("MergeTwoLinkedLists", "a []int, b []int", "[]int", [
        "left := 0",
        "right := 0",
        "merged := []int{}",
        "for left < len(a) && right < len(b) {",
        "\tif a[left] <= b[right] {",
        "\t\tmerged = append(merged, a[left])",
        "\t\tleft++",
        "\t} else {",
        "\t\tmerged = append(merged, b[right])",
        "\t\tright++",
        "\t}",
        "}",
        "merged = append(merged, a[left:]...)",
        "merged = append(merged, b[right:]...)",
        "return merged"
      ]),
      scala: scala("mergeTwoLinkedLists", "a: Seq[Int], b: Seq[Int]", "Seq[Int]", [
        "var left = 0",
        "var right = 0",
        "val merged = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "while (left < a.length && right < b.length) {",
        "  if (a(left) <= b(right)) {",
        "    merged.append(a(left))",
        "    left += 1",
        "  } else {",
        "    merged.append(b(right))",
        "    right += 1",
        "  }",
        "}",
        "merged.appendAll(a.drop(left))",
        "merged.appendAll(b.drop(right))",
        "merged.toSeq"
      ])
    }
  },
  "palindrome-linked-list-local": arrayNumberBoolean("palindromeLinkedListLocal", "values", [
    "let left = 0;",
    "let right = values.length - 1;",
    "while (left < right) {",
    "  if (values[left] !== values[right]) return false;",
    "  left += 1;",
    "  right -= 1;",
    "}",
    "return true;"
  ], [
    "left = 0",
    "right = len(values) - 1",
    "while left < right:",
    "    if values[left] != values[right]:",
    "        return False",
    "    left += 1",
    "    right -= 1",
    "return True"
  ], [
    "left := 0",
    "right := len(values) - 1",
    "for left < right {",
    "\tif values[left] != values[right] {",
    "\t\treturn false",
    "\t}",
    "\tleft++",
    "\tright--",
    "}",
    "return true"
  ], [
    "var left = 0",
    "var right = values.length - 1",
    "while (left < right) {",
    "  if (values(left) != values(right)) return false",
    "  left += 1",
    "  right -= 1",
    "}",
    "true"
  ], "PalindromeLinkedListLocal"),
  "linked-lists-bonus-01": arrayNumberNumber("listLength", "values", [
    "return values.length;"
  ], [
    "return len(values)"
  ], [
    "return len(values)"
  ], [
    "values.length"
  ], "ListLength"),
  "linked-lists-bonus-02": {
    signature: {
      name: "valueAtIndex",
      inputs: [
        { name: "values", type: numberArray() },
        { name: "index", type: numberType() }
      ],
      output: nullable(numberType())
    },
    languages: {
      python: py("value_at_index", "values: list[int], index: int", "int | None", [
        "if index < 0 or index >= len(values):",
        "    return None",
        "return values[index]"
      ]),
      typescript: ts("valueAtIndex", "values: number[], index: number", "number | null", [
        "if (index < 0 || index >= values.length) return null;",
        "return values[index];"
      ]),
      go: go("ValueAtIndex", "values []int, index int", "interface{}", [
        "if index < 0 || index >= len(values) {",
        "\treturn nil",
        "}",
        "return values[index]"
      ]),
      scala: scala("valueAtIndex", "values: Seq[Int], index: Int", "Any", [
        "if (index < 0 || index >= values.length) null else values(index)"
      ])
    }
  },
  "linked-lists-bonus-03": nullableArrayNumber("maxListValue", "values", [
    "if (values.length === 0) return null;",
    "let best = values[0];",
    "for (const value of values) best = Math.max(best, value);",
    "return best;"
  ], [
    "if not values:",
    "    return None",
    "best = values[0]",
    "for value in values:",
    "    best = max(best, value)",
    "return best"
  ], [
    "if len(values) == 0 {",
    "\treturn nil",
    "}",
    "best := values[0]",
    "for _, value := range values {",
    "\tif value > best {",
    "\t\tbest = value",
    "\t}",
    "}",
    "return best"
  ], [
    "if (values.isEmpty) null else values.max"
  ], "MaxListValue"),
  "linked-lists-bonus-04": arrayNumberArray("reverseList", "values", [
    "return [...values].reverse();"
  ], [
    "return list(reversed(values))"
  ], [
    "result := make([]int, 0, len(values))",
    "for index := len(values) - 1; index >= 0; index-- {",
    "\tresult = append(result, values[index])",
    "}",
    "return result"
  ], [
    "values.reverse"
  ], "ReverseList"),
  "linked-lists-bonus-05": {
    signature: {
      name: "insertAfterIndex",
      inputs: [
        { name: "values", type: numberArray() },
        { name: "index", type: numberType() },
        { name: "value", type: numberType() }
      ],
      output: numberArray()
    },
    languages: {
      python: py("insert_after_index", "values: list[int], index: int, value: int", "list[int]", [
        "if index < 0 or index >= len(values):",
        "    return values[:]",
        "return values[:index + 1] + [value] + values[index + 1:]"
      ]),
      typescript: ts("insertAfterIndex", "values: number[], index: number, value: number", "number[]", [
        "if (index < 0 || index >= values.length) return [...values];",
        "return values.slice(0, index + 1).concat([value], values.slice(index + 1));"
      ]),
      go: go("InsertAfterIndex", "values []int, index int, value int", "[]int", [
        "if index < 0 || index >= len(values) {",
        "\treturn append([]int{}, values...)",
        "}",
        "result := append([]int{}, values[:index+1]...)",
        "result = append(result, value)",
        "result = append(result, values[index+1:]...)",
        "return result"
      ]),
      scala: scala("insertAfterIndex", "values: Seq[Int], index: Int, value: Int", "Seq[Int]", [
        "if (index < 0 || index >= values.length) values",
        "else values.take(index + 1) ++ Seq(value) ++ values.drop(index + 1)"
      ])
    }
  },
  "linked-lists-bonus-06": arrayNumberArray("dedupSortedList", "values", [
    "const result: number[] = [];",
    "for (const value of values) {",
    "  if (result.length === 0 || result[result.length - 1] !== value) result.push(value);",
    "}",
    "return result;"
  ], [
    "result = []",
    "for value in values:",
    "    if not result or result[-1] != value:",
    "        result.append(value)",
    "return result"
  ], [
    "result := []int{}",
    "for _, value := range values {",
    "\tif len(result) == 0 || result[len(result)-1] != value {",
    "\t\tresult = append(result, value)",
    "\t}",
    "}",
    "return result"
  ], [
    "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "for (value <- values) {",
    "  if (result.isEmpty || result.last != value) result.append(value)",
    "}",
    "result.toSeq"
  ], "DedupSortedList"),
  "linked-lists-bonus-07": arrayNumberBoolean("isListSorted", "values", [
    "for (let index = 1; index < values.length; index += 1) {",
    "  if (values[index - 1] > values[index]) return false;",
    "}",
    "return true;"
  ], [
    "for index in range(1, len(values)):",
    "    if values[index - 1] > values[index]:",
    "        return False",
    "return True"
  ], [
    "for index := 1; index < len(values); index++ {",
    "\tif values[index-1] > values[index] {",
    "\t\treturn false",
    "\t}",
    "}",
    "return true"
  ], [
    "for (index <- 1 until values.length) {",
    "  if (values(index - 1) > values(index)) return false",
    "}",
    "true"
  ], "IsListSorted"),
  "linked-lists-bonus-08": {
    signature: {
      name: "removeNthFromEnd",
      inputs: [
        { name: "values", type: numberArray() },
        { name: "n", type: numberType() }
      ],
      output: numberArray()
    },
    languages: {
      python: py("remove_nth_from_end", "values: list[int], n: int", "list[int]", [
        "index = len(values) - n",
        "if index < 0 or index >= len(values):",
        "    return values[:]",
        "return values[:index] + values[index + 1:]"
      ]),
      typescript: ts("removeNthFromEnd", "values: number[], n: number", "number[]", [
        "const index = values.length - n;",
        "if (index < 0 || index >= values.length) return [...values];",
        "return values.slice(0, index).concat(values.slice(index + 1));"
      ]),
      go: go("RemoveNthFromEnd", "values []int, n int", "[]int", [
        "index := len(values) - n",
        "if index < 0 || index >= len(values) {",
        "\treturn append([]int{}, values...)",
        "}",
        "result := append([]int{}, values[:index]...)",
        "result = append(result, values[index+1:]...)",
        "return result"
      ]),
      scala: scala("removeNthFromEnd", "values: Seq[Int], n: Int", "Seq[Int]", [
        "val index = values.length - n",
        "if (index < 0 || index >= values.length) values",
        "else values.take(index) ++ values.drop(index + 1)"
      ])
    }
  },
  "linked-lists-bonus-09": arrayNumberArray("oddEvenList", "values", [
    "const odds: number[] = [];",
    "const evens: number[] = [];",
    "for (let index = 0; index < values.length; index += 1) {",
    "  if (index % 2 === 0) odds.push(values[index]);",
    "  else evens.push(values[index]);",
    "}",
    "return odds.concat(evens);"
  ], [
    "odds = []",
    "evens = []",
    "for index, value in enumerate(values):",
    "    if index % 2 == 0:",
    "        odds.append(value)",
    "    else:",
    "        evens.append(value)",
    "return odds + evens"
  ], [
    "odds := []int{}",
    "evens := []int{}",
    "for index, value := range values {",
    "\tif index%2 == 0 {",
    "\t\todds = append(odds, value)",
    "\t} else {",
    "\t\tevens = append(evens, value)",
    "\t}",
    "}",
    "return append(odds, evens...)"
  ], [
    "val odds = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "val evens = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "for ((value, index) <- values.zipWithIndex) {",
    "  if (index % 2 == 0) odds.append(value) else evens.append(value)",
    "}",
    "(odds ++ evens).toSeq"
  ], "OddEvenList"),
  "linked-lists-bonus-10": arrayNumberArray("swapPairs", "values", [
    "const result = [...values];",
    "for (let index = 0; index + 1 < result.length; index += 2) {",
    "  const temp = result[index];",
    "  result[index] = result[index + 1];",
    "  result[index + 1] = temp;",
    "}",
    "return result;"
  ], [
    "result = values[:]",
    "for index in range(0, len(result) - 1, 2):",
    "    result[index], result[index + 1] = result[index + 1], result[index]",
    "return result"
  ], [
    "result := append([]int{}, values...)",
    "for index := 0; index+1 < len(result); index += 2 {",
    "\tresult[index], result[index+1] = result[index+1], result[index]",
    "}",
    "return result"
  ], [
    "val result = values.toArray",
    "for (index <- 0 until result.length - 1 by 2) {",
    "  val temp = result(index)",
    "  result(index) = result(index + 1)",
    "  result(index + 1) = temp",
    "}",
    "result.toSeq"
  ], "SwapPairs")
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
      inputs: [{ name: argName, type: numberArray() }],
      output: numberArray()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[]", tsBody),
      go: go(goName, `${argName} []int`, "[]int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Int]", scalaBody)
    }
  };
}

function arrayNumberBoolean(
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
      inputs: [{ name: argName, type: numberArray() }],
      output: booleanType()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "bool", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "boolean", tsBody),
      go: go(goName, `${argName} []int`, "bool", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Boolean", scalaBody)
    }
  };
}

function arrayNumberNumber(
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
      inputs: [{ name: argName, type: numberArray() }],
      output: numberType()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number", tsBody),
      go: go(goName, `${argName} []int`, "int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Int", scalaBody)
    }
  };
}

function nullableArrayNumber(
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
      inputs: [{ name: argName, type: numberArray() }],
      output: nullable(numberType())
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "int | None", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number | null", tsBody),
      go: go(goName, `${argName} []int`, "interface{}", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Any", scalaBody)
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

function go(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
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

function booleanType(): ValueType {
  return { type: "boolean" };
}

function nullable(valueType: ValueType): ValueType {
  return { ...valueType, nullable: true };
}

function numberArray(): ValueType {
  return { type: "array", items: numberType() };
}

function numberType(): ValueType {
  return { type: "number" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}
