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

export const libraryProblemIds = [
  "lib-sc-running-median",
  "lib-sc-sliding-window-median",
  "lib-od-lru-cache",
  "lib-od-first-unique"
] as const;

export const libraryCurated: Record<string, CuratedProblem> = {
  "lib-sc-running-median": problem(
    { name: "runningMedian", inputs: [{ name: "stream", type: numberArray() }], output: numberArray() },
    names("running_median", "runningMedian", "RunningMedian", "runningMedian"),
    "stream: list[int]",
    "stream: number[]",
    "stream []int",
    "stream: Seq[Int]",
    "list[float]",
    "number[]",
    "[]float64",
    "Seq[Double]",
    [
      "values = []",
      "out = []",
      "for value in stream:",
      "    values.append(value)",
      "    values.sort()",
      "    n = len(values)",
      "    if n % 2:",
      "        out.append(float(values[n // 2]))",
      "    else:",
      "        out.append((values[n // 2 - 1] + values[n // 2]) / 2.0)",
      "return out"
    ],
    [
      "const values: number[] = [];",
      "const out: number[] = [];",
      "for (const value of stream) {",
      "  insertSorted(values, value);",
      "  const n = values.length;",
      "  out.push(n % 2 === 1 ? values[Math.floor(n / 2)] : (values[n / 2 - 1] + values[n / 2]) / 2);",
      "}",
      "return out;"
    ],
    [insertSortedTs()],
    `package solution

func RunningMedian(stream []int) []float64 {
	values := []int{}
	out := []float64{}
	for _, value := range stream {
		insertSorted(&values, value)
		n := len(values)
		if n%2 == 1 {
			out = append(out, float64(values[n/2]))
		} else {
			out = append(out, float64(values[n/2-1]+values[n/2])/2.0)
		}
	}
	return out
}

func insertSorted(values *[]int, value int) {
	left := 0
	right := len(*values)
	for left < right {
		mid := (left + right) / 2
		if (*values)[mid] < value {
			left = mid + 1
		} else {
			right = mid
		}
	}
	*values = append(*values, 0)
	copy((*values)[left+1:], (*values)[left:])
	(*values)[left] = value
}
`,
    `object Solution {
  def runningMedian(stream: Seq[Int]): Seq[Double] = {
    val values = scala.collection.mutable.ArrayBuffer.empty[Int]
    val out = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (value <- stream) {
      insertSorted(values, value)
      val n = values.length
      if (n % 2 == 1) out.append(values(n / 2).toDouble)
      else out.append((values(n / 2 - 1) + values(n / 2)) / 2.0)
    }
    out.toSeq
  }

  private def insertSorted(values: scala.collection.mutable.ArrayBuffer[Int], value: Int): Unit = {
    var left = 0
    var right = values.length
    while (left < right) {
      val mid = (left + right) / 2
      if (values(mid) < value) left = mid + 1
      else right = mid
    }
    values.insert(left, value)
  }
}
`
  ),
  "lib-sc-sliding-window-median": problem(
    { name: "slidingWindowMedian", inputs: [{ name: "nums", type: numberArray() }, { name: "k", type: numberType() }], output: numberArray() },
    names("sliding_window_median", "slidingWindowMedian", "SlidingWindowMedian", "slidingWindowMedian"),
    "nums: list[int], k: int",
    "nums: number[], k: number",
    "nums []int, k int",
    "nums: Seq[Int], k: Int",
    "list[float]",
    "number[]",
    "[]float64",
    "Seq[Double]",
    [
      "if not nums or k <= 0 or k > len(nums):",
      "    return []",
      "window = sorted(nums[:k])",
      "out = []",
      "for index in range(len(nums) - k + 1):",
      "    if k % 2:",
      "        out.append(float(window[k // 2]))",
      "    else:",
      "        out.append((window[k // 2 - 1] + window[k // 2]) / 2.0)",
      "    if index + k < len(nums):",
      "        window.remove(nums[index])",
      "        window.append(nums[index + k])",
      "        window.sort()",
      "return out"
    ],
    [
      "if (nums.length === 0 || k <= 0 || k > nums.length) return [];",
      "const window = [...nums.slice(0, k)].sort((a, b) => a - b);",
      "const out: number[] = [];",
      "for (let index = 0; index <= nums.length - k; index += 1) {",
      "  out.push(k % 2 === 1 ? window[Math.floor(k / 2)] : (window[k / 2 - 1] + window[k / 2]) / 2);",
      "  if (index + k < nums.length) {",
      "    removeOne(window, nums[index]);",
      "    insertSorted(window, nums[index + k]);",
      "  }",
      "}",
      "return out;"
    ],
    [insertSortedTs(), removeOneTs()],
    `package solution

func SlidingWindowMedian(nums []int, k int) []float64 {
	if len(nums) == 0 || k <= 0 || k > len(nums) {
		return []float64{}
	}
	window := append([]int{}, nums[:k]...)
	sortInts(window)
	out := []float64{}
	for index := 0; index <= len(nums)-k; index++ {
		if k%2 == 1 {
			out = append(out, float64(window[k/2]))
		} else {
			out = append(out, float64(window[k/2-1]+window[k/2])/2.0)
		}
		if index+k < len(nums) {
			removeOne(&window, nums[index])
			insertSorted(&window, nums[index+k])
		}
	}
	return out
}

func sortInts(values []int) {
	for i := 1; i < len(values); i++ {
		value := values[i]
		j := i - 1
		for j >= 0 && values[j] > value {
			values[j+1] = values[j]
			j--
		}
		values[j+1] = value
	}
}

func insertSorted(values *[]int, value int) {
	left := 0
	right := len(*values)
	for left < right {
		mid := (left + right) / 2
		if (*values)[mid] < value {
			left = mid + 1
		} else {
			right = mid
		}
	}
	*values = append(*values, 0)
	copy((*values)[left+1:], (*values)[left:])
	(*values)[left] = value
}

func removeOne(values *[]int, value int) {
	for index, item := range *values {
		if item == value {
			copy((*values)[index:], (*values)[index+1:])
			*values = (*values)[:len(*values)-1]
			return
		}
	}
}
`,
    `object Solution {
  def slidingWindowMedian(nums: Seq[Int], k: Int): Seq[Double] = {
    if (nums.isEmpty || k <= 0 || k > nums.length) return Seq.empty
    val window = scala.collection.mutable.ArrayBuffer.from(nums.take(k).sorted)
    val out = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (index <- 0 to nums.length - k) {
      if (k % 2 == 1) out.append(window(k / 2).toDouble)
      else out.append((window(k / 2 - 1) + window(k / 2)) / 2.0)
      if (index + k < nums.length) {
        removeOne(window, nums(index))
        insertSorted(window, nums(index + k))
      }
    }
    out.toSeq
  }

  private def insertSorted(values: scala.collection.mutable.ArrayBuffer[Int], value: Int): Unit = {
    var left = 0
    var right = values.length
    while (left < right) {
      val mid = (left + right) / 2
      if (values(mid) < value) left = mid + 1
      else right = mid
    }
    values.insert(left, value)
  }

  private def removeOne(values: scala.collection.mutable.ArrayBuffer[Int], value: Int): Unit = {
    val index = values.indexOf(value)
    if (index >= 0) values.remove(index)
  }
}
`
  ),
  "lib-od-lru-cache": problem(
    { name: "lruCache", inputs: [{ name: "capacity", type: numberType() }, { name: "operations", type: arrayOf(arrayOf(stringType())) }], output: stringArray() },
    names("lru_cache", "lruCache", "LruCache", "lruCache"),
    "capacity: int, operations: list[list[str]]",
    "capacity: number, operations: string[][]",
    "capacity int, operations [][]string",
    "capacity: Int, operations: Seq[Seq[String]]",
    "list[str]",
    "string[]",
    "[]string",
    "Seq[String]",
    [
      "cache = {}",
      "order = []",
      "out = []",
      "for op in operations:",
      "    if op[0] == 'get':",
      "        key = op[1]",
      "        if key in cache:",
      "            order.remove(key)",
      "            order.append(key)",
      "            out.append(cache[key])",
      "        else:",
      "            out.append('-1')",
      "    else:",
      "        key, value = op[1], op[2]",
      "        if key in cache:",
      "            order.remove(key)",
      "        cache[key] = value",
      "        order.append(key)",
      "        if len(order) > capacity:",
      "            oldest = order.pop(0)",
      "            del cache[oldest]",
      "return out"
    ],
    [
      "const cache = new Map<string, string>();",
      "const out: string[] = [];",
      "for (const op of operations) {",
      "  if (op[0] === \"get\") {",
      "    const key = op[1];",
      "    if (!cache.has(key)) out.push(\"-1\");",
      "    else { const value = cache.get(key)!; cache.delete(key); cache.set(key, value); out.push(value); }",
      "  } else {",
      "    const key = op[1];",
      "    const value = op[2];",
      "    if (cache.has(key)) cache.delete(key);",
      "    cache.set(key, value);",
      "    if (cache.size > capacity) {",
      "      const oldest = cache.keys().next().value;",
      "      if (oldest !== undefined) cache.delete(oldest);",
      "    }",
      "  }",
      "}",
      "return out;"
    ],
    [],
    `package solution

func LruCache(capacity int, operations [][]string) []string {
	cache := map[string]string{}
	order := []string{}
	out := []string{}
	for _, op := range operations {
		if len(op) == 0 {
			continue
		}
		if op[0] == "get" {
			key := op[1]
			value, ok := cache[key]
			if !ok {
				out = append(out, "-1")
			} else {
				order = removeKey(order, key)
				order = append(order, key)
				out = append(out, value)
			}
		} else {
			key := op[1]
			value := op[2]
			if _, ok := cache[key]; ok {
				order = removeKey(order, key)
			}
			cache[key] = value
			order = append(order, key)
			if len(order) > capacity {
				oldest := order[0]
				order = order[1:]
				delete(cache, oldest)
			}
		}
	}
	return out
}

func removeKey(values []string, target string) []string {
	out := values[:0]
	for _, value := range values {
		if value != target {
			out = append(out, value)
		}
	}
	return out
}
`,
    `object Solution {
  def lruCache(capacity: Int, operations: Seq[Seq[String]]): Seq[String] = {
    val cache = scala.collection.mutable.LinkedHashMap.empty[String, String]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    for (op <- operations if op.nonEmpty) {
      if (op.head == "get") {
        val key = op(1)
        cache.get(key) match {
          case Some(value) =>
            cache.remove(key)
            cache.put(key, value)
            out.append(value)
          case None => out.append("-1")
        }
      } else {
        val key = op(1)
        val value = op(2)
        cache.remove(key)
        cache.put(key, value)
        if (cache.size > capacity) {
          val oldest = cache.head._1
          cache.remove(oldest)
        }
      }
    }
    out.toSeq
  }
}
`
  ),
  "lib-od-first-unique": problem(
    { name: "firstUnique", inputs: [{ name: "stream", type: stringArray() }], output: stringArray() },
    names("first_unique", "firstUnique", "FirstUnique", "firstUnique"),
    "stream: list[str]",
    "stream: string[]",
    "stream []string",
    "stream: Seq[String]",
    "list[str]",
    "string[]",
    "[]string",
    "Seq[String]",
    [
      "counts = {}",
      "pending = []",
      "out = []",
      "for value in stream:",
      "    counts[value] = counts.get(value, 0) + 1",
      "    if counts[value] == 1:",
      "        pending.append(value)",
      "    else:",
      "        pending = [item for item in pending if item != value]",
      "    out.append(pending[0] if pending else '')",
      "return out"
    ],
    [
      "const counts = new Map<string, number>();",
      "const pending: string[] = [];",
      "const out: string[] = [];",
      "for (const value of stream) {",
      "  const count = (counts.get(value) ?? 0) + 1;",
      "  counts.set(value, count);",
      "  if (count === 1) pending.push(value);",
      "  else {",
      "    let index = pending.indexOf(value);",
      "    while (index !== -1) { pending.splice(index, 1); index = pending.indexOf(value); }",
      "  }",
      "  out.push(pending[0] ?? \"\");",
      "}",
      "return out;"
    ],
    [],
    `package solution

func FirstUnique(stream []string) []string {
	counts := map[string]int{}
	pending := []string{}
	out := []string{}
	for _, value := range stream {
		counts[value]++
		if counts[value] == 1 {
			pending = append(pending, value)
		} else {
			pending = removeString(pending, value)
		}
		if len(pending) == 0 {
			out = append(out, "")
		} else {
			out = append(out, pending[0])
		}
	}
	return out
}

func removeString(values []string, target string) []string {
	out := values[:0]
	for _, value := range values {
		if value != target {
			out = append(out, value)
		}
	}
	return out
}
`,
    `object Solution {
  def firstUnique(stream: Seq[String]): Seq[String] = {
    val counts = scala.collection.mutable.Map.empty[String, Int]
    val pending = scala.collection.mutable.ArrayBuffer.empty[String]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    for (value <- stream) {
      val count = counts.getOrElse(value, 0) + 1
      counts.update(value, count)
      if (count == 1) pending.append(value)
      else {
        var index = pending.indexOf(value)
        while (index >= 0) {
          pending.remove(index)
          index = pending.indexOf(value)
        }
      }
      out.append(pending.headOption.getOrElse(""))
    }
    out.toSeq
  }
}
`
  )
};

type Names = { python: string; typescript: string; go: string; scala: string };

function names(python: string, typescript: string, go: string, scala: string): Names {
  return { python, typescript, go, scala };
}

function problem(
  signature: FunctionSignature,
  names: Names,
  pyArgs: string,
  tsArgs: string,
  goArgs: string,
  scalaArgs: string,
  pyReturn: string,
  tsReturn: string,
  goReturn: string,
  scalaReturn: string,
  pyBody: string[],
  tsBody: string[],
  tsHelpers: string[] = [],
  goReference?: string,
  scalaReference?: string
): CuratedProblem {
  return {
    signature,
    languages: {
      python: py(names.python, pyArgs, pyReturn, pyBody),
      typescript: ts(names.typescript, tsArgs, tsReturn, tsBody, tsHelpers),
      go: go(names.go, goArgs, goReturn, goReference),
      scala: scala(names.scala, scalaArgs, scalaReturn, scalaReference)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "py", starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`, reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n` };
}

function ts(name: string, args: string, returnType: string, body: string[], helpers: string[]): LanguageFiles {
  const helperText = helpers.length ? `\n\n${helpers.join("\n\n")}\n` : "\n";
  return { entrypoint: name, extension: "ts", starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`, reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}${helperText}` };
}

function go(name: string, args: string, returnType: string, reference?: string): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: reference ?? `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("GENERATE_REFERENCE_FROM_LEGACY_TESTS")\n}\n`
  };
}

function scala(name: string, args: string, returnType: string, reference?: string): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: reference ?? `object Solution {\n  def ${name}(${args}): ${returnType} = throw new NotImplementedError("GENERATE_REFERENCE_FROM_LEGACY_TESTS")\n}\n`
  };
}

function insertSortedTs(): string {
  return `function insertSorted(values: number[], value: number) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (values[mid] < value) left = mid + 1;
    else right = mid;
  }
  values.splice(left, 0, value);
}`;
}

function removeOneTs(): string {
  return `function removeOne(values: number[], value: number) {
  const index = values.indexOf(value);
  if (index !== -1) values.splice(index, 1);
}`;
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function numberArray(): ValueType {
  return arrayOf(numberType());
}

function numberType(): ValueType {
  return { type: "number" };
}

function stringArray(): ValueType {
  return arrayOf(stringType());
}

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
